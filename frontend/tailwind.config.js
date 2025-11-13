/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class', // Enable dark mode via class strategy
  theme: {
    extend: {
      // Custom Colors
      colors: {
        // Primary - Purple shades
        primary: {
          50: '#FAF5FF',
          100: '#F3E8FF',
          200: '#E9D5FF',
          300: '#D8B4FE',
          400: '#C084FC',
          500: '#8B5CF6', // Primary purple
          600: '#7C3AED',
          700: '#6D28D9',
          800: '#5B21B6',
          900: '#4C1D95',
        },
        // Accent - Golden yellow
        accent: {
          50: '#FEFCE8',
          100: '#FEF9C3',
          200: '#FEF08A',
          300: '#FDE047',
          400: '#FFD700', // Primary gold
          500: '#EAB308',
          600: '#CA8A04',
          700: '#A16207',
          800: '#854D0E',
          900: '#713F12',
        },
        // Gray scale (optimized for dark theme)
        gray: {
          50: '#F9FAFB',
          100: '#F3F4F6',
          200: '#E5E7EB',
          300: '#D1D5DB',
          400: '#9CA3AF',
          500: '#6B7280',
          600: '#4B5563',
          700: '#374151',
          750: '#2D2D30', // Custom shade
          800: '#1A1A1C',
          850: '#121214', // Custom shade
          900: '#0A0A0B',
        },
      },
      // Extended Spacing
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
        '144': '36rem',
      },
      // Custom Animations
      animation: {
        'fadeIn': 'fadeIn 0.3s ease-in-out',
        'fadeOut': 'fadeOut 0.3s ease-in-out',
        'slideIn': 'slideIn 0.3s ease-out',
        'slideOut': 'slideOut 0.3s ease-out',
        'slideInUp': 'slideInUp 0.3s ease-out',
        'slideInDown': 'slideInDown 0.3s ease-out',
        'slideInLeft': 'slideInLeft 0.3s ease-out',
        'slideInRight': 'slideInRight 0.3s ease-out',
        'scaleIn': 'scaleIn 0.2s ease-out',
        'scaleOut': 'scaleOut 0.2s ease-out',
        'bounce-slow': 'bounce 2s infinite',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      // Keyframes
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeOut: {
          '0%': { opacity: '1' },
          '100%': { opacity: '0' },
        },
        slideIn: {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideOut: {
          '0%': { transform: 'translateY(0)', opacity: '1' },
          '100%': { transform: 'translateY(-10px)', opacity: '0' },
        },
        slideInUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideInDown: {
          '0%': { transform: 'translateY(-20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideInLeft: {
          '0%': { transform: 'translateX(-20px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        slideInRight: {
          '0%': { transform: 'translateX(20px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        scaleOut: {
          '0%': { transform: 'scale(1)', opacity: '1' },
          '100%': { transform: 'scale(0.95)', opacity: '0' },
        },
      },
      // Custom Box Shadows
      boxShadow: {
        'glow-sm': '0 0 10px rgba(255, 215, 0, 0.3)',
        'glow-md': '0 0 20px rgba(255, 215, 0, 0.4)',
        'glow-lg': '0 0 30px rgba(255, 215, 0, 0.5)',
        'inner-lg': 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.5)',
      },
      // Border Radius
      borderRadius: {
        '4xl': '2rem',
      },
      // Z-index Scale
      zIndex: {
        '60': '60',
        '70': '70',
        '80': '80',
        '90': '90',
        '100': '100',
      },
      // Typography
      fontSize: {
        '2xs': '0.625rem',
      },
      // Transition Duration
      transitionDuration: {
        '400': '400ms',
      },
      // Backdrop Blur
      backdropBlur: {
        xs: '2px',
      },
      // Custom Screens (for better responsive design)
      screens: {
        'xs': '360px',
        '3xl': '1920px',
      },
    },
  },
  plugins: [
    // Custom scrollbar plugin
    function({ addUtilities }) {
      const newUtilities = {
        '.scrollbar-thin': {
          'scrollbar-width': 'thin',
          'scrollbar-color': '#374151 #1A1A1C',
        },
        '.scrollbar-thin::-webkit-scrollbar': {
          width: '8px',
          height: '8px',
        },
        '.scrollbar-thin::-webkit-scrollbar-track': {
          background: '#1A1A1C',
        },
        '.scrollbar-thin::-webkit-scrollbar-thumb': {
          background: '#374151',
          'border-radius': '4px',
        },
        '.scrollbar-thin::-webkit-scrollbar-thumb:hover': {
          background: '#4B5563',
        },
      };
      addUtilities(newUtilities);
    },
  ],
}
