/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class', // Enable dark mode with class strategy
  theme: {
    extend: {
      colors: {
        // Salon Theme Colors - Dark Mode Primary
        salon: {
          yellow: '#f4d03f',      // Bright yellow accent
          'yellow-light': '#f9e076',
          'yellow-dark': '#d4af37',
          black: '#0d0d0d',       // Deep black background
          'black-light': '#1a1a1a', // Soft black
          'gray-dark': '#2d2d2d',   // Charcoal gray
          'gray-medium': '#3d3d3d',
          'gray-light': '#4d4d4d',
          'gray-text': '#b0b0b0',
        },
        // Functional colors
        success: {
          DEFAULT: '#28a745',
          light: '#34d058',
        },
        danger: {
          DEFAULT: '#dc3545',
          light: '#f85149',
        },
        warning: {
          DEFAULT: '#ffc107',
          light: '#ffca2c',
        },
      },
      borderRadius: {
        'xl': '1rem',       // 16px
        '2xl': '1.5rem',    // 24px
        '3xl': '2rem',      // 32px
      },
      boxShadow: {
        'soft': '0 2px 8px rgba(0, 0, 0, 0.15)',
        'float': '0 4px 16px rgba(244, 208, 63, 0.2)',
        'glow': '0 0 20px rgba(244, 208, 63, 0.4)',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in',
        'slide-up': 'slideUp 0.3s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}

