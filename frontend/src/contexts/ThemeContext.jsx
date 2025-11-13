import React, { createContext, useContext, useState, useEffect } from 'react';
import PropTypes from 'prop-types';

/**
 * Theme Context - Design System
 * Manages dark/light theme with localStorage persistence
 */
const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => {
    // Initialize from localStorage or default to 'dark'
    const savedTheme = localStorage.getItem('salon-theme');
    return savedTheme || 'dark';
  });

  useEffect(() => {
    // Update document class and localStorage when theme changes
    const root = document.documentElement;

    if (theme === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light');
    } else {
      root.classList.add('light');
      root.classList.remove('dark');
    }

    // Update CSS variables
    updateCSSVariables(theme);

    // Persist to localStorage
    localStorage.setItem('salon-theme', theme);
  }, [theme]);

  const updateCSSVariables = (currentTheme) => {
    const root = document.documentElement;

    if (currentTheme === 'dark') {
      // Dark theme colors
      root.style.setProperty('--color-bg-primary', '#0A0A0B');
      root.style.setProperty('--color-bg-secondary', '#1A1A1C');
      root.style.setProperty('--color-bg-tertiary', '#2D2D30');
      root.style.setProperty('--color-text-primary', '#FFFFFF');
      root.style.setProperty('--color-text-secondary', '#9CA3AF');
      root.style.setProperty('--color-text-tertiary', '#6B7280');
      root.style.setProperty('--color-border-primary', '#2D2D30');
      root.style.setProperty('--color-border-secondary', '#3A3A3D');
    } else {
      // Light theme colors
      root.style.setProperty('--color-bg-primary', '#FFFFFF');
      root.style.setProperty('--color-bg-secondary', '#F9FAFB');
      root.style.setProperty('--color-bg-tertiary', '#E5E7EB');
      root.style.setProperty('--color-text-primary', '#111827');
      root.style.setProperty('--color-text-secondary', '#4B5563');
      root.style.setProperty('--color-text-tertiary', '#9CA3AF');
      root.style.setProperty('--color-border-primary', '#E5E7EB');
      root.style.setProperty('--color-border-secondary', '#D1D5DB');
    }
  };

  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === 'dark' ? 'light' : 'dark'));
  };

  const setDarkTheme = () => setTheme('dark');
  const setLightTheme = () => setTheme('light');

  const value = {
    theme,
    toggleTheme,
    setDarkTheme,
    setLightTheme,
    isDark: theme === 'dark',
    isLight: theme === 'light',
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

ThemeProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export default ThemeContext;
