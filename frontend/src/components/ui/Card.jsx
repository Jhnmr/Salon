import React from 'react';
import PropTypes from 'prop-types';

/**
 * Card Component - Design System
 * Flexible container for content with optional header and footer
 */
const Card = ({
  children,
  variant = 'flat',
  padding = 'md',
  onClick,
  className = '',
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

  // Variant styles
  const variantStyles = {
    flat: 'bg-gray-800 border border-gray-700',
    outlined: 'bg-transparent border-2 border-gray-700',
    elevated: 'bg-gray-800 border border-gray-700 shadow-xl transform hover:scale-[1.02] transition-transform duration-200',
  };

  const baseStyles = `
    rounded-xl
    ${variantStyles[variant]}
    ${onClick ? 'cursor-pointer' : ''}
  `;

  return (
    <div
      className={`${baseStyles} ${className}`}
      onClick={onClick}
      {...props}
    >
      {children}
    </div>
  );
};

// Card Image Subcomponent
Card.Image = ({ src, alt = '', className = '' }) => (
  <div className="w-full overflow-hidden rounded-t-xl">
    <img
      src={src}
      alt={alt}
      className={`w-full h-full object-cover ${className}`}
    />
  </div>
);

// Card Header Subcomponent
Card.Header = ({ children, className = '' }) => (
  <div className={`px-6 py-4 border-b border-gray-700 ${className}`}>
    {children}
  </div>
);

// Card Body Subcomponent
Card.Body = ({ children, className = '' }) => (
  <div className={`px-6 py-4 ${className}`}>
    {children}
  </div>
);

// Card Footer Subcomponent
Card.Footer = ({ children, className = '' }) => (
  <div className={`px-6 py-4 border-t border-gray-700 ${className}`}>
    {children}
  </div>
);

Card.propTypes = {
  children: PropTypes.node.isRequired,
  variant: PropTypes.oneOf(['flat', 'outlined', 'elevated']),
  padding: PropTypes.oneOf(['none', 'sm', 'md', 'lg', 'xl']),
  onClick: PropTypes.func,
  className: PropTypes.string,
};

Card.Image.propTypes = {
  src: PropTypes.string.isRequired,
  alt: PropTypes.string,
  className: PropTypes.string,
};

Card.Header.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
};

Card.Body.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
};

Card.Footer.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
};

export default Card;
