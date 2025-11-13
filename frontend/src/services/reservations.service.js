/**
 * SALON PWA - Reservations Service
 * API calls for managing reservations and appointments
 */

import { get, post, put, patch, del } from './api';

/**
 * Get all reservations with optional filters
 * @param {Object} filters - Filter parameters
 * @param {string} filters.status - Reservation status (pending, confirmed, completed, cancelled)
 * @param {string} filters.stylist_id - Filter by stylist ID
 * @param {string} filters.client_id - Filter by client ID
 * @param {string} filters.start_date - Filter by start date
 * @param {string} filters.end_date - Filter by end date
 * @param {number} filters.page - Page number for pagination
 * @param {number} filters.per_page - Items per page
 * @returns {Promise<Object>} Reservations list with pagination
 */
export const getReservations = async (filters = {}) => {
  try {
    const response = await get('/reservations', { params: filters });
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Get single reservation by ID
 * @param {string|number} id - Reservation ID
 * @returns {Promise<Object>} Reservation data
 */
export const getReservation = async (id) => {
  try {
    const response = await get(`/reservations/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Create new reservation
 * @param {Object} data - Reservation data
 * @param {string} data.stylist_id - Stylist ID
 * @param {string} data.service_id - Service ID
 * @param {string} data.scheduled_at - Appointment date/time (ISO format)
 * @param {string} data.notes - Optional notes
 * @returns {Promise<Object>} Created reservation
 */
export const createReservation = async (data) => {
  try {
    const response = await post('/reservations', data);
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Update existing reservation
 * @param {string|number} id - Reservation ID
 * @param {Object} data - Updated reservation data
 * @returns {Promise<Object>} Updated reservation
 */
export const updateReservation = async (id, data) => {
  try {
    const response = await put(`/reservations/${id}`, data);
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Cancel reservation
 * @param {string|number} id - Reservation ID
 * @param {string} reason - Cancellation reason
 * @returns {Promise<Object>} Cancelled reservation
 */
export const cancelReservation = async (id, reason = '') => {
  try {
    const response = await patch(`/reservations/${id}/cancel`, { reason });
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Confirm reservation (stylist action)
 * @param {string|number} id - Reservation ID
 * @returns {Promise<Object>} Confirmed reservation
 */
export const confirmReservation = async (id) => {
  try {
    const response = await patch(`/reservations/${id}/confirm`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Mark reservation as completed
 * @param {string|number} id - Reservation ID
 * @returns {Promise<Object>} Completed reservation
 */
export const completeReservation = async (id) => {
  try {
    const response = await patch(`/reservations/${id}/complete`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Reschedule reservation
 * @param {string|number} id - Reservation ID
 * @param {string} scheduledAt - New appointment date/time (ISO format)
 * @returns {Promise<Object>} Rescheduled reservation
 */
export const rescheduleReservation = async (id, scheduledAt) => {
  try {
    const response = await patch(`/reservations/${id}/reschedule`, {
      scheduled_at: scheduledAt,
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Check stylist availability for a service
 * @param {string|number} stylistId - Stylist ID
 * @param {string|number} serviceId - Service ID
 * @param {string} date - Date to check (YYYY-MM-DD format)
 * @returns {Promise<Object>} Available time slots
 */
export const checkAvailability = async (stylistId, serviceId, date) => {
  try {
    const response = await get('/reservations/availability', {
      params: {
        stylist_id: stylistId,
        service_id: serviceId,
        date,
      },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Get upcoming reservations for current user
 * @param {number} limit - Number of reservations to fetch
 * @returns {Promise<Object>} Upcoming reservations
 */
export const getUpcomingReservations = async (limit = 5) => {
  try {
    const response = await get('/reservations/upcoming', {
      params: { limit },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Get past reservations for current user
 * @param {number} page - Page number
 * @param {number} perPage - Items per page
 * @returns {Promise<Object>} Past reservations with pagination
 */
export const getPastReservations = async (page = 1, perPage = 10) => {
  try {
    const response = await get('/reservations/past', {
      params: { page, per_page: perPage },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Delete reservation (admin only)
 * @param {string|number} id - Reservation ID
 * @returns {Promise<void>}
 */
export const deleteReservation = async (id) => {
  try {
    await del(`/reservations/${id}`);
  } catch (error) {
    throw error;
  }
};

export default {
  getReservations,
  getReservation,
  createReservation,
  updateReservation,
  cancelReservation,
  confirmReservation,
  completeReservation,
  rescheduleReservation,
  checkAvailability,
  getUpcomingReservations,
  getPastReservations,
  deleteReservation,
};
