import React from 'react';
import PropTypes from 'prop-types';

/**
 * Badge Component - Design System
 * Small status indicator or label
 */
const Badge = ({
  children,
  variant = 'default',
  size = 'md',
  dot = false,
  className = '',
  ...props
}) => {
  // Base styles
  const baseStyles = `
    inline-flex items-center gap-1.5
    font-medium rounded-full
    transition-colors duration-200
  `;

  // Variant styles
  const variantStyles = {
    default: 'bg-gray-700 text-gray-300',
    primary: 'bg-yellow-500/20 text-yellow-400 ring-1 ring-yellow-500/30',
    success: 'bg-green-500/20 text-green-400 ring-1 ring-green-500/30',
    error: 'bg-red-500/20 text-red-400 ring-1 ring-red-500/30',
    warning: 'bg-yellow-500/20 text-yellow-400 ring-1 ring-yellow-500/30',
    info: 'bg-blue-500/20 text-blue-400 ring-1 ring-blue-500/30',
  };

  // Size styles
  const sizeStyles = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-sm',
    lg: 'px-3 py-1.5 text-base',
  };

  // Dot colors
  const dotColors = {
    default: 'bg-gray-400',
    primary: 'bg-yellow-400',
    success: 'bg-green-400',
    error: 'bg-red-400',
    warning: 'bg-yellow-400',
    info: 'bg-blue-400',
  };

  return (
    <span
      className={`
        ${baseStyles}
        ${variantStyles[variant]}
        ${sizeStyles[size]}
        ${className}
      `}
      {...props}
    >
      {dot && (
        <span className={`w-1.5 h-1.5 rounded-full ${dotColors[variant]}`} />
      )}
      {children}
    </span>
  );
};

Badge.propTypes = {
  children: PropTypes.node.isRequired,
  variant: PropTypes.oneOf(['default', 'primary', 'success', 'error', 'warning', 'info']),
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  dot: PropTypes.bool,
  className: PropTypes.string,
};

export default Badge;
