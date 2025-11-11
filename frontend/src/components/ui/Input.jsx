import React, { forwardRef } from 'react';
import PropTypes from 'prop-types';

/**
 * Input Component - Design System
 * Versatile input field with label, error, and icon support
 */
const Input = forwardRef(({
  type = 'text',
  label,
  error,
  helpText,
  icon: Icon = null,
  iconPosition = 'left',
  fullWidth = false,
  disabled = false,
  required = false,
  placeholder,
  className = '',
  ...props
}, ref) => {
  const baseInputStyles = `
    w-full px-4 py-2.5
    bg-gray-800 text-white placeholder-gray-500
    border border-gray-700 rounded-lg
    focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent
    disabled:opacity-50 disabled:cursor-not-allowed
    transition-all duration-200
  `;

  const errorStyles = error ? 'border-red-500 focus:ring-red-500' : '';
  const iconPaddingStyles = Icon ? (iconPosition === 'left' ? 'pl-10' : 'pr-10') : '';

  return (
    <div className={`${fullWidth ? 'w-full' : ''} ${className}`}>
      {/* Label */}
      {label && (
        <label className="block text-sm font-medium text-gray-300 mb-1.5">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      {/* Input Container */}
      <div className="relative">
        {/* Icon */}
        {Icon && (
          <div className={`
            absolute top-1/2 transform -translate-y-1/2
            ${iconPosition === 'left' ? 'left-3' : 'right-3'}
            text-gray-400
          `}>
            <Icon className="w-5 h-5" />
          </div>
        )}

        {/* Input Field */}
        <input
          ref={ref}
          type={type}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          className={`
            ${baseInputStyles}
            ${errorStyles}
            ${iconPaddingStyles}
          `}
          {...props}
        />
      </div>

      {/* Help Text or Error Message */}
      {(helpText || error) && (
        <p className={`
          mt-1.5 text-sm
          ${error ? 'text-red-500' : 'text-gray-400'}
        `}>
          {error || helpText}
        </p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

Input.propTypes = {
  type: PropTypes.oneOf(['text', 'email', 'password', 'tel', 'number', 'url', 'search']),
  label: PropTypes.string,
  error: PropTypes.string,
  helpText: PropTypes.string,
  icon: PropTypes.elementType,
  iconPosition: PropTypes.oneOf(['left', 'right']),
  fullWidth: PropTypes.bool,
  disabled: PropTypes.bool,
  required: PropTypes.bool,
  placeholder: PropTypes.string,
  className: PropTypes.string,
};

export default Input;
