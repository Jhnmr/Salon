import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { profileService, ratingService } from '../services/api';
import { useAuth } from '../hooks/useAuth';

export const StylistRatings = () => {
  const { stylistId } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  const [stylist, setStylist] = useState(null);
  const [ratings, setRatings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAddingRating, setIsAddingRating] = useState(false);
  const [userRating, setUserRating] = useState(null);

  const [formData, setFormData] = useState({
    rating: 5,
    comment: '',
  });

  useEffect(() => {
    fetchData();
  }, [stylistId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const stylistRes = await profileService.getStylistProfile(stylistId);
      setStylist(stylistRes.data.profile);

      const ratingsRes = await ratingService.getStylistRatings(stylistId);
      setRatings(ratingsRes.data.ratings || []);

      // Check if current user has already rated
      if (isAuthenticated && user) {
        const userRatingData = ratingsRes.data.ratings?.find(
          (r) => r.user_id === user.id && r.stylist_id === parseInt(stylistId)
        );
        setUserRating(userRatingData || null);
      }

      setError(null);
    } catch (err) {
      setError('Error al cargar información');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRatingChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'rating' ? parseInt(value) : value,
    }));
  };

  const handleSubmitRating = async (e) => {
    e.preventDefault();

    if (!isAuthenticated) {
      alert('Debes iniciar sesión para dejar una reseña');
      navigate('/login');
      return;
    }

    try {
      const ratingData = {
        stylist_id: parseInt(stylistId),
        rating: formData.rating,
        comment: formData.comment,
      };

      if (userRating) {
        await ratingService.updateRating(userRating.id, ratingData);
        alert('Reseña actualizada exitosamente');
      } else {
        await ratingService.createRating(ratingData);
        alert('Reseña agregada exitosamente');
      }

      setFormData({ rating: 5, comment: '' });
      fetchData();
    } catch (err) {
      alert('Error al guardar reseña');
      console.error(err);
    }
  };

  const handleDeleteRating = async (ratingId) => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar tu reseña?')) {
      return;
    }

    try {
      await ratingService.deleteRating(ratingId);
      alert('Reseña eliminada');
      fetchData();
    } catch (err) {
      alert('Error al eliminar reseña');
      console.error(err);
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
          <p className="mt-4 text-gray-600">Cargando información...</p>
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
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="mb-8 px-4 py-2 text-purple-600 hover:text-purple-700 font-semibold"
        >
          ← Volver
        </button>

        {/* Stylist Header */}
        <div className="bg-white rounded-lg shadow p-8 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Stylist Info */}
            <div className="md:col-span-2">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {stylist.user?.name}
              </h1>
              {stylist.specialization && (
                <p className="text-lg text-purple-600 mb-2">
                  {stylist.specialization}
                </p>
              )}
              {stylist.experience_years && (
                <p className="text-gray-600 mb-4">
                  {stylist.experience_years} años de experiencia
                </p>
              )}

              {stylist.bio && (
                <div className="mt-4 pt-4 border-t">
                  <p className="text-gray-700">{stylist.bio}</p>
                </div>
              )}
            </div>

            {/* Rating Summary */}
            <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-lg p-6">
              <p className="text-gray-600 text-sm mb-2">Calificación Promedio</p>
              <div className="flex items-baseline gap-2 mb-4">
                <p className="text-4xl font-bold text-yellow-600">{avgRating}</p>
                <p className="text-gray-600">/5.0</p>
              </div>
              {renderStars(Math.round(avgRating))}
              <p className="text-sm text-gray-600 mt-4">
                Basado en {ratings.length} reseña{ratings.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
        </div>

        {/* Rating Distribution */}
        <div className="bg-white rounded-lg shadow p-8 mb-8">
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

        {/* Add/Edit Review Form */}
        {isAuthenticated && user?.role === 'client' && (
          <div className="bg-white rounded-lg shadow p-8 mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-6">
              {userRating ? 'Editar tu Reseña' : 'Agregar una Reseña'}
            </h2>

            <form onSubmit={handleSubmitRating} className="space-y-6">
              {/* Rating Select */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-3">
                  Calificación
                </label>
                <div className="flex gap-4">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <label key={star} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="rating"
                        value={star}
                        checked={formData.rating === star}
                        onChange={handleRatingChange}
                        className="w-4 h-4"
                      />
                      <span className="text-2xl text-yellow-400">★</span>
                      <span className="text-sm text-gray-600">{star}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Comment */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Comentario (Opcional)
                </label>
                <textarea
                  name="comment"
                  value={formData.comment}
                  onChange={handleRatingChange}
                  rows="4"
                  maxLength="500"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-purple-500"
                  placeholder="Comparte tu experiencia..."
                />
                <p className="text-xs text-gray-500 mt-1">
                  {formData.comment.length}/500 caracteres
                </p>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition font-semibold"
              >
                {userRating ? 'Actualizar Reseña' : 'Publicar Reseña'}
              </button>
            </form>
          </div>
        )}

        {/* Reviews List */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Reseñas ({ratings.length})
          </h2>

          {ratings.length > 0 ? (
            ratings.map((rating) => (
              <div key={rating.id} className="bg-white rounded-lg shadow p-6">
                <div className="flex justify-between items-start mb-4">
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
                  <p className="text-gray-700 mb-4">{rating.comment}</p>
                )}

                {isAuthenticated && user?.id === rating.user_id && (
                  <div className="border-t pt-4 flex gap-2">
                    <button
                      onClick={() => {
                        setFormData({
                          rating: rating.rating,
                          comment: rating.comment,
                        });
                        setUserRating(rating);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      className="text-sm text-blue-600 hover:text-blue-700 font-semibold"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleDeleteRating(rating.id)}
                      className="text-sm text-red-600 hover:text-red-700 font-semibold"
                    >
                      Eliminar
                    </button>
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="bg-white rounded-lg shadow p-8 text-center">
              <p className="text-gray-600">
                No hay reseñas aún. ¡Sé el primero en dejar una reseña!
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
