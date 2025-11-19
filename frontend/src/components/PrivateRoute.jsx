import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export const PrivateRoute = ({ children, requiredRole = null }) => {
  const { isAuthenticated, user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
          <p className="mt-4 text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && user?.role !== requiredRole) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

export const AdminRoute = ({ children }) => (
  <PrivateRoute requiredRole="admin">{children}</PrivateRoute>
);

export const StylistRoute = ({ children }) => (
  <PrivateRoute requiredRole="stylist">{children}</PrivateRoute>
);

export const ClientRoute = ({ children }) => (
  <PrivateRoute requiredRole="client">{children}</PrivateRoute>
);
