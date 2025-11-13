/**
 * SALON PWA - Protected Route Component
 * Route guard for authentication and role-based access control
 */

import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

/**
 * ProtectedRoute Component
 * Wraps routes that require authentication and/or specific roles
 *
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components to render if authorized
 * @param {string|Array<string>} props.roles - Required role(s) to access the route
 * @param {string} props.redirectTo - Path to redirect if unauthorized (default: /login)
 * @param {boolean} props.requireAuth - Require authentication (default: true)
 */
const ProtectedRoute = ({
  children,
  roles = null,
  redirectTo = '/login',
  requireAuth = true,
}) => {
  const { isAuthenticated, isLoading, user, hasRole } = useAuth();
  const location = useLocation();

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-neutral-600 dark:text-neutral-400">Loading...</p>
        </div>
      </div>
    );
  }

  // Check authentication requirement
  if (requireAuth && !isAuthenticated) {
    // Redirect to login, but save the attempted location
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  // Check role-based access
  if (roles && user) {
    const hasRequiredRole = hasRole(roles);

    if (!hasRequiredRole) {
      // User is authenticated but doesn't have required role
      return <Navigate to="/unauthorized" replace />;
    }
  }

  // User is authenticated and authorized
  return children;
};

/**
 * PublicOnlyRoute Component
 * Redirects authenticated users away from public-only routes (like login/register)
 *
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components to render if not authenticated
 * @param {string} props.redirectTo - Path to redirect if authenticated (default: /dashboard)
 */
export const PublicOnlyRoute = ({ children, redirectTo = '/dashboard' }) => {
  const { isAuthenticated, isLoading, user } = useAuth();
  const location = useLocation();

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-neutral-600 dark:text-neutral-400">Loading...</p>
        </div>
      </div>
    );
  }

  // If authenticated, redirect based on user role
  if (isAuthenticated && user) {
    // Get the intended redirect from location state, or use role-based default
    const from = location.state?.from?.pathname;

    if (from) {
      return <Navigate to={from} replace />;
    }

    // Role-based redirection
    const roleRedirects = {
      admin: '/admin/dashboard',
      stylist: '/stylist/dashboard',
      client: '/client/dashboard',
    };

    const destination = roleRedirects[user.role] || redirectTo;
    return <Navigate to={destination} replace />;
  }

  // User is not authenticated, show the public route
  return children;
};

/**
 * RoleBasedRoute Component
 * Renders different content based on user role
 *
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.admin - Content for admin role
 * @param {React.ReactNode} props.stylist - Content for stylist role
 * @param {React.ReactNode} props.client - Content for client role
 * @param {React.ReactNode} props.fallback - Fallback content if role doesn't match
 */
export const RoleBasedRoute = ({ admin, stylist, client, fallback = null }) => {
  const { user, hasRole } = useAuth();

  if (!user) {
    return fallback;
  }

  if (hasRole('admin') && admin) {
    return admin;
  }

  if (hasRole('stylist') && stylist) {
    return stylist;
  }

  if (hasRole('client') && client) {
    return client;
  }

  return fallback;
};

export default ProtectedRoute;
