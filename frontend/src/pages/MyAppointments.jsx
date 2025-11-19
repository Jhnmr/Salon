import { useEffect, useState } from 'react';
import { reservationService } from '../services/api';

export const MyAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');
  const [todayAppointments, setTodayAppointments] = useState([]);

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const res = await reservationService.getStylistReservations();
      const allAppointments = res.data.reservations || [];
      setAppointments(allAppointments);

      // Filter today's appointments
      const today = new Date().toDateString();
      const today_appointments = allAppointments.filter((apt) => {
        const aptDate = new Date(apt.scheduled_at).toDateString();
        return aptDate === today;
      });
      setTodayAppointments(today_appointments);
      setError(null);
    } catch (err) {
      setError('Error al cargar citas');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (appointmentId, newStatus) => {
    try {
      await reservationService.updateReservation(appointmentId, {
        status: newStatus,
      });
      setAppointments(
        appointments.map((apt) =>
          apt.id === appointmentId ? { ...apt, status: newStatus } : apt
        )
      );
    } catch (err) {
      alert('Error al actualizar cita');
      console.error(err);
    }
  };

  const getFilteredAppointments = () => {
    if (filter === 'today') {
      return todayAppointments;
    }
    if (filter === 'pending') {
      return appointments.filter((apt) => apt.status === 'pending');
    }
    if (filter === 'confirmed') {
      return appointments.filter((apt) => apt.status === 'confirmed');
    }
    if (filter === 'completed') {
      return appointments.filter((apt) => apt.status === 'completed');
    }
    if (filter === 'cancelled') {
      return appointments.filter((apt) => apt.status === 'cancelled');
    }
    return appointments;
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      confirmed: 'bg-blue-100 text-blue-800',
      completed: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusLabel = (status) => {
    const labels = {
      pending: 'Pendiente',
      confirmed: 'Confirmada',
      completed: 'Completada',
      cancelled: 'Cancelada',
    };
    return labels[status] || status;
  };

  const formatDateTime = (dateTime) => {
    return new Date(dateTime).toLocaleString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
          <p className="mt-4 text-gray-600">Cargando citas...</p>
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

  const filteredAppointments = getFilteredAppointments();

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Mis Citas</h1>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-gray-600 text-sm">Total de citas</p>
            <p className="text-2xl font-bold text-gray-900 mt-2">
              {appointments.length}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-gray-600 text-sm">Citas de hoy</p>
            <p className="text-2xl font-bold text-blue-600 mt-2">
              {todayAppointments.length}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-gray-600 text-sm">Pendientes</p>
            <p className="text-2xl font-bold text-yellow-600 mt-2">
              {appointments.filter((a) => a.status === 'pending').length}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-gray-600 text-sm">Completadas</p>
            <p className="text-2xl font-bold text-green-600 mt-2">
              {appointments.filter((a) => a.status === 'completed').length}
            </p>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="mb-8 flex gap-2 flex-wrap">
          {['all', 'today', 'pending', 'confirmed', 'completed', 'cancelled'].map(
            (filterOption) => (
              <button
                key={filterOption}
                onClick={() => setFilter(filterOption)}
                className={`px-4 py-2 rounded-lg font-semibold transition ${
                  filter === filterOption
                    ? 'bg-purple-600 text-white'
                    : 'bg-white text-gray-700 border border-gray-300 hover:border-purple-600'
                }`}
              >
                {filterOption === 'all'
                  ? 'Todas'
                  : filterOption === 'today'
                  ? 'Hoy'
                  : filterOption === 'pending'
                  ? 'Pendientes'
                  : filterOption === 'confirmed'
                  ? 'Confirmadas'
                  : filterOption === 'completed'
                  ? 'Completadas'
                  : 'Canceladas'}
              </button>
            )
          )}
        </div>

        {/* Appointments List */}
        <div className="space-y-4">
          {filteredAppointments.length > 0 ? (
            filteredAppointments.map((appointment) => (
              <div
                key={appointment.id}
                className="bg-white rounded-lg shadow hover:shadow-lg transition p-6"
              >
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-gray-600">Servicio</p>
                    <p className="font-semibold text-gray-900">
                      {appointment.service?.name}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Cliente</p>
                    <p className="font-semibold text-gray-900">
                      {appointment.client?.name}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Fecha y Hora</p>
                    <p className="font-semibold text-gray-900">
                      {formatDateTime(appointment.scheduled_at)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Duración</p>
                    <p className="font-semibold text-gray-900">
                      {appointment.service?.duration_minutes} minutos
                    </p>
                  </div>
                </div>

                <div className="border-t pt-4 mb-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Precio</p>
                      <p className="text-lg font-bold text-purple-600">
                        ${appointment.service?.price}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Email del Cliente</p>
                      <p className="text-sm text-gray-900">
                        {appointment.client?.email}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Estado</p>
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                          appointment.status
                        )}`}
                      >
                        {getStatusLabel(appointment.status)}
                      </span>
                    </div>
                  </div>
                </div>

                {appointment.notes && (
                  <div className="border-t pt-4 mb-4">
                    <p className="text-sm text-gray-600">Notas</p>
                    <p className="text-gray-700">{appointment.notes}</p>
                  </div>
                )}

                {appointment.status !== 'completed' &&
                  appointment.status !== 'cancelled' && (
                    <div className="border-t pt-4 flex gap-2">
                      {appointment.status === 'pending' && (
                        <>
                          <button
                            onClick={() =>
                              handleUpdateStatus(appointment.id, 'confirmed')
                            }
                            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-sm font-semibold"
                          >
                            Confirmar
                          </button>
                          <button
                            onClick={() =>
                              handleUpdateStatus(appointment.id, 'cancelled')
                            }
                            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition text-sm font-semibold"
                          >
                            Cancelar
                          </button>
                        </>
                      )}
                      {appointment.status === 'confirmed' && (
                        <>
                          <button
                            onClick={() =>
                              handleUpdateStatus(appointment.id, 'completed')
                            }
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-semibold"
                          >
                            Marcar como completada
                          </button>
                          <button
                            onClick={() =>
                              handleUpdateStatus(appointment.id, 'cancelled')
                            }
                            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition text-sm font-semibold"
                          >
                            Cancelar
                          </button>
                        </>
                      )}
                    </div>
                  )}
              </div>
            ))
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-600 text-lg">
                {filter === 'today'
                  ? 'No tienes citas hoy'
                  : 'No hay citas en esta categoría'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
