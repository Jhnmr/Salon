/**
 * Toast Component
 * Notification toast with multiple variants and positions
 */

import { useEffect, useState } from 'react';
import { useTheme } from '../../hooks/useTheme';

export const Toast = ({
  message,
  variant = 'info',
  duration = 3000,
  position = 'top-right',
  onClose,
  isVisible = true,
}) => {
  const { theme } = useTheme();
  const [show, setShow] = useState(isVisible);

  useEffect(() => {
    if (isVisible && duration > 0) {
      const timer = setTimeout(() => {
        setShow(false);
        if (onClose) {
          setTimeout(onClose, 300); // Wait for fade out animation
        }
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [isVisible, duration, onClose]);

  if (!show && !isVisible) return null;

  const variantStyles = {
    success: {
      backgroundColor: theme.semantic.success,
      icon: '✓',
    },
    error: {
      backgroundColor: theme.semantic.error,
      icon: '✕',
    },
    warning: {
      backgroundColor: theme.semantic.warning,
      icon: '⚠',
    },
    info: {
      backgroundColor: theme.semantic.info,
      icon: 'ℹ',
    },
  };

  const positionStyles = {
    'top-left': { top: theme.spacing.md, left: theme.spacing.md },
    'top-center': {
      top: theme.spacing.md,
      left: '50%',
      transform: 'translateX(-50%)',
    },
    'top-right': { top: theme.spacing.md, right: theme.spacing.md },
    'bottom-left': { bottom: theme.spacing.md, left: theme.spacing.md },
    'bottom-center': {
      bottom: theme.spacing.md,
      left: '50%',
      transform: 'translateX(-50%)',
    },
    'bottom-right': { bottom: theme.spacing.md, right: theme.spacing.md },
  };

  const currentVariant = variantStyles[variant] || variantStyles.info;

  return (
    <div
      role="alert"
      style={{
        position: 'fixed',
        zIndex: theme.zIndex.tooltip,
        minWidth: '300px',
        maxWidth: '500px',
        backgroundColor: currentVariant.backgroundColor,
        color: '#FFFFFF',
        borderRadius: theme.radius.md,
        padding: theme.spacing.md,
        boxShadow: theme.shadow.lg,
        display: 'flex',
        alignItems: 'center',
        gap: theme.spacing.md,
        animation: show ? 'slideIn 300ms ease-out' : 'slideOut 300ms ease-out',
        opacity: show ? 1 : 0,
        ...positionStyles[position],
      }}
    >
      {/* Icon */}
      <div
        style={{
          fontSize: theme.typography.fontSize.xl,
          fontWeight: theme.typography.fontWeight.bold,
          flexShrink: 0,
        }}
      >
        {currentVariant.icon}
      </div>

      {/* Message */}
      <div style={{ flex: 1, fontSize: theme.typography.fontSize.sm }}>
        {message}
      </div>

      {/* Close Button */}
      <button
        onClick={() => {
          setShow(false);
          if (onClose) {
            setTimeout(onClose, 300);
          }
        }}
        aria-label="Cerrar notificación"
        style={{
          background: 'none',
          border: 'none',
          color: '#FFFFFF',
          fontSize: theme.typography.fontSize.lg,
          cursor: 'pointer',
          padding: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          opacity: 0.8,
          transition: `opacity ${theme.transition.fast}`,
        }}
        onMouseEnter={(e) => (e.currentTarget.style.opacity = '1')}
        onMouseLeave={(e) => (e.currentTarget.style.opacity = '0.8')}
      >
        ×
      </button>

      <style>
        {`
          @keyframes slideIn {
            from {
              opacity: 0;
              transform: translateY(-20px) ${
                position.includes('center') ? 'translateX(-50%)' : ''
              };
            }
            to {
              opacity: 1;
              transform: translateY(0) ${
                position.includes('center') ? 'translateX(-50%)' : ''
              };
            }
          }

          @keyframes slideOut {
            from {
              opacity: 1;
              transform: translateY(0) ${
                position.includes('center') ? 'translateX(-50%)' : ''
              };
            }
            to {
              opacity: 0;
              transform: translateY(-20px) ${
                position.includes('center') ? 'translateX(-50%)' : ''
              };
            }
          }
        `}
      </style>
    </div>
  );
};

/**
 * ToastContainer Component
 * Container for managing multiple toasts
 */
export const ToastContainer = ({ toasts = [], onRemove }) => {
  return (
    <>
      {toasts.map((toast, index) => (
        <Toast
          key={toast.id || index}
          message={toast.message}
          variant={toast.variant}
          duration={toast.duration}
          position={toast.position}
          onClose={() => onRemove && onRemove(toast.id || index)}
        />
      ))}
    </>
  );
};

export default Toast;
