import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { profileService, ratingService, favoriteService } from '../services/api';
import { useAuth } from '../hooks/useAuth';

export const SearchStylists = () => {
  const { isAuthenticated } = useAuth();
  const [stylists, setStylists] = useState([]);
  const [filteredStylists, setFilteredStylists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpecialization, setSelectedSpecialization] = useState('all');
  const [minRating, setMinRating] = useState(0);
  const [sortBy, setSortBy] = useState('rating');

  const [stylistRatings, setStylistRatings] = useState({});
  const [favorites, setFavorites] = useState(new Set());

  useEffect(() => {
    fetchStylists();
    if (isAuthenticated) {
      fetchFavorites();
    }
  }, [isAuthenticated]);

  useEffect(() => {
    applyFilters();
  }, [stylists, searchTerm, selectedSpecialization, minRating, sortBy]);

  const fetchStylists = async () => {
    try {
      setLoading(true);
      const res = await profileService.getAllStylists();
      const stylistList = res.data.profiles || [];
      setStylists(stylistList);

      // Fetch ratings for all stylists
      const ratingsMap = {};
      for (const stylist of stylistList) {
        try {
          const ratingRes = await ratingService.getStylistRatings(stylist.user_id);
          const ratings = ratingRes.data.ratings || [];
          ratingsMap[stylist.user_id] = {
            count: ratings.length,
            average:
              ratings.length > 0
                ? (ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length).toFixed(1)
                : 0,
          };
        } catch (err) {
          ratingsMap[stylist.user_id] = { count: 0, average: 0 };
        }
      }
      setStylistRatings(ratingsMap);
      setError(null);
    } catch (err) {
      setError('Error al cargar estilistas');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchFavorites = async () => {
    try {
      const res = await favoriteService.getMyFavorites();
      const favoriteIds = new Set(
        (res.data.favorites || []).map((f) => f.stylist_id)
      );
      setFavorites(favoriteIds);
    } catch (err) {
      console.error('Error loading favorites:', err);
    }
  };

  const handleToggleFavorite = async (stylistId) => {
    try {
      const isFavorited = favorites.has(stylistId);
      if (isFavorited) {
        await favoriteService.removeFavorite(stylistId);
        setFavorites(new Set([...favorites].filter((id) => id !== stylistId)));
      } else {
        await favoriteService.addFavorite(stylistId);
        setFavorites(new Set([...favorites, stylistId]));
      }
    } catch (err) {
      alert('Error al actualizar favorito');
      console.error(err);
    }
  };

  const applyFilters = () => {
    let filtered = stylists;

    // Search by name
    if (searchTerm) {
      filtered = filtered.filter((stylist) =>
        stylist.user?.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by specialization
    if (selectedSpecialization !== 'all') {
      filtered = filtered.filter(
        (stylist) => stylist.specialization === selectedSpecialization
      );
    }

    // Filter by minimum rating
    filtered = filtered.filter((stylist) => {
      const rating = parseFloat(stylistRatings[stylist.user_id]?.average || 0);
      return rating >= minRating;
    });

    // Sort
    filtered.sort((a, b) => {
      const ratingA = parseFloat(stylistRatings[a.user_id]?.average || 0);
      const ratingB = parseFloat(stylistRatings[b.user_id]?.average || 0);

      switch (sortBy) {
        case 'rating_high':
          return ratingB - ratingA;
        case 'rating_low':
          return ratingA - ratingB;
        case 'experience_high':
          return (b.experience_years || 0) - (a.experience_years || 0);
        case 'experience_low':
          return (a.experience_years || 0) - (b.experience_years || 0);
        case 'reviews':
          return (
            (stylistRatings[b.user_id]?.count || 0) -
            (stylistRatings[a.user_id]?.count || 0)
          );
        default:
          return ratingB - ratingA;
      }
    });

    setFilteredStylists(filtered);
  };

  const specializations = [
    'all',
    ...new Set(stylists.map((s) => s.specialization).filter(Boolean)),
  ];

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
          <p className="mt-4 text-gray-600">Cargando estilistas...</p>
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
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Encuentra tu Estilista</h1>
        <p className="text-gray-600 mb-8">Busca y compara estilistas en nuestra plataforma</p>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Search */}
            <div className="lg:col-span-2">
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Buscar por nombre
              </label>
              <input
                type="text"
                placeholder="Nombre del estilista..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-purple-500"
              />
            </div>

            {/* Specialization Filter */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Especialización
              </label>
              <select
                value={selectedSpecialization}
                onChange={(e) => setSelectedSpecialization(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-purple-500"
              >
                {specializations.map((spec) => (
                  <option key={spec} value={spec}>
                    {spec === 'all' ? 'Todas' : spec}
                  </option>
                ))}
              </select>
            </div>

            {/* Rating Filter */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Calificación mínima
              </label>
              <select
                value={minRating}
                onChange={(e) => setMinRating(parseFloat(e.target.value))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-purple-500"
              >
                <option value={0}>Todas</option>
                <option value={3}>3+ ⭐</option>
                <option value={3.5}>3.5+ ⭐</option>
                <option value={4}>4+ ⭐</option>
                <option value={4.5}>4.5+ ⭐</option>
                <option value={5}>5 ⭐</option>
              </select>
            </div>

            {/* Sort */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Ordenar por
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-purple-500"
              >
                <option value="rating">Mejor calificación</option>
                <option value="rating_low">Menor calificación</option>
                <option value="experience_high">Más experiencia</option>
                <option value="experience_low">Menos experiencia</option>
                <option value="reviews">Más reseñas</option>
              </select>
            </div>
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-gray-600">
            Se encontraron <strong>{filteredStylists.length}</strong> estilista
            {filteredStylists.length !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Stylists Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredStylists.length > 0 ? (
            filteredStylists.map((stylist) => {
              const rating = stylistRatings[stylist.user_id];
              return (
                <div
                  key={stylist.user_id}
                  className="bg-white rounded-lg shadow hover:shadow-lg transition overflow-hidden"
                >
                  <div className="h-40 bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-5xl">💇</div>
                      <p className="text-white font-semibold text-sm mt-2">
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
                    {stylist.experience_years && (
                      <p className="text-sm text-gray-600 mb-4">
                        <strong>{stylist.experience_years}</strong> años de experiencia
                      </p>
                    )}

                    {/* Bio */}
                    {stylist.bio && (
                      <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                        {stylist.bio}
                      </p>
                    )}

                    {/* Action Buttons */}
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
                      {isAuthenticated && (
                        <button
                          onClick={() => handleToggleFavorite(stylist.user_id)}
                          className={`px-3 py-2 rounded-lg transition font-semibold text-sm ${
                            favorites.has(stylist.user_id)
                              ? 'bg-red-600 text-white hover:bg-red-700'
                              : 'bg-gray-200 text-gray-900 hover:bg-gray-300'
                          }`}
                          title={
                            favorites.has(stylist.user_id)
                              ? 'Quitar de favoritos'
                              : 'Agregar a favoritos'
                          }
                        >
                          {favorites.has(stylist.user_id) ? '❤️' : '🤍'}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="col-span-full text-center py-12">
              <p className="text-gray-600 text-lg">
                No se encontraron estilistas con los criterios especificados
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
