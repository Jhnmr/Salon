/**
 * SALON PWA - React Router Configuration
 * Centralized routing configuration with role-based access control
 */

import { createBrowserRouter, Navigate } from 'react-router-dom';
import ProtectedRoute, { PublicOnlyRoute } from './components/ProtectedRoute';

// Layouts
// TODO: Import actual layout components when created
const MainLayout = ({ children }) => <div className="min-h-screen">{children}</div>;
const DashboardLayout = ({ children }) => <div className="min-h-screen">{children}</div>;

// Placeholder components - Replace with actual components
const HomePage = () => <div className="p-8"><h1 className="text-3xl font-bold">Welcome to SALON</h1></div>;
const LoginPage = () => <div className="p-8"><h1 className="text-3xl font-bold">Login</h1></div>;
const RegisterPage = () => <div className="p-8"><h1 className="text-3xl font-bold">Register</h1></div>;
const ForgotPasswordPage = () => <div className="p-8"><h1 className="text-3xl font-bold">Forgot Password</h1></div>;
const ResetPasswordPage = () => <div className="p-8"><h1 className="text-3xl font-bold">Reset Password</h1></div>;

const ServicesPage = () => <div className="p-8"><h1 className="text-3xl font-bold">Services</h1></div>;
const ServiceDetailPage = () => <div className="p-8"><h1 className="text-3xl font-bold">Service Detail</h1></div>;
const StylistsPage = () => <div className="p-8"><h1 className="text-3xl font-bold">Stylists</h1></div>;
const StylistDetailPage = () => <div className="p-8"><h1 className="text-3xl font-bold">Stylist Detail</h1></div>;
const GalleryPage = () => <div className="p-8"><h1 className="text-3xl font-bold">Gallery</h1></div>;
const AboutPage = () => <div className="p-8"><h1 className="text-3xl font-bold">About Us</h1></div>;
const ContactPage = () => <div className="p-8"><h1 className="text-3xl font-bold">Contact</h1></div>;

// Client Dashboard
const ClientDashboard = () => <div className="p-8"><h1 className="text-3xl font-bold">Client Dashboard</h1></div>;
const MyReservationsPage = () => <div className="p-8"><h1 className="text-3xl font-bold">My Reservations</h1></div>;
const BookingPage = () => <div className="p-8"><h1 className="text-3xl font-bold">Book Service</h1></div>;
const MyProfilePage = () => <div className="p-8"><h1 className="text-3xl font-bold">My Profile</h1></div>;
const MessagesPage = () => <div className="p-8"><h1 className="text-3xl font-bold">Messages</h1></div>;
const PaymentHistoryPage = () => <div className="p-8"><h1 className="text-3xl font-bold">Payment History</h1></div>;

// Stylist Dashboard
const StylistDashboard = () => <div className="p-8"><h1 className="text-3xl font-bold">Stylist Dashboard</h1></div>;
const StylistSchedulePage = () => <div className="p-8"><h1 className="text-3xl font-bold">My Schedule</h1></div>;
const StylistClientsPage = () => <div className="p-8"><h1 className="text-3xl font-bold">My Clients</h1></div>;
const StylistPortfolioPage = () => <div className="p-8"><h1 className="text-3xl font-bold">My Portfolio</h1></div>;
const StylistEarningsPage = () => <div className="p-8"><h1 className="text-3xl font-bold">Earnings</h1></div>;
const StylistProfilePage = () => <div className="p-8"><h1 className="text-3xl font-bold">Stylist Profile</h1></div>;

// Admin Dashboard
const AdminDashboard = () => <div className="p-8"><h1 className="text-3xl font-bold">Admin Dashboard</h1></div>;
const AdminUsersPage = () => <div className="p-8"><h1 className="text-3xl font-bold">Manage Users</h1></div>;
const AdminServicesPage = () => <div className="p-8"><h1 className="text-3xl font-bold">Manage Services</h1></div>;
const AdminReservationsPage = () => <div className="p-8"><h1 className="text-3xl font-bold">Manage Reservations</h1></div>;
const AdminReportsPage = () => <div className="p-8"><h1 className="text-3xl font-bold">Reports</h1></div>;

// Error Pages
const NotFoundPage = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="text-center">
      <h1 className="text-6xl font-bold text-neutral-900 dark:text-white">404</h1>
      <p className="text-xl text-neutral-600 dark:text-neutral-400 mt-4">Page not found</p>
      <a href="/" className="mt-6 inline-block px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700">
        Go Home
      </a>
    </div>
  </div>
);

const UnauthorizedPage = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="text-center">
      <h1 className="text-6xl font-bold text-neutral-900 dark:text-white">403</h1>
      <p className="text-xl text-neutral-600 dark:text-neutral-400 mt-4">Unauthorized Access</p>
      <p className="text-neutral-500 dark:text-neutral-500 mt-2">You don't have permission to access this page</p>
      <a href="/" className="mt-6 inline-block px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700">
        Go Home
      </a>
    </div>
  </div>
);

/**
 * React Router Configuration
 * Defines all application routes with proper access control
 */
const router = createBrowserRouter([
  // Public Routes
  {
    path: '/',
    element: <MainLayout><HomePage /></MainLayout>,
  },
  {
    path: '/services',
    element: <MainLayout><ServicesPage /></MainLayout>,
  },
  {
    path: '/services/:id',
    element: <MainLayout><ServiceDetailPage /></MainLayout>,
  },
  {
    path: '/stylists',
    element: <MainLayout><StylistsPage /></MainLayout>,
  },
  {
    path: '/stylists/:id',
    element: <MainLayout><StylistDetailPage /></MainLayout>,
  },
  {
    path: '/gallery',
    element: <MainLayout><GalleryPage /></MainLayout>,
  },
  {
    path: '/about',
    element: <MainLayout><AboutPage /></MainLayout>,
  },
  {
    path: '/contact',
    element: <MainLayout><ContactPage /></MainLayout>,
  },

  // Public-Only Routes (redirect if authenticated)
  {
    path: '/login',
    element: (
      <PublicOnlyRoute>
        <LoginPage />
      </PublicOnlyRoute>
    ),
  },
  {
    path: '/register',
    element: (
      <PublicOnlyRoute>
        <RegisterPage />
      </PublicOnlyRoute>
    ),
  },
  {
    path: '/forgot-password',
    element: (
      <PublicOnlyRoute>
        <ForgotPasswordPage />
      </PublicOnlyRoute>
    ),
  },
  {
    path: '/reset-password/:token',
    element: (
      <PublicOnlyRoute>
        <ResetPasswordPage />
      </PublicOnlyRoute>
    ),
  },

  // Client Routes
  {
    path: '/client',
    element: (
      <ProtectedRoute roles="client">
        <DashboardLayout><Navigate to="/client/dashboard" replace /></DashboardLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/client/dashboard',
    element: (
      <ProtectedRoute roles="client">
        <DashboardLayout><ClientDashboard /></DashboardLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/client/reservations',
    element: (
      <ProtectedRoute roles="client">
        <DashboardLayout><MyReservationsPage /></DashboardLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/client/book',
    element: (
      <ProtectedRoute roles="client">
        <DashboardLayout><BookingPage /></DashboardLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/client/messages',
    element: (
      <ProtectedRoute roles="client">
        <DashboardLayout><MessagesPage /></DashboardLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/client/payments',
    element: (
      <ProtectedRoute roles="client">
        <DashboardLayout><PaymentHistoryPage /></DashboardLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/client/profile',
    element: (
      <ProtectedRoute roles="client">
        <DashboardLayout><MyProfilePage /></DashboardLayout>
      </ProtectedRoute>
    ),
  },

  // Stylist Routes
  {
    path: '/stylist',
    element: (
      <ProtectedRoute roles="stylist">
        <DashboardLayout><Navigate to="/stylist/dashboard" replace /></DashboardLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/stylist/dashboard',
    element: (
      <ProtectedRoute roles="stylist">
        <DashboardLayout><StylistDashboard /></DashboardLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/stylist/schedule',
    element: (
      <ProtectedRoute roles="stylist">
        <DashboardLayout><StylistSchedulePage /></DashboardLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/stylist/clients',
    element: (
      <ProtectedRoute roles="stylist">
        <DashboardLayout><StylistClientsPage /></DashboardLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/stylist/portfolio',
    element: (
      <ProtectedRoute roles="stylist">
        <DashboardLayout><StylistPortfolioPage /></DashboardLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/stylist/earnings',
    element: (
      <ProtectedRoute roles="stylist">
        <DashboardLayout><StylistEarningsPage /></DashboardLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/stylist/profile',
    element: (
      <ProtectedRoute roles="stylist">
        <DashboardLayout><StylistProfilePage /></DashboardLayout>
      </ProtectedRoute>
    ),
  },

  // Admin Routes
  {
    path: '/admin',
    element: (
      <ProtectedRoute roles="admin">
        <DashboardLayout><Navigate to="/admin/dashboard" replace /></DashboardLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/admin/dashboard',
    element: (
      <ProtectedRoute roles="admin">
        <DashboardLayout><AdminDashboard /></DashboardLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/admin/users',
    element: (
      <ProtectedRoute roles="admin">
        <DashboardLayout><AdminUsersPage /></DashboardLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/admin/services',
    element: (
      <ProtectedRoute roles="admin">
        <DashboardLayout><AdminServicesPage /></DashboardLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/admin/reservations',
    element: (
      <ProtectedRoute roles="admin">
        <DashboardLayout><AdminReservationsPage /></DashboardLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/admin/reports',
    element: (
      <ProtectedRoute roles="admin">
        <DashboardLayout><AdminReportsPage /></DashboardLayout>
      </ProtectedRoute>
    ),
  },

  // Generic Dashboard Route (redirects based on role)
  {
    path: '/dashboard',
    element: (
      <ProtectedRoute>
        <Navigate to="/client/dashboard" replace />
      </ProtectedRoute>
    ),
  },

  // Error Routes
  {
    path: '/unauthorized',
    element: <UnauthorizedPage />,
  },
  {
    path: '*',
    element: <NotFoundPage />,
  },
]);

export default router;
