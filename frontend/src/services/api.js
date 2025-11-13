/**
 * SALON PWA - Axios API Client
 * Configured Axios instance with JWT interceptors and automatic token refresh
 */

import axios from 'axios';
import {
  getAccessToken,
  getRefreshToken,
  saveAccessToken,
  clearAuthData,
} from '../utils/storage';

// Get API base URL from environment variables
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

/**
 * Create Axios instance with default configuration
 */
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // 30 seconds
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

/**
 * Flag to prevent multiple simultaneous token refresh requests
 */
let isRefreshing = false;

/**
 * Queue to hold failed requests while token is being refreshed
 */
let failedRequestsQueue = [];

/**
 * Process queued requests after token refresh
 * @param {Error|null} error - Error if refresh failed
 * @param {string|null} token - New access token if refresh succeeded
 */
const processQueue = (error, token = null) => {
  failedRequestsQueue.forEach(promise => {
    if (error) {
      promise.reject(error);
    } else {
      promise.resolve(token);
    }
  });

  failedRequestsQueue = [];
};

/**
 * Request Interceptor
 * Adds Authorization header with JWT token to all requests
 */
api.interceptors.request.use(
  (config) => {
    const token = getAccessToken();

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Log request in development
    if (import.meta.env.DEV) {
      console.log(`[API Request] ${config.method.toUpperCase()} ${config.url}`, {
        params: config.params,
        data: config.data,
      });
    }

    return config;
  },
  (error) => {
    console.error('[API Request Error]', error);
    return Promise.reject(error);
  }
);

/**
 * Response Interceptor
 * Handles errors, token refresh, and logging
 */
api.interceptors.response.use(
  (response) => {
    // Log response in development
    if (import.meta.env.DEV) {
      console.log(`[API Response] ${response.config.method.toUpperCase()} ${response.config.url}`, {
        status: response.status,
        data: response.data,
      });
    }

    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Log error in development
    if (import.meta.env.DEV) {
      console.error('[API Response Error]', {
        url: error.config?.url,
        status: error.response?.status,
        message: error.message,
        data: error.response?.data,
      });
    }

    // Handle network errors
    if (!error.response) {
      console.error('[Network Error] Unable to reach the server');
      return Promise.reject({
        message: 'Unable to connect to the server. Please check your internet connection.',
        isNetworkError: true,
      });
    }

    const { status } = error.response;

    // Handle 401 Unauthorized - Token expired or invalid
    if (status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // If already refreshing, queue this request
        return new Promise((resolve, reject) => {
          failedRequestsQueue.push({ resolve, reject });
        })
          .then(token => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch(err => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = getRefreshToken();

      if (!refreshToken) {
        // No refresh token available, logout user
        clearAuthData();
        window.location.href = '/login';
        return Promise.reject(error);
      }

      try {
        // Attempt to refresh the access token
        const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
          refresh_token: refreshToken,
        });

        const { access_token } = response.data;

        // Save new access token
        saveAccessToken(access_token);

        // Update the Authorization header
        api.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;
        originalRequest.headers.Authorization = `Bearer ${access_token}`;

        // Process queued requests
        processQueue(null, access_token);
        isRefreshing = false;

        // Retry original request
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh token failed, logout user
        processQueue(refreshError, null);
        isRefreshing = false;
        clearAuthData();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    // Handle 403 Forbidden - User doesn't have permission
    if (status === 403) {
      console.error('[Authorization Error] You do not have permission to access this resource');
      return Promise.reject({
        message: 'You do not have permission to access this resource.',
        status: 403,
      });
    }

    // Handle 404 Not Found
    if (status === 404) {
      return Promise.reject({
        message: 'The requested resource was not found.',
        status: 404,
      });
    }

    // Handle 422 Validation Error
    if (status === 422) {
      const validationErrors = error.response.data.errors || {};
      return Promise.reject({
        message: 'Validation failed. Please check your input.',
        validationErrors,
        status: 422,
      });
    }

    // Handle 429 Too Many Requests - Rate limiting
    if (status === 429) {
      const retryAfter = error.response.headers['retry-after'];
      console.error(`[Rate Limit] Too many requests. Retry after ${retryAfter} seconds`);
      return Promise.reject({
        message: 'Too many requests. Please try again later.',
        retryAfter,
        status: 429,
      });
    }

    // Handle 500 Internal Server Error
    if (status >= 500) {
      return Promise.reject({
        message: 'A server error occurred. Please try again later.',
        status,
      });
    }

    // Default error handling
    return Promise.reject({
      message: error.response.data?.message || 'An unexpected error occurred.',
      status,
      data: error.response.data,
    });
  }
);

/**
 * Helper function to handle API errors consistently
 * @param {Error} error - Error object from API
 * @returns {Object} Formatted error object
 */
export const handleApiError = (error) => {
  if (error.isNetworkError) {
    return {
      message: error.message,
      type: 'network',
    };
  }

  if (error.validationErrors) {
    return {
      message: error.message,
      type: 'validation',
      errors: error.validationErrors,
    };
  }

  return {
    message: error.message || 'An unexpected error occurred',
    type: 'general',
    status: error.status,
  };
};

/**
 * Helper function for GET requests
 * @param {string} url - API endpoint
 * @param {Object} config - Axios config
 * @returns {Promise} Axios promise
 */
export const get = (url, config = {}) => api.get(url, config);

/**
 * Helper function for POST requests
 * @param {string} url - API endpoint
 * @param {Object} data - Request data
 * @param {Object} config - Axios config
 * @returns {Promise} Axios promise
 */
export const post = (url, data, config = {}) => api.post(url, data, config);

/**
 * Helper function for PUT requests
 * @param {string} url - API endpoint
 * @param {Object} data - Request data
 * @param {Object} config - Axios config
 * @returns {Promise} Axios promise
 */
export const put = (url, data, config = {}) => api.put(url, data, config);

/**
 * Helper function for PATCH requests
 * @param {string} url - API endpoint
 * @param {Object} data - Request data
 * @param {Object} config - Axios config
 * @returns {Promise} Axios promise
 */
export const patch = (url, data, config = {}) => api.patch(url, data, config);

/**
 * Helper function for DELETE requests
 * @param {string} url - API endpoint
 * @param {Object} config - Axios config
 * @returns {Promise} Axios promise
 */
export const del = (url, config = {}) => api.delete(url, config);

/**
 * Helper function for uploading files
 * @param {string} url - API endpoint
 * @param {FormData} formData - Form data with files
 * @param {Function} onUploadProgress - Progress callback
 * @returns {Promise} Axios promise
 */
export const upload = (url, formData, onUploadProgress) => {
  return api.post(url, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    onUploadProgress,
  });
};

export default api;
