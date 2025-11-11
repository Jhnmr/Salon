/**
 * Select Component
 * Custom dropdown select with search and multiple selection support
 */

import { useState, useRef, useEffect } from 'react';
import { useTheme } from '../../hooks/useTheme';

export const Select = ({
  options = [],
  value,
  onChange,
  placeholder = 'Seleccionar...',
  disabled = false,
  error = null,
  searchable = false,
  multiple = false,
  name,
  label,
}) => {
  const { theme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const selectRef = useRef(null);
  const searchInputRef = useRef(null);

  // Close dropdown when clicking outside
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

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isOpen && searchable && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen, searchable]);

  const filteredOptions = searchable
    ? options.filter((option) =>
        option.label.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : options;

  const getSelectedLabel = () => {
    if (!value) return placeholder;

    if (multiple) {
      if (Array.isArray(value) && value.length > 0) {
        const selectedOptions = options.filter((opt) =>
          value.includes(opt.value)
        );
        return selectedOptions.map((opt) => opt.label).join(', ');
      }
      return placeholder;
    }

    const selected = options.find((opt) => opt.value === value);
    return selected ? selected.label : placeholder;
  };

  const handleOptionClick = (optionValue) => {
    if (multiple) {
      const newValue = Array.isArray(value) ? [...value] : [];
      const index = newValue.indexOf(optionValue);

      if (index > -1) {
        newValue.splice(index, 1);
      } else {
        newValue.push(optionValue);
      }

      onChange({
        target: {
          name,
          value: newValue,
        },
      });
    } else {
      onChange({
        target: {
          name,
          value: optionValue,
        },
      });
      setIsOpen(false);
      setSearchTerm('');
    }
  };

  const isSelected = (optionValue) => {
    if (multiple) {
      return Array.isArray(value) && value.includes(optionValue);
    }
    return value === optionValue;
  };

  return (
    <div style={{ width: '100%' }}>
      {label && (
        <label
          style={{
            display: 'block',
            marginBottom: theme.spacing.xs,
            fontSize: theme.typography.fontSize.sm,
            fontWeight: theme.typography.fontWeight.medium,
            color: theme.text.primary,
          }}
        >
          {label}
        </label>
      )}

      <div ref={selectRef} style={{ position: 'relative' }}>
        {/* Select Button */}
        <button
          type="button"
          onClick={() => !disabled && setIsOpen(!isOpen)}
          disabled={disabled}
          style={{
            width: '100%',
            padding: `${theme.spacing.sm} ${theme.spacing.md}`,
            backgroundColor: disabled ? theme.bg.tertiary : theme.bg.secondary,
            border: `1px solid ${
              error ? theme.semantic.error : isOpen ? theme.border.focus : theme.border.primary
            }`,
            borderRadius: theme.radius.md,
            color: value ? theme.text.primary : theme.text.secondary,
            fontSize: theme.typography.fontSize.base,
            textAlign: 'left',
            cursor: disabled ? 'not-allowed' : 'pointer',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            transition: `all ${theme.transition.fast}`,
            opacity: disabled ? 0.6 : 1,
          }}
        >
          <span
            style={{
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {getSelectedLabel()}
          </span>
          <span
            style={{
              marginLeft: theme.spacing.sm,
              transform: isOpen ? 'rotate(180deg)' : 'rotate(0)',
              transition: `transform ${theme.transition.fast}`,
            }}
          >
            ▼
          </span>
        </button>

        {/* Dropdown */}
        {isOpen && (
          <div
            style={{
              position: 'absolute',
              top: 'calc(100% + 4px)',
              left: 0,
              right: 0,
              backgroundColor: theme.bg.secondary,
              border: `1px solid ${theme.border.primary}`,
              borderRadius: theme.radius.md,
              boxShadow: theme.shadow.lg,
              zIndex: theme.zIndex.dropdown,
              maxHeight: '250px',
              overflowY: 'auto',
              animation: 'dropdownSlide 150ms ease-out',
            }}
          >
            {/* Search Input */}
            {searchable && (
              <div
                style={{
                  padding: theme.spacing.sm,
                  borderBottom: `1px solid ${theme.border.primary}`,
                }}
              >
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Buscar..."
                  style={{
                    width: '100%',
                    padding: theme.spacing.sm,
                    backgroundColor: theme.bg.primary,
                    border: `1px solid ${theme.border.primary}`,
                    borderRadius: theme.radius.sm,
                    color: theme.text.primary,
                    fontSize: theme.typography.fontSize.sm,
                    outline: 'none',
                  }}
                />
              </div>
            )}

            {/* Options */}
            <div>
              {filteredOptions.length === 0 ? (
                <div
                  style={{
                    padding: theme.spacing.md,
                    textAlign: 'center',
                    color: theme.text.secondary,
                    fontSize: theme.typography.fontSize.sm,
                  }}
                >
                  No se encontraron opciones
                </div>
              ) : (
                filteredOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => handleOptionClick(option.value)}
                    style={{
                      width: '100%',
                      padding: theme.spacing.md,
                      backgroundColor: isSelected(option.value)
                        ? theme.bg.hover
                        : 'transparent',
                      border: 'none',
                      color: theme.text.primary,
                      fontSize: theme.typography.fontSize.base,
                      textAlign: 'left',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: theme.spacing.sm,
                      transition: `background-color ${theme.transition.fast}`,
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.backgroundColor = theme.bg.hover)
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.backgroundColor = isSelected(
                        option.value
                      )
                        ? theme.bg.hover
                        : 'transparent')
                    }
                  >
                    {multiple && (
                      <span
                        style={{
                          width: '16px',
                          height: '16px',
                          border: `2px solid ${
                            isSelected(option.value)
                              ? theme.accent.primary
                              : theme.border.primary
                          }`,
                          borderRadius: theme.radius.sm,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          backgroundColor: isSelected(option.value)
                            ? theme.accent.primary
                            : 'transparent',
                          flexShrink: 0,
                        }}
                      >
                        {isSelected(option.value) && (
                          <span style={{ color: theme.text.inverse }}>✓</span>
                        )}
                      </span>
                    )}
                    {option.label}
                  </button>
                ))
              )}
            </div>
          </div>
        )}

        <style>
          {`
            @keyframes dropdownSlide {
              from {
                opacity: 0;
                transform: translateY(-8px);
              }
              to {
                opacity: 1;
                transform: translateY(0);
              }
            }
          `}
        </style>
      </div>

      {error && (
        <p
          style={{
            marginTop: theme.spacing.xs,
            fontSize: theme.typography.fontSize.sm,
            color: theme.semantic.error,
          }}
        >
          {error}
        </p>
      )}
    </div>
  );
};

export default Select;
