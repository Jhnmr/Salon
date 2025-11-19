import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export const Home = () => {
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <h1 className="text-5xl font-bold text-gray-900 mb-4">
              Bienvenido a Salon
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Tu plataforma de reservas de servicios de belleza
            </p>
            <Link
              to="/dashboard"
              className="inline-block bg-purple-600 text-white px-8 py-3 rounded-lg hover:bg-purple-700 transition"
            >
              Ir al Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 to-blue-100">
      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div>
            <h1 className="text-5xl font-bold text-gray-900 mb-6">
              Reserva tus servicios de belleza online
            </h1>
            <p className="text-xl text-gray-700 mb-8">
              Encuentra los mejores estilistas y servicios de belleza en tu área. Reserva citas de forma rápida y sencilla.
            </p>
            <div className="space-y-4 sm:space-y-0 sm:space-x-4 flex flex-col sm:flex-row">
              <Link
                to="/login"
                className="bg-purple-600 text-white px-8 py-3 rounded-lg hover:bg-purple-700 transition text-center"
              >
                Iniciar Sesión
              </Link>
              <Link
                to="/register"
                className="bg-white text-purple-600 border-2 border-purple-600 px-8 py-3 rounded-lg hover:bg-purple-50 transition text-center"
              >
                Registrarse
              </Link>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <div className="bg-purple-100 rounded-full p-4">
                  <svg className="h-6 w-6 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10.5 1.5H3.75A2.25 2.25 0 001.5 3.75v12.5A2.25 2.25 0 003.75 18.5h12.5a2.25 2.25 0 002.25-2.25V9.5" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Reserva Fácil</h3>
                  <p className="text-gray-600">Reserva citas con unos pocos clics</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="bg-blue-100 rounded-full p-4">
                  <svg className="h-6 w-6 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Profesionales</h3>
                  <p className="text-gray-600">Conecta con estilistas profesionales</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="bg-green-100 rounded-full p-4">
                  <svg className="h-6 w-6 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M7 9a2 2 0 11-4 0 2 2 0 014 0zm14-7a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Disponibilidad</h3>
                  <p className="text-gray-600">Acceso 24/7 a horarios y disponibilidad</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Características Principales
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-purple-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">📅</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Gestión de Citas
              </h3>
              <p className="text-gray-600">
                Administra tus citas de forma intuitiva y recibe recordatorios
              </p>
            </div>
            <div className="text-center">
              <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">💇</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Catálogo de Servicios
              </h3>
              <p className="text-gray-600">
                Explora una amplia variedad de servicios de belleza
              </p>
            </div>
            <div className="text-center">
              <div className="bg-green-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">⭐</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Calificaciones
              </h3>
              <p className="text-gray-600">
                Conoce la calificación de cada profesional
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
