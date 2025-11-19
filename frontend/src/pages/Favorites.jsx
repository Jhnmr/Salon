import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { favoriteService, ratingService } from '../services/api';
import { useAuth } from '../hooks/useAuth';

export const Favorites = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stylistRatings, setStylistRatings] = useState({});

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    fetchFavorites();
  }, [isAuthenticated, navigate]);

  const fetchFavorites = async () => {
    try {
      setLoading(true);
      const res = await favoriteService.getMyFavorites();
      const favoritesList = res.data.favorites || [];
      setFavorites(favoritesList);

      // Fetch ratings for all stylists
      const ratingsMap = {};
      for (const favorite of favoritesList) {
        try {
          const ratingRes = await ratingService.getStylistRatings(favorite.stylist_id);
          const ratings = ratingRes.data.ratings || [];
          ratingsMap[favorite.stylist_id] = {
            count: ratings.length,
            average:
              ratings.length > 0
                ? (ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length).toFixed(1)
                : 0,
          };
        } catch (err) {
          ratingsMap[favorite.stylist_id] = { count: 0, average: 0 };
        }
      }
      setStylistRatings(ratingsMap);
      setError(null);
    } catch (err) {
      setError('Error al cargar favoritos');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFavorite = async (stylistId) => {
    try {
      await favoriteService.removeFavorite(stylistId);
      setFavorites(favorites.filter((f) => f.stylist_id !== stylistId));
    } catch (err) {
      alert('Error al eliminar favorito');
      console.error(err);
    }
  };

  const renderStars = (rating) => {
    const roundedRating = Math.round(rating);
    return (
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <span
            key={star}
            className={star <= roundedRating ? 'text-yellow-400 text-lg' : 'text-gray-300 text-lg'}
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
          <p className="mt-4 text-gray-600">Cargando favoritos...</p>
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

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Mis Estilistas Favoritas</h1>
            <p className="text-gray-600 mt-2">
              {favorites.length} estilista{favorites.length !== 1 ? 's' : ''} guardada{favorites.length !== 1 ? 's' : ''}
            </p>
          </div>
          <Link
            to="/search-stylists"
            className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition font-semibold"
          >
            Explorar Estilistas
          </Link>
        </div>

        {/* Favorites Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {favorites.length > 0 ? (
            favorites.map((favorite) => {
              const stylist = favorite.stylist;
              const rating = stylistRatings[favorite.stylist_id];

              return (
                <div
                  key={favorite.id}
                  className="bg-white rounded-lg shadow hover:shadow-lg transition overflow-hidden flex flex-col"
                >
                  {/* Header with Profile */}
                  <div className="h-40 bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center relative">
                    <div className="text-center">
                      <div className="text-5xl mb-2">💇</div>
                      <p className="text-white font-semibold text-sm">
                        {stylist?.user?.name}
                      </p>
                    </div>
                    <button
                      onClick={() => handleRemoveFavorite(favorite.stylist_id)}
                      className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition"
                      title="Eliminar de favoritos"
                    >
                      ✕
                    </button>
                  </div>

                  <div className="p-6 flex-grow flex flex-col">
                    {/* Specialization */}
                    {stylist?.specialization && (
                      <p className="text-sm text-purple-600 font-semibold mb-3">
                        {stylist.specialization}
                      </p>
                    )}

                    {/* Rating */}
                    <div className="mb-4">
                      <div className="flex items-center gap-2 mb-1">
                        {renderStars(rating?.average || 0)}
                        <span className="text-sm font-bold text-gray-900">
                          {rating?.average || 0}
                        </span>
                      </div>
                      <p className="text-xs text-gray-600">
                        {rating?.count} reseña{rating?.count !== 1 ? 's' : ''}
                      </p>
                    </div>

                    {/* Experience */}
                    {stylist?.experience_years && (
                      <p className="text-sm text-gray-600 mb-4">
                        <strong>{stylist.experience_years}</strong> años de experiencia
                      </p>
                    )}

                    {/* Bio */}
                    {stylist?.bio && (
                      <p className="text-sm text-gray-600 mb-4 flex-grow line-clamp-3">
                        {stylist.bio}
                      </p>
                    )}

                    {/* Buttons */}
                    <div className="flex gap-2 mt-4">
                      <Link
                        to={`/stylist/${stylist?.user_id}/profile`}
                        className="flex-1 px-3 py-2 bg-gray-100 text-gray-900 rounded-lg hover:bg-gray-200 transition font-semibold text-center text-sm"
                      >
                        Ver Perfil
                      </Link>
                      <Link
                        to={`/stylist/${stylist?.user_id}/ratings`}
                        className="flex-1 px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition font-semibold text-center text-sm"
                      >
                        Reseñas
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="col-span-full">
              <div className="bg-white rounded-lg shadow p-12 text-center">
                <div className="text-5xl mb-4">💔</div>
                <p className="text-gray-600 text-lg mb-4">
                  No tienes estilistas favoritas guardadas
                </p>
                <p className="text-gray-500 mb-6">
                  Explora y agrega tus estilistas favoritas para acceder rápidamente
                </p>
                <Link
                  to="/search-stylists"
                  className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition font-semibold inline-block"
                >
                  Descubre Estilistas
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
