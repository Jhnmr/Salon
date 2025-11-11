/**
 * Theme Context
 * Manages application theme (dark/light mode) and provides theme values
 */

import { createContext, useState, useEffect, useMemo } from 'react';
import { darkTheme, lightTheme } from '../styles/theme';

export const ThemeContext = createContext(null);

export const ThemeProvider = ({ children }) => {
  // Initialize theme from localStorage or default to dark
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    return savedTheme ? savedTheme === 'dark' : true; // Default to dark
  });

  // Get the current theme object
  const theme = useMemo(() => {
    return isDarkMode ? darkTheme : lightTheme;
  }, [isDarkMode]);

  // Update localStorage and document class when theme changes
  useEffect(() => {
    localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');

    // Update document class for global styles
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    } else {
      document.documentElement.classList.add('light');
      document.documentElement.classList.remove('dark');
    }

    // Update meta theme-color for mobile browsers
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      metaThemeColor.setAttribute('content', theme.bg.primary);
    }
  }, [isDarkMode, theme.bg.primary]);

  /**
   * Toggle between dark and light mode
   */
  const toggleTheme = () => {
    setIsDarkMode(prev => !prev);
  };

  /**
   * Set theme explicitly
   * @param {boolean} dark - true for dark mode, false for light mode
   */
  const setTheme = (dark) => {
    setIsDarkMode(dark);
  };

  const value = {
    theme,
    isDarkMode,
    toggleTheme,
    setTheme,
  };

  return (
    <ThemeContext.Provider value={value}>
      <div
        style={{
          backgroundColor: theme.bg.primary,
          color: theme.text.primary,
          minHeight: '100vh',
        }}
      >
        {children}
      </div>
    </ThemeContext.Provider>
  );
};

export default ThemeContext;
