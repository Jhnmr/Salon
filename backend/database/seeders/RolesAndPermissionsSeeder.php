<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Role;
use App\Models\Permission;

/**
 * Roles and Permissions Seeder
 *
 * Seeds initial roles and permissions for the RBAC system
 */
class RolesAndPermissionsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create roles
        $roles = $this->createRoles();

        // Create permissions
        $permissions = $this->createPermissions();

        // Assign permissions to roles
        $this->assignPermissionsToRoles($roles, $permissions);
    }

    /**
     * Create system roles
     *
     * @return array
     */
    private function createRoles(): array
    {
        $rolesData = [
            [
                'name' => 'client',
                'display_name' => 'Client',
                'description' => 'Regular customer who books appointments',
                'is_system_role' => true,
            ],
            [
                'name' => 'stylist',
                'display_name' => 'Stylist',
                'description' => 'Professional stylist who provides services',
                'is_system_role' => true,
            ],
            [
                'name' => 'admin',
                'display_name' => 'Administrator',
                'description' => 'Branch administrator with management capabilities',
                'is_system_role' => true,
            ],
            [
                'name' => 'super_admin',
                'display_name' => 'Super Administrator',
                'description' => 'Platform super administrator with full access',
                'is_system_role' => true,
            ],
        ];

        $roles = [];
        foreach ($rolesData as $roleData) {
            $roles[$roleData['name']] = Role::firstOrCreate(
                ['name' => $roleData['name']],
                $roleData
            );
        }

        return $roles;
    }

    /**
     * Create system permissions
     *
     * @return array
     */
    private function createPermissions(): array
    {
        $permissionsData = [
            // Citas (Reservations/Appointments)
            ['name' => 'create_cita', 'display_name' => 'Create Appointment', 'description' => 'Create new appointments', 'resource' => 'cita', 'action' => 'create', 'group' => 'appointments'],
            ['name' => 'read_cita', 'display_name' => 'Read Appointment', 'description' => 'View appointment details', 'resource' => 'cita', 'action' => 'read', 'group' => 'appointments'],
            ['name' => 'update_cita', 'display_name' => 'Update Appointment', 'description' => 'Modify appointment details', 'resource' => 'cita', 'action' => 'update', 'group' => 'appointments'],
            ['name' => 'delete_cita', 'display_name' => 'Delete Appointment', 'description' => 'Cancel/delete appointments', 'resource' => 'cita', 'action' => 'delete', 'group' => 'appointments'],
            ['name' => 'manage_cita', 'display_name' => 'Manage Appointments', 'description' => 'Full control over appointments', 'resource' => 'cita', 'action' => 'manage', 'group' => 'appointments'],

            // Users
            ['name' => 'create_user', 'display_name' => 'Create User', 'description' => 'Create new users', 'resource' => 'user', 'action' => 'create', 'group' => 'users'],
            ['name' => 'read_user', 'display_name' => 'Read User', 'description' => 'View user details', 'resource' => 'user', 'action' => 'read', 'group' => 'users'],
            ['name' => 'update_user', 'display_name' => 'Update User', 'description' => 'Modify user details', 'resource' => 'user', 'action' => 'update', 'group' => 'users'],
            ['name' => 'delete_user', 'display_name' => 'Delete User', 'description' => 'Delete users', 'resource' => 'user', 'action' => 'delete', 'group' => 'users'],
            ['name' => 'manage_user', 'display_name' => 'Manage Users', 'description' => 'Full control over users', 'resource' => 'user', 'action' => 'manage', 'group' => 'users'],

            // Services
            ['name' => 'create_service', 'display_name' => 'Create Service', 'description' => 'Create new services', 'resource' => 'service', 'action' => 'create', 'group' => 'services'],
            ['name' => 'read_service', 'display_name' => 'Read Service', 'description' => 'View service details', 'resource' => 'service', 'action' => 'read', 'group' => 'services'],
            ['name' => 'update_service', 'display_name' => 'Update Service', 'description' => 'Modify service details', 'resource' => 'service', 'action' => 'update', 'group' => 'services'],
            ['name' => 'delete_service', 'display_name' => 'Delete Service', 'description' => 'Delete services', 'resource' => 'service', 'action' => 'delete', 'group' => 'services'],
            ['name' => 'manage_service', 'display_name' => 'Manage Services', 'description' => 'Full control over services', 'resource' => 'service', 'action' => 'manage', 'group' => 'services'],

            // Branches
            ['name' => 'create_branch', 'display_name' => 'Create Branch', 'description' => 'Create new branches', 'resource' => 'branch', 'action' => 'create', 'group' => 'branches'],
            ['name' => 'read_branch', 'display_name' => 'Read Branch', 'description' => 'View branch details', 'resource' => 'branch', 'action' => 'read', 'group' => 'branches'],
            ['name' => 'update_branch', 'display_name' => 'Update Branch', 'description' => 'Modify branch details', 'resource' => 'branch', 'action' => 'update', 'group' => 'branches'],
            ['name' => 'delete_branch', 'display_name' => 'Delete Branch', 'description' => 'Delete branches', 'resource' => 'branch', 'action' => 'delete', 'group' => 'branches'],
            ['name' => 'manage_branch', 'display_name' => 'Manage Branches', 'description' => 'Full control over branches', 'resource' => 'branch', 'action' => 'manage', 'group' => 'branches'],

            // Payments
            ['name' => 'create_payment', 'display_name' => 'Create Payment', 'description' => 'Process payments', 'resource' => 'payment', 'action' => 'create', 'group' => 'payments'],
            ['name' => 'read_payment', 'display_name' => 'Read Payment', 'description' => 'View payment details', 'resource' => 'payment', 'action' => 'read', 'group' => 'payments'],
            ['name' => 'update_payment', 'display_name' => 'Update Payment', 'description' => 'Modify payment details', 'resource' => 'payment', 'action' => 'update', 'group' => 'payments'],
            ['name' => 'manage_payment', 'display_name' => 'Manage Payments', 'description' => 'Full control over payments', 'resource' => 'payment', 'action' => 'manage', 'group' => 'payments'],

            // Invoices
            ['name' => 'read_invoice', 'display_name' => 'Read Invoice', 'description' => 'View invoices', 'resource' => 'invoice', 'action' => 'read', 'group' => 'invoices'],
            ['name' => 'manage_invoice', 'display_name' => 'Manage Invoices', 'description' => 'Full control over invoices', 'resource' => 'invoice', 'action' => 'manage', 'group' => 'invoices'],

            // Reviews
            ['name' => 'create_review', 'display_name' => 'Create Review', 'description' => 'Write reviews', 'resource' => 'review', 'action' => 'create', 'group' => 'reviews'],
            ['name' => 'read_review', 'display_name' => 'Read Review', 'description' => 'View reviews', 'resource' => 'review', 'action' => 'read', 'group' => 'reviews'],
            ['name' => 'update_review', 'display_name' => 'Update Review', 'description' => 'Modify reviews', 'resource' => 'review', 'action' => 'update', 'group' => 'reviews'],
            ['name' => 'delete_review', 'display_name' => 'Delete Review', 'description' => 'Delete reviews', 'resource' => 'review', 'action' => 'delete', 'group' => 'reviews'],

            // Notifications
            ['name' => 'read_notification', 'display_name' => 'Read Notification', 'description' => 'View notifications', 'resource' => 'notification', 'action' => 'read', 'group' => 'notifications'],
            ['name' => 'manage_notification', 'display_name' => 'Manage Notifications', 'description' => 'Full control over notifications', 'resource' => 'notification', 'action' => 'manage', 'group' => 'notifications'],

            // Audit Logs
            ['name' => 'read_audit_log', 'display_name' => 'Read Audit Log', 'description' => 'View audit logs', 'resource' => 'audit_log', 'action' => 'read', 'group' => 'audit'],

            // Dashboard
            ['name' => 'view_dashboard', 'display_name' => 'View Dashboard', 'description' => 'Access dashboard', 'resource' => 'dashboard', 'action' => 'read', 'group' => 'dashboard'],
        ];

        $permissions = [];
        foreach ($permissionsData as $permissionData) {
            $permission = Permission::firstOrCreate(
                ['name' => $permissionData['name']],
                $permissionData
            );
            $permissions[$permission->name] = $permission;
        }

        return $permissions;
    }

    /**
     * Assign permissions to roles
     *
     * @param array $roles
     * @param array $permissions
     * @return void
     */
    private function assignPermissionsToRoles(array $roles, array $permissions): void
    {
        // CLIENT permissions
        $clientPermissions = [
            'create_cita', 'read_cita', 'update_cita', 'delete_cita',
            'read_service',
            'create_payment', 'read_payment',
            'read_invoice',
            'create_review', 'read_review', 'update_review',
            'read_notification',
            'view_dashboard',
        ];
        $roles['client']->syncPermissions(
            collect($permissions)->whereIn('name', $clientPermissions)->pluck('id')->toArray()
        );

        // STYLIST permissions
        $stylistPermissions = [
            'read_cita', 'update_cita',
            'read_service',
            'read_payment',
            'read_invoice',
            'read_review',
            'read_notification',
            'view_dashboard',
        ];
        $roles['stylist']->syncPermissions(
            collect($permissions)->whereIn('name', $stylistPermissions)->pluck('id')->toArray()
        );

        // ADMIN permissions
        $adminPermissions = [
            'manage_cita',
            'create_user', 'read_user', 'update_user',
            'manage_service',
            'read_branch', 'update_branch',
            'manage_payment',
            'manage_invoice',
            'read_review', 'delete_review',
            'manage_notification',
            'view_dashboard',
        ];
        $roles['admin']->syncPermissions(
            collect($permissions)->whereIn('name', $adminPermissions)->pluck('id')->toArray()
        );

        // SUPER_ADMIN - No need to assign permissions, they bypass all checks
        // But we'll assign all permissions for consistency
        $roles['super_admin']->syncPermissions(
            collect($permissions)->pluck('id')->toArray()
        );
    }
}
