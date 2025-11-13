<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     *
     * This is the master seeder that orchestrates all other seeders
     * in the correct order to maintain referential integrity.
     */
    public function run(): void
    {
        $this->command->info('🌱 Starting SALON Database Seeding...');
        $this->command->newLine();

        // 1. Core System Data (no dependencies)
        $this->call([
            RolesAndPermissionsSeeder::class,
            PlansSeeder::class,
            ServiceCategoriesSeeder::class,
        ]);

        // 2. Location and Branch Data
        $this->call([
            BranchesSeeder::class,
        ]);

        // 3. Users (depends on roles and branches)
        $this->call([
            UsersSeeder::class,
        ]);

        // 4. Stylists and Clients (depends on users and branches)
        $this->call([
            StylistsSeeder::class,
            ClientsSeeder::class,
        ]);

        // 5. Services (depends on branches and categories)
        $this->call([
            ServicesSeeder::class,
        ]);

        // 6. Reservations (depends on clients, stylists, services)
        $this->call([
            ReservationsSeeder::class,
        ]);

        // 7. Payments and Invoices (depends on reservations)
        $this->call([
            PaymentsSeeder::class,
            InvoicesSeeder::class,
        ]);

        // 8. Reviews (depends on completed reservations)
        $this->call([
            ReviewsSeeder::class,
        ]);

        // 9. Social Features (depends on users and stylists)
        $this->call([
            PostsSeeder::class,
            ConversationsSeeder::class,
        ]);

        // 10. Promotions (depends on branches)
        $this->call([
            PromotionsSeeder::class,
        ]);

        $this->command->newLine();
        $this->command->info('✅ Database seeding completed successfully!');
        $this->command->info('   The SALON platform is now ready for use.');
    }
}
