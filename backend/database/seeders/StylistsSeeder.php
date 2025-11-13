<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Stylist;
use App\Models\Branch;
use Illuminate\Database\Seeder;
use Faker\Factory as Faker;

class StylistsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $this->command->info('💇 Seeding Stylists...');

        // Clear existing stylists
        Stylist::query()->delete();

        $faker = Faker::create('es_ES');

        // Get all stylist users
        $stylistUsers = User::whereHas('roles', function ($query) {
            $query->where('name', 'stylist');
        })->get();

        // Get all branches
        $branches = Branch::all();

        if ($branches->isEmpty()) {
            $this->command->warn('⚠️  No branches found. Please run BranchesSeeder first.');
            return;
        }

        // Specialties pool
        $specialties = [
            'Coloración y Mechas',
            'Corte y Estilismo',
            'Tratamientos Capilares',
            'Peinados de Eventos',
            'Alisados y Permanentes',
            'Extensiones',
            'Barbería Clásica',
            'Barbería Moderna',
            'Manicura y Nail Art',
            'Pedicura Spa',
            'Maquillaje Social',
            'Maquillaje de Novias',
            'Diseño de Cejas',
            'Extensiones de Pestañas',
        ];

        // Bio templates
        $bioTemplates = [
            "Especialista en {specialty} con {years} años de experiencia. Apasionado/a por crear looks únicos que realcen la belleza natural de cada cliente.",
            "Con {years} años en la industria, me especializo en {specialty}. Mi objetivo es que cada cliente se sienta increíble.",
            "Profesional certificado/a en {specialty}. {years} años transformando estilos y creando confianza.",
            "Estilista dedicado/a con {years} años de experiencia. Mi especialidad: {specialty}. Siempre actualizado/a con las últimas tendencias.",
            "{years} años perfeccionando el arte de {specialty}. Cada cliente es una obra maestra en progreso.",
        ];

        $count = 0;
        foreach ($stylistUsers as $index => $user) {
            // Distribute stylists across branches evenly
            $branch = $branches[$index % $branches->count()];

            // Random specialties (2-4 specialties per stylist)
            $stylistSpecialties = $faker->randomElements($specialties, $faker->numberBetween(2, 4));
            $mainSpecialty = $stylistSpecialties[0]; // First one is the main specialty

            // Years of experience (2-15 years as per requirements)
            $yearsExperience = $faker->numberBetween(2, 15);

            // Generate bio
            $bioTemplate = $faker->randomElement($bioTemplates);
            $bio = str_replace(
                ['{specialty}', '{years}'],
                [strtolower($mainSpecialty), $yearsExperience],
                $bioTemplate
            );

            // Certifications (some stylists have certifications)
            $certifications = null;
            if ($faker->boolean(60)) { // 60% have certifications
                $certifications = $faker->randomElements([
                    'Coloración Avanzada L\'Oréal',
                    'Técnicas de Balayage Redken',
                    'Barbería Profesional',
                    'Keratina Brasileña Certificada',
                    'Extensiones de Pelo Natural',
                    'Maquillaje Profesional MAC',
                    'Microblading Certificado',
                    'Nail Art Avanzado',
                    'Estilismo de Novias',
                ], $faker->numberBetween(1, 3));
            }

            // First 5 stylists are featured
            $isFeatured = $index < 5;

            Stylist::create([
                'user_id' => $user->id,
                'branch_id' => $branch->id,
                'bio' => $bio,
                'specialty' => $mainSpecialty, // Keep for backward compatibility
                'specialties' => $stylistSpecialties, // JSON array of specialties
                'years_experience' => $yearsExperience,
                'certifications' => $certifications,
                'commission_percentage' => $faker->randomFloat(2, 50, 70), // 50-70%
                'tips_enabled' => true,
                'average_rating' => $faker->randomFloat(2, 4.0, 5.0), // 4.0-5.0 stars
                'total_reviews' => $faker->numberBetween(5, 50),
                'total_services_completed' => $faker->numberBetween(10, 500),
                'is_active' => true,
                'is_featured' => $isFeatured, // First 5 are featured
                'start_date' => now()->subMonths($faker->numberBetween(1, 60)),
                'end_date' => null,
            ]);

            $count++;
        }

        $featuredCount = Stylist::where('is_featured', true)->count();

        $this->command->info('✅ ' . $count . ' stylist profiles created');
        $this->command->info('   - ' . $featuredCount . ' featured stylists');
        $this->command->info('   - Distributed across ' . $branches->count() . ' branches');
        $this->command->info('   Average rating: ' . number_format(Stylist::avg('average_rating'), 2) . ' ⭐');
        $this->command->info('   Average experience: ' . round(Stylist::avg('years_experience')) . ' years');
    }
}
