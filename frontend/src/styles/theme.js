/**
 * SALON Design System - Theme Configuration
 * Dark theme as primary, following modern beauty app aesthetics
 */

export const darkTheme = {
  // Background colors
  bg: {
    primary: '#0A0A0B',      // Negro profundo - Fondo principal
    secondary: '#1A1A1C',    // Gris carbón - Cards y surfaces
    tertiary: '#2D2D30',     // Gris oscuro - Borders y dividers
    hover: '#3A3A3D',        // Estado hover
    active: '#4A4A4D',       // Estado active/pressed
  },

  // Text colors
  text: {
    primary: '#FFFFFF',       // Blanco - Texto principal
    secondary: '#9CA3AF',     // Gris claro - Texto secundario
    tertiary: '#6B7280',      // Gris medio - Texto deshabilitado
    inverse: '#0A0A0B',       // Negro - Texto sobre fondos claros
  },

  // Accent colors
  accent: {
    primary: '#FFD700',       // Amarillo dorado - Accent principal
    secondary: '#FFC93C',     // Amarillo cálido
    light: '#FFE55C',         // Amarillo claro
    dark: '#E5C100',          // Dorado oscuro
  },

  // Semantic colors
  semantic: {
    success: '#10B981',       // Verde - Success states
    error: '#EF4444',         // Rojo - Error states
    warning: '#F59E0B',       // Naranja - Warning states
    info: '#3B82F6',          // Azul - Info states
  },

  // Status colors
  status: {
    online: '#10B981',
    offline: '#6B7280',
    busy: '#EF4444',
    away: '#F59E0B',
  },

  // Border colors
  border: {
    primary: '#2D2D30',
    secondary: '#3A3A3D',
    focus: '#FFD700',
  },

  // Shadow colors
  shadow: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.5)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.5), 0 2px 4px -1px rgba(0, 0, 0, 0.3)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.5), 0 4px 6px -2px rgba(0, 0, 0, 0.3)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 10px 10px -5px rgba(0, 0, 0, 0.2)',
  },

  // Spacing scale (rem units)
  spacing: {
    xs: '0.25rem',    // 4px
    sm: '0.5rem',     // 8px
    md: '1rem',       // 16px
    lg: '1.5rem',     // 24px
    xl: '2rem',       // 32px
    '2xl': '3rem',    // 48px
    '3xl': '4rem',    // 64px
  },

  // Border radius
  radius: {
    none: '0',
    sm: '0.25rem',    // 4px
    md: '0.5rem',     // 8px
    lg: '0.75rem',    // 12px
    xl: '1rem',       // 16px
    '2xl': '1.5rem',  // 24px
    full: '9999px',   // Circular
  },

  // Typography
  typography: {
    fontFamily: {
      sans: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      mono: 'Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
    },
    fontSize: {
      xs: '0.75rem',     // 12px
      sm: '0.875rem',    // 14px
      base: '1rem',      // 16px
      lg: '1.125rem',    // 18px
      xl: '1.25rem',     // 20px
      '2xl': '1.5rem',   // 24px
      '3xl': '1.875rem', // 30px
      '4xl': '2.25rem',  // 36px
      '5xl': '3rem',     // 48px
    },
    fontWeight: {
      light: 300,
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
      extrabold: 800,
    },
    lineHeight: {
      none: 1,
      tight: 1.25,
      snug: 1.375,
      normal: 1.5,
      relaxed: 1.625,
      loose: 2,
    },
  },

  // Z-index scale
  zIndex: {
    base: 0,
    dropdown: 1000,
    sticky: 1100,
    fixed: 1200,
    modalBackdrop: 1300,
    modal: 1400,
    popover: 1500,
    tooltip: 1600,
  },

  // Transitions
  transition: {
    fast: '150ms cubic-bezier(0.4, 0, 0.2, 1)',
    base: '200ms cubic-bezier(0.4, 0, 0.2, 1)',
    slow: '300ms cubic-bezier(0.4, 0, 0.2, 1)',
  },

  // Breakpoints (mobile-first)
  breakpoints: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
  },
};

// Light theme (opcional, para futuro)
export const lightTheme = {
  ...darkTheme,
  bg: {
    primary: '#FFFFFF',
    secondary: '#F9FAFB',
    tertiary: '#E5E7EB',
    hover: '#F3F4F6',
    active: '#E5E7EB',
  },
  text: {
    primary: '#111827',
    secondary: '#4B5563',
    tertiary: '#9CA3AF',
    inverse: '#FFFFFF',
  },
  border: {
    primary: '#E5E7EB',
    secondary: '#D1D5DB',
    focus: '#FFD700',
  },
};

export default darkTheme;
