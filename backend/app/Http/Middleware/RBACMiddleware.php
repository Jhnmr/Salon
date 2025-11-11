<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * RBAC (Role-Based Access Control) Middleware
 *
 * Validates user permissions before allowing access to routes
 * Usage: Route::middleware('rbac:create_cita')->get('/citas', ...);
 */
class RBACMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     * @param  string|null  $permission  Permission name required (e.g., 'create_cita')
     * @param  string|null  $mode  'any' or 'all' for multiple permissions
     */
    public function handle(Request $request, Closure $next, ?string $permission = null, ?string $mode = 'any'): Response
    {
        $user = $request->user();

        if (!$user) {
            return response()->json([
                'status' => 'error',
                'message' => 'Unauthenticated',
                'errors' => ['auth' => ['User is not authenticated']],
            ], 401);
        }

        // Super admin bypasses all permission checks
        if ($user->isSuperAdmin()) {
            return $next($request);
        }

        // If no permission specified, just check if user is authenticated
        if (!$permission) {
            return $next($request);
        }

        // Handle multiple permissions (comma-separated)
        $permissions = explode(',', $permission);
        $permissions = array_map('trim', $permissions);

        $hasPermission = false;

        if ($mode === 'all') {
            // User must have ALL specified permissions
            $hasPermission = $user->hasAllPermissions($permissions);
        } else {
            // User must have ANY of the specified permissions (default)
            if (count($permissions) === 1) {
                $hasPermission = $user->hasPermissionTo($permissions[0]);
            } else {
                $hasPermission = $user->hasAnyPermission($permissions);
            }
        }

        if (!$hasPermission) {
            return response()->json([
                'status' => 'error',
                'message' => 'Forbidden',
                'errors' => [
                    'permission' => [
                        'You do not have permission to perform this action',
                        'Required permission(s): ' . implode(', ', $permissions),
                    ],
                ],
            ], 403);
        }

        return $next($request);
    }
}
