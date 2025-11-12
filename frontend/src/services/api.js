import axios from 'axios';

// API Base URL - configurable via environment variable
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  timeout: 30000, // 30 seconds
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors and token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If 401 and we haven't tried to refresh yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refresh_token');
        if (refreshToken) {
          const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
            refresh_token: refreshToken,
          });

          const { access_token, refresh_token: newRefreshToken } = response.data;

          localStorage.setItem('access_token', access_token);
          localStorage.setItem('refresh_token', newRefreshToken);

          // Retry original request with new token
          originalRequest.headers.Authorization = `Bearer ${access_token}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        // Refresh failed, logout user
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// ============================================
// AUTH API
// ============================================

export const authAPI = {
  login: (credentials) => api.post('/login', credentials),
  register: (userData) => api.post('/register', userData),
  logout: () => api.post('/logout'),
  getCurrentUser: () => api.get('/user'),
  refreshToken: (refreshToken) => api.post('/auth/refresh', { refresh_token: refreshToken }),
  revokeAll: () => api.post('/auth/revoke-all'),
};

// ============================================
// SERVICES API
// ============================================

export const servicesAPI = {
  getAll: (params) => api.get('/services', { params }),
  getById: (id) => api.get(`/services/${id}`),
  getByCategory: (category) => api.get(`/services/category/${category}`),
  create: (data) => api.post('/services', data),
  update: (id, data) => api.put(`/services/${id}`, data),
  delete: (id) => api.delete(`/services/${id}`),
};

// ============================================
// RESERVATIONS API
// ============================================

export const reservationsAPI = {
  getAll: (params) => api.get('/reservations', { params }),
  getById: (id) => api.get(`/reservations/${id}`),
  create: (data) => api.post('/reservations', data),
  update: (id, data) => api.put(`/reservations/${id}`, data),
  cancel: (id) => api.post(`/reservations/${id}/cancel`),
  getAvailableSlots: (params) => api.get('/reservations/available-slots', { params }),
  getStylistReservations: (stylistId, params) =>
    api.get(`/reservations/stylist/${stylistId}`, { params }),
};

// ============================================
// STYLISTS API
// ============================================

export const stylistsAPI = {
  getAll: (params) => api.get('/stylists', { params }),
  getById: (id) => api.get(`/stylists/${id}`),
  create: (data) => api.post('/stylists', data),
  update: (id, data) => api.put(`/stylists/${id}`, data),
};

// ============================================
// BRANCHES API
// ============================================

export const branchesAPI = {
  getAll: (params) => api.get('/branches', { params }),
  getById: (id) => api.get(`/branches/${id}`),
  getStats: (id) => api.get(`/branches/${id}/stats`),
  create: (data) => api.post('/branches', data),
  update: (id, data) => api.put(`/branches/${id}`, data),
  delete: (id) => api.delete(`/branches/${id}`),
  activate: (id) => api.post(`/branches/${id}/activate`),
  deactivate: (id) => api.post(`/branches/${id}/deactivate`),
  verify: (id) => api.post(`/branches/${id}/verify`),
};

// ============================================
// PAYMENTS API
// ============================================

export const paymentsAPI = {
  getAll: (params) => api.get('/payments', { params }),
  getById: (id) => api.get(`/payments/${id}`),
  create: (data) => api.post('/payments', data),
  confirm: (id, data) => api.post(`/payments/${id}/confirm`, data),
  refund: (id, data) => api.post(`/payments/${id}/refund`, data),
  getStatistics: () => api.get('/payments/statistics'),
};

// ============================================
// INVOICES API
// ============================================

export const invoicesAPI = {
  getAll: (params) => api.get('/invoices', { params }),
  getById: (id) => api.get(`/invoices/${id}`),
  create: (data) => api.post('/invoices', data),
  send: (id, email) => api.post(`/invoices/${id}/send`, { email }),
  download: (id) => api.get(`/invoices/${id}/download`),
  cancel: (id, reason) => api.post(`/invoices/${id}/cancel`, { motivo: reason }),
  getStatistics: () => api.get('/invoices/statistics'),
};

// ============================================
// NOTIFICATIONS API
// ============================================

export const notificationsAPI = {
  getAll: (params) => api.get('/notifications', { params }),
  getUnread: () => api.get('/notifications/unread'),
  getUnreadCount: () => api.get('/notifications/unread/count'),
  markAsRead: (id) => api.put(`/notifications/${id}/read`),
  markAllAsRead: () => api.post('/notifications/mark-all-read'),
  delete: (id) => api.delete(`/notifications/${id}`),
};

// ============================================
// DASHBOARD API
// ============================================

export const dashboardAPI = {
  getOverview: () => api.get('/dashboard'),
  getQuickStats: () => api.get('/dashboard/stats'),
};

// ============================================
// USERS API
// ============================================

export const usersAPI = {
  getAll: (params) => api.get('/users', { params }),
  getById: (id) => api.get(`/users/${id}`),
  getByRole: (role) => api.get(`/users/role/${role}`),
  update: (id, data) => api.put(`/users/${id}`, data),
  activate: (id) => api.post(`/users/${id}/activate`),
  deactivate: (id) => api.post(`/users/${id}/deactivate`),
  delete: (id) => api.delete(`/users/${id}`),
  getStatistics: () => api.get('/users/statistics/all'),
};

// ============================================
// AVAILABILITY API
// ============================================

export const availabilityAPI = {
  getByStylist: (stylistId) => api.get(`/availability/${stylistId}`),
  getByDay: (stylistId, day) => api.get(`/availability/${stylistId}/${day}`),
  getMine: () => api.get('/availability/mine'),
  create: (data) => api.post('/availability', data),
  update: (id, data) => api.put(`/availability/${id}`, data),
  delete: (id) => api.delete(`/availability/${id}`),
  bulkSet: (data) => api.post('/availability/bulk-set', data),
};

// ============================================
// AUDIT LOGS API
// ============================================

export const auditLogsAPI = {
  getAll: (params) => api.get('/audit-logs', { params }),
  getMine: () => api.get('/audit-logs/mine'),
  getById: (id) => api.get(`/audit-logs/${id}`),
  getRecordHistory: (tableName, recordId) =>
    api.get(`/audit-logs/record/${tableName}/${recordId}`),
  getStatistics: (params) => api.get('/audit-logs/statistics', { params }),
  cleanup: (days) => api.delete('/audit-logs/cleanup', { params: { days } }),
};

export default api;
