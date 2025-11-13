/**
 * SALON PWA - Services Service
 * API calls for managing salon services and categories
 */

import { get, post, put, del } from './api';

/**
 * Get all services with optional filters
 * @param {Object} filters - Filter parameters
 * @param {string} filters.category_id - Filter by category ID
 * @param {string} filters.branch_id - Filter by branch ID
 * @param {number} filters.min_price - Minimum price filter
 * @param {number} filters.max_price - Maximum price filter
 * @param {number} filters.min_duration - Minimum duration filter (minutes)
 * @param {number} filters.max_duration - Maximum duration filter (minutes)
 * @param {string} filters.sort - Sort field (price, duration, name)
 * @param {string} filters.order - Sort order (asc, desc)
 * @param {number} filters.page - Page number
 * @param {number} filters.per_page - Items per page
 * @returns {Promise<Object>} Services list with pagination
 */
export const getServices = async (filters = {}) => {
  try {
    const response = await get('/services', { params: filters });
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Get single service by ID
 * @param {string|number} id - Service ID
 * @returns {Promise<Object>} Service data
 */
export const getService = async (id) => {
  try {
    const response = await get(`/services/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Search services by name or description
 * @param {string} query - Search query
 * @param {Object} filters - Additional filters
 * @returns {Promise<Object>} Search results
 */
export const searchServices = async (query, filters = {}) => {
  try {
    const response = await get('/services/search', {
      params: { q: query, ...filters },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Get all service categories
 * @returns {Promise<Array>} Service categories list
 */
export const getServiceCategories = async () => {
  try {
    const response = await get('/services/categories');
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Get services by category
 * @param {string|number} categoryId - Category ID
 * @param {Object} filters - Additional filters
 * @returns {Promise<Object>} Services in category
 */
export const getServicesByCategory = async (categoryId, filters = {}) => {
  try {
    const response = await get(`/services/categories/${categoryId}/services`, {
      params: filters,
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Get popular/featured services
 * @param {number} limit - Number of services to fetch
 * @returns {Promise<Array>} Popular services
 */
export const getPopularServices = async (limit = 10) => {
  try {
    const response = await get('/services/popular', {
      params: { limit },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Get services offered by a specific stylist
 * @param {string|number} stylistId - Stylist ID
 * @returns {Promise<Array>} Stylist's services
 */
export const getStylistServices = async (stylistId) => {
  try {
    const response = await get(`/stylists/${stylistId}/services`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Create new service (admin/stylist only)
 * @param {Object} data - Service data
 * @param {string} data.name - Service name
 * @param {string} data.description - Service description
 * @param {number} data.price - Service price
 * @param {number} data.duration - Service duration in minutes
 * @param {string} data.category_id - Category ID
 * @returns {Promise<Object>} Created service
 */
export const createService = async (data) => {
  try {
    const response = await post('/services', data);
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Update service (admin/stylist only)
 * @param {string|number} id - Service ID
 * @param {Object} data - Updated service data
 * @returns {Promise<Object>} Updated service
 */
export const updateService = async (id, data) => {
  try {
    const response = await put(`/services/${id}`, data);
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Delete service (admin only)
 * @param {string|number} id - Service ID
 * @returns {Promise<void>}
 */
export const deleteService = async (id) => {
  try {
    await del(`/services/${id}`);
  } catch (error) {
    throw error;
  }
};

/**
 * Get service pricing tiers/plans
 * @param {string|number} serviceId - Service ID
 * @returns {Promise<Array>} Service pricing tiers
 */
export const getServicePricing = async (serviceId) => {
  try {
    const response = await get(`/services/${serviceId}/pricing`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export default {
  getServices,
  getService,
  searchServices,
  getServiceCategories,
  getServicesByCategory,
  getPopularServices,
  getStylistServices,
  createService,
  updateService,
  deleteService,
  getServicePricing,
};
