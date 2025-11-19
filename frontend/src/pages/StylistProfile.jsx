import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { profileService, ratingService, reservationService } from '../services/api';
import { useAuth } from '../hooks/useAuth';

export const StylistProfile = () => {
  const { stylistId } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  const [stylist, setStylist] = useState(null);
  const [ratings, setRatings] = useState([]);
  const [upcomingSlots, setUpcomingSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchData();
  }, [stylistId]);

  const fetchData = async () => {
    try {
      setLoading(true);

      // Fetch stylist profile
      const profileRes = await profileService.getStylistProfile(stylistId);
      setStylist(profileRes.data.profile);

      // Fetch ratings
      const ratingsRes = await ratingService.getStylistRatings(stylistId);
      setRatings(ratingsRes.data.ratings || []);

      // Fetch available slots for next 7 days
      const slotsData = [];
      const today = new Date();
      for (let i = 0; i < 7; i++) {
        const date = new Date(today);
        date.setDate(date.getDate() + i);
        const dateStr = date.toISOString().split('T')[0];

        try {
          // Note: This is a simplified approach - in production you'd want to batch these
          const slotRes = await reservationService.getAvailableSlots(
            null,
            stylistId,
            dateStr
          );
          if (slotRes.data.slots && slotRes.data.slots.length > 0) {
            slotsData.push({
              date: dateStr,
              slots: slotRes.data.slots,
            });
          }
        } catch (err) {
          // No slots available for this date
        }
      }
      setUpcomingSlots(slotsData);

      setError(null);
    } catch (err) {
      setError('Error al cargar perfil');
      console.error(err);
    } finally {
      setLoading(false);
    }
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

  const renderStars = (rating) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <span
            key={star}
            className={star <= rating ? 'text-yellow-400 text-lg' : 'text-gray-300 text-lg'}
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
          <p className="mt-4 text-gray-600">Cargando perfil...</p>
        </div>
      </div>
    );
  }

  if (error || !stylist) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center text-red-600">
          <p className="text-xl font-semibold">{error || 'Estilista no encontrada'}</p>
          <button
            onClick={() => navigate(-1)}
            className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
          >
            Volver Atrás
          </button>
        </div>
      </div>
    );
  }

  const avgRating = getAverageRating();
  const ratingCounts = getRatingCounts();

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="mb-8 px-4 py-2 text-purple-600 hover:text-purple-700 font-semibold"
        >
          ← Volver
        </button>

        {/* Header Section */}
        <div className="bg-white rounded-lg shadow p-8 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Profile Image */}
            <div className="md:col-span-1">
              <div className="bg-gradient-to-br from-purple-400 to-pink-400 rounded-lg h-64 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-6xl mb-2">💇</div>
                  <p className="text-white font-semibold text-sm">
                    {stylist.user?.name}
                  </p>
                </div>
              </div>
            </div>

            {/* Profile Info */}
            <div className="md:col-span-3">
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                {stylist.user?.name}
              </h1>

              {stylist.specialization && (
                <p className="text-xl text-purple-600 font-semibold mb-4">
                  {stylist.specialization}
                </p>
              )}

              {/* Rating Summary */}
              <div className="flex items-center gap-4 mb-6 pb-6 border-b">
                <div>
                  <div className="flex items-baseline gap-2 mb-2">
                    <p className="text-3xl font-bold text-yellow-600">{avgRating}</p>
                    <p className="text-gray-600">/5.0</p>
                  </div>
                  {renderStars(Math.round(avgRating))}
                  <p className="text-sm text-gray-600 mt-2">
                    {ratings.length} reseña{ratings.length !== 1 ? 's' : ''}
                  </p>
                </div>

                {stylist.experience_years && (
                  <div className="border-l pl-6">
                    <p className="text-3xl font-bold text-blue-600">
                      {stylist.experience_years}
                    </p>
                    <p className="text-gray-600">años de experiencia</p>
                  </div>
                )}
              </div>

              {/* Bio */}
              {stylist.bio && (
                <p className="text-gray-700 mb-6 leading-relaxed">{stylist.bio}</p>
              )}

              {/* Action Buttons */}
              <div className="flex gap-4 flex-wrap">
                <Link
                  to={`/stylist/${stylist.user_id}/ratings`}
                  className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition font-semibold"
                >
                  Ver Reseñas
                </Link>
                {isAuthenticated && user?.role === 'client' && (
                  <Link
                    to="/services"
                    className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-semibold"
                  >
                    Reservar Servicio
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Rating Distribution and Recent Reviews */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Rating Distribution */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">
              Distribución de Calificaciones
            </h2>
            <div className="space-y-3">
              {[5, 4, 3, 2, 1].map((star) => (
                <div key={star} className="flex items-center gap-3">
                  <span className="w-12 text-sm font-semibold text-gray-600">
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
                  <span className="w-8 text-right text-sm text-gray-600">
                    {ratingCounts[star]}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Reviews */}
          <div className="lg:col-span-2 bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Reseñas Recientes</h2>

            {ratings.length > 0 ? (
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {ratings.slice(0, 5).map((rating) => (
                  <div key={rating.id} className="border-b pb-4 last:border-b-0">
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
                No hay reseñas aún. Sé el primero en dejar una reseña.
              </p>
            )}
          </div>
        </div>

        {/* Availability */}
        {upcomingSlots.length > 0 && (
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Disponibilidad Próxima</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {upcomingSlots.map((daySlots) => (
                <div key={daySlots.date} className="border rounded-lg p-4">
                  <p className="font-semibold text-gray-900 mb-3">
                    {new Date(daySlots.date).toLocaleDateString('es-ES', {
                      weekday: 'short',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {daySlots.slots.slice(0, 4).map((slot) => (
                      <span
                        key={slot}
                        className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded"
                      >
                        {slot}
                      </span>
                    ))}
                    {daySlots.slots.length > 4 && (
                      <span className="text-xs text-gray-600">
                        +{daySlots.slots.length - 4} más
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {isAuthenticated && user?.role === 'client' && (
              <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">
                  ¿Interesado en esta estilista? Visita la página de{' '}
                  <Link to="/services" className="font-bold hover:underline">
                    servicios
                  </Link>{' '}
                  para reservar una cita.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Contact Info */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Contacto</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-sm text-gray-600 mb-1">Email</p>
              <p className="text-gray-900 font-semibold">{stylist.user?.email}</p>
            </div>

            {stylist.specialization && (
              <div>
                <p className="text-sm text-gray-600 mb-1">Especialización</p>
                <p className="text-gray-900 font-semibold">{stylist.specialization}</p>
              </div>
            )}

            {stylist.experience_years && (
              <div>
                <p className="text-sm text-gray-600 mb-1">Experiencia</p>
                <p className="text-gray-900 font-semibold">
                  {stylist.experience_years} años
                </p>
              </div>
            )}

            <div>
              <p className="text-sm text-gray-600 mb-1">Calificación</p>
              <div className="flex items-center gap-2">
                {renderStars(Math.round(avgRating))}
                <span className="font-semibold text-gray-900">{avgRating}/5.0</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
