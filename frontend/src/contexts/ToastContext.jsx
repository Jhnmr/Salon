import React, { createContext, useContext, useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import { ToastContainer } from '../components/ui';

/**
 * Toast Context - Design System
 * Global toast notification manager with auto-dismiss queue
 */
const ToastContext = createContext();

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

export const ToastProvider = ({ children, position = 'top-right', defaultDuration = 5000 }) => {
  const [toasts, setToasts] = useState([]);

  // Generate unique ID for toasts
  const generateId = () => {
    return `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  };

  // Add a new toast
  const showToast = useCallback((message, type = 'info', options = {}) => {
    const id = generateId();
    const duration = options.duration ?? defaultDuration;

    const newToast = {
      id,
      message,
      type,
      duration,
      position: options.position || position,
      onClose: () => removeToast(id),
    };

    setToasts((prevToasts) => [...prevToasts, newToast]);

    return id;
  }, [defaultDuration, position]);

  // Remove a toast by ID
  const removeToast = useCallback((id) => {
    setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id));
  }, []);

  // Clear all toasts
  const clearAllToasts = useCallback(() => {
    setToasts([]);
  }, []);

  // Convenience methods for different toast types
  const showSuccess = useCallback((message, options = {}) => {
    return showToast(message, 'success', options);
  }, [showToast]);

  const showError = useCallback((message, options = {}) => {
    return showToast(message, 'error', options);
  }, [showToast]);

  const showWarning = useCallback((message, options = {}) => {
    return showToast(message, 'warning', options);
  }, [showToast]);

  const showInfo = useCallback((message, options = {}) => {
    return showToast(message, 'info', options);
  }, [showToast]);

  const value = {
    toasts,
    showToast,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    removeToast,
    clearAllToasts,
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastContainer toasts={toasts} position={position} />
    </ToastContext.Provider>
  );
};

ToastProvider.propTypes = {
  children: PropTypes.node.isRequired,
  position: PropTypes.oneOf(['top-right', 'top-center', 'top-left', 'bottom-right', 'bottom-center', 'bottom-left']),
  defaultDuration: PropTypes.number,
};

export default ToastContext;
