<?php

namespace Database\Seeders;

use App\Models\Review;
use App\Models\Reservation;
use App\Models\Stylist;
use Illuminate\Database\Seeder;
use Faker\Factory as Faker;

class ReviewsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $this->command->info('⭐ Seeding Reviews...');

        // Clear existing reviews
        Review::query()->delete();

        $faker = Faker::create('es_ES');

        // Get all completed reservations
        $reservations = Reservation::with(['client', 'stylist', 'service.branch'])
            ->where('status', 'completed')
            ->get();

        if ($reservations->isEmpty()) {
            $this->command->warn('⚠️  No completed reservations found.');
            return;
        }

        // Select 60% of completed reservations for reviews
        $reviewCount = (int) ceil($reservations->count() * 0.6);
        $reservationsToReview = $reservations->random($reviewCount);

        // Review templates by rating
        $reviewTemplates = [
            5 => [
                '¡Excelente servicio! {stylist} es increíble, quedé muy satisfecho/a con el resultado.',
                'La mejor experiencia. {stylist} tiene manos mágicas, definitivamente volveré.',
                'Superó mis expectativas. {stylist} es muy profesional y atento/a. 100% recomendado.',
                'Perfecta atención y resultados espectaculares. {stylist} es un/a verdadero/a artista.',
                '¡Wow! Me encantó todo. {stylist} entendió exactamente lo que quería. Cinco estrellas merecidas.',
                'Impecable servicio. {stylist} es súper profesional y el ambiente del salón es maravilloso.',
                'Mi estilista favorito/a. {stylist} siempre logra que me vea y sienta increíble.',
                'Servicio de primera calidad. {stylist} prestó atención a cada detalle. Muy recomendado.',
            ],
            4 => [
                'Muy buen servicio, {stylist} hizo un gran trabajo. Solo pequeños detalles por mejorar.',
                'Buena experiencia en general. {stylist} es amable y profesional. Lo recomendaría.',
                'Quedé satisfecho/a con el resultado. {stylist} escuchó mis preferencias.',
                'Buen trabajo de {stylist}. El servicio fue profesional y el ambiente agradable.',
                'Me gustó el resultado final. {stylist} tiene buena técnica y es muy amable.',
                'Servicio profesional. {stylist} cumplió con mis expectativas.',
                'Buena atención. {stylist} se tomó su tiempo y el resultado es bueno.',
            ],
            3 => [
                'Experiencia aceptable. {stylist} hizo su trabajo pero esperaba un poco más.',
                'No estuvo mal, pero tampoco excepcional. {stylist} podría mejorar la comunicación.',
                'Resultado promedio. {stylist} fue amable pero el servicio fue básico.',
                'Está bien para el precio. {stylist} cumplió pero sin destacar.',
                'Servicio regular. {stylist} necesita más práctica en esta técnica.',
            ],
            2 => [
                'No quedé completamente satisfecho/a. {stylist} no entendió bien lo que quería.',
                'Esperaba más por el precio. {stylist} fue amable pero el resultado no fue el esperado.',
                'Algo decepcionante. {stylist} debería mejorar la técnica.',
                'No fue la mejor experiencia. {stylist} parecía apurado/a y no prestó suficiente atención.',
            ],
            1 => [
                'Muy decepcionante. {stylist} no cumplió con lo prometido. No vuelvo.',
                'Mala experiencia. {stylist} no tenía la experiencia necesaria para este servicio.',
                'No recomiendo. {stylist} no escuchó mis preferencias y el resultado fue terrible.',
            ],
        ];

        // Response templates (for stylist/admin responses)
        $responseTemplates = [
            5 => [
                '¡Muchas gracias por tu hermosa reseña! Fue un placer atenderte. ¡Te esperamos pronto! 💕',
                'Gracias por confiar en nosotros. ¡Nos encanta que estés feliz con el resultado! 🌟',
                '¡Qué alegría leerte! Gracias por tu confianza. Te esperamos en tu próxima cita. ✨',
                'Gracias por tus palabras. Es un placer trabajar con clientes como tú. ¡Hasta pronto! 💖',
            ],
            4 => [
                'Gracias por tu feedback. Nos alegra que hayas disfrutado el servicio. ¡Seguiremos mejorando! 😊',
                'Agradecemos tu reseña. Tomaremos en cuenta tus comentarios para mejorar. ¡Hasta pronto!',
                'Gracias por elegirnos. Trabajamos constantemente para perfeccionar nuestro servicio. 🙏',
            ],
            3 => [
                'Gracias por tu honestidad. Lamentamos que no haya sido perfecto. ¿Podemos hacer algo más?',
                'Agradecemos tu feedback. Tomaremos tus comentarios para mejorar nuestro servicio.',
                'Gracias por tu reseña. Nos gustaría saber cómo podemos mejorar tu próxima experiencia.',
            ],
            2 => [
                'Lamentamos que tu experiencia no haya sido la esperada. Por favor contáctanos para resolverlo.',
                'Sentimos mucho tu decepción. Nos gustaría hablar contigo para mejorar. Escríbenos por favor.',
                'Tus comentarios son importantes. Lamentamos no haber cumplido tus expectativas.',
            ],
            1 => [
                'Lamentamos profundamente tu experiencia. Por favor contáctanos para resolver esta situación.',
                'Sentimos mucho lo sucedido. Nos gustaría compensarte. Por favor escríbenos directamente.',
                'Esto no es aceptable. Por favor contáctanos para encontrar una solución inmediata.',
            ],
        ];

        $count = 0;
        $ratingCounts = [1 => 0, 2 => 0, 3 => 0, 4 => 0, 5 => 0];

        foreach ($reservationsToReview as $reservation) {
            $stylist = Stylist::where('user_id', $reservation->stylist_id)->first();

            if (!$stylist) {
                continue;
            }

            // Rating distribution (weighted toward positive)
            // 50% = 5 stars, 30% = 4 stars, 15% = 3 stars, 4% = 2 stars, 1% = 1 star
            $ratingDistribution = array_merge(
                array_fill(0, 50, 5),
                array_fill(0, 30, 4),
                array_fill(0, 15, 3),
                array_fill(0, 4, 2),
                array_fill(0, 1, 1)
            );
            $rating = $faker->randomElement($ratingDistribution);
            $ratingCounts[$rating]++;

            // Get comment template
            $stylistName = $reservation->stylist->name ?? 'el/la estilista';
            $commentTemplate = $faker->randomElement($reviewTemplates[$rating]);
            $comment = str_replace('{stylist}', $stylistName, $commentTemplate);

            // 70% of reviews get responses (especially lower ratings)
            $shouldRespond = $rating <= 3 ? $faker->boolean(90) : $faker->boolean(60);
            $response = null;
            $respondedAt = null;

            if ($shouldRespond) {
                $response = $faker->randomElement($responseTemplates[$rating]);
                $respondedAt = $reservation->scheduled_at->copy()->addDays($faker->numberBetween(1, 5));
            }

            // Review is created 1-7 days after appointment
            $reviewCreatedAt = $reservation->scheduled_at->copy()->addDays($faker->numberBetween(1, 7));

            Review::create([
                'user_id' => $reservation->client_id,
                'reservation_id' => $reservation->id,
                'stylist_id' => $stylist->id,
                'branch_id' => $reservation->service->branch_id ?? null,
                'rating' => $rating,
                'comment' => $comment,
                'response' => $response,
                'responded_at' => $respondedAt,
                'is_verified' => true, // All are verified since they're from real reservations
                'created_at' => $reviewCreatedAt,
                'updated_at' => $respondedAt ?? $reviewCreatedAt,
            ]);

            $count++;
        }

        $totalReviews = array_sum($ratingCounts);
        $averageRating = ($ratingCounts[5] * 5 + $ratingCounts[4] * 4 + $ratingCounts[3] * 3 + $ratingCounts[2] * 2 + $ratingCounts[1] * 1) / $totalReviews;

        $this->command->info('✅ ' . $count . ' reviews created (60% of completed reservations)');
        $this->command->info('   Rating distribution:');
        $this->command->info('   - 5 stars: ' . $ratingCounts[5] . ' (' . round($ratingCounts[5]/$totalReviews*100) . '%)');
        $this->command->info('   - 4 stars: ' . $ratingCounts[4] . ' (' . round($ratingCounts[4]/$totalReviews*100) . '%)');
        $this->command->info('   - 3 stars: ' . $ratingCounts[3] . ' (' . round($ratingCounts[3]/$totalReviews*100) . '%)');
        $this->command->info('   - 2 stars: ' . $ratingCounts[2] . ' (' . round($ratingCounts[2]/$totalReviews*100) . '%)');
        $this->command->info('   - 1 star: ' . $ratingCounts[1] . ' (' . round($ratingCounts[1]/$totalReviews*100) . '%)');
        $this->command->info('   Average rating: ' . number_format($averageRating, 2) . ' ⭐');
    }
}
