<?php

namespace Database\Seeders;

use App\Models\Service;
use App\Models\ServiceCategory;
use App\Models\Branch;
use Illuminate\Database\Seeder;
use Faker\Factory as Faker;

class ServicesSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $this->command->info('  Seeding Services...');

        // Clear existing services
        Service::query()->delete();

        $faker = Faker::create('es_ES');

        // Get all branches
        $branches = Branch::all();

        if ($branches->isEmpty()) {
            $this->command->warn('�  No branches found. Please run BranchesSeeder first.');
            return;
        }

        // Get service categories (subcategories only - those with parent_id)
        $categories = ServiceCategory::whereNotNull('parent_id')->get();

        if ($categories->isEmpty()) {
            $this->command->warn('�  No service categories found. Please run ServiceCategoriesSeeder first.');
            return;
        }

        // Define service templates with pricing and duration
        $serviceTemplates = [
            // Hair Services
            'Corte de Cabello Mujer' => ['price' => [25, 45], 'duration' => [45, 60]],
            'Corte de Cabello Hombre' => ['price' => [15, 25], 'duration' => [30, 45]],
            'Corte de Ni�os' => ['price' => [12, 20], 'duration' => [30, 40]],
            'Coloraci�n Completa' => ['price' => [60, 120], 'duration' => [120, 180]],
            'Mechas/Highlights' => ['price' => [70, 130], 'duration' => [120, 180]],
            'Balayage' => ['price' => [80, 150], 'duration' => [150, 180]],
            'Alisado Brasile�o' => ['price' => [100, 200], 'duration' => [180, 240]],
            'Tratamiento Capilar' => ['price' => [30, 60], 'duration' => [60, 90]],
            'Peinado Especial' => ['price' => [40, 80], 'duration' => [60, 90]],
            'Extensiones' => ['price' => [150, 300], 'duration' => [180, 240]],

            // Nail Services
            'Manicura Cl�sica' => ['price' => [15, 25], 'duration' => [45, 60]],
            'Manicura Spa' => ['price' => [25, 40], 'duration' => [60, 75]],
            'Pedicura Cl�sica' => ['price' => [20, 30], 'duration' => [45, 60]],
            'Pedicura Spa' => ['price' => [30, 50], 'duration' => [60, 90]],
            'U�as Acr�licas' => ['price' => [35, 60], 'duration' => [90, 120]],
            'U�as de Gel' => ['price' => [40, 65], 'duration' => [90, 120]],
            'Nail Art B�sico' => ['price' => [5, 15], 'duration' => [15, 30]],
            'Nail Art Premium' => ['price' => [20, 40], 'duration' => [30, 60]],
            'Relleno de U�as' => ['price' => [25, 45], 'duration' => [60, 90]],
            'Retiro de U�as' => ['price' => [10, 20], 'duration' => [30, 45]],

            // Face Services
            'Maquillaje Social' => ['price' => [30, 50], 'duration' => [45, 60]],
            'Maquillaje de Noche' => ['price' => [40, 70], 'duration' => [60, 90]],
            'Maquillaje de Novia' => ['price' => [80, 150], 'duration' => [90, 120]],
            'Dise�o de Cejas' => ['price' => [10, 20], 'duration' => [30, 45]],
            'Microblading' => ['price' => [150, 300], 'duration' => [120, 180]],
            'Laminado de Cejas' => ['price' => [40, 70], 'duration' => [60, 75]],
            'Extensiones de Pesta�as' => ['price' => [60, 120], 'duration' => [120, 150]],
            'Lifting de Pesta�as' => ['price' => [40, 70], 'duration' => [60, 75]],
            'Limpieza Facial' => ['price' => [35, 60], 'duration' => [60, 90]],
            'Tratamiento Facial' => ['price' => [50, 90], 'duration' => [75, 120]],

            // Barber�a Services
            'Corte Cl�sico' => ['price' => [15, 25], 'duration' => [30, 45]],
            'Corte Moderno' => ['price' => [20, 35], 'duration' => [45, 60]],
            'Corte + Barba' => ['price' => [25, 45], 'duration' => [60, 75]],
            'Afeitado Cl�sico' => ['price' => [20, 35], 'duration' => [45, 60]],
            'Dise�o de Barba' => ['price' => [15, 25], 'duration' => [30, 45]],
            'Coloraci�n de Barba' => ['price' => [25, 40], 'duration' => [45, 60]],

            // Bridal Services
            'Paquete Novia Completo' => ['price' => [200, 400], 'duration' => [180, 240]],
            'Prueba de Maquillaje' => ['price' => [30, 50], 'duration' => [60, 75]],
            'Prueba de Peinado' => ['price' => [30, 50], 'duration' => [60, 75]],
            'Peinado de Novia' => ['price' => [80, 150], 'duration' => [90, 120]],
            'Manicura de Novia' => ['price' => [30, 50], 'duration' => [60, 75]],
        ];

        $count = 0;
        $sortOrder = 1;

        // Create services for each branch
        foreach ($branches as $branch) {
            // Each branch gets a subset of services (15-20 services per branch)
            $selectedServices = $faker->randomElements(array_keys($serviceTemplates), $faker->numberBetween(15, 20));

            foreach ($selectedServices as $serviceName) {
                $template = $serviceTemplates[$serviceName];

                // Find matching category by name
                $category = $categories->first(function ($cat) use ($serviceName) {
                    return stripos($cat->name, explode(' ', $serviceName)[0]) !== false
                        || stripos($serviceName, explode(' ', $cat->name)[0]) !== false;
                });

                // If no match found, use random category
                if (!$category) {
                    $category = $categories->random();
                }

                // Price varies by branch and within range
                $price = $faker->randomFloat(2, $template['price'][0], $template['price'][1]);

                // Duration varies within range
                $duration = $faker->numberBetween($template['duration'][0], $template['duration'][1]);

                // Generate description
                $descriptions = [
                    "Servicio profesional de {service} con productos de alta calidad.",
                    "Nuestro servicio de {service} incluye consulta personalizada y acabado impecable.",
                    "Experimenta el mejor {service} con nuestros especialistas certificados.",
                    "Servicio premium de {service}. Resultados garantizados.",
                    "{service} profesional con t�cnicas modernas y productos de primera l�nea.",
                ];

                $description = str_replace('{service}', strtolower($serviceName), $faker->randomElement($descriptions));

                // Deposit requirement for services > $80
                $requiresDeposit = $price > 80;
                $depositAmount = $requiresDeposit ? round($price * 0.20, 2) : 0;

                Service::create([
                    'branch_id' => $branch->id,
                    'category_id' => $category->id,
                    'name' => $serviceName,
                    'description' => $description,
                    'price' => $price,
                    'duration_minutes' => $duration,
                    'is_active' => true, // All active as per requirements
                    'image_url' => 'https://picsum.photos/seed/' . $faker->uuid . '/800/600',
                    'sort_order' => $sortOrder++,
                    'requires_deposit' => $requiresDeposit,
                    'deposit_amount' => $depositAmount,
                ]);

                $count++;
            }
        }


        $depositCount = Service::where('requires_deposit', true)->count();

        $this->command->info('✅ ' . $count . ' services created across ' . $branches->count() . ' branches');
        $this->command->info('   - Average: ~' . round($count / $branches->count()) . ' services per branch');
        $this->command->info('   - ' . $depositCount . ' services require deposit (' . round($depositCount/$count*100) . '%)');
        $this->command->info('   Price range: $' . number_format(Service::min('price'), 2) . ' - $' . number_format(Service::max('price'), 2));
        $this->command->info('   Average price: $' . number_format(Service::avg('price'), 2));
    }
}
