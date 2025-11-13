import React, { useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';

/**
 * Select Component - Design System
 * Dropdown select with search and multi-select support
 */
const Select = ({
  options = [],
  value,
  onChange,
  multi = false,
  searchable = false,
  placeholder = 'Select...',
  label,
  error,
  disabled = false,
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const selectRef = useRef(null);

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (selectRef.current && !selectRef.current.contains(event.target)) {
        setIsOpen(false);
        setSearchTerm('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter options based on search
  const filteredOptions = searchable
    ? options.filter((option) =>
        option.label.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : options;

  // Handle option selection
  const handleSelect = (option) => {
    if (multi) {
      const isSelected = Array.isArray(value) && value.some((v) => v.value === option.value);
      const newValue = isSelected
        ? value.filter((v) => v.value !== option.value)
        : [...(value || []), option];
      onChange(newValue);
    } else {
      onChange(option);
      setIsOpen(false);
      setSearchTerm('');
    }
  };

  // Check if option is selected
  const isSelected = (option) => {
    if (multi) {
      return Array.isArray(value) && value.some((v) => v.value === option.value);
    }
    return value?.value === option.value;
  };

  // Get display text
  const getDisplayText = () => {
    if (multi && Array.isArray(value) && value.length > 0) {
      return `${value.length} selected`;
    }
    if (!multi && value) {
      return value.label;
    }
    return placeholder;
  };

  return (
    <div className={`relative ${className}`} ref={selectRef}>
      {/* Label */}
      {label && (
        <label className="block text-sm font-medium text-gray-300 mb-1.5">
          {label}
        </label>
      )}

      {/* Select Button */}
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`
          w-full px-4 py-2.5 text-left
          bg-gray-800 text-white
          border ${error ? 'border-red-500' : 'border-gray-700'}
          rounded-lg
          focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent
          disabled:opacity-50 disabled:cursor-not-allowed
          transition-all duration-200
          flex items-center justify-between
        `}
      >
        <span className={!value || (multi && (!value || value.length === 0)) ? 'text-gray-500' : ''}>
          {getDisplayText()}
        </span>
        <svg
          className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${
            isOpen ? 'transform rotate-180' : ''
          }`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute z-10 w-full mt-2 bg-gray-800 border border-gray-700 rounded-lg shadow-xl max-h-60 overflow-hidden">
          {/* Search Input */}
          {searchable && (
            <div className="p-2 border-b border-gray-700">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search..."
                className="w-full px-3 py-2 bg-gray-900 text-white border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 text-sm"
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          )}

          {/* Options List */}
          <div className="overflow-y-auto max-h-48">
            {filteredOptions.length === 0 ? (
              <div className="px-4 py-3 text-sm text-gray-500 text-center">
                No options found
              </div>
            ) : (
              filteredOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => handleSelect(option)}
                  className={`
                    w-full px-4 py-2.5 text-left text-sm
                    hover:bg-gray-700
                    transition-colors duration-150
                    flex items-center justify-between
                    ${isSelected(option) ? 'bg-gray-700 text-yellow-400' : 'text-gray-300'}
                  `}
                >
                  <span>{option.label}</span>
                  {isSelected(option) && (
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                </button>
              ))
            )}
          </div>

          {/* Multi-select footer */}
          {multi && value && value.length > 0 && (
            <div className="p-2 border-t border-gray-700 flex justify-between items-center">
              <span className="text-xs text-gray-400">{value.length} selected</span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onChange([]);
                }}
                className="text-xs text-red-400 hover:text-red-300 font-medium"
              >
                Clear all
              </button>
            </div>
          )}
        </div>
      )}

      {/* Error Message */}
      {error && (
        <p className="mt-1.5 text-sm text-red-500">{error}</p>
      )}
    </div>
  );
};

Select.propTypes = {
  options: PropTypes.arrayOf(
    PropTypes.shape({
      value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      label: PropTypes.string.isRequired,
    })
  ).isRequired,
  value: PropTypes.oneOfType([
    PropTypes.shape({
      value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      label: PropTypes.string,
    }),
    PropTypes.arrayOf(
      PropTypes.shape({
        value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        label: PropTypes.string,
      })
    ),
  ]),
  onChange: PropTypes.func.isRequired,
  multi: PropTypes.bool,
  searchable: PropTypes.bool,
  placeholder: PropTypes.string,
  label: PropTypes.string,
  error: PropTypes.string,
  disabled: PropTypes.bool,
  className: PropTypes.string,
};

export default Select;
