<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Role;
use App\Models\Branch;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UsersSeeder extends Seeder
{
    public function run(): void
    {
        $this->command->info('👤 Seeding Users...');
        
        User::query()->delete();
        
        $roles = [
            'client' => Role::where('name', 'client')->first(),
            'stylist' => Role::where('name', 'stylist')->first(),
            'admin' => Role::where('name', 'admin')->first(),
            'super_admin' => Role::where('name', 'super_admin')->first(),
        ];
        
        $branches = Branch::all();
        $password = Hash::make('password');
        
        // Super Admin
        $superAdmin = User::create([
            'name' => 'System Administrator',
            'email' => 'admin@salon.com',
            'password' => $password,
            'role' => 'super_admin',
            'is_active' => true,
        ]);
        $superAdmin->assignRole($roles['super_admin']);
        
        // Branch Admins
        $adminCount = 0;
        foreach ($branches as $branch) {
            $admin = User::create([
                'name' => "Admin " . $branch->name,
                'email' => "admin.{$branch->slug}@salon.com",
                'password' => $password,
                'role' => 'admin',
                'is_active' => true,
            ]);
            $admin->assignRole($roles['admin']);
            $branch->update(['admin_id' => $admin->id]);
            $adminCount++;
        }
        
        // Stylists
        $stylistNames = [
            'María Rodríguez', 'Carlos Martínez', 'Ana García', 'Luis Hernández',
            'Sofia López', 'Diego González', 'Carmen Pérez', 'Miguel Sánchez',
            'Isabella Torres', 'Fernando Ramírez', 'Valentina Flores', 'Andrés Castro',
            'Camila Morales', 'Javier Ortiz', 'Gabriela Ruiz', 'Pablo Díaz',
            'Daniela Silva', 'Ricardo Herrera', 'Lucía Medina', 'Sebastián Vargas',
            'Natalia Romero', 'Eduardo Jiménez', 'Andrea Núñez', 'Roberto Cruz',
            'Carolina Mendoza'
        ];
        
        foreach ($stylistNames as $index => $name) {
            $stylist = User::create([
                'name' => $name,
                'email' => 'stylist' . ($index + 1) . '@salon.com',
                'password' => $password,
                'role' => 'stylist',
                'is_active' => true,
            ]);
            $stylist->assignRole($roles['stylist']);
        }
        
        // Clients
        for ($i = 1; $i <= 60; $i++) {
            $client = User::create([
                'name' => "Client User {$i}",
                'email' => "client{$i}@test.com",
                'password' => $password,
                'role' => 'client',
                'is_active' => true,
            ]);
            $client->assignRole($roles['client']);
        }
        
        $this->command->info("✅ Users: 1 super_admin, {$adminCount} admins, 25 stylists, 60 clients");
    }
}
