import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { dashboardAPI, reservationsAPI } from '../services/api';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [recentReservations, setRecentReservations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [statsRes, reservationsRes] = await Promise.all([
        dashboardAPI.getQuickStats(),
        reservationsAPI.getAll({ limit: 5 }),
      ]);

      setStats(statsRes.data);
      setRecentReservations(reservationsRes.data.data || reservationsRes.data.reservations || []);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-400"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Header */}
      <header className="bg-gray-800/50 backdrop-blur-sm border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-white">Dashboard</h1>
              <p className="text-gray-400 mt-1">
                Bienvenido, {user?.name || 'Usuario'}
              </p>
            </div>
            <Link to="/booking/new">
              <Button variant="primary">Nueva Reserva</Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm font-medium">Reservas Totales</p>
                <p className="text-3xl font-bold text-white mt-2">
                  {stats?.total_reservations || 0}
                </p>
              </div>
              <div className="h-12 w-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
                <span className="text-2xl">📅</span>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm font-medium">Próximas Citas</p>
                <p className="text-3xl font-bold text-white mt-2">
                  {stats?.upcoming_reservations || 0}
                </p>
              </div>
              <div className="h-12 w-12 bg-green-500/20 rounded-lg flex items-center justify-center">
                <span className="text-2xl">✅</span>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm font-medium">Servicios Favoritos</p>
                <p className="text-3xl font-bold text-white mt-2">
                  {stats?.favorite_services || 0}
                </p>
              </div>
              <div className="h-12 w-12 bg-yellow-500/20 rounded-lg flex items-center justify-center">
                <span className="text-2xl">⭐</span>
              </div>
            </div>
          </Card>
        </div>

        {/* Recent Reservations */}
        <Card className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-white">Reservas Recientes</h2>
            <Link to="/reservations">
              <Button variant="ghost" size="sm">
                Ver todas
              </Button>
            </Link>
          </div>

          {recentReservations.length > 0 ? (
            <div className="space-y-4">
              {recentReservations.map((reservation) => (
                <div
                  key={reservation.id}
                  className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg border border-gray-700 hover:border-gray-600 transition-colors"
                >
                  <div className="flex items-center space-x-4">
                    <div className="h-10 w-10 bg-yellow-500/20 rounded-lg flex items-center justify-center">
                      <span className="text-xl">💇</span>
                    </div>
                    <div>
                      <p className="text-white font-medium">
                        {reservation.service?.name || 'Servicio'}
                      </p>
                      <p className="text-gray-400 text-sm">
                        {new Date(reservation.scheduled_at).toLocaleDateString('es-ES', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        reservation.status === 'confirmed'
                          ? 'bg-green-500/20 text-green-400'
                          : reservation.status === 'pending'
                          ? 'bg-yellow-500/20 text-yellow-400'
                          : 'bg-gray-500/20 text-gray-400'
                      }`}
                    >
                      {reservation.status}
                    </span>
                    <Link to={`/reservations/${reservation.id}`}>
                      <Button variant="ghost" size="sm">
                        Ver Detalles
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-400 mb-4">No tienes reservas aún</p>
              <Link to="/services">
                <Button variant="primary">Explorar Servicios</Button>
              </Link>
            </div>
          )}
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
          <Link to="/services">
            <Card className="p-6 hover:bg-gray-800/70 transition-colors cursor-pointer">
              <div className="text-center">
                <div className="h-12 w-12 bg-purple-500/20 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <span className="text-2xl">✨</span>
                </div>
                <p className="text-white font-medium">Servicios</p>
                <p className="text-gray-400 text-sm mt-1">Explora nuestros servicios</p>
              </div>
            </Card>
          </Link>

          <Link to="/stylists">
            <Card className="p-6 hover:bg-gray-800/70 transition-colors cursor-pointer">
              <div className="text-center">
                <div className="h-12 w-12 bg-pink-500/20 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <span className="text-2xl">👤</span>
                </div>
                <p className="text-white font-medium">Estilistas</p>
                <p className="text-gray-400 text-sm mt-1">Conoce a nuestro equipo</p>
              </div>
            </Card>
          </Link>

          <Link to="/profile">
            <Card className="p-6 hover:bg-gray-800/70 transition-colors cursor-pointer">
              <div className="text-center">
                <div className="h-12 w-12 bg-blue-500/20 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <span className="text-2xl">⚙️</span>
                </div>
                <p className="text-white font-medium">Mi Perfil</p>
                <p className="text-gray-400 text-sm mt-1">Edita tu información</p>
              </div>
            </Card>
          </Link>

          <Link to="/payments">
            <Card className="p-6 hover:bg-gray-800/70 transition-colors cursor-pointer">
              <div className="text-center">
                <div className="h-12 w-12 bg-green-500/20 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <span className="text-2xl">💳</span>
                </div>
                <p className="text-white font-medium">Pagos</p>
                <p className="text-gray-400 text-sm mt-1">Historial de pagos</p>
              </div>
            </Card>
          </Link>
        </div>
      </main>
    </div>
  );
}
