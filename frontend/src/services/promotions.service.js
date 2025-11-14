/**
 * SALON PWA - Promotions Service
 * API calls for managing promotion codes and discounts
 */

import { get, post, put, del } from './api';

/**
 * Get all active promotions
 * @returns {Promise<Object>} List of active promotions
 */
export const getPromotions = async () => {
  try {
    const response = await get('/promotions');
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Get single promotion by ID
 * @param {string|number} id - Promotion ID
 * @returns {Promise<Object>} Promotion data
 */
export const getPromotion = async (id) => {
  try {
    const response = await get(`/promotions/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Validate promotion code
 * @param {Object} data - Validation data
 * @param {string} data.code - Promotion code
 * @param {number} data.service_id - Service ID (optional)
 * @param {number} data.branch_id - Branch ID (optional)
 * @param {number} data.amount - Original amount in cents
 * @returns {Promise<Object>} Validation result with discount details
 */
export const validatePromotion = async (data) => {
  try {
    const response = await post('/promotions/validate', data);
    return response.data;
  } catch (error) {
    // Return invalid response instead of throwing
    return {
      valid: false,
      message: error.message || 'Invalid promotion code',
    };
  }
};

/**
 * Apply promotion code to get final price
 * @param {Object} data - Application data
 * @param {string} data.code - Promotion code
 * @param {number} data.service_id - Service ID
 * @param {number} data.branch_id - Branch ID
 * @param {number} data.amount - Original amount in cents
 * @returns {Promise<Object>} Discounted price and details
 */
export const applyPromotion = async (data) => {
  try {
    const response = await post('/promotions/apply', data);
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Create new promotion (admin only)
 * @param {Object} data - Promotion data
 * @param {string} data.code - Promotion code
 * @param {string} data.type - Type (percentage, fixed, free_service)
 * @param {number} data.discount - Discount value
 * @param {string} data.valid_from - Start date
 * @param {string} data.valid_until - End date
 * @param {number} data.max_uses - Maximum uses
 * @param {boolean} data.one_per_client - One use per client
 * @param {boolean} data.first_booking_only - First booking only
 * @returns {Promise<Object>} Created promotion
 */
export const createPromotion = async (data) => {
  try {
    const response = await post('/promotions', data);
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Update promotion (admin only)
 * @param {string|number} id - Promotion ID
 * @param {Object} data - Updated promotion data
 * @returns {Promise<Object>} Updated promotion
 */
export const updatePromotion = async (id, data) => {
  try {
    const response = await put(`/promotions/${id}`, data);
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Delete promotion (admin only)
 * @param {string|number} id - Promotion ID
 * @returns {Promise<void>}
 */
export const deletePromotion = async (id) => {
  try {
    await del(`/promotions/${id}`);
  } catch (error) {
    throw error;
  }
};

/**
 * Get promotion statistics (admin only)
 * @param {string|number} id - Promotion ID
 * @returns {Promise<Object>} Usage statistics
 */
export const getPromotionStatistics = async (id) => {
  try {
    const response = await get(`/promotions/${id}/statistics`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export default {
  getPromotions,
  getPromotion,
  validatePromotion,
  applyPromotion,
  createPromotion,
  updatePromotion,
  deletePromotion,
  getPromotionStatistics,
};
