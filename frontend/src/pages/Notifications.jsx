import { useEffect, useState } from 'react';
import { notificationService } from '../services/api';

export const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await notificationService.getMyNotifications();
      setNotifications(res.data.notifications || []);
    } catch (err) {
      setError('Error al cargar notificaciones');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (notificationId) => {
    try {
      await notificationService.markAsRead(notificationId);
      setNotifications(
        notifications.map((n) =>
          n.id === notificationId ? { ...n, is_read: true } : n
        )
      );
    } catch (err) {
      console.error('Error marking as read', err);
    }
  };

  const handleDelete = async (notificationId) => {
    try {
      await notificationService.deleteNotification(notificationId);
      setNotifications(notifications.filter((n) => n.id !== notificationId));
    } catch (err) {
      console.error('Error deleting notification', err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications(
        notifications.map((n) => ({ ...n, is_read: true }))
      );
    } catch (err) {
      console.error('Error marking all as read', err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
          <p className="mt-4 text-gray-600">Cargando notificaciones...</p>
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

  const unreadCount = notifications.filter((n) => !n.is_read).length;
  const filteredNotifications =
    filter === 'unread'
      ? notifications.filter((n) => !n.is_read)
      : notifications;

  const getNotificationTypeColor = (type) => {
    const colors = {
      reservation: 'bg-blue-100 text-blue-800',
      reminder: 'bg-yellow-100 text-yellow-800',
      confirmation: 'bg-green-100 text-green-800',
      alert: 'bg-red-100 text-red-800',
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Notificaciones</h1>
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllAsRead}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
            >
              Marcar todas como leídas ({unreadCount})
            </button>
          )}
        </div>

        {/* Filter Tabs */}
        <div className="mb-8 flex gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg font-semibold transition ${
              filter === 'all'
                ? 'bg-purple-600 text-white'
                : 'bg-white text-gray-700 border border-gray-300 hover:border-purple-600'
            }`}
          >
            Todas ({notifications.length})
          </button>
          <button
            onClick={() => setFilter('unread')}
            className={`px-4 py-2 rounded-lg font-semibold transition ${
              filter === 'unread'
                ? 'bg-purple-600 text-white'
                : 'bg-white text-gray-700 border border-gray-300 hover:border-purple-600'
            }`}
          >
            No leídas ({unreadCount})
          </button>
        </div>

        {/* Notifications List */}
        <div className="space-y-4">
          {filteredNotifications.length > 0 ? (
            filteredNotifications.map((notification) => (
              <div
                key={notification.id}
                className={`bg-white rounded-lg shadow p-6 hover:shadow-lg transition ${
                  !notification.is_read ? 'border-l-4 border-blue-500' : ''
                }`}
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h2 className="text-xl font-semibold text-gray-900">
                        {notification.title}
                      </h2>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${getNotificationTypeColor(
                          notification.type
                        )}`}
                      >
                        {notification.type}
                      </span>
                      {!notification.is_read && (
                        <span className="inline-block w-2 h-2 bg-blue-500 rounded-full"></span>
                      )}
                    </div>
                    <p className="text-gray-600 mb-2">
                      {notification.message}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(notification.created_at).toLocaleString(
                        'es-ES',
                        {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        }
                      )}
                    </p>
                  </div>

                  {notification.reservation && (
                    <div className="ml-4 text-right text-sm text-gray-600">
                      <p className="font-semibold">
                        {notification.reservation.service?.name}
                      </p>
                      <p>
                        {new Date(
                          notification.reservation.scheduled_at
                        ).toLocaleString('es-ES')}
                      </p>
                    </div>
                  )}
                </div>

                <div className="flex gap-2 pt-4 border-t">
                  {!notification.is_read && (
                    <button
                      onClick={() => handleMarkAsRead(notification.id)}
                      className="text-sm text-purple-600 hover:text-purple-700 font-semibold"
                    >
                      Marcar como leída
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(notification.id)}
                    className="text-sm text-red-600 hover:text-red-700 font-semibold ml-auto"
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-600 text-lg">
                {filter === 'unread'
                  ? 'No tienes notificaciones sin leer'
                  : 'No tienes notificaciones'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
