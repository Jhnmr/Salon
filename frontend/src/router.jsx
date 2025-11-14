/**
 * SALON PWA - React Router Configuration
 * Centralized routing configuration with role-based access control
 */

import { createBrowserRouter, Navigate } from 'react-router-dom';
import ProtectedRoute, { PublicOnlyRoute } from './components/ProtectedRoute';

// Layouts
import { Layout } from './components/layout';

// Auth Pages
import { Login, Register, ForgotPassword, ResetPassword } from './pages/auth';

// Public Pages
import Home from './pages/Home';
import ServiceDetails from './pages/ServiceDetails';
import StylistProfile from './pages/StylistProfile';
import NotFound from './pages/NotFound';
import Unauthorized from './pages/Unauthorized';

// Client Pages
import {
  ClientDashboard,
  SearchServices,
  BookAppointment,
  Reservations,
  ClientProfile,
} from './pages/client';

// Stylist Pages
import {
  StylistDashboard,
  StylistSchedule,
  StylistPortfolio,
  StylistEarnings,
} from './pages/stylist';

// Admin Pages
import {
  AdminDashboard,
  AdminUsers,
  AdminServices,
  AdminReports,
} from './pages/admin';

// Layouts
const MainLayout = ({ children }) => <Layout>{children}</Layout>;
const DashboardLayout = ({ children }) => <Layout dashboard>{children}</Layout>;

// Temporary placeholders
const ServicesPage = () => <div className="p-8"><h1 className="text-3xl font-bold">Services (Coming Soon)</h1></div>;
const StylistsPage = () => <div className="p-8"><h1 className="text-3xl font-bold">Find Stylists (Coming Soon)</h1></div>;
const GalleryPage = () => <div className="p-8"><h1 className="text-3xl font-bold">Gallery (Coming Soon)</h1></div>;
const AboutPage = () => <div className="p-8"><h1 className="text-3xl font-bold">About Us (Coming Soon)</h1></div>;
const ContactPage = () => <div className="p-8"><h1 className="text-3xl font-bold">Contact (Coming Soon)</h1></div>;
const MessagesPage = () => <div className="p-8"><h1 className="text-3xl font-bold">Messages (Coming Soon)</h1></div>;
const PaymentHistoryPage = () => <div className="p-8"><h1 className="text-3xl font-bold">Payment History (Coming Soon)</h1></div>;

const router = createBrowserRouter([
  // Public Routes
  { path: '/', element: <MainLayout><Home /></MainLayout> },
  { path: '/services', element: <MainLayout><ServicesPage /></MainLayout> },
  { path: '/services/:id', element: <MainLayout><ServiceDetails /></MainLayout> },
  { path: '/stylists', element: <MainLayout><StylistsPage /></MainLayout> },
  { path: '/stylists/:id', element: <MainLayout><StylistProfile /></MainLayout> },
  { path: '/gallery', element: <MainLayout><GalleryPage /></MainLayout> },
  { path: '/about', element: <MainLayout><AboutPage /></MainLayout> },
  { path: '/contact', element: <MainLayout><ContactPage /></MainLayout> },

  // Auth Routes
  { path: '/login', element: <PublicOnlyRoute><Login /></PublicOnlyRoute> },
  { path: '/register', element: <PublicOnlyRoute><Register /></PublicOnlyRoute> },
  { path: '/forgot-password', element: <PublicOnlyRoute><ForgotPassword /></PublicOnlyRoute> },
  { path: '/reset-password/:token', element: <PublicOnlyRoute><ResetPassword /></PublicOnlyRoute> },

  // Client Routes
  { path: '/client', element: <ProtectedRoute roles={['client']}><DashboardLayout><Navigate to="/client/dashboard" replace /></DashboardLayout></ProtectedRoute> },
  { path: '/client/dashboard', element: <ProtectedRoute roles={['client']}><DashboardLayout><ClientDashboard /></DashboardLayout></ProtectedRoute> },
  { path: '/client/reservations', element: <ProtectedRoute roles={['client']}><DashboardLayout><Reservations /></DashboardLayout></ProtectedRoute> },
  { path: '/client/book', element: <ProtectedRoute roles={['client']}><DashboardLayout><BookAppointment /></DashboardLayout></ProtectedRoute> },
  { path: '/client/search', element: <ProtectedRoute roles={['client']}><DashboardLayout><SearchServices /></DashboardLayout></ProtectedRoute> },
  { path: '/client/messages', element: <ProtectedRoute roles={['client']}><DashboardLayout><MessagesPage /></DashboardLayout></ProtectedRoute> },
  { path: '/client/payments', element: <ProtectedRoute roles={['client']}><DashboardLayout><PaymentHistoryPage /></DashboardLayout></ProtectedRoute> },
  { path: '/client/profile', element: <ProtectedRoute roles={['client']}><DashboardLayout><ClientProfile /></DashboardLayout></ProtectedRoute> },

  // Stylist Routes
  { path: '/stylist', element: <ProtectedRoute roles={['stylist']}><DashboardLayout><Navigate to="/stylist/dashboard" replace /></DashboardLayout></ProtectedRoute> },
  { path: '/stylist/dashboard', element: <ProtectedRoute roles={['stylist']}><DashboardLayout><StylistDashboard /></DashboardLayout></ProtectedRoute> },
  { path: '/stylist/schedule', element: <ProtectedRoute roles={['stylist']}><DashboardLayout><StylistSchedule /></DashboardLayout></ProtectedRoute> },
  { path: '/stylist/portfolio', element: <ProtectedRoute roles={['stylist']}><DashboardLayout><StylistPortfolio /></DashboardLayout></ProtectedRoute> },
  { path: '/stylist/earnings', element: <ProtectedRoute roles={['stylist']}><DashboardLayout><StylistEarnings /></DashboardLayout></ProtectedRoute> },

  // Admin Routes
  { path: '/admin', element: <ProtectedRoute roles={['admin']}><DashboardLayout><Navigate to="/admin/dashboard" replace /></DashboardLayout></ProtectedRoute> },
  { path: '/admin/dashboard', element: <ProtectedRoute roles={['admin']}><DashboardLayout><AdminDashboard /></DashboardLayout></ProtectedRoute> },
  { path: '/admin/users', element: <ProtectedRoute roles={['admin']}><DashboardLayout><AdminUsers /></DashboardLayout></ProtectedRoute> },
  { path: '/admin/services', element: <ProtectedRoute roles={['admin']}><DashboardLayout><AdminServices /></DashboardLayout></ProtectedRoute> },
  { path: '/admin/reports', element: <ProtectedRoute roles={['admin']}><DashboardLayout><AdminReports /></DashboardLayout></ProtectedRoute> },

  // Error Routes
  { path: '/unauthorized', element: <Unauthorized /> },
  { path: '*', element: <NotFound /> },
]);

export default router;
