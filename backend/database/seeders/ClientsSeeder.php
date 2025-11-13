<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Client;
use Illuminate\Database\Seeder;
use Faker\Factory as Faker;

class ClientsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $this->command->info('👤 Seeding Clients...');

        // Clear existing clients
        Client::query()->delete();

        $faker = Faker::create('es_ES');

        // Get all client users
        $clientUsers = User::whereHas('roles', function ($query) {
            $query->where('name', 'client');
        })->get();

        // Cities with coordinates (Costa Rica, Mexico, Colombia)
        $cities = [
            ['name' => 'San José', 'lat' => 9.9281, 'lng' => -84.0907, 'country' => 'Costa Rica'],
            ['name' => 'Heredia', 'lat' => 9.9989, 'lng' => -84.1196, 'country' => 'Costa Rica'],
            ['name' => 'Cartago', 'lat' => 9.8647, 'lng' => -83.9195, 'country' => 'Costa Rica'],
            ['name' => 'Ciudad de México', 'lat' => 19.4326, 'lng' => -99.1332, 'country' => 'Mexico'],
            ['name' => 'Guadalajara', 'lat' => 20.6597, 'lng' => -103.3496, 'country' => 'Mexico'],
            ['name' => 'Monterrey', 'lat' => 25.6866, 'lng' => -100.3161, 'country' => 'Mexico'],
            ['name' => 'Medellín', 'lat' => 6.2088, 'lng' => -75.5671, 'country' => 'Colombia'],
            ['name' => 'Bogotá', 'lat' => 4.7110, 'lng' => -74.0721, 'country' => 'Colombia'],
            ['name' => 'Cali', 'lat' => 3.4516, 'lng' => -76.5320, 'country' => 'Colombia'],
        ];

        // Preferences options
        $servicePreferences = [
            'Corte', 'Coloración', 'Tratamientos', 'Manicura', 'Pedicura',
            'Maquillaje', 'Cejas', 'Pestañas', 'Barbería', 'Alisados',
        ];

        $stylingPreferences = [
            'Moderno', 'Clásico', 'Casual', 'Elegante', 'Atrevido',
        ];

        $count = 0;
        foreach ($clientUsers as $user) {
            // Set phone on user if not already set
            if (empty($user->phone)) {
                $user->update([
                    'phone' => $faker->phoneNumber(),
                ]);
            }

            // Random city
            $city = $faker->randomElement($cities);

            // Add some variation to coordinates (within ~5km radius)
            $lat = $city['lat'] + $faker->randomFloat(4, -0.05, 0.05);
            $lng = $city['lng'] + $faker->randomFloat(4, -0.05, 0.05);

            // Generate address
            $address = $faker->streetAddress . ', ' . $city['name'] . ', ' . $city['country'];

            // Random total spent (0-5000) and appointments (0-50)
            $totalAppointments = $faker->numberBetween(0, 50);
            $totalSpent = $faker->randomFloat(2, 0, 5000);

            // VIP status (20% chance, or if spent > $3000)
            $isVip = $faker->boolean(20) || $totalSpent > 3000;

            // Random preferences
            $preferences = [
                'preferred_services' => $faker->randomElements($servicePreferences, $faker->numberBetween(2, 5)),
                'preferred_style' => $faker->randomElement($stylingPreferences),
                'appointment_reminders' => $faker->boolean(80), // 80% want reminders
                'newsletter_subscription' => $faker->boolean(60), // 60% subscribed
                'language' => $faker->randomElement(['es', 'en']),
                'is_vip' => $isVip, // VIP flag in preferences
            ];

            // Gender distribution
            $genders = [Client::GENDER_FEMALE, Client::GENDER_MALE, Client::GENDER_OTHER, Client::GENDER_PREFER_NOT_TO_SAY];
            $gender = $faker->randomElement($genders);

            // Birth date (18-70 years old)
            $birthDate = $faker->dateTimeBetween('-70 years', '-18 years');

            Client::create([
                'user_id' => $user->id,
                'location_lat' => $lat,
                'location_lng' => $lng,
                'saved_address' => $address,
                'preferences' => $preferences,
                'birth_date' => $birthDate,
                'gender' => $gender,
                'total_appointments' => $totalAppointments,
                'total_spent' => $totalSpent,
            ]);

            $count++;
        }

        // Count VIP clients
        $vipCount = Client::whereRaw("JSON_EXTRACT(preferences, '$.is_vip') = true")->count();

        $this->command->info('✅ ' . $count . ' client profiles created');
        $this->command->info('   - ' . $vipCount . ' VIP clients (' . round($vipCount/$count*100) . '%)');
        $this->command->info('   Average spent: $' . number_format(Client::avg('total_spent'), 2));
        $this->command->info('   Average appointments: ' . round(Client::avg('total_appointments')));
    }
}
