/**
 * SALON PWA - Notification Context
 * Manages real-time notifications and WebSocket connection
 */

import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useAuth } from './AuthContext';

const NotificationContext = createContext(null);

/**
 * Notification Provider Component
 * Manages notifications and real-time updates
 */
export const NotificationProvider = ({ children }) => {
  const { isAuthenticated, user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isConnected, setIsConnected] = useState(false);
  const [socket, setSocket] = useState(null);

  /**
   * Initialize WebSocket connection
   * Placeholder for Firebase or WebSocket implementation
   */
  useEffect(() => {
    if (!isAuthenticated || !user) {
      return;
    }

    // TODO: Initialize Firebase Cloud Messaging or WebSocket connection
    // For now, this is a placeholder structure

    const initializeNotifications = async () => {
      try {
        // Placeholder for notification initialization
        setIsConnected(true);

        // Example: Initialize Firebase
        // const messaging = getMessaging();
        // const token = await getToken(messaging);
        // Send token to backend

        console.log('Notifications initialized for user:', user.id);
      } catch (error) {
        console.error('Failed to initialize notifications:', error);
        setIsConnected(false);
      }
    };

    initializeNotifications();

    return () => {
      // Cleanup WebSocket/Firebase connection
      if (socket) {
        socket.close();
      }
      setIsConnected(false);
    };
  }, [isAuthenticated, user]);

  /**
   * Add notification to list
   * @param {Object} notification - Notification object
   */
  const addNotification = useCallback((notification) => {
    const newNotification = {
      id: notification.id || Date.now(),
      title: notification.title,
      message: notification.message,
      type: notification.type || 'info', // info, success, warning, error
      timestamp: notification.timestamp || new Date().toISOString(),
      read: false,
      data: notification.data || {},
    };

    setNotifications((prev) => [newNotification, ...prev]);
    setUnreadCount((prev) => prev + 1);

    // Show browser notification if permission granted
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(newNotification.title, {
        body: newNotification.message,
        icon: '/icon-192x192.png',
        badge: '/icon-192x192.png',
      });
    }

    return newNotification;
  }, []);

  /**
   * Mark notification as read
   * @param {string|number} notificationId - Notification ID
   */
  const markAsRead = useCallback((notificationId) => {
    setNotifications((prev) =>
      prev.map((notification) =>
        notification.id === notificationId
          ? { ...notification, read: true }
          : notification
      )
    );

    setUnreadCount((prev) => Math.max(0, prev - 1));
  }, []);

  /**
   * Mark all notifications as read
   */
  const markAllAsRead = useCallback(() => {
    setNotifications((prev) =>
      prev.map((notification) => ({ ...notification, read: true }))
    );
    setUnreadCount(0);
  }, []);

  /**
   * Remove notification
   * @param {string|number} notificationId - Notification ID
   */
  const removeNotification = useCallback((notificationId) => {
    setNotifications((prev) => {
      const notification = prev.find((n) => n.id === notificationId);
      if (notification && !notification.read) {
        setUnreadCount((count) => Math.max(0, count - 1));
      }
      return prev.filter((n) => n.id !== notificationId);
    });
  }, []);

  /**
   * Clear all notifications
   */
  const clearAllNotifications = useCallback(() => {
    setNotifications([]);
    setUnreadCount(0);
  }, []);

  /**
   * Request browser notification permission
   */
  const requestPermission = useCallback(async () => {
    if (!('Notification' in window)) {
      console.warn('This browser does not support notifications');
      return 'unsupported';
    }

    if (Notification.permission === 'granted') {
      return 'granted';
    }

    if (Notification.permission === 'denied') {
      return 'denied';
    }

    const permission = await Notification.requestPermission();
    return permission;
  }, []);

  /**
   * Get notifications filtered by type
   * @param {string} type - Notification type
   * @returns {Array} Filtered notifications
   */
  const getNotificationsByType = useCallback((type) => {
    return notifications.filter((notification) => notification.type === type);
  }, [notifications]);

  /**
   * Get unread notifications
   * @returns {Array} Unread notifications
   */
  const getUnreadNotifications = useCallback(() => {
    return notifications.filter((notification) => !notification.read);
  }, [notifications]);

  /**
   * Simulate receiving a notification (for testing)
   * @param {Object} notification - Notification data
   */
  const simulateNotification = useCallback((notification) => {
    addNotification(notification);
  }, [addNotification]);

  /**
   * Handle WebSocket message
   * Placeholder for actual WebSocket implementation
   */
  const handleSocketMessage = useCallback((message) => {
    try {
      const data = typeof message === 'string' ? JSON.parse(message) : message;

      switch (data.type) {
        case 'reservation_confirmed':
          addNotification({
            title: 'Reservation Confirmed',
            message: 'Your reservation has been confirmed!',
            type: 'success',
            data: data.payload,
          });
          break;

        case 'reservation_cancelled':
          addNotification({
            title: 'Reservation Cancelled',
            message: 'A reservation has been cancelled.',
            type: 'warning',
            data: data.payload,
          });
          break;

        case 'new_message':
          addNotification({
            title: 'New Message',
            message: `${data.payload.sender}: ${data.payload.preview}`,
            type: 'info',
            data: data.payload,
          });
          break;

        case 'payment_received':
          addNotification({
            title: 'Payment Received',
            message: 'Your payment has been processed successfully.',
            type: 'success',
            data: data.payload,
          });
          break;

        default:
          console.log('Unknown notification type:', data.type);
      }
    } catch (error) {
      console.error('Error handling socket message:', error);
    }
  }, [addNotification]);

  const value = {
    // State
    notifications,
    unreadCount,
    isConnected,

    // Actions
    addNotification,
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearAllNotifications,
    requestPermission,

    // Helpers
    getNotificationsByType,
    getUnreadNotifications,

    // Testing
    simulateNotification,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

/**
 * Hook to use Notification Context
 * @returns {Object} Notification context value
 */
export const useNotifications = () => {
  const context = useContext(NotificationContext);

  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }

  return context;
};

export default NotificationContext;
