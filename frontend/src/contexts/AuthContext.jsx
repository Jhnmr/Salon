/**
 * SALON PWA - Authentication Context
 * Manages user authentication state and operations
 */

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import * as authService from '../services/auth.service';
import { getAccessToken, getUser, clearAuthData } from '../utils/storage';

const AuthContext = createContext(null);

/**
 * Authentication Provider Component
 * Wraps the app and provides authentication state and functions
 */
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  /**
   * Initialize authentication state from localStorage
   */
  useEffect(() => {
    const initAuth = async () => {
      try {
        const token = getAccessToken();
        const storedUser = getUser();

        if (token && storedUser) {
          // Verify token is still valid by fetching current user
          try {
            const currentUser = await authService.getCurrentUser();
            setUser(currentUser);
            setIsAuthenticated(true);
          } catch (error) {
            // Token invalid or expired, clear auth data
            console.error('Token validation failed:', error);
            clearAuthData();
            setUser(null);
            setIsAuthenticated(false);
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        clearAuthData();
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  /**
   * Login user with email and password
   * @param {string} email - User email
   * @param {string} password - User password
   */
  const login = useCallback(async (email, password) => {
    try {
      setIsLoading(true);
      setError(null);

      const { user } = await authService.login(email, password);

      setUser(user);
      setIsAuthenticated(true);

      return { success: true, user };
    } catch (error) {
      setError(error.message || 'Login failed');
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Register new user
   * @param {Object} userData - User registration data
   */
  const register = useCallback(async (userData) => {
    try {
      setIsLoading(true);
      setError(null);

      const { user } = await authService.register(userData);

      setUser(user);
      setIsAuthenticated(true);

      return { success: true, user };
    } catch (error) {
      setError(error.message || 'Registration failed');
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Logout current user
   */
  const logout = useCallback(async () => {
    try {
      setIsLoading(true);
      await authService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      setIsAuthenticated(false);
      setIsLoading(false);
    }
  }, []);

  /**
   * Update user profile
   * @param {Object} userData - Updated user data
   */
  const updateProfile = useCallback(async (userData) => {
    try {
      setIsLoading(true);
      setError(null);

      const updatedUser = await authService.updateProfile(userData);

      setUser(updatedUser);

      return { success: true, user: updatedUser };
    } catch (error) {
      setError(error.message || 'Profile update failed');
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Change user password
   * @param {string} currentPassword - Current password
   * @param {string} newPassword - New password
   * @param {string} newPasswordConfirmation - New password confirmation
   */
  const changePassword = useCallback(async (currentPassword, newPassword, newPasswordConfirmation) => {
    try {
      setIsLoading(true);
      setError(null);

      await authService.changePassword(currentPassword, newPassword, newPasswordConfirmation);

      return { success: true };
    } catch (error) {
      setError(error.message || 'Password change failed');
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Send forgot password email
   * @param {string} email - User email
   */
  const forgotPassword = useCallback(async (email) => {
    try {
      setIsLoading(true);
      setError(null);

      await authService.forgotPassword(email);

      return { success: true };
    } catch (error) {
      setError(error.message || 'Failed to send reset email');
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Reset password with token
   * @param {string} token - Reset token
   * @param {string} password - New password
   * @param {string} passwordConfirmation - Password confirmation
   */
  const resetPassword = useCallback(async (token, password, passwordConfirmation) => {
    try {
      setIsLoading(true);
      setError(null);

      await authService.resetPassword(token, password, passwordConfirmation);

      return { success: true };
    } catch (error) {
      setError(error.message || 'Password reset failed');
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Refresh current user data
   */
  const refreshUser = useCallback(async () => {
    try {
      const currentUser = await authService.getCurrentUser();
      setUser(currentUser);
      return currentUser;
    } catch (error) {
      console.error('Failed to refresh user:', error);
      throw error;
    }
  }, []);

  /**
   * Check if user has specific role
   * @param {string|Array<string>} roles - Role(s) to check
   * @returns {boolean}
   */
  const hasRole = useCallback((roles) => {
    if (!user) return false;

    const roleArray = Array.isArray(roles) ? roles : [roles];
    return roleArray.includes(user.role);
  }, [user]);

  /**
   * Check if user has specific permission
   * @param {string} permission - Permission to check
   * @returns {boolean}
   */
  const hasPermission = useCallback((permission) => {
    if (!user || !user.permissions) return false;
    return user.permissions.includes(permission);
  }, [user]);

  const value = {
    // State
    user,
    isAuthenticated,
    isLoading,
    error,

    // Actions
    login,
    register,
    logout,
    updateProfile,
    changePassword,
    forgotPassword,
    resetPassword,
    refreshUser,

    // Helpers
    hasRole,
    hasPermission,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

/**
 * Hook to use Authentication Context
 * @returns {Object} Authentication context value
 */
export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
};

export default AuthContext;
