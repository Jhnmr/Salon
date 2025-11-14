/**
 * SALON PWA - Authentication Service
 * API calls for user authentication and authorization
 */

import { get, post } from './api';
import { saveAccessToken, saveRefreshToken, saveUser, clearAuthData } from '../utils/storage';

/**
 * Login user with email and password
 * @param {string} email - User email
 * @param {string} password - User password
 * @returns {Promise<Object>} User data and tokens
 */
export const login = async (email, password) => {
  try {
    const response = await post('/auth/login', { email, password });
    const { user, access_token, refresh_token } = response.data;

    // Save tokens and user data to localStorage
    saveAccessToken(access_token);
    saveRefreshToken(refresh_token);
    saveUser(user);

    return { user, access_token, refresh_token };
  } catch (error) {
    throw error;
  }
};

/**
 * Register new user
 * @param {Object} userData - User registration data
 * @param {string} userData.name - User's full name
 * @param {string} userData.email - User's email
 * @param {string} userData.password - User's password
 * @param {string} userData.password_confirmation - Password confirmation
 * @param {string} userData.phone - User's phone number
 * @param {string} userData.role - User role (client, stylist, admin)
 * @returns {Promise<Object>} User data and tokens
 */
export const register = async (userData) => {
  try {
    const response = await post('/auth/register', userData);
    const { user, access_token, refresh_token } = response.data;

    // Save tokens and user data to localStorage
    saveAccessToken(access_token);
    saveRefreshToken(refresh_token);
    saveUser(user);

    return { user, access_token, refresh_token };
  } catch (error) {
    throw error;
  }
};

/**
 * Logout current user
 * @returns {Promise<void>}
 */
export const logout = async () => {
  try {
    await post('/auth/logout');
  } catch (error) {
    console.error('Logout API call failed:', error);
    // Continue with logout even if API call fails
  } finally {
    // Clear all authentication data
    clearAuthData();
  }
};

/**
 * Refresh access token using refresh token
 * @param {string} refreshToken - Refresh token
 * @returns {Promise<Object>} New access token
 */
export const refreshToken = async (refreshToken) => {
  try {
    const response = await post('/auth/refresh', { refresh_token: refreshToken });
    const { access_token } = response.data;

    // Save new access token
    saveAccessToken(access_token);

    return { access_token };
  } catch (error) {
    // If refresh fails, clear auth data
    clearAuthData();
    throw error;
  }
};

/**
 * Send forgot password email
 * @param {string} email - User's email
 * @returns {Promise<Object>} Success message
 */
export const forgotPassword = async (email) => {
  try {
    const response = await post('/auth/forgot-password', { email });
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Reset password with token
 * @param {string} token - Password reset token
 * @param {string} password - New password
 * @param {string} passwordConfirmation - Password confirmation
 * @returns {Promise<Object>} Success message
 */
export const resetPassword = async (token, password, passwordConfirmation) => {
  try {
    const response = await post('/auth/reset-password', {
      token,
      password,
      password_confirmation: passwordConfirmation,
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Get current authenticated user
 * @returns {Promise<Object>} User data
 */
export const getCurrentUser = async () => {
  try {
    const response = await get('/auth/user'); // Fixed: changed from /auth/me to /auth/user
    const { user } = response.data;

    // Update user data in localStorage
    saveUser(user);

    return user;
  } catch (error) {
    throw error;
  }
};

/**
 * Update current user profile
 * @param {Object} userData - Updated user data
 * @returns {Promise<Object>} Updated user data
 */
export const updateProfile = async (userData) => {
  try {
    const response = await post('/auth/profile', userData);
    const { user } = response.data;

    // Update user data in localStorage
    saveUser(user);

    return user;
  } catch (error) {
    throw error;
  }
};

/**
 * Change user password
 * @param {string} currentPassword - Current password
 * @param {string} newPassword - New password
 * @param {string} newPasswordConfirmation - New password confirmation
 * @returns {Promise<Object>} Success message
 */
export const changePassword = async (currentPassword, newPassword, newPasswordConfirmation) => {
  try {
    const response = await post('/auth/change-password', {
      current_password: currentPassword,
      new_password: newPassword,
      new_password_confirmation: newPasswordConfirmation,
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Verify email with token
 * @param {string} token - Email verification token
 * @returns {Promise<Object>} Success message
 */
export const verifyEmail = async (token) => {
  try {
    const response = await post('/auth/verify-email', { token });
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Resend email verification
 * @returns {Promise<Object>} Success message
 */
export const resendVerificationEmail = async () => {
  try {
    const response = await post('/auth/resend-verification');
    return response.data;
  } catch (error) {
    throw error;
  }
};

export default {
  login,
  register,
  logout,
  refreshToken,
  forgotPassword,
  resetPassword,
  getCurrentUser,
  updateProfile,
  changePassword,
  verifyEmail,
  resendVerificationEmail,
};
