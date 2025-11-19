import { useEffect, useState } from 'react';
import { ratingService, reservationService, profileService } from '../services/api';
import { useAuth } from '../hooks/useAuth';

export const StylistStats = () => {
  const { user } = useAuth();

  const [stats, setStats] = useState(null);
  const [ratings, setRatings] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeframe, setTimeframe] = useState('all'); // all, 30days, 90days

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);

      // Fetch ratings for current stylist
      const ratingsRes = await ratingService.getStylistRatings(user?.id);
      setRatings(ratingsRes.data.ratings || []);

      // Fetch reservations for current stylist
      const reservationsRes = await reservationService.getStylistReservations(user?.id);
      setReservations(reservationsRes.data.reservations || []);

      setError(null);
    } catch (err) {
      setError('Error al cargar estadísticas');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getFilteredReservations = () => {
    if (timeframe === 'all') return reservations;

    const now = new Date();
    const filterDate = new Date();

    if (timeframe === '30days') {
      filterDate.setDate(filterDate.getDate() - 30);
    } else if (timeframe === '90days') {
      filterDate.setDate(filterDate.getDate() - 90);
    }

    return reservations.filter(
      (r) => new Date(r.created_at) >= filterDate
    );
  };

  const calculateStats = () => {
    const filtered = getFilteredReservations();

    return {
      totalReservations: filtered.length,
      completedReservations: filtered.filter((r) => r.status === 'completed').length,
      pendingReservations: filtered.filter((r) => r.status === 'pending').length,
      confirmedReservations: filtered.filter((r) => r.status === 'confirmed').length,
      cancelledReservations: filtered.filter((r) => r.status === 'cancelled').length,
      totalEarnings: filtered
        .filter((r) => r.status === 'completed')
        .reduce((sum, r) => sum + (r.service?.price || 0), 0)
        .toFixed(2),
      avgEarningsPerReservation:
        filtered.filter((r) => r.status === 'completed').length > 0
          ? (
              filtered
                .filter((r) => r.status === 'completed')
                .reduce((sum, r) => sum + (r.service?.price || 0), 0) /
              filtered.filter((r) => r.status === 'completed').length
            ).toFixed(2)
          : '0.00',
      completionRate:
        filtered.length > 0
          ? (
              (filtered.filter((r) => r.status === 'completed').length / filtered.length) *
              100
            ).toFixed(1)
          : '0.0',
    };
  };

  const getAverageRating = () => {
    if (ratings.length === 0) return 0;
    return (ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length).toFixed(1);
  };

  const getRatingCounts = () => {
    const counts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    ratings.forEach((r) => {
      if (counts.hasOwnProperty(r.rating)) {
        counts[r.rating]++;
      }
    });
    return counts;
  };

  const getMostPopularServices = () => {
    const serviceMap = {};
    getFilteredReservations().forEach((r) => {
      if (r.service) {
        const serviceId = r.service.id;
        if (!serviceMap[serviceId]) {
          serviceMap[serviceId] = {
            name: r.service.name,
            count: 0,
            revenue: 0,
          };
        }
        serviceMap[serviceId].count++;
        if (r.status === 'completed') {
          serviceMap[serviceId].revenue += r.service.price || 0;
        }
      }
    });

    return Object.values(serviceMap)
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  };

  const renderStars = (rating) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <span
            key={star}
            className={star <= rating ? 'text-yellow-400' : 'text-gray-300'}
          >
            ★
          </span>
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
          <p className="mt-4 text-gray-600">Cargando estadísticas...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center text-red-600">
          <p className="text-xl font-semibold">{error}</p>
        </div>
      </div>
    );
  }

  const stats_data = calculateStats();
  const avgRating = getAverageRating();
  const ratingCounts = getRatingCounts();
  const popularServices = getMostPopularServices();

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Mi Desempeño</h1>

          {/* Timeframe Filter */}
          <div className="flex gap-2">
            {['all', '30days', '90days'].map((option) => (
              <button
                key={option}
                onClick={() => setTimeframe(option)}
                className={`px-4 py-2 rounded-lg font-semibold transition ${
                  timeframe === option
                    ? 'bg-purple-600 text-white'
                    : 'bg-white text-gray-700 border border-gray-300 hover:border-purple-600'
                }`}
              >
                {option === 'all' ? 'Toda' : option === '30days' ? 'Últimos 30 días' : 'Últimos 90 días'}
              </button>
            ))}
          </div>
        </div>

        {/* Key Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-gray-600 text-sm">Total de Reservas</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">
              {stats_data.totalReservations}
            </p>
            <p className="text-xs text-gray-500 mt-2">
              {stats_data.completedReservations} completadas
            </p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-gray-600 text-sm">Tasa de Completación</p>
            <p className="text-3xl font-bold text-green-600 mt-2">
              {stats_data.completionRate}%
            </p>
            <p className="text-xs text-gray-500 mt-2">
              De todas tus reservas
            </p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-gray-600 text-sm">Ingresos Totales</p>
            <p className="text-3xl font-bold text-green-600 mt-2">
              ${stats_data.totalEarnings}
            </p>
            <p className="text-xs text-gray-500 mt-2">
              ${stats_data.avgEarningsPerReservation} promedio
            </p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-gray-600 text-sm">Calificación Promedio</p>
            <p className="text-3xl font-bold text-yellow-600 mt-2">
              {avgRating}
            </p>
            <p className="text-xs text-gray-500 mt-2">
              Basado en {ratings.length} reseña{ratings.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>

        {/* Rating Distribution */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Rating Stars */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">
              Distribución de Calificaciones
            </h2>
            <div className="space-y-3">
              {[5, 4, 3, 2, 1].map((star) => (
                <div key={star} className="flex items-center gap-4">
                  <span className="w-20 text-sm font-semibold text-gray-600">
                    {star} ⭐
                  </span>
                  <div className="flex-1 bg-gray-200 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-yellow-400 h-full transition-all"
                      style={{
                        width: `${
                          ratings.length > 0
                            ? (ratingCounts[star] / ratings.length) * 100
                            : 0
                        }%`,
                      }}
                    ></div>
                  </div>
                  <span className="w-12 text-right text-sm text-gray-600">
                    {ratingCounts[star]}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Reservation Status */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">
              Estado de Reservas
            </h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Pendientes</span>
                <span className="text-lg font-bold text-yellow-600">
                  {stats_data.pendingReservations}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Confirmadas</span>
                <span className="text-lg font-bold text-blue-600">
                  {stats_data.confirmedReservations}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Completadas</span>
                <span className="text-lg font-bold text-green-600">
                  {stats_data.completedReservations}
                </span>
              </div>
              <div className="border-t pt-4 flex justify-between items-center">
                <span className="text-gray-600">Canceladas</span>
                <span className="text-lg font-bold text-red-600">
                  {stats_data.cancelledReservations}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Popular Services */}
        {popularServices.length > 0 && (
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-6">
              Servicios Más Solicitados
            </h2>
            <div className="space-y-4">
              {popularServices.map((service, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">{service.name}</p>
                    <p className="text-sm text-gray-600">
                      {service.count} reserva{service.count !== 1 ? 's' : ''}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-green-600">
                      ${service.revenue.toFixed(2)}
                    </p>
                    <p className="text-xs text-gray-600">en ingresos</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recent Reviews */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">
            Reseñas Recientes
          </h2>

          {ratings.length > 0 ? (
            <div className="space-y-4">
              {ratings.slice(0, 5).map((rating) => (
                <div
                  key={rating.id}
                  className="border-b pb-4 last:border-b-0"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-semibold text-gray-900">
                        {rating.user?.name}
                      </p>
                      <div className="mt-1">{renderStars(rating.rating)}</div>
                    </div>
                    <p className="text-sm text-gray-500">
                      {new Date(rating.created_at).toLocaleDateString('es-ES')}
                    </p>
                  </div>
                  {rating.comment && (
                    <p className="text-gray-700 text-sm">{rating.comment}</p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-600 text-center py-8">
              Aún no tienes reseñas. ¡Continúa proporcionando un excelente servicio!
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
