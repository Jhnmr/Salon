/**
 * SALON PWA - LocalStorage Utility
 * Provides a type-safe wrapper around localStorage for token and user management
 */

const STORAGE_KEYS = {
  ACCESS_TOKEN: 'salon_access_token',
  REFRESH_TOKEN: 'salon_refresh_token',
  USER: 'salon_user',
  THEME: 'salon_theme',
  CART: 'salon_cart',
};

/**
 * Save access token to localStorage
 * @param {string} token - JWT access token
 */
export const saveAccessToken = (token) => {
  try {
    localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, token);
  } catch (error) {
    console.error('Failed to save access token:', error);
  }
};

/**
 * Get access token from localStorage
 * @returns {string|null} JWT access token or null
 */
export const getAccessToken = () => {
  try {
    return localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
  } catch (error) {
    console.error('Failed to get access token:', error);
    return null;
  }
};

/**
 * Remove access token from localStorage
 */
export const removeAccessToken = () => {
  try {
    localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
  } catch (error) {
    console.error('Failed to remove access token:', error);
  }
};

/**
 * Save refresh token to localStorage
 * @param {string} token - JWT refresh token
 */
export const saveRefreshToken = (token) => {
  try {
    localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, token);
  } catch (error) {
    console.error('Failed to save refresh token:', error);
  }
};

/**
 * Get refresh token from localStorage
 * @returns {string|null} JWT refresh token or null
 */
export const getRefreshToken = () => {
  try {
    return localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
  } catch (error) {
    console.error('Failed to get refresh token:', error);
    return null;
  }
};

/**
 * Remove refresh token from localStorage
 */
export const removeRefreshToken = () => {
  try {
    localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
  } catch (error) {
    console.error('Failed to remove refresh token:', error);
  }
};

/**
 * Save user data to localStorage
 * @param {Object} user - User object
 */
export const saveUser = (user) => {
  try {
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
  } catch (error) {
    console.error('Failed to save user:', error);
  }
};

/**
 * Get user data from localStorage
 * @returns {Object|null} User object or null
 */
export const getUser = () => {
  try {
    const user = localStorage.getItem(STORAGE_KEYS.USER);
    return user ? JSON.parse(user) : null;
  } catch (error) {
    console.error('Failed to get user:', error);
    return null;
  }
};

/**
 * Remove user data from localStorage
 */
export const removeUser = () => {
  try {
    localStorage.removeItem(STORAGE_KEYS.USER);
  } catch (error) {
    console.error('Failed to remove user:', error);
  }
};

/**
 * Save cart data to localStorage
 * @param {Object} cart - Cart object
 */
export const saveCart = (cart) => {
  try {
    localStorage.setItem(STORAGE_KEYS.CART, JSON.stringify(cart));
  } catch (error) {
    console.error('Failed to save cart:', error);
  }
};

/**
 * Get cart data from localStorage
 * @returns {Object|null} Cart object or null
 */
export const getCart = () => {
  try {
    const cart = localStorage.getItem(STORAGE_KEYS.CART);
    return cart ? JSON.parse(cart) : null;
  } catch (error) {
    console.error('Failed to get cart:', error);
    return null;
  }
};

/**
 * Remove cart data from localStorage
 */
export const removeCart = () => {
  try {
    localStorage.removeItem(STORAGE_KEYS.CART);
  } catch (error) {
    console.error('Failed to remove cart:', error);
  }
};

/**
 * Clear all authentication data
 */
export const clearAuthData = () => {
  removeAccessToken();
  removeRefreshToken();
  removeUser();
};

/**
 * Clear all storage data
 */
export const clearAllStorage = () => {
  try {
    Object.values(STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
  } catch (error) {
    console.error('Failed to clear storage:', error);
  }
};

export default {
  saveAccessToken,
  getAccessToken,
  removeAccessToken,
  saveRefreshToken,
  getRefreshToken,
  removeRefreshToken,
  saveUser,
  getUser,
  removeUser,
  saveCart,
  getCart,
  removeCart,
  clearAuthData,
  clearAllStorage,
};
