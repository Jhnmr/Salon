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

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

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
