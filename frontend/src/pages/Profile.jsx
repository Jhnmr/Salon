import { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { profileService } from '../services/api';

export const Profile = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    phone: '',
    bio: '',
    avatar_url: '',
    specialization: '',
    experience_years: '',
  });
  const [saveLoading, setSaveLoading] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await profileService.getMyProfile();
        setProfile(res.data.profile);
        setFormData({
          phone: res.data.profile.phone || '',
          bio: res.data.profile.bio || '',
          avatar_url: res.data.profile.avatar_url || '',
          specialization: res.data.profile.specialization || '',
          experience_years: res.data.profile.experience_years || '',
        });
      } catch (err) {
        setError('Error al cargar perfil');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaveLoading(true);
    try {
      const res = await profileService.updateProfile(formData);
      setProfile(res.data.profile);
      setIsEditing(false);
      alert('Perfil actualizado exitosamente');
    } catch (err) {
      alert('Error al actualizar perfil');
      console.error(err);
    } finally {
      setSaveLoading(false);
    }
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
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Mi Perfil</h1>

        <div className="bg-white rounded-lg shadow p-8">
          {/* User Basic Info */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Información de Cuenta
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Nombre</p>
                <p className="font-semibold text-gray-900">{user?.name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Email</p>
                <p className="font-semibold text-gray-900">{user?.email}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Rol</p>
                <p className="font-semibold text-gray-900">
                  {user?.role === 'client'
                    ? 'Cliente'
                    : user?.role === 'stylist'
                    ? 'Estilista'
                    : 'Administrador'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Estado</p>
                <p className="font-semibold text-green-600">
                  {user?.is_active ? 'Activo' : 'Inactivo'}
                </p>
              </div>
            </div>
          </div>

          <hr className="my-8" />

          {/* Edit Profile Form */}
          {isEditing ? (
            <form onSubmit={handleSave} className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Editar Perfil
              </h2>

              <div>
                <label className="block text-sm text-gray-600 mb-1">
                  Teléfono
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-purple-500"
                  placeholder="Tu número de teléfono"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-600 mb-1">
                  Biografía
                </label>
                <textarea
                  name="bio"
                  value={formData.bio}
                  onChange={handleChange}
                  rows="4"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-purple-500"
                  placeholder="Cuéntanos sobre ti"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-600 mb-1">
                  URL de Avatar
                </label>
                <input
                  type="url"
                  name="avatar_url"
                  value={formData.avatar_url}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-purple-500"
                  placeholder="https://ejemplo.com/foto.jpg"
                />
              </div>

              {user?.role === 'stylist' && (
                <>
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">
                      Especialización
                    </label>
                    <input
                      type="text"
                      name="specialization"
                      value={formData.specialization}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-purple-500"
                      placeholder="Ej: Colorimetría, Diseño de cejas"
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-gray-600 mb-1">
                      Años de Experiencia
                    </label>
                    <input
                      type="number"
                      name="experience_years"
                      value={formData.experience_years}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-purple-500"
                      placeholder="Ej: 5"
                      min="0"
                    />
                  </div>
                </>
              )}

              <div className="flex gap-2 pt-4">
                <button
                  type="submit"
                  disabled={saveLoading}
                  className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition disabled:bg-gray-400"
                >
                  {saveLoading ? 'Guardando...' : 'Guardar Cambios'}
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-6 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition"
                >
                  Cancelar
                </button>
              </div>
            </form>
          ) : (
            <>
              {/* Profile Display */}
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Información Adicional
              </h2>

              <div className="space-y-4">
                {profile?.phone && (
                  <div>
                    <p className="text-sm text-gray-600">Teléfono</p>
                    <p className="font-semibold text-gray-900">{profile.phone}</p>
                  </div>
                )}

                {profile?.bio && (
                  <div>
                    <p className="text-sm text-gray-600">Biografía</p>
                    <p className="font-semibold text-gray-900">{profile.bio}</p>
                  </div>
                )}

                {user?.role === 'stylist' && (
                  <>
                    {profile?.specialization && (
                      <div>
                        <p className="text-sm text-gray-600">Especialización</p>
                        <p className="font-semibold text-gray-900">
                          {profile.specialization}
                        </p>
                      </div>
                    )}

                    {profile?.experience_years && (
                      <div>
                        <p className="text-sm text-gray-600">
                          Años de Experiencia
                        </p>
                        <p className="font-semibold text-gray-900">
                          {profile.experience_years} años
                        </p>
                      </div>
                    )}

                    {profile?.rating && (
                      <div>
                        <p className="text-sm text-gray-600">Calificación</p>
                        <p className="font-semibold text-yellow-600">
                          {profile.rating} ⭐
                        </p>
                      </div>
                    )}
                  </>
                )}
              </div>

              <button
                onClick={() => setIsEditing(true)}
                className="mt-6 px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
              >
                Editar Perfil
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
