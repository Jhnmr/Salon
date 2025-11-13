<?php

namespace Database\Seeders;

use App\Models\Branch;
use App\Models\Plan;
use Illuminate\Database\Seeder;

class BranchesSeeder extends Seeder
{
    public function run(): void
    {
        $this->command->info('🏢 Seeding Branches...');
        Branch::query()->delete();

        $basicPlan = Plan::where('slug', 'basic')->first();
        $proPlan = Plan::where('slug', 'professional')->first();
        $enterprisePlan = Plan::where('slug', 'enterprise')->first();

        $branches = [
            [
                'name' => 'Belleza Total San José',
                'slug' => 'belleza-total-san-jose',
                'description' => 'Premier beauty salon in San José',
                'email' => 'sanjose@bellezatotal.cr',
                'phone' => '+506 2222-3344',
                'address' => 'Avenida Central, Calle 5',
                'city' => 'San José',
                'state' => 'San José',
                'country' => 'Costa Rica',
                'postal_code' => '10101',
                'latitude' => 9.9281,
                'longitude' => -84.0907,
                'timezone' => 'America/Costa_Rica',
                'currency' => 'CRC',
                'language' => 'es',
                'business_hours' => json_encode([
                    'monday' => ['open' => '09:00', 'close' => '19:00'],
                    'tuesday' => ['open' => '09:00', 'close' => '19:00'],
                    'wednesday' => ['open' => '09:00', 'close' => '19:00'],
                    'thursday' => ['open' => '09:00', 'close' => '19:00'],
                    'friday' => ['open' => '09:00', 'close' => '20:00'],
                    'saturday' => ['open' => '08:00', 'close' => '18:00'],
                    'sunday' => ['open' => '10:00', 'close' => '15:00'],
                ]),
                'plan_id' => $proPlan?->id,
                'is_active' => true,
                'is_verified' => true,
                'admin_id' => null,
            ],
            [
                'name' => 'Salón Élite CDMX',
                'slug' => 'salon-elite-cdmx',
                'description' => 'Exclusive salon in Mexico City',
                'email' => 'cdmx@salonelite.mx',
                'phone' => '+52 55 1234-5678',
                'address' => 'Av. Presidente Masaryk 101',
                'city' => 'Ciudad de México',
                'state' => 'CDMX',
                'country' => 'Mexico',
                'postal_code' => '11560',
                'latitude' => 19.4326,
                'longitude' => -99.1332,
                'timezone' => 'America/Mexico_City',
                'currency' => 'MXN',
                'language' => 'es',
                'business_hours' => json_encode([
                    'monday' => ['open' => '10:00', 'close' => '20:00'],
                    'tuesday' => ['open' => '10:00', 'close' => '20:00'],
                    'wednesday' => ['open' => '10:00', 'close' => '20:00'],
                    'thursday' => ['open' => '10:00', 'close' => '20:00'],
                    'friday' => ['open' => '10:00', 'close' => '21:00'],
                    'saturday' => ['open' => '09:00', 'close' => '20:00'],
                    'sunday' => ['open' => '10:00', 'close' => '17:00'],
                ]),
                'plan_id' => $enterprisePlan?->id,
                'is_active' => true,
                'is_verified' => true,
                'admin_id' => null,
            ],
            [
                'name' => 'Glamour Studio Medellín',
                'slug' => 'glamour-studio-medellin',
                'description' => 'Trendy studio in El Poblado',
                'email' => 'medellin@glamourstudio.co',
                'phone' => '+57 4 345-6789',
                'address' => 'Carrera 43A #3-50',
                'city' => 'Medellín',
                'state' => 'Antioquia',
                'country' => 'Colombia',
                'postal_code' => '050021',
                'latitude' => 6.2088,
                'longitude' => -75.5671,
                'timezone' => 'America/Bogota',
                'currency' => 'COP',
                'language' => 'es',
                'business_hours' => json_encode([
                    'monday' => ['open' => '10:00', 'close' => '20:00'],
                    'tuesday' => ['open' => '10:00', 'close' => '20:00'],
                    'wednesday' => ['open' => '10:00', 'close' => '20:00'],
                    'thursday' => ['open' => '10:00', 'close' => '20:00'],
                    'friday' => ['open' => '10:00', 'close' => '21:00'],
                    'saturday' => ['open' => '09:00', 'close' => '20:00'],
                    'sunday' => ['open' => '10:00', 'close' => '17:00'],
                ]),
                'plan_id' => $proPlan?->id,
                'is_active' => true,
                'is_verified' => true,
                'admin_id' => null,
            ],
        ];

        foreach ($branches as $branchData) {
            Branch::create($branchData);
        }

        $this->command->info('✅ ' . count($branches) . ' branches created');
    }
}
