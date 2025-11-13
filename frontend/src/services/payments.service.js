/**
 * SALON PWA - Payments Service
 * API calls for managing payments and transactions
 */

import { get, post, put, del } from './api';

/**
 * Get all payments for current user
 * @param {Object} filters - Filter parameters
 * @param {string} filters.status - Payment status (pending, completed, failed, refunded)
 * @param {number} filters.page - Page number
 * @param {number} filters.per_page - Items per page
 * @returns {Promise<Object>} Payments list with pagination
 */
export const getPayments = async (filters = {}) => {
  const response = await get('/payments', { params: filters });
  return response.data;
};

/**
 * Get single payment by ID
 * @param {string|number} id - Payment ID
 * @returns {Promise<Object>} Payment data
 */
export const getPayment = async (id) => {
  const response = await get(`/payments/${id}`);
  return response.data;
};

/**
 * Create payment intent for reservation
 * @param {string|number} reservationId - Reservation ID
 * @param {Object} options - Payment options
 * @param {string} options.payment_method - Payment method (card, cash, etc.)
 * @returns {Promise<Object>} Payment intent with client secret
 */
export const createPaymentIntent = async (reservationId, options = {}) => {
  const response = await post('/payments/intent', {
    reservation_id: reservationId,
    ...options,
  });
  return response.data;
};

/**
 * Confirm payment
 * @param {string} paymentIntentId - Stripe payment intent ID
 * @param {Object} paymentDetails - Payment details
 * @returns {Promise<Object>} Confirmed payment
 */
export const confirmPayment = async (paymentIntentId, paymentDetails = {}) => {
  const response = await post('/payments/confirm', {
    payment_intent_id: paymentIntentId,
    ...paymentDetails,
  });
  return response.data;
};

/**
 * Get saved payment methods
 * @returns {Promise<Array>} List of saved payment methods
 */
export const getPaymentMethods = async () => {
  const response = await get('/payments/methods');
  return response.data;
};

/**
 * Save new payment method
 * @param {Object} data - Payment method data
 * @param {string} data.type - Payment method type (card)
 * @param {string} data.token - Stripe token or payment method ID
 * @param {boolean} data.set_default - Set as default payment method
 * @returns {Promise<Object>} Saved payment method
 */
export const savePaymentMethod = async (data) => {
  const response = await post('/payments/methods', data);
  return response.data;
};

/**
 * Delete payment method
 * @param {string|number} id - Payment method ID
 * @returns {Promise<void>}
 */
export const deletePaymentMethod = async (id) => {
  await del(`/payments/methods/${id}`);
};

/**
 * Set default payment method
 * @param {string|number} id - Payment method ID
 * @returns {Promise<Object>} Updated payment method
 */
export const setDefaultPaymentMethod = async (id) => {
  const response = await put(`/payments/methods/${id}/default`);
  return response.data;
};

/**
 * Request refund for payment
 * @param {string|number} paymentId - Payment ID
 * @param {string} reason - Refund reason
 * @param {number} amount - Refund amount (optional, defaults to full amount)
 * @returns {Promise<Object>} Refund details
 */
export const requestRefund = async (paymentId, reason, amount = null) => {
  const data = { reason };
  if (amount) data.amount = amount;

  const response = await post(`/payments/${paymentId}/refund`, data);
  return response.data;
};

/**
 * Get payment history
 * @param {number} page - Page number
 * @param {number} perPage - Items per page
 * @returns {Promise<Object>} Payment history with pagination
 */
export const getPaymentHistory = async (page = 1, perPage = 20) => {
  const response = await get('/payments/history', {
    params: { page, per_page: perPage },
  });
  return response.data;
};

/**
 * Get payment statistics for stylist
 * @param {string} period - Period (week, month, year, all)
 * @returns {Promise<Object>} Payment statistics
 */
export const getPaymentStats = async (period = 'month') => {
  const response = await get('/payments/stats', {
    params: { period },
  });
  return response.data;
};

/**
 * Process cash payment (stylist action)
 * @param {string|number} reservationId - Reservation ID
 * @param {number} amount - Payment amount
 * @returns {Promise<Object>} Payment record
 */
export const processCashPayment = async (reservationId, amount) => {
  const response = await post('/payments/cash', {
    reservation_id: reservationId,
    amount,
  });
  return response.data;
};

/**
 * Add tip to payment
 * @param {string|number} paymentId - Payment ID
 * @param {number} tipAmount - Tip amount
 * @returns {Promise<Object>} Updated payment
 */
export const addTip = async (paymentId, tipAmount) => {
  const response = await post(`/payments/${paymentId}/tip`, {
    tip_amount: tipAmount,
  });
  return response.data;
};

/**
 * Download payment receipt
 * @param {string|number} paymentId - Payment ID
 * @returns {Promise<Blob>} Receipt PDF blob
 */
export const downloadReceipt = async (paymentId) => {
  const response = await get(`/payments/${paymentId}/receipt`, {
    responseType: 'blob',
  });
  return response.data;
};

export default {
  getPayments,
  getPayment,
  createPaymentIntent,
  confirmPayment,
  getPaymentMethods,
  savePaymentMethod,
  deletePaymentMethod,
  setDefaultPaymentMethod,
  requestRefund,
  getPaymentHistory,
  getPaymentStats,
  processCashPayment,
  addTip,
  downloadReceipt,
};
