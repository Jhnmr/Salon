<?php

namespace Database\Seeders;

use App\Models\Promotion;
use App\Models\Branch;
use App\Models\Service;
use Illuminate\Database\Seeder;
use Carbon\Carbon;
use Faker\Factory as Faker;
use Illuminate\Support\Str;

class PromotionsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $this->command->info('< Seeding Promotions...');

        // Clear existing promotions
        Promotion::query()->delete();

        $faker = Faker::create('es_ES');

        // Get all branches
        $branches = Branch::all();

        if ($branches->isEmpty()) {
            $this->command->warn('   No branches found. Please run BranchesSeeder first.');
            return;
        }

        // Promotion templates
        $promotionTemplates = [
            [
                'title' => 'Bienvenida - Primera Visita',
                'description' => '20% de descuento en tu primer servicio. ¡Conoce la calidad de nuestro salón!',
                'discount_type' => Promotion::DISCOUNT_TYPE_PERCENTAGE,
                'discount_value' => 20,
                'is_first_booking_only' => true,
                'timing' => 'active',
            ],
            [
                'title' => 'Combo Especial - Corte + Color',
                'description' => 'Obtén $30 de descuento al reservar corte y coloración juntos',
                'discount_type' => Promotion::DISCOUNT_TYPE_FIXED,
                'discount_value' => 30,
                'is_first_booking_only' => false,
                'timing' => 'active',
            ],
            [
                'title' => 'Happy Hour - Tardes de Martes',
                'description' => '15% de descuento en todos los servicios los martes de 2pm a 5pm',
                'discount_type' => Promotion::DISCOUNT_TYPE_PERCENTAGE,
                'discount_value' => 15,
                'is_first_booking_only' => false,
                'timing' => 'active',
                'applicable_days' => [2], // Tuesday
            ],
            [
                'title' => 'Black Friday Beauty',
                'description' => '¡50% de descuento en servicios seleccionados! Aprovecha esta oferta única.',
                'discount_type' => Promotion::DISCOUNT_TYPE_PERCENTAGE,
                'discount_value' => 50,
                'is_first_booking_only' => false,
                'timing' => 'expired',
            ],
            [
                'title' => 'Verano 2024',
                'description' => '$25 de descuento en tratamientos capilares para proteger tu cabello del sol',
                'discount_type' => Promotion::DISCOUNT_TYPE_FIXED,
                'discount_value' => 25,
                'is_first_booking_only' => false,
                'timing' => 'expired',
            ],
            [
                'title' => 'Especial Novias',
                'description' => '30% de descuento en paquetes de novia. Reserva tu fecha especial.',
                'discount_type' => Promotion::DISCOUNT_TYPE_PERCENTAGE,
                'discount_value' => 30,
                'is_first_booking_only' => false,
                'timing' => 'active',
            ],
            [
                'title' => 'Día de la Madre',
                'description' => 'Regalo perfecto: 25% de descuento en todos los servicios para mamá',
                'discount_type' => Promotion::DISCOUNT_TYPE_PERCENTAGE,
                'discount_value' => 25,
                'is_first_booking_only' => false,
                'timing' => 'future',
            ],
            [
                'title' => 'Recomienda y Gana',
                'description' => '$20 de descuento cuando traes a un amigo. Aplica para ambos.',
                'discount_type' => Promotion::DISCOUNT_TYPE_FIXED,
                'discount_value' => 20,
                'is_first_booking_only' => false,
                'timing' => 'active',
            ],
            [
                'title' => 'Fin de Año - Cambio de Look',
                'description' => '35% en coloración y mechas. ¡Estrena look para el año nuevo!',
                'discount_type' => Promotion::DISCOUNT_TYPE_PERCENTAGE,
                'discount_value' => 35,
                'is_first_booking_only' => false,
                'timing' => 'future',
            ],
            [
                'title' => 'Lunes Económico',
                'description' => '$15 de descuento en servicios de lunes. Comienza bien la semana.',
                'discount_type' => Promotion::DISCOUNT_TYPE_FIXED,
                'discount_value' => 15,
                'is_first_booking_only' => false,
                'timing' => 'active',
                'applicable_days' => [1], // Monday
            ],
        ];

        $count = 0;
        $statusCounts = [
            'active' => 0,
            'expired' => 0,
            'future' => 0,
        ];

        foreach ($promotionTemplates as $template) {
            // Assign to random branch
            $branch = $branches->random();

            // Generate unique code
            $code = strtoupper(Str::random(8));

            // Set dates based on timing
            switch ($template['timing']) {
                case 'active':
                    $validFrom = Carbon::now()->subMonths(1);
                    $validUntil = Carbon::now()->addMonths(2);
                    $isActive = true;
                    $statusCounts['active']++;
                    break;

                case 'expired':
                    $validFrom = Carbon::now()->subMonths(6);
                    $validUntil = Carbon::now()->subMonths(2);
                    $isActive = false;
                    $statusCounts['expired']++;
                    break;

                case 'future':
                    $validFrom = Carbon::now()->addMonths(1);
                    $validUntil = Carbon::now()->addMonths(3);
                    $isActive = true;
                    $statusCounts['future']++;
                    break;
            }

            // Usage limits
            $usageLimit = $faker->randomElement([null, 50, 100, 200]); // null = unlimited
            $userUsageLimit = $faker->randomElement([1, 2, 3, null]); // null = unlimited per user

            // Usage count (only for active/expired)
            $usageCount = 0;
            if ($template['timing'] === 'expired') {
                $usageCount = $usageLimit ?? $faker->numberBetween(30, 100);
            } elseif ($template['timing'] === 'active') {
                $maxUsage = $usageLimit ?? 50;
                $usageCount = $faker->numberBetween(5, min(30, $maxUsage - 5));
            }

            // Min purchase amount (some promotions have minimum)
            $minPurchaseAmount = $faker->boolean(40) ? $faker->randomElement([50, 75, 100]) : null;

            // Max discount amount (for percentage discounts)
            $maxDiscountAmount = $template['discount_type'] === Promotion::DISCOUNT_TYPE_PERCENTAGE
                ? $faker->randomElement([null, 50, 75, 100])
                : null;

            // Get some services for applicable_services (if not all services)
            $applicableServices = null;
            if ($faker->boolean(30)) { // 30% have specific services
                $branchServices = Service::where('branch_id', $branch->id)->pluck('id')->toArray();
                if (!empty($branchServices)) {
                    $applicableServices = $faker->randomElements(
                        $branchServices,
                        $faker->numberBetween(1, min(5, count($branchServices)))
                    );
                }
            }

            // Applicable days
            $applicableDays = $template['applicable_days'] ?? null;

            Promotion::create([
                'branch_id' => $branch->id,
                'code' => $code,
                'title' => $template['title'],
                'description' => $template['description'],
                'discount_type' => $template['discount_type'],
                'discount_value' => $template['discount_value'],
                'min_purchase_amount' => $minPurchaseAmount,
                'max_discount_amount' => $maxDiscountAmount,
                'usage_limit' => $usageLimit,
                'usage_count' => $usageCount,
                'user_usage_limit' => $userUsageLimit,
                'valid_from' => $validFrom,
                'valid_until' => $validUntil,
                'applicable_services' => $applicableServices,
                'applicable_days' => $applicableDays,
                'is_active' => $isActive,
                'is_first_booking_only' => $template['is_first_booking_only'],
                'is_public' => true,
                'created_at' => $validFrom->copy()->subDays(7),
                'updated_at' => now(),
            ]);

            $count++;
        }

        $this->command->info(' ' . $count . ' promotions created:');
        $this->command->info('   - ' . $statusCounts['active'] . ' active promotions');
        $this->command->info('   - ' . $statusCounts['expired'] . ' expired promotions');
        $this->command->info('   - ' . $statusCounts['future'] . ' future promotions');
    }
}
