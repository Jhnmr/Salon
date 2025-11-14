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

// Import actual page components
import HomePage from './pages/Home';
import LoginPage from './pages/auth/Login';
import RegisterPage from './pages/auth/Register';
import ForgotPasswordPage from './pages/auth/ForgotPassword';
import ResetPasswordPage from './pages/auth/ResetPassword';
import NotFoundPage from './pages/NotFound';
import UnauthorizedPage from './pages/Unauthorized';

// Service pages
import ServiceDetailPage from './pages/ServiceDetails';
import StylistProfilePage from './pages/StylistProfile';

// Client pages
import ClientDashboard from './pages/client/Dashboard';
import MyReservationsPage from './pages/client/Reservations';
import BookingPage from './pages/client/BookAppointment';
import MyProfilePage from './pages/client/Profile';
import SearchServicesPage from './pages/client/SearchServices';

// Stylist pages
import StylistDashboard from './pages/stylist/Dashboard';
import StylistSchedulePage from './pages/stylist/Schedule';
import StylistPortfolioPage from './pages/stylist/Portfolio';
import StylistEarningsPage from './pages/stylist/Earnings';

// Admin pages
import AdminDashboard from './pages/admin/Dashboard';
import AdminUsersPage from './pages/admin/Users';
import AdminServicesPage from './pages/admin/Services';
import AdminReportsPage from './pages/admin/Reports';

// Placeholder components for pages not yet created
const GalleryPage = () => <div className="p-8"><h1 className="text-3xl font-bold">Gallery</h1></div>;
const AboutPage = () => <div className="p-8"><h1 className="text-3xl font-bold">About Us</h1></div>;
const ContactPage = () => <div className="p-8"><h1 className="text-3xl font-bold">Contact</h1></div>;
const MessagesPage = () => <div className="p-8"><h1 className="text-3xl font-bold">Messages</h1></div>;
const PaymentHistoryPage = () => <div className="p-8"><h1 className="text-3xl font-bold">Payment History</h1></div>;
const StylistClientsPage = () => <div className="p-8"><h1 className="text-3xl font-bold">My Clients</h1></div>;
const AdminReservationsPage = () => <div className="p-8"><h1 className="text-3xl font-bold">Manage Reservations</h1></div>;

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
    path: '/search',
    element: <MainLayout><SearchServicesPage /></MainLayout>,
  },
  {
    path: '/services',
    element: <MainLayout><SearchServicesPage /></MainLayout>,
  },
  {
    path: '/services/:id',
    element: <MainLayout><ServiceDetailPage /></MainLayout>,
  },
  {
    path: '/salon/:id',
    element: <MainLayout><ServiceDetailPage /></MainLayout>,
  },
  {
    path: '/stylists/:id',
    element: <MainLayout><StylistProfilePage /></MainLayout>,
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
        <MainLayout><LoginPage /></MainLayout>
      </PublicOnlyRoute>
    ),
  },
  {
    path: '/auth/login',
    element: (
      <PublicOnlyRoute>
        <MainLayout><LoginPage /></MainLayout>
      </PublicOnlyRoute>
    ),
  },
  {
    path: '/register',
    element: (
      <PublicOnlyRoute>
        <MainLayout><RegisterPage /></MainLayout>
      </PublicOnlyRoute>
    ),
  },
  {
    path: '/auth/register',
    element: (
      <PublicOnlyRoute>
        <MainLayout><RegisterPage /></MainLayout>
      </PublicOnlyRoute>
    ),
  },
  {
    path: '/forgot-password',
    element: (
      <PublicOnlyRoute>
        <MainLayout><ForgotPasswordPage /></MainLayout>
      </PublicOnlyRoute>
    ),
  },
  {
    path: '/auth/forgot-password',
    element: (
      <PublicOnlyRoute>
        <MainLayout><ForgotPasswordPage /></MainLayout>
      </PublicOnlyRoute>
    ),
  },
  {
    path: '/reset-password/:token',
    element: (
      <PublicOnlyRoute>
        <MainLayout><ResetPasswordPage /></MainLayout>
      </PublicOnlyRoute>
    ),
  },
  {
    path: '/auth/reset-password/:token',
    element: (
      <PublicOnlyRoute>
        <MainLayout><ResetPasswordPage /></MainLayout>
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
