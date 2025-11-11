import React from 'react';
import PropTypes from 'prop-types';

/**
 * Card Component - Design System
 * Flexible container for content with optional header and footer
 */
const Card = ({
  children,
  title,
  subtitle,
  footer,
  elevated = false,
  shadow = 'md',
  padding = 'md',
  className = '',
  headerAction,
  ...props
}) => {
  // Padding variants
  const paddingStyles = {
    none: 'p-0',
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6',
    xl: 'p-8',
  };

  // Shadow variants
  const shadowStyles = {
    none: '',
    sm: 'shadow-sm',
    md: 'shadow-md',
    lg: 'shadow-lg',
    xl: 'shadow-xl',
  };

  const baseStyles = `
    bg-gray-800 border border-gray-700 rounded-xl
    ${elevated ? 'transform hover:scale-[1.02] transition-transform duration-200' : ''}
    ${shadowStyles[shadow]}
  `;

  return (
    <div className={`${baseStyles} ${className}`} {...props}>
      {/* Header */}
      {(title || subtitle || headerAction) && (
        <div className={`border-b border-gray-700 ${paddingStyles[padding]}`}>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              {title && (
                <h3 className="text-lg font-semibold text-white">
                  {title}
                </h3>
              )}
              {subtitle && (
                <p className="mt-1 text-sm text-gray-400">
                  {subtitle}
                </p>
              )}
            </div>
            {headerAction && (
              <div className="ml-4">
                {headerAction}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Content */}
      <div className={paddingStyles[padding]}>
        {children}
      </div>

      {/* Footer */}
      {footer && (
        <div className={`border-t border-gray-700 ${paddingStyles[padding]}`}>
          {footer}
        </div>
      )}
    </div>
  );
};

Card.propTypes = {
  children: PropTypes.node.isRequired,
  title: PropTypes.string,
  subtitle: PropTypes.string,
  footer: PropTypes.node,
  elevated: PropTypes.bool,
  shadow: PropTypes.oneOf(['none', 'sm', 'md', 'lg', 'xl']),
  padding: PropTypes.oneOf(['none', 'sm', 'md', 'lg', 'xl']),
  className: PropTypes.string,
  headerAction: PropTypes.node,
};

export default Card;
