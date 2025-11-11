<?php

namespace Database\Seeders;

use App\Models\ServiceCategory;
use Illuminate\Database\Seeder;

class ServiceCategoriesSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $this->command->info('<¨ Seeding Service Categories...');

        // Clear existing categories
        ServiceCategory::query()->delete();

        $categories = [
            [
                'name' => 'Cabello',
                'slug' => 'cabello',
                'description' => 'Servicios completos de corte, coloración y tratamiento capilar',
                'icon' => '',
                'color' => '#FF6B6B',
                'is_active' => true,
                'sort_order' => 1,
                'children' => [
                    ['name' => 'Corte de Cabello Mujer', 'description' => 'Corte y estilo profesional para mujer', 'icon' => ''],
                    ['name' => 'Corte de Cabello Hombre', 'description' => 'Corte masculino clásico y moderno', 'icon' => ''],
                    ['name' => 'Corte de Niños', 'description' => 'Cortes especiales para los más pequeños', 'icon' => '=v'],
                    ['name' => 'Coloración Completa', 'description' => 'Tinte completo de raíces a puntas', 'icon' => '<¨'],
                    ['name' => 'Mechas/Highlights', 'description' => 'Mechas californianas, babylights', 'icon' => '('],
                    ['name' => 'Balayage', 'description' => 'Técnica de iluminación degradada', 'icon' => '<'],
                    ['name' => 'Alisado Brasileño', 'description' => 'Tratamiento de alisado con keratina', 'icon' => '=†'],
                    ['name' => 'Tratamiento Capilar', 'description' => 'Hidratación profunda y reconstrucción', 'icon' => '=§'],
                    ['name' => 'Peinado Especial', 'description' => 'Peinados para eventos y ocasiones', 'icon' => '=‡'],
                    ['name' => 'Extensiones', 'description' => 'Aplicación de extensiones naturales', 'icon' => '•'],
                ],
            ],
            [
                'name' => 'Uñas',
                'slug' => 'unas',
                'description' => 'Servicios de manicura, pedicura y nail art profesional',
                'icon' => '=…',
                'color' => '#FF8CC6',
                'is_active' => true,
                'sort_order' => 2,
                'children' => [
                    ['name' => 'Manicura Clásica', 'description' => 'Limado, cutícula y esmaltado', 'icon' => '=…'],
                    ['name' => 'Manicura Spa', 'description' => 'Manicura con exfoliación e hidratación', 'icon' => '('],
                    ['name' => 'Pedicura Clásica', 'description' => 'Cuidado completo de pies', 'icon' => '>¶'],
                    ['name' => 'Pedicura Spa', 'description' => 'Pedicura con masaje y parafina', 'icon' => '=†'],
                    ['name' => 'Uñas Acrílicas', 'description' => 'Esculpido de uñas acrílicas', 'icon' => '=…'],
                    ['name' => 'Uñas de Gel', 'description' => 'Uñas de gel con acabado natural', 'icon' => '('],
                    ['name' => 'Nail Art Básico', 'description' => 'Diseños simples y elegantes', 'icon' => '<¨'],
                    ['name' => 'Nail Art Premium', 'description' => 'Diseños elaborados con 3D y cristales', 'icon' => '=Ž'],
                    ['name' => 'Relleno de Uñas', 'description' => 'Mantenimiento de uñas artificiales', 'icon' => '='],
                    ['name' => 'Retiro de Uñas', 'description' => 'Retiro seguro sin daño', 'icon' => 'L'],
                ],
            ],
            [
                'name' => 'Rostro',
                'slug' => 'rostro',
                'description' => 'Maquillaje profesional y cuidado facial especializado',
                'icon' => '=„',
                'color' => '#FFC93C',
                'is_active' => true,
                'sort_order' => 3,
                'children' => [
                    ['name' => 'Maquillaje Social', 'description' => 'Maquillaje para el día a día', 'icon' => '=„'],
                    ['name' => 'Maquillaje de Noche', 'description' => 'Maquillaje glam para eventos', 'icon' => '('],
                    ['name' => 'Maquillaje de Novia', 'description' => 'Maquillaje especial para bodas', 'icon' => '=p'],
                    ['name' => 'Diseño de Cejas', 'description' => 'Perfilado y diseño profesional', 'icon' => '=A'],
                    ['name' => 'Microblading', 'description' => 'Cejas pelo a pelo semipermanentes', 'icon' => ''],
                    ['name' => 'Laminado de Cejas', 'description' => 'Efecto cejas peinadas 24/7', 'icon' => '=Ð'],
                    ['name' => 'Extensiones de Pestañas', 'description' => 'Pestañas volumen y efecto natural', 'icon' => '=A'],
                    ['name' => 'Lifting de Pestañas', 'description' => 'Rizador permanente de pestañas', 'icon' => '<'],
                    ['name' => 'Limpieza Facial', 'description' => 'Limpieza profunda con extracción', 'icon' => '>Ö'],
                    ['name' => 'Tratamiento Facial', 'description' => 'Hidratación y anti-edad', 'icon' => '=§'],
                ],
            ],
            [
                'name' => 'Barbería',
                'slug' => 'barberia',
                'description' => 'Servicios especializados de barbería masculina',
                'icon' => '>’',
                'color' => '#4ECDC4',
                'is_active' => true,
                'sort_order' => 4,
                'children' => [
                    ['name' => 'Corte Clásico', 'description' => 'Corte tradicional con tijera', 'icon' => ''],
                    ['name' => 'Corte Moderno', 'description' => 'Estilos actuales con fade', 'icon' => '=ˆ'],
                    ['name' => 'Corte + Barba', 'description' => 'Combo completo de barba y cabello', 'icon' => '>Ô'],
                    ['name' => 'Afeitado Clásico', 'description' => 'Afeitado con navaja y toallas calientes', 'icon' => '>’'],
                    ['name' => 'Diseño de Barba', 'description' => 'Perfilado y estilizado profesional', 'icon' => '('],
                    ['name' => 'Coloración de Barba', 'description' => 'Tinte para barba y bigote', 'icon' => '<¨'],
                    ['name' => 'Tratamiento Capilar', 'description' => 'Cuidado anticaída y fortalecimiento', 'icon' => '=§'],
                ],
            ],
            [
                'name' => 'Novias',
                'slug' => 'novias',
                'description' => 'Paquetes especiales para el día más importante',
                'icon' => '=p',
                'color' => '#FFD3E1',
                'is_active' => true,
                'sort_order' => 5,
                'children' => [
                    ['name' => 'Paquete Novia Completo', 'description' => 'Cabello, maquillaje y uñas', 'icon' => '=p'],
                    ['name' => 'Maquillaje de Novia', 'description' => 'Maquillaje HD larga duración', 'icon' => '=„'],
                    ['name' => 'Peinado de Novia', 'description' => 'Peinado personalizado con prueba', 'icon' => '=‡'],
                    ['name' => 'Prueba de Maquillaje', 'description' => 'Ensayo previo al evento', 'icon' => '('],
                    ['name' => 'Prueba de Peinado', 'description' => 'Ensayo de estilo', 'icon' => '=‡'],
                    ['name' => 'Manicura de Novia', 'description' => 'Uñas perfectas para el anillo', 'icon' => '=…'],
                ],
            ],
        ];

        $count = 0;
        $childCount = 0;

        foreach ($categories as $categoryData) {
            $children = $categoryData['children'] ?? [];
            unset($categoryData['children']);

            $category = ServiceCategory::create($categoryData);
            $count++;

            // Create subcategories
            foreach ($children as $childData) {
                $childData['parent_id'] = $category->id;
                $childData['is_active'] = true;
                $childData['color'] = $categoryData['color'];
                $childData['slug'] = \Illuminate\Support\Str::slug($childData['name']);
                $childData['sort_order'] = $childCount + 1;

                ServiceCategory::create($childData);
                $childCount++;
            }
        }

        $this->command->info(" Service Categories seeded successfully!");
        $this->command->info("   - {$count} parent categories created");
        $this->command->info("   - {$childCount} subcategories created");
    }
}
