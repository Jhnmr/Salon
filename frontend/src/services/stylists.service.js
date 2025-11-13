/**
 * SALON PWA - Stylists Service
 * API calls for managing stylists and their profiles
 */

import { get, post, put, del } from './api';

/**
 * Get all stylists with optional filters
 * @param {Object} filters - Filter parameters
 * @param {string} filters.branch_id - Filter by branch ID
 * @param {string} filters.service_id - Filter by service they offer
 * @param {string} filters.specialty - Filter by specialty
 * @param {number} filters.min_rating - Minimum rating filter
 * @param {boolean} filters.available - Show only available stylists
 * @param {string} filters.sort - Sort field (rating, experience, name)
 * @param {string} filters.order - Sort order (asc, desc)
 * @param {number} filters.page - Page number
 * @param {number} filters.per_page - Items per page
 * @returns {Promise<Object>} Stylists list with pagination
 */
export const getStylists = async (filters = {}) => {
  const response = await get('/stylists', { params: filters });
  return response.data;
};

/**
 * Get single stylist by ID
 * @param {string|number} id - Stylist ID
 * @returns {Promise<Object>} Stylist data with full profile
 */
export const getStylist = async (id) => {
  const response = await get(`/stylists/${id}`);
  return response.data;
};

/**
 * Get stylist reviews
 * @param {string|number} id - Stylist ID
 * @param {number} page - Page number
 * @param {number} perPage - Items per page
 * @returns {Promise<Object>} Reviews with pagination
 */
export const getStylistReviews = async (id, page = 1, perPage = 10) => {
  const response = await get(`/stylists/${id}/reviews`, {
    params: { page, per_page: perPage },
  });
  return response.data;
};

/**
 * Get stylist portfolio posts
 * @param {string|number} id - Stylist ID
 * @param {number} page - Page number
 * @param {number} perPage - Items per page
 * @returns {Promise<Object>} Portfolio posts with pagination
 */
export const getStylistPosts = async (id, page = 1, perPage = 12) => {
  const response = await get(`/stylists/${id}/posts`, {
    params: { page, per_page: perPage },
  });
  return response.data;
};

/**
 * Get stylist availability for a specific date
 * @param {string|number} id - Stylist ID
 * @param {string} date - Date to check (YYYY-MM-DD format)
 * @param {string|number} serviceId - Optional service ID to check availability for
 * @returns {Promise<Object>} Available time slots
 */
export const getStylistAvailability = async (id, date, serviceId = null) => {
  const params = { date };
  if (serviceId) params.service_id = serviceId;

  const response = await get(`/stylists/${id}/availability`, { params });
  return response.data;
};

/**
 * Get stylist schedule for a date range
 * @param {string|number} id - Stylist ID
 * @param {string} startDate - Start date (YYYY-MM-DD)
 * @param {string} endDate - End date (YYYY-MM-DD)
 * @returns {Promise<Object>} Stylist schedule
 */
export const getStylistSchedule = async (id, startDate, endDate) => {
  const response = await get(`/stylists/${id}/schedule`, {
    params: { start_date: startDate, end_date: endDate },
  });
  return response.data;
};

/**
 * Get stylist statistics (for stylist dashboard)
 * @param {string|number} id - Stylist ID
 * @returns {Promise<Object>} Stylist statistics
 */
export const getStylistStats = async (id) => {
  const response = await get(`/stylists/${id}/stats`);
  return response.data;
};

/**
 * Search stylists by name or specialty
 * @param {string} query - Search query
 * @param {Object} filters - Additional filters
 * @returns {Promise<Object>} Search results
 */
export const searchStylists = async (query, filters = {}) => {
  const response = await get('/stylists/search', {
    params: { q: query, ...filters },
  });
  return response.data;
};

/**
 * Get featured/top-rated stylists
 * @param {number} limit - Number of stylists to fetch
 * @returns {Promise<Array>} Featured stylists
 */
export const getFeaturedStylists = async (limit = 6) => {
  const response = await get('/stylists/featured', {
    params: { limit },
  });
  return response.data;
};

/**
 * Update stylist profile (stylist/admin only)
 * @param {string|number} id - Stylist ID
 * @param {Object} data - Updated profile data
 * @returns {Promise<Object>} Updated stylist profile
 */
export const updateStylistProfile = async (id, data) => {
  const response = await put(`/stylists/${id}`, data);
  return response.data;
};

/**
 * Update stylist working hours
 * @param {string|number} id - Stylist ID
 * @param {Object} workingHours - Working hours data
 * @returns {Promise<Object>} Updated working hours
 */
export const updateWorkingHours = async (id, workingHours) => {
  const response = await put(`/stylists/${id}/working-hours`, workingHours);
  return response.data;
};

/**
 * Add stylist service
 * @param {string|number} id - Stylist ID
 * @param {string|number} serviceId - Service ID
 * @returns {Promise<Object>} Updated services list
 */
export const addStylistService = async (id, serviceId) => {
  const response = await post(`/stylists/${id}/services`, { service_id: serviceId });
  return response.data;
};

/**
 * Remove stylist service
 * @param {string|number} id - Stylist ID
 * @param {string|number} serviceId - Service ID
 * @returns {Promise<void>}
 */
export const removeStylistService = async (id, serviceId) => {
  await del(`/stylists/${id}/services/${serviceId}`);
};

/**
 * Upload stylist profile photo
 * @param {string|number} id - Stylist ID
 * @param {File} photo - Photo file
 * @returns {Promise<Object>} Updated stylist with new photo URL
 */
export const uploadStylistPhoto = async (id, photo) => {
  const formData = new FormData();
  formData.append('photo', photo);

  const response = await post(`/stylists/${id}/photo`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

export default {
  getStylists,
  getStylist,
  getStylistReviews,
  getStylistPosts,
  getStylistAvailability,
  getStylistSchedule,
  getStylistStats,
  searchStylists,
  getFeaturedStylists,
  updateStylistProfile,
  updateWorkingHours,
  addStylistService,
  removeStylistService,
  uploadStylistPhoto,
};
