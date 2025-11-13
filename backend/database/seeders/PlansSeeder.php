<?php

namespace Database\Seeders;

use App\Models\Plan;
use Illuminate\Database\Seeder;

class PlansSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $this->command->info('=Ž Seeding Subscription Plans...');

        // Clear existing plans
        Plan::query()->delete();

        $plans = [
            [
                'name' => 'Basic',
                'slug' => 'basic',
                'description' => 'Perfect for independent stylists and small salons just getting started',
                'price' => 29.00,
                'billing_period' => 'monthly',
                'trial_days' => 14,
                'features' => json_encode([
                    '1 branch location',
                    'Up to 5 stylists',
                    'Unlimited appointments',
                    'Online booking system',
                    'Basic analytics',
                    'Email notifications',
                    'Mobile app access',
                    'Client management',
                    'Payment processing (7% commission)',
                    'Standard support',
                ]),
                'limits' => json_encode([
                    'branches' => 1,
                    'stylists' => 5,
                    'appointments' => -1, // unlimited
                    'storage_gb' => 5,
                    'sms_notifications' => 100,
                ]),
                'is_active' => true,
                'is_popular' => false,
                'sort_order' => 1,
            ],
            [
                'name' => 'Professional',
                'slug' => 'professional',
                'description' => 'Ideal for growing salons with multiple locations',
                'price' => 79.00,
                'billing_period' => 'monthly',
                'trial_days' => 14,
                'features' => json_encode([
                    'Up to 3 branch locations',
                    'Up to 20 stylists',
                    'Unlimited appointments',
                    'Online booking system',
                    'Advanced analytics & reports',
                    'Email & SMS notifications',
                    'Mobile app access',
                    'Client management',
                    'Payment processing (6% commission)',
                    'Inventory management',
                    'Staff scheduling',
                    'Marketing tools',
                    'Priority support',
                    'Custom branding',
                ]),
                'limits' => json_encode([
                    'branches' => 3,
                    'stylists' => 20,
                    'appointments' => -1,
                    'storage_gb' => 25,
                    'sms_notifications' => 500,
                ]),
                'is_active' => true,
                'is_popular' => true,
                'sort_order' => 2,
            ],
            [
                'name' => 'Enterprise',
                'slug' => 'enterprise',
                'description' => 'For large salon chains and franchises requiring full control',
                'price' => 199.00,
                'billing_period' => 'monthly',
                'trial_days' => 30,
                'features' => json_encode([
                    'Unlimited branch locations',
                    'Unlimited stylists',
                    'Unlimited appointments',
                    'Online booking system',
                    'Enterprise analytics & BI',
                    'Email, SMS & Push notifications',
                    'Mobile app access',
                    'Client management',
                    'Payment processing (5% commission)',
                    'Inventory management',
                    'Staff scheduling',
                    'Marketing automation',
                    'Multi-location management',
                    'API access',
                    'White-label solution',
                    'Dedicated account manager',
                    '24/7 Priority support',
                    'Custom integrations',
                    'Advanced security features',
                ]),
                'limits' => json_encode([
                    'branches' => -1,
                    'stylists' => -1,
                    'appointments' => -1,
                    'storage_gb' => 100,
                    'sms_notifications' => -1,
                ]),
                'is_active' => true,
                'is_popular' => false,
                'sort_order' => 3,
            ],
            [
                'name' => 'Free Trial',
                'slug' => 'free-trial',
                'description' => 'Try all Professional features free for 14 days',
                'price' => 0.00,
                'billing_period' => 'monthly',
                'trial_days' => 14,
                'features' => json_encode([
                    'All Professional features',
                    'No credit card required',
                    'Cancel anytime',
                ]),
                'limits' => json_encode([
                    'branches' => 1,
                    'stylists' => 3,
                    'appointments' => 50,
                    'storage_gb' => 2,
                    'sms_notifications' => 20,
                ]),
                'is_active' => true,
                'is_popular' => false,
                'sort_order' => 0,
            ],
        ];

        foreach ($plans as $planData) {
            Plan::create($planData);
        }

        $this->command->info(' Plans seeded successfully!');
        $this->command->info('   - 4 subscription plans created (Free Trial, Basic, Professional, Enterprise)');
    }
}
