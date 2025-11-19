import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { profileService, userService } from '../services/api';

export const About = () => {
  const [stats, setStats] = useState({
    totalStylists: 0,
    totalClients: 0,
    totalServices: 0,
  });
  const [loading, setLoading] = useState(true);
  const [stylists, setStylists] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);

      // Fetch stylists count
      const stylistsRes = await profileService.getAllStylists();
      const stylistsList = stylistsRes.data.profiles || [];
      setStylists(stylistsList.slice(0, 3)); // Get top 3 stylists

      // Fetch statistics
      const userStatsRes = await userService.getStatistics();
      const userStats = userStatsRes.data;

      setStats({
        totalStylists: userStats.stylists || 0,
        totalClients: userStats.clients || 0,
        totalServices: userStats.services || 0,
      });
    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  const renderStars = (rating) => {
    if (!rating) return null;
    const roundedRating = Math.round(rating);
    return (
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <span
            key={star}
            className={star <= roundedRating ? 'text-yellow-400' : 'text-gray-300'}
          >
            ★
          </span>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl font-bold mb-4">Acerca de Salon</h1>
          <p className="text-xl opacity-90">
            Tu plataforma de confianza para conectar con los mejores estilistas
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Our Mission */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-20">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Nuestra Misión</h2>
            <p className="text-gray-700 mb-4 leading-relaxed">
              En Salon, creemos que cada persona merece acceso a servicios de belleza de alta
              calidad. Nuestra plataforma conecta a clientes con estilistas profesionales y talentosos.
            </p>
            <p className="text-gray-700 mb-4 leading-relaxed">
              Nos dedicamos a simplificar el proceso de reserva, mantener la comunicación clara
              y garantizar que cada experiencia sea excepcional.
            </p>
            <p className="text-gray-700 leading-relaxed">
              Con nuestro sistema de calificaciones y reseñas, construimos una comunidad de confianza
              donde la calidad y la excelencia son lo primero.
            </p>
          </div>

          <div className="bg-white rounded-lg shadow p-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">Nuestros Valores</h3>
            <ul className="space-y-4">
              <li className="flex gap-3">
                <span className="text-purple-600 text-xl">✓</span>
                <div>
                  <p className="font-semibold text-gray-900">Calidad</p>
                  <p className="text-sm text-gray-600">
                    Comprometidos con los mejores servicios
                  </p>
                </div>
              </li>
              <li className="flex gap-3">
                <span className="text-purple-600 text-xl">✓</span>
                <div>
                  <p className="font-semibold text-gray-900">Confianza</p>
                  <p className="text-sm text-gray-600">
                    Transparencia en cada interacción
                  </p>
                </div>
              </li>
              <li className="flex gap-3">
                <span className="text-purple-600 text-xl">✓</span>
                <div>
                  <p className="font-semibold text-gray-900">Profesionalismo</p>
                  <p className="text-sm text-gray-600">
                    Estilistas certificados y experimentados
                  </p>
                </div>
              </li>
              <li className="flex gap-3">
                <span className="text-purple-600 text-xl">✓</span>
                <div>
                  <p className="font-semibold text-gray-900">Innovación</p>
                  <p className="text-sm text-gray-600">
                    Tecnología para mejorar la experiencia
                  </p>
                </div>
              </li>
            </ul>
          </div>
        </div>

        {/* Statistics */}
        {!loading && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-20">
            <div className="bg-white rounded-lg shadow p-8 text-center">
              <p className="text-5xl font-bold text-purple-600 mb-2">
                {stats.totalStylists}+
              </p>
              <p className="text-gray-600 font-semibold">Estilistas Profesionales</p>
              <p className="text-sm text-gray-500 mt-2">
                Talentosas y certificadas
              </p>
            </div>

            <div className="bg-white rounded-lg shadow p-8 text-center">
              <p className="text-5xl font-bold text-pink-600 mb-2">
                {stats.totalClients}+
              </p>
              <p className="text-gray-600 font-semibold">Clientes Satisfechos</p>
              <p className="text-sm text-gray-500 mt-2">
                Confiando en nuestro servicio
              </p>
            </div>

            <div className="bg-white rounded-lg shadow p-8 text-center">
              <p className="text-5xl font-bold text-blue-600 mb-2">
                {stats.totalServices}+
              </p>
              <p className="text-gray-600 font-semibold">Servicios Disponibles</p>
              <p className="text-sm text-gray-500 mt-2">
                Variedad de opciones
              </p>
            </div>
          </div>
        )}

        {/* Featured Stylists */}
        <div className="mb-20">
          <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">
            Nuestras Mejores Estilistas
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {stylists.map((stylist) => (
              <div
                key={stylist.user_id}
                className="bg-white rounded-lg shadow hover:shadow-lg transition overflow-hidden"
              >
                <div className="h-40 bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-5xl mb-2">💇</div>
                    <p className="text-white font-semibold text-sm">
                      {stylist.user?.name}
                    </p>
                  </div>
                </div>

                <div className="p-6">
                  {stylist.specialization && (
                    <p className="text-sm text-purple-600 font-semibold mb-3">
                      {stylist.specialization}
                    </p>
                  )}

                  {stylist.experience_years && (
                    <p className="text-sm text-gray-600 mb-3">
                      <strong>{stylist.experience_years}</strong> años de experiencia
                    </p>
                  )}

                  {stylist.rating && (
                    <div className="mb-4">
                      <div className="flex items-center gap-2 mb-1">
                        {renderStars(stylist.rating)}
                        <span className="text-sm font-bold text-gray-900">
                          {stylist.rating}
                        </span>
                      </div>
                    </div>
                  )}

                  {stylist.bio && (
                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                      {stylist.bio}
                    </p>
                  )}

                  <div className="flex gap-2">
                    <Link
                      to={`/stylist/${stylist.user_id}/profile`}
                      className="flex-1 px-4 py-2 bg-gray-100 text-gray-900 rounded-lg hover:bg-gray-200 transition font-semibold text-center text-sm"
                    >
                      Ver Perfil
                    </Link>
                    <Link
                      to={`/stylist/${stylist.user_id}/ratings`}
                      className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition font-semibold text-center text-sm"
                    >
                      Reseñas
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg shadow-lg p-12 text-center text-white">
          <h2 className="text-3xl font-bold mb-4">¿Listo para transformarte?</h2>
          <p className="text-lg opacity-90 mb-8">
            Descubre a las mejores estilistas y reserva tu cita hoy mismo
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link
              to="/search-stylists"
              className="px-8 py-3 bg-white text-purple-600 rounded-lg hover:bg-gray-100 transition font-semibold"
            >
              Buscar Estilistas
            </Link>
            <Link
              to="/services"
              className="px-8 py-3 border-2 border-white text-white rounded-lg hover:bg-white hover:bg-opacity-10 transition font-semibold"
            >
              Ver Servicios
            </Link>
          </div>
        </div>

        {/* Contact Section */}
        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <div className="text-4xl mb-4">📞</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Teléfono</h3>
            <p className="text-gray-600">(123) 456-7890</p>
          </div>

          <div className="bg-white rounded-lg shadow p-8 text-center">
            <div className="text-4xl mb-4">📧</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Email</h3>
            <p className="text-gray-600">info@salon.com</p>
          </div>

          <div className="bg-white rounded-lg shadow p-8 text-center">
            <div className="text-4xl mb-4">📍</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Ubicación</h3>
            <p className="text-gray-600">Calle Principal 123, Ciudad</p>
          </div>
        </div>
      </div>
    </div>
  );
};
