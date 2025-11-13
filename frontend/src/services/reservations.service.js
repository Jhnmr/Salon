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
  const response = await get('/reservations', { params: filters });
  return response.data;
};

/**
 * Get single reservation by ID
 * @param {string|number} id - Reservation ID
 * @returns {Promise<Object>} Reservation data
 */
export const getReservation = async (id) => {
  const response = await get(`/reservations/${id}`);
  return response.data;
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
  const response = await post('/reservations', data);
  return response.data;
};

/**
 * Update existing reservation
 * @param {string|number} id - Reservation ID
 * @param {Object} data - Updated reservation data
 * @returns {Promise<Object>} Updated reservation
 */
export const updateReservation = async (id, data) => {
  const response = await put(`/reservations/${id}`, data);
  return response.data;
};

/**
 * Cancel reservation
 * @param {string|number} id - Reservation ID
 * @param {string} reason - Cancellation reason
 * @returns {Promise<Object>} Cancelled reservation
 */
export const cancelReservation = async (id, reason = '') => {
  const response = await patch(`/reservations/${id}/cancel`, { reason });
  return response.data;
};

/**
 * Confirm reservation (stylist action)
 * @param {string|number} id - Reservation ID
 * @returns {Promise<Object>} Confirmed reservation
 */
export const confirmReservation = async (id) => {
  const response = await patch(`/reservations/${id}/confirm`);
  return response.data;
};

/**
 * Mark reservation as completed
 * @param {string|number} id - Reservation ID
 * @returns {Promise<Object>} Completed reservation
 */
export const completeReservation = async (id) => {
  const response = await patch(`/reservations/${id}/complete`);
  return response.data;
};

/**
 * Reschedule reservation
 * @param {string|number} id - Reservation ID
 * @param {string} scheduledAt - New appointment date/time (ISO format)
 * @returns {Promise<Object>} Rescheduled reservation
 */
export const rescheduleReservation = async (id, scheduledAt) => {
  const response = await patch(`/reservations/${id}/reschedule`, {
    scheduled_at: scheduledAt,
  });
  return response.data;
};

/**
 * Check stylist availability for a service
 * @param {string|number} stylistId - Stylist ID
 * @param {string|number} serviceId - Service ID
 * @param {string} date - Date to check (YYYY-MM-DD format)
 * @returns {Promise<Object>} Available time slots
 */
export const checkAvailability = async (stylistId, serviceId, date) => {
  const response = await get('/reservations/availability', {
    params: {
      stylist_id: stylistId,
      service_id: serviceId,
      date,
    },
  });
  return response.data;
};

/**
 * Get upcoming reservations for current user
 * @param {number} limit - Number of reservations to fetch
 * @returns {Promise<Object>} Upcoming reservations
 */
export const getUpcomingReservations = async (limit = 5) => {
  const response = await get('/reservations/upcoming', {
    params: { limit },
  });
  return response.data;
};

/**
 * Get past reservations for current user
 * @param {number} page - Page number
 * @param {number} perPage - Items per page
 * @returns {Promise<Object>} Past reservations with pagination
 */
export const getPastReservations = async (page = 1, perPage = 10) => {
  const response = await get('/reservations/past', {
    params: { page, per_page: perPage },
  });
  return response.data;
};

/**
 * Delete reservation (admin only)
 * @param {string|number} id - Reservation ID
 * @returns {Promise<void>}
 */
export const deleteReservation = async (id) => {
  await del(`/reservations/${id}`);
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
