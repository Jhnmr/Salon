import { useEffect, useState } from 'react';
import { notificationService } from '../services/api';

export const NotificationBell = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await notificationService.getUnreadNotifications();
      setNotifications(res.data.notifications || []);
      setUnreadCount(res.data.notifications?.length || 0);
    } catch (err) {
      console.error('Error fetching notifications', err);
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
      setUnreadCount(Math.max(0, unreadCount - 1));
    } catch (err) {
      console.error('Error marking notification as read', err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications(
        notifications.map((n) => ({ ...n, is_read: true }))
      );
      setUnreadCount(0);
    } catch (err) {
      console.error('Error marking all as read', err);
    }
  };

  return (
    <div className="relative">
      {/* Bell Icon */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative text-gray-600 hover:text-purple-600 transition p-2"
      >
        <svg
          className="h-6 w-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Notification Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-xl z-50">
          <div className="p-4 border-b flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-900">Notificaciones</h3>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="text-sm text-purple-600 hover:text-purple-700"
              >
                Marcar todas como leídas
              </button>
            )}
          </div>

          <div className="max-h-96 overflow-y-auto">
            {notifications.length > 0 ? (
              <div className="space-y-0">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-4 border-b hover:bg-gray-50 transition cursor-pointer ${
                      !notification.is_read ? 'bg-blue-50' : ''
                    }`}
                    onClick={() => !notification.is_read && handleMarkAsRead(notification.id)}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900">
                          {notification.title}
                        </p>
                        <p className="text-sm text-gray-600 mt-1">
                          {notification.message}
                        </p>
                        <p className="text-xs text-gray-500 mt-2">
                          {new Date(notification.created_at).toLocaleString('es-ES')}
                        </p>
                      </div>
                      {!notification.is_read && (
                        <div className="ml-2 flex-shrink-0 w-2 h-2 bg-blue-500 rounded-full mt-1"></div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center text-gray-500">
                <p>No tienes notificaciones</p>
              </div>
            )}
          </div>

          {notifications.length > 0 && (
            <div className="p-4 border-t text-center">
              <a
                href="/notifications"
                className="text-sm text-purple-600 hover:text-purple-700 font-semibold"
              >
                Ver todas las notificaciones
              </a>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
