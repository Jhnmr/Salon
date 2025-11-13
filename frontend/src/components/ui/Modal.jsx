import React, { useEffect } from 'react';
import PropTypes from 'prop-types';

/**
 * Modal Component - Design System
 * Responsive dialog with overlay, animations, and flexible content
 */
const Modal = ({ isOpen, onClose, size = 'md', title, children, className = '' }) => {
  // Size variants
  const sizeStyles = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    full: 'max-w-full mx-4',
  };

  // Handle ESC key press
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto"
      aria-labelledby="modal-title"
      role="dialog"
      aria-modal="true"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-75 transition-opacity duration-300 animate-fadeIn"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Container */}
      <div className="flex min-h-screen items-center justify-center p-4">
        <div
          className={`
            relative w-full ${sizeStyles[size]}
            bg-gray-800 rounded-xl shadow-2xl
            transform transition-all duration-300 animate-slideIn
            ${className}
          `}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          {title && (
            <Modal.Header onClose={onClose}>
              {title}
            </Modal.Header>
          )}

          {/* Content */}
          {children}
        </div>
      </div>
    </div>
  );
};

// Modal Header Subcomponent
Modal.Header = ({ children, onClose }) => (
  <div className="flex items-center justify-between p-6 border-b border-gray-700">
    <h3 className="text-xl font-semibold text-white" id="modal-title">
      {children}
    </h3>
    <button
      onClick={onClose}
      className="text-gray-400 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-yellow-400 rounded-lg p-1"
      aria-label="Close modal"
    >
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
      </svg>
    </button>
  </div>
);

// Modal Body Subcomponent
Modal.Body = ({ children, className = '' }) => (
  <div className={`p-6 ${className}`}>
    {children}
  </div>
);

// Modal Footer Subcomponent
Modal.Footer = ({ children, className = '' }) => (
  <div className={`flex items-center justify-end gap-3 p-6 border-t border-gray-700 ${className}`}>
    {children}
  </div>
);

Modal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  size: PropTypes.oneOf(['sm', 'md', 'lg', 'xl', 'full']),
  title: PropTypes.string,
  children: PropTypes.node,
  className: PropTypes.string,
};

Modal.Header.propTypes = {
  children: PropTypes.node.isRequired,
  onClose: PropTypes.func.isRequired,
};

Modal.Body.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
};

Modal.Footer.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
};

export default Modal;
