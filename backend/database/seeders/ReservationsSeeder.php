<?php

namespace Database\Seeders;

use App\Models\Reservation;
use App\Models\User;
use App\Models\Stylist;
use App\Models\Service;
use App\Models\Branch;
use Illuminate\Database\Seeder;
use Carbon\Carbon;
use Faker\Factory as Faker;

class ReservationsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $this->command->info('📅 Seeding Reservations...');

        // Clear existing reservations
        Reservation::query()->delete();

        $faker = Faker::create('es_ES');

        // Get all clients, stylists, and services
        $clients = User::whereHas('roles', function ($query) {
            $query->where('name', 'client');
        })->get();

        $stylists = Stylist::with('user')->get();
        $services = Service::where('is_active', true)->get();

        if ($clients->isEmpty() || $stylists->isEmpty() || $services->isEmpty()) {
            $this->command->warn('⚠️  Missing required data. Please run previous seeders first.');
            return;
        }

        // Status distribution:
        // 50% completed, 30% confirmed, 15% pending, 5% cancelled
        $statuses = array_merge(
            array_fill(0, 100, 'completed'),
            array_fill(0, 60, 'confirmed'),
            array_fill(0, 30, 'pending'),
            array_fill(0, 10, 'cancelled')
        );

        // Notes templates
        $notesTemplates = [
            'Cliente prefiere productos sin sulfatos',
            'Alergia a tintes con amoníaco',
            'Primera visita',
            'Cliente regular - conoce sus preferencias',
            'Solicita música relajante',
            'Prefiere conversación mínima',
            'Celebración especial',
            'Cambio de look dramático',
            null, // Many reservations don't have notes
            null,
            null,
        ];

        $count = 0;
        $statusCounts = [
            'completed' => 0,
            'confirmed' => 0,
            'pending' => 0,
            'cancelled' => 0,
        ];

        // Create 200 reservations
        for ($i = 0; $i < 200; $i++) {
            $status = $faker->randomElement($statuses);
            $statusCounts[$status]++;

            // Select random client, stylist, and service
            $client = $clients->random();
            $stylist = $stylists->random();
            $service = $services->where('branch_id', $stylist->branch_id)->random();

            // If no service for that branch, pick any service
            if (!$service) {
                $service = $services->random();
            }

            // Date distribution:
            // 50% in past 3 months (for completed/cancelled)
            // 50% in next 2 months (for confirmed/pending)
            if (in_array($status, ['completed', 'cancelled'])) {
                // Past appointments
                $scheduledAt = Carbon::now()
                    ->subDays($faker->numberBetween(1, 90))
                    ->setTime($faker->numberBetween(9, 18), $faker->randomElement([0, 15, 30, 45]));
            } else {
                // Future appointments
                $scheduledAt = Carbon::now()
                    ->addDays($faker->numberBetween(1, 60))
                    ->setTime($faker->numberBetween(9, 18), $faker->randomElement([0, 15, 30, 45]));
            }

            // Notes (30% have notes)
            $notes = $faker->boolean(30) ? $faker->randomElement($notesTemplates) : null;

            // Calculate total price from service
            $totalPrice = floatval($service->price);

            Reservation::create([
                'client_id' => $client->id,
                'stylist_id' => $stylist->user_id,
                'service_id' => $service->id,
                'scheduled_at' => $scheduledAt,
                'status' => $status,
                'notes' => $notes,
                'total_price' => $totalPrice,
                'created_at' => $scheduledAt->copy()->subDays($faker->numberBetween(1, 7)),
                'updated_at' => now(),
            ]);

            $count++;
        }

        $this->command->info('✅ ' . $count . ' reservations created:');
        $this->command->info('   - ' . $statusCounts['completed'] . ' completed (' . round($statusCounts['completed']/$count*100) . '%)');
        $this->command->info('   - ' . $statusCounts['confirmed'] . ' confirmed (' . round($statusCounts['confirmed']/$count*100) . '%)');
        $this->command->info('   - ' . $statusCounts['pending'] . ' pending (' . round($statusCounts['pending']/$count*100) . '%)');
        $this->command->info('   - ' . $statusCounts['cancelled'] . ' cancelled (' . round($statusCounts['cancelled']/$count*100) . '%)');
    }
}
