import React from 'react';
import PropTypes from 'prop-types';

/**
 * Loader Component - Design System
 * Loading indicators with multiple types and sizes
 */
const Loader = ({
  type = 'spinner',
  size = 'md',
  fullscreen = false,
  message = '',
  className = '',
}) => {
  // Size variants
  const sizeStyles = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
  };

  // Spinner Loader
  const SpinnerLoader = () => (
    <svg
      className={`animate-spin ${sizeStyles[size]} text-yellow-400`}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );

  // Dots Loader
  const DotsLoader = () => {
    const dotSize = {
      sm: 'w-1.5 h-1.5',
      md: 'w-2.5 h-2.5',
      lg: 'w-3.5 h-3.5',
      xl: 'w-4 h-4',
    };

    return (
      <div className="flex items-center gap-1.5">
        <div
          className={`${dotSize[size]} bg-yellow-400 rounded-full animate-bounce`}
          style={{ animationDelay: '0ms' }}
        />
        <div
          className={`${dotSize[size]} bg-yellow-400 rounded-full animate-bounce`}
          style={{ animationDelay: '150ms' }}
        />
        <div
          className={`${dotSize[size]} bg-yellow-400 rounded-full animate-bounce`}
          style={{ animationDelay: '300ms' }}
        />
      </div>
    );
  };

  // Skeleton Loader
  const SkeletonLoader = () => (
    <div className="space-y-3 w-full">
      <div className="h-4 bg-gray-700 rounded animate-pulse w-full" />
      <div className="h-4 bg-gray-700 rounded animate-pulse w-5/6" />
      <div className="h-4 bg-gray-700 rounded animate-pulse w-4/6" />
    </div>
  );

  // Pulse Loader
  const PulseLoader = () => (
    <div className="relative">
      <div className={`${sizeStyles[size]} bg-yellow-400 rounded-full animate-ping absolute opacity-75`} />
      <div className={`${sizeStyles[size]} bg-yellow-500 rounded-full`} />
    </div>
  );

  // Select loader type
  const renderLoader = () => {
    switch (type) {
      case 'dots':
        return <DotsLoader />;
      case 'skeleton':
        return <SkeletonLoader />;
      case 'pulse':
        return <PulseLoader />;
      case 'spinner':
      default:
        return <SpinnerLoader />;
    }
  };

  const loaderContent = (
    <div className={`flex flex-col items-center justify-center gap-4 ${className}`}>
      {renderLoader()}
      {message && (
        <p className="text-sm text-gray-400 font-medium animate-pulse">
          {message}
        </p>
      )}
    </div>
  );

  if (fullscreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900 bg-opacity-90">
        {loaderContent}
      </div>
    );
  }

  return loaderContent;
};

// Inline Spinner (for buttons, small spaces)
export const Spinner = ({ size = 'sm', className = '' }) => {
  const sizeMap = {
    xs: 'w-3 h-3',
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
  };

  return (
    <svg
      className={`animate-spin ${sizeMap[size]} ${className}`}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );
};

Loader.propTypes = {
  type: PropTypes.oneOf(['spinner', 'dots', 'skeleton', 'pulse']),
  size: PropTypes.oneOf(['sm', 'md', 'lg', 'xl']),
  fullscreen: PropTypes.bool,
  message: PropTypes.string,
  className: PropTypes.string,
};

Spinner.propTypes = {
  size: PropTypes.oneOf(['xs', 'sm', 'md', 'lg']),
  className: PropTypes.string,
};

export default Loader;
