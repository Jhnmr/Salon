/**
 * SALON PWA - Branches Service
 * Handles API calls for salon branches
 */

import api from './api';

/**
 * Get all branches with filters
 * @param {Object} filters - Search filters (status, country, search, lat, lng, rating)
 * @returns {Promise} Branch list
 */
export const getBranches = async (filters = {}) => {
  try {
    const params = new URLSearchParams();

    if (filters.search) params.append('search', filters.search);
    if (filters.status) params.append('status', filters.status);
    if (filters.country) params.append('country', filters.country);
    if (filters.verified !== undefined) params.append('verified', filters.verified);
    if (filters.lat) params.append('lat', filters.lat);
    if (filters.lng) params.append('lng', filters.lng);
    if (filters.radius) params.append('radius', filters.radius);
    if (filters.min_rating) params.append('min_rating', filters.min_rating);

    const response = await api.get(`/branches?${params.toString()}`);
    return response.data;
  } catch (error) {
    console.error('Failed to get branches:', error);
    throw error;
  }
};

/**
 * Get a specific branch by ID
 * @param {number} id - Branch ID
 * @returns {Promise} Branch details
 */
export const getBranch = async (id) => {
  try {
    const response = await api.get(`/branches/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Failed to get branch ${id}:`, error);
    throw error;
  }
};

/**
 * Get services offered by a branch
 * @param {number} branchId - Branch ID
 * @returns {Promise} Services list
 */
export const getBranchServices = async (branchId) => {
  try {
    const response = await api.get(`/branches/${branchId}/services`);
    return response.data;
  } catch (error) {
    console.error(`Failed to get branch ${branchId} services:`, error);
    throw error;
  }
};

/**
 * Get stylists working at a branch
 * @param {number} branchId - Branch ID
 * @returns {Promise} Stylists list
 */
export const getBranchStylists = async (branchId) => {
  try {
    const response = await api.get(`/branches/${branchId}/stylists`);
    return response.data;
  } catch (error) {
    console.error(`Failed to get branch ${branchId} stylists:`, error);
    throw error;
  }
};

/**
 * Get reviews for a branch
 * @param {number} branchId - Branch ID
 * @param {Object} filters - Pagination and filters
 * @returns {Promise} Reviews list
 */
export const getBranchReviews = async (branchId, filters = {}) => {
  try {
    const params = new URLSearchParams();
    if (filters.page) params.append('page', filters.page);
    if (filters.per_page) params.append('per_page', filters.per_page);
    if (filters.min_rating) params.append('min_rating', filters.min_rating);

    const response = await api.get(`/branches/${branchId}/reviews?${params.toString()}`);
    return response.data;
  } catch (error) {
    console.error(`Failed to get branch ${branchId} reviews:`, error);
    throw error;
  }
};

/**
 * Get portfolio posts for a branch
 * @param {number} branchId - Branch ID
 * @returns {Promise} Posts list
 */
export const getBranchPosts = async (branchId) => {
  try {
    const response = await api.get(`/branches/${branchId}/posts`);
    return response.data;
  } catch (error) {
    console.error(`Failed to get branch ${branchId} posts:`, error);
    throw error;
  }
};

/**
 * Get branch availability for a specific date
 * @param {number} branchId - Branch ID
 * @param {string} date - Date in YYYY-MM-DD format
 * @returns {Promise} Available time slots
 */
export const getBranchAvailability = async (branchId, date) => {
  try {
    const response = await api.get(`/branches/${branchId}/availability`, {
      params: { date },
    });
    return response.data;
  } catch (error) {
    console.error(`Failed to get branch ${branchId} availability:`, error);
    throw error;
  }
};

/**
 * Create a new branch (admin only)
 * @param {Object} branchData - Branch data
 * @returns {Promise} Created branch
 */
export const createBranch = async (branchData) => {
  try {
    const response = await api.post('/branches', branchData);
    return response.data;
  } catch (error) {
    console.error('Failed to create branch:', error);
    throw error;
  }
};

/**
 * Update a branch (admin only)
 * @param {number} id - Branch ID
 * @param {Object} branchData - Updated branch data
 * @returns {Promise} Updated branch
 */
export const updateBranch = async (id, branchData) => {
  try {
    const response = await api.put(`/branches/${id}`, branchData);
    return response.data;
  } catch (error) {
    console.error(`Failed to update branch ${id}:`, error);
    throw error;
  }
};

/**
 * Delete a branch (admin only)
 * @param {number} id - Branch ID
 * @returns {Promise} Deletion confirmation
 */
export const deleteBranch = async (id) => {
  try {
    const response = await api.delete(`/branches/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Failed to delete branch ${id}:`, error);
    throw error;
  }
};

/**
 * Search branches near a location
 * @param {Object} location - {lat, lng, radius}
 * @returns {Promise} Nearby branches
 */
export const searchNearbyBranches = async ({ lat, lng, radius = 10 }) => {
  try {
    const response = await api.get('/branches/nearby', {
      params: { lat, lng, radius },
    });
    return response.data;
  } catch (error) {
    console.error('Failed to search nearby branches:', error);
    throw error;
  }
};
