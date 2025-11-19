import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import {
  PrivateRoute,
  AdminRoute,
  StylistRoute,
  ClientRoute,
} from './components/PrivateRoute';

// Pages
import { Home } from './pages/Home';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Dashboard } from './pages/Dashboard';
import { Services } from './pages/Services';
import { Reservations } from './pages/Reservations';
import { Profile } from './pages/Profile';
import { Notifications } from './pages/Notifications';
import { Users } from './pages/Users';
import { AdminServices } from './pages/AdminServices';
import { MyAppointments } from './pages/MyAppointments';
import { Availability } from './pages/Availability';
import { BookService } from './pages/BookService';
import { AdminReservations } from './pages/AdminReservations';
import { StylistRatings } from './pages/StylistRatings';
import { StylistStats } from './pages/StylistStats';
import { SearchStylists } from './pages/SearchStylists';
import { StylistProfile } from './pages/StylistProfile';
import { Favorites } from './pages/Favorites';
import { About } from './pages/About';
import { ContactUs } from './pages/ContactUs';
import { AccountSettings } from './pages/AccountSettings';
import { TermsOfService } from './pages/TermsOfService';
import { PrivacyPolicy } from './pages/PrivacyPolicy';

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/search-stylists" element={<SearchStylists />} />
        <Route path="/stylist/:stylistId/profile" element={<StylistProfile />} />
        <Route path="/stylist/:stylistId/ratings" element={<StylistRatings />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<ContactUs />} />
        <Route path="/terms" element={<TermsOfService />} />
        <Route path="/privacy" element={<PrivacyPolicy />} />

        {/* Protected Routes */}
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <PrivateRoute>
              <Profile />
            </PrivateRoute>
          }
        />
        <Route
          path="/services"
          element={
            <PrivateRoute>
              <ClientRoute>
                <Services />
              </ClientRoute>
            </PrivateRoute>
          }
        />
        <Route
          path="/favorites"
          element={
            <PrivateRoute>
              <ClientRoute>
                <Favorites />
              </ClientRoute>
            </PrivateRoute>
          }
        />
        <Route
          path="/book-service/:serviceId"
          element={
            <PrivateRoute>
              <ClientRoute>
                <BookService />
              </ClientRoute>
            </PrivateRoute>
          }
        />
        <Route
          path="/reservations"
          element={
            <PrivateRoute>
              <ClientRoute>
                <Reservations />
              </ClientRoute>
            </PrivateRoute>
          }
        />
        <Route
          path="/notifications"
          element={
            <PrivateRoute>
              <Notifications />
            </PrivateRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <PrivateRoute>
              <AccountSettings />
            </PrivateRoute>
          }
        />

        {/* Admin Routes */}
        <Route
          path="/users"
          element={
            <PrivateRoute>
              <AdminRoute>
                <Users />
              </AdminRoute>
            </PrivateRoute>
          }
        />
        <Route
          path="/admin/services"
          element={
            <PrivateRoute>
              <AdminRoute>
                <AdminServices />
              </AdminRoute>
            </PrivateRoute>
          }
        />
        <Route
          path="/admin/reservations"
          element={
            <PrivateRoute>
              <AdminRoute>
                <AdminReservations />
              </AdminRoute>
            </PrivateRoute>
          }
        />

        {/* Stylist Routes */}
        <Route
          path="/my-appointments"
          element={
            <PrivateRoute>
              <StylistRoute>
                <MyAppointments />
              </StylistRoute>
            </PrivateRoute>
          }
        />
        <Route
          path="/availability"
          element={
            <PrivateRoute>
              <StylistRoute>
                <Availability />
              </StylistRoute>
            </PrivateRoute>
          }
        />
        <Route
          path="/my-stats"
          element={
            <PrivateRoute>
              <StylistRoute>
                <StylistStats />
              </StylistRoute>
            </PrivateRoute>
          }
        />

        {/* 404 Page */}
        <Route
          path="*"
          element={
            <div className="min-h-screen flex items-center justify-center">
              <div className="text-center">
                <h1 className="text-4xl font-bold text-gray-900 mb-4">
                  404 - Página no encontrada
                </h1>
                <p className="text-gray-600">
                  La página que buscas no existe.
                </p>
              </div>
            </div>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
