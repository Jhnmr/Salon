import { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { dashboardService } from '../services/api';

export const Dashboard = () => {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await dashboardService.getDashboard();
        setDashboardData(res.data);
      } catch (err) {
        setError('Error al cargar el dashboard');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
          <p className="mt-4 text-gray-600">Cargando dashboard...</p>
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

  if (!dashboardData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">No hay datos disponibles</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Bienvenido, {user?.name}
        </h1>

        {user?.role === 'client' && (
          <ClientDashboard data={dashboardData} />
        )}
        {user?.role === 'stylist' && (
          <StylistDashboard data={dashboardData} />
        )}
        {user?.role === 'admin' && (
          <AdminDashboard data={dashboardData} />
        )}
      </div>
    </div>
  );
};

const ClientDashboard = ({ data }) => {
  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm text-gray-600 mb-2">Total de Reservas</div>
          <div className="text-3xl font-bold text-purple-600">
            {data.summary?.total_reservations || 0}
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm text-gray-600 mb-2">Citas Completadas</div>
          <div className="text-3xl font-bold text-green-600">
            {data.summary?.completed_reservations || 0}
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm text-gray-600 mb-2">Notificaciones</div>
          <div className="text-3xl font-bold text-blue-600">
            {data.summary?.unread_notifications || 0}
          </div>
        </div>
      </div>

      {/* Upcoming Reservations */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Próximas Reservas
        </h2>
        {data.upcoming_reservations && data.upcoming_reservations.length > 0 ? (
          <div className="space-y-3">
            {data.upcoming_reservations.map((reservation) => (
              <div
                key={reservation.id}
                className="flex justify-between items-center p-4 border border-gray-200 rounded-lg"
              >
                <div>
                  <p className="font-semibold text-gray-900">
                    {reservation.service?.name}
                  </p>
                  <p className="text-sm text-gray-600">
                    {new Date(reservation.scheduled_at).toLocaleString('es-ES')}
                  </p>
                </div>
                <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm">
                  {reservation.status}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-600">No tienes reservas próximas</p>
        )}
      </div>

      {/* Favorite Services */}
      {data.favorite_services && data.favorite_services.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Servicios Favoritos
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {data.favorite_services.map((service) => (
              <div key={service.id} className="border border-gray-200 rounded-lg p-4">
                <p className="font-semibold text-gray-900">
                  {service.service?.name}
                </p>
                <p className="text-purple-600 font-bold">
                  ${service.service?.price}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const StylistDashboard = ({ data }) => {
  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm text-gray-600 mb-2">Total de Citas</div>
          <div className="text-3xl font-bold text-purple-600">
            {data.summary?.total_reservations || 0}
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm text-gray-600 mb-2">Completadas</div>
          <div className="text-3xl font-bold text-green-600">
            {data.summary?.completed_reservations || 0}
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm text-gray-600 mb-2">Este Mes</div>
          <div className="text-3xl font-bold text-blue-600">
            {data.summary?.monthly_reservations || 0}
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm text-gray-600 mb-2">Calificación</div>
          <div className="text-3xl font-bold text-yellow-600">
            {data.profile?.rating || 0} ⭐
          </div>
        </div>
      </div>

      {/* Today's Appointments */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Citas de Hoy
        </h2>
        {data.today_reservations && data.today_reservations.length > 0 ? (
          <div className="space-y-3">
            {data.today_reservations.map((reservation) => (
              <div
                key={reservation.id}
                className="flex justify-between items-center p-4 border border-gray-200 rounded-lg"
              >
                <div>
                  <p className="font-semibold text-gray-900">
                    {reservation.service?.name}
                  </p>
                  <p className="text-sm text-gray-600">
                    Cliente: {reservation.client?.name}
                  </p>
                  <p className="text-sm text-gray-600">
                    {new Date(reservation.scheduled_at).toLocaleTimeString('es-ES')}
                  </p>
                </div>
                <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                  {reservation.status}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-600">No tienes citas hoy</p>
        )}
      </div>
    </div>
  );
};

const AdminDashboard = ({ data }) => {
  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm text-gray-600 mb-2">Total de Usuarios</div>
          <div className="text-3xl font-bold text-purple-600">
            {data.users?.total || 0}
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm text-gray-600 mb-2">Clientes</div>
          <div className="text-3xl font-bold text-blue-600">
            {data.users?.clients || 0}
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm text-gray-600 mb-2">Estilistas</div>
          <div className="text-3xl font-bold text-green-600">
            {data.users?.stylists || 0}
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm text-gray-600 mb-2">Reservas Totales</div>
          <div className="text-3xl font-bold text-yellow-600">
            {data.reservations?.total || 0}
          </div>
        </div>
      </div>

      {/* Reservation Status */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm text-gray-600 mb-2">Pendientes</div>
          <div className="text-3xl font-bold text-orange-600">
            {data.reservations?.pending || 0}
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm text-gray-600 mb-2">Confirmadas</div>
          <div className="text-3xl font-bold text-blue-600">
            {data.reservations?.confirmed || 0}
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm text-gray-600 mb-2">Completadas</div>
          <div className="text-3xl font-bold text-green-600">
            {data.reservations?.completed || 0}
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm text-gray-600 mb-2">Canceladas</div>
          <div className="text-3xl font-bold text-red-600">
            {data.reservations?.cancelled || 0}
          </div>
        </div>
      </div>

      {/* Services */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Servicios
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 border border-gray-200 rounded-lg">
            <p className="text-sm text-gray-600">Total de Servicios</p>
            <p className="text-2xl font-bold text-purple-600">
              {data.services?.total || 0}
            </p>
          </div>
          <div className="p-4 border border-gray-200 rounded-lg">
            <p className="text-sm text-gray-600">Activos</p>
            <p className="text-2xl font-bold text-green-600">
              {data.services?.active || 0}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
