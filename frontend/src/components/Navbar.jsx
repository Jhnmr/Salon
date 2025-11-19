import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { NotificationBell } from './NotificationBell';

export const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, logoutUser, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logoutUser();
    navigate('/login');
  };

  const getNavLinks = () => {
    if (!isAuthenticated || !user) {
      return [
        { label: 'Acerca de', path: '/about' },
        { label: 'Contacto', path: '/contact' },
        { label: 'Iniciar Sesión', path: '/login' },
        { label: 'Registrarse', path: '/register' },
      ];
    }

    const commonLinks = [
      { label: 'Dashboard', path: '/dashboard' },
      { label: 'Mi Perfil', path: '/profile' },
      { label: 'Notificaciones', path: '/notifications' },
      { label: 'Configuración', path: '/settings' },
    ];

    if (user.role === 'client') {
      return [
        ...commonLinks,
        { label: 'Buscar Estilistas', path: '/search-stylists' },
        { label: 'Favoritos', path: '/favorites' },
        { label: 'Servicios', path: '/services' },
        { label: 'Mis Reservas', path: '/reservations' },
      ];
    }

    if (user.role === 'stylist') {
      return [
        ...commonLinks,
        { label: 'Mis Citas', path: '/my-appointments' },
        { label: 'Mi Desempeño', path: '/my-stats' },
        { label: 'Horarios', path: '/availability' },
      ];
    }

    if (user.role === 'admin') {
      return [
        ...commonLinks,
        { label: 'Usuarios', path: '/users' },
        { label: 'Servicios', path: '/admin/services' },
        { label: 'Reservas', path: '/admin/reservations' },
      ];
    }

    return commonLinks;
  };

  const navLinks = getNavLinks();

  return (
    <nav className="bg-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link to="/" className="text-2xl font-bold text-purple-600">
              Salon
            </Link>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex md:items-center md:space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className="text-gray-700 hover:text-purple-600 transition"
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* User Menu */}
          <div className="hidden md:flex md:items-center md:space-x-4">
            {isAuthenticated && user && (
              <>
                <NotificationBell />
                <span className="text-sm text-gray-600">
                  {user.name}
                </span>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
                >
                  Cerrar Sesión
                </button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-gray-600 hover:text-purple-600"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden pb-4">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className="block px-4 py-2 text-gray-700 hover:text-purple-600"
                onClick={() => setIsOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            {isAuthenticated && user && (
              <button
                onClick={handleLogout}
                className="w-full text-left px-4 py-2 text-red-600 hover:text-red-700"
              >
                Cerrar Sesión
              </button>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};
