import { useEffect, useState } from 'react';
import { reservationService } from '../services/api';

export const AdminReservations = () => {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('date_desc');

  useEffect(() => {
    fetchReservations();
  }, []);

  const fetchReservations = async () => {
    try {
      setLoading(true);
      const res = await reservationService.getAllReservations();
      setReservations(res.data.reservations || []);
      setError(null);
    } catch (err) {
      setError('Error al cargar reservas');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (reservationId, newStatus) => {
    try {
      await reservationService.updateReservation(reservationId, {
        status: newStatus,
      });
      setReservations(
        reservations.map((res) =>
          res.id === reservationId ? { ...res, status: newStatus } : res
        )
      );
    } catch (err) {
      alert('Error al actualizar reserva');
      console.error(err);
    }
  };

  const handleCancelReservation = async (reservationId) => {
    if (
      !window.confirm('¿Estás seguro de que deseas cancelar esta reserva?')
    ) {
      return;
    }
    try {
      await reservationService.cancelReservation(reservationId);
      setReservations(
        reservations.map((res) =>
          res.id === reservationId ? { ...res, status: 'cancelled' } : res
        )
      );
    } catch (err) {
      alert('Error al cancelar reserva');
      console.error(err);
    }
  };

  const getFilteredAndSortedReservations = () => {
    let filtered = reservations;

    // Apply status filter
    if (filter !== 'all') {
      filtered = filtered.filter((res) => res.status === filter);
    }

    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (res) =>
          res.client?.name.toLowerCase().includes(term) ||
          res.client?.email.toLowerCase().includes(term) ||
          res.stylist?.name.toLowerCase().includes(term) ||
          res.service?.name.toLowerCase().includes(term)
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'date_asc':
          return (
            new Date(a.scheduled_at) - new Date(b.scheduled_at)
          );
        case 'date_desc':
          return (
            new Date(b.scheduled_at) - new Date(a.scheduled_at)
          );
        case 'price_high':
          return (b.service?.price || 0) - (a.service?.price || 0);
        case 'price_low':
          return (a.service?.price || 0) - (b.service?.price || 0);
        default:
          return 0;
      }
    });

    return filtered;
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

  const calculateStatistics = () => {
    return {
      total: reservations.length,
      pending: reservations.filter((r) => r.status === 'pending').length,
      confirmed: reservations.filter((r) => r.status === 'confirmed').length,
      completed: reservations.filter((r) => r.status === 'completed').length,
      cancelled: reservations.filter((r) => r.status === 'cancelled').length,
      totalRevenue: reservations
        .filter((r) => r.status === 'completed')
        .reduce((sum, r) => sum + (r.service?.price || 0), 0)
        .toFixed(2),
    };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
          <p className="mt-4 text-gray-600">Cargando reservas...</p>
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

  const filteredReservations = getFilteredAndSortedReservations();
  const stats = calculateStatistics();

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Gestión de Reservas
        </h1>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-gray-600 text-sm">Total de reservas</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">
              {stats.total}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-gray-600 text-sm">Pendientes</p>
            <p className="text-3xl font-bold text-yellow-600 mt-2">
              {stats.pending}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-gray-600 text-sm">Confirmadas</p>
            <p className="text-3xl font-bold text-blue-600 mt-2">
              {stats.confirmed}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-gray-600 text-sm">Completadas</p>
            <p className="text-3xl font-bold text-green-600 mt-2">
              {stats.completed}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-gray-600 text-sm">Ingresos totales</p>
            <p className="text-3xl font-bold text-purple-600 mt-2">
              ${stats.totalRevenue}
            </p>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm text-gray-600 mb-2">
                Buscar
              </label>
              <input
                type="text"
                placeholder="Cliente, estilista o servicio..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-purple-500"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-2">
                Estado
              </label>
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-purple-500"
              >
                <option value="all">Todas</option>
                <option value="pending">Pendientes</option>
                <option value="confirmed">Confirmadas</option>
                <option value="completed">Completadas</option>
                <option value="cancelled">Canceladas</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-2">
                Ordenar por
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-purple-500"
              >
                <option value="date_desc">Fecha (Más reciente)</option>
                <option value="date_asc">Fecha (Más antigua)</option>
                <option value="price_high">Precio (Mayor)</option>
                <option value="price_low">Precio (Menor)</option>
              </select>
            </div>
            <div className="flex items-end">
              <button
                onClick={fetchReservations}
                className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
              >
                Actualizar
              </button>
            </div>
          </div>
        </div>

        {/* Reservations List */}
        <div className="space-y-4">
          {filteredReservations.length > 0 ? (
            filteredReservations.map((reservation) => (
              <div
                key={reservation.id}
                className="bg-white rounded-lg shadow hover:shadow-lg transition p-6"
              >
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-gray-600">Cliente</p>
                    <p className="font-semibold text-gray-900">
                      {reservation.client?.name}
                    </p>
                    <p className="text-xs text-gray-600">
                      {reservation.client?.email}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Estilista</p>
                    <p className="font-semibold text-gray-900">
                      {reservation.stylist?.name}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Servicio</p>
                    <p className="font-semibold text-gray-900">
                      {reservation.service?.name}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Fecha y Hora</p>
                    <p className="font-semibold text-gray-900">
                      {formatDateTime(reservation.scheduled_at)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Estado</p>
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                        reservation.status
                      )}`}
                    >
                      {getStatusLabel(reservation.status)}
                    </span>
                  </div>
                </div>

                <div className="border-t pt-4 mb-4">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Duración</p>
                      <p className="font-semibold text-gray-900">
                        {reservation.service?.duration_minutes} minutos
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Precio</p>
                      <p className="text-lg font-bold text-purple-600">
                        ${reservation.service?.price}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Creada</p>
                      <p className="text-sm text-gray-900">
                        {formatDateTime(reservation.created_at)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">ID Reserva</p>
                      <p className="text-xs font-mono text-gray-600">
                        #{reservation.id}
                      </p>
                    </div>
                  </div>
                </div>

                {reservation.notes && (
                  <div className="border-t pt-4 mb-4">
                    <p className="text-sm text-gray-600">Notas</p>
                    <p className="text-gray-700">{reservation.notes}</p>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="border-t pt-4 flex gap-2 flex-wrap">
                  {reservation.status === 'pending' && (
                    <>
                      <button
                        onClick={() =>
                          handleUpdateStatus(reservation.id, 'confirmed')
                        }
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-semibold"
                      >
                        Confirmar
                      </button>
                      <button
                        onClick={() =>
                          handleCancelReservation(reservation.id)
                        }
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition text-sm font-semibold"
                      >
                        Cancelar
                      </button>
                    </>
                  )}
                  {reservation.status === 'confirmed' && (
                    <>
                      <button
                        onClick={() =>
                          handleUpdateStatus(reservation.id, 'completed')
                        }
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-sm font-semibold"
                      >
                        Completar
                      </button>
                      <button
                        onClick={() =>
                          handleCancelReservation(reservation.id)
                        }
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition text-sm font-semibold"
                      >
                        Cancelar
                      </button>
                    </>
                  )}
                  {reservation.status !== 'completed' &&
                    reservation.status !== 'cancelled' && (
                      <button
                        onClick={() =>
                          handleCancelReservation(reservation.id)
                        }
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition text-sm font-semibold"
                      >
                        Cancelar
                      </button>
                    )}
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12 bg-white rounded-lg shadow">
              <p className="text-gray-600 text-lg">
                No hay reservas que coincidan con tu búsqueda
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
