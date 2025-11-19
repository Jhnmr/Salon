import axios from 'axios';
import { authStore } from '../store/authStore';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para agregar el token a todas las solicitudes
api.interceptors.request.use(
  (config) => {
    const token = authStore.getState().token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor para manejar errores de autenticación
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      authStore.getState().logout();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Funciones de autenticación
export const authService = {
  register: (data) => api.post('/register', data),
  login: (email, password) => api.post('/login', { email, password }),
  logout: () => api.post('/logout'),
  getCurrentUser: () => api.get('/user'),
};

// Funciones de perfiles
export const profileService = {
  getMyProfile: () => api.get('/profile'),
  updateProfile: (data) => api.post('/profile', data),
  getStylistProfile: (userId) => api.get(`/profiles/${userId}`),
  getAllStylists: () => api.get('/stylists'),
};

// Funciones de servicios
export const serviceService = {
  getAllServices: () => api.get('/services'),
  getServiceById: (id) => api.get(`/services/${id}`),
  getServicesByCategory: (category) => api.get(`/services/category/${category}`),
  createService: (data) => api.post('/services', data),
  updateService: (id, data) => api.put(`/services/${id}`, data),
  deleteService: (id) => api.delete(`/services/${id}`),
};

// Funciones de reservas
export const reservationService = {
  getMyReservations: () => api.get('/reservations'),
  getReservationById: (id) => api.get(`/reservations/${id}`),
  createReservation: (data) => api.post('/reservations', data),
  updateReservation: (id, data) => api.put(`/reservations/${id}`, data),
  cancelReservation: (id) => api.post(`/reservations/${id}/cancel`),
  getAvailableSlots: (serviceId, stylistId, date) =>
    api.get('/reservations/available-slots', {
      params: { service_id: serviceId, stylist_id: stylistId, date },
    }),
  getStylistReservations: (stylistId) =>
    api.get(`/reservations/stylist/${stylistId}`),
};

// Funciones de disponibilidad
export const availabilityService = {
  getMyAvailability: () => api.get('/availability/mine'),
  getStylistAvailability: (stylistId) => api.get(`/availability/${stylistId}`),
  getStylistAvailabilityByDay: (stylistId, day) =>
    api.get(`/availability/${stylistId}/${day}`),
  addAvailability: (data) => api.post('/availability', data),
  updateAvailability: (id, data) => api.put(`/availability/${id}`, data),
  deleteAvailability: (id) => api.delete(`/availability/${id}`),
  bulkSetAvailability: (data) => api.post('/availability/bulk-set', data),
};

// Funciones de notificaciones
export const notificationService = {
  getMyNotifications: () => api.get('/notifications'),
  getUnreadNotifications: () => api.get('/notifications/unread'),
  getUnreadCount: () => api.get('/notifications/unread/count'),
  markAsRead: (id) => api.put(`/notifications/${id}/read`),
  markAllAsRead: () => api.post('/notifications/mark-all-read'),
  deleteNotification: (id) => api.delete(`/notifications/${id}`),
};

// Funciones de usuarios
export const userService = {
  getAllUsers: () => api.get('/users'),
  getUsersByRole: (role) => api.get(`/users/role/${role}`),
  getUserById: (id) => api.get(`/users/${id}`),
  updateUser: (id, data) => api.put(`/users/${id}`, data),
  deactivateUser: (id) => api.post(`/users/${id}/deactivate`),
  activateUser: (id) => api.post(`/users/${id}/activate`),
  deleteUser: (id) => api.delete(`/users/${id}`),
  getStatistics: () => api.get('/users/statistics/all'),
};

// Funciones de dashboard
export const dashboardService = {
  getDashboard: () => api.get('/dashboard'),
  getQuickStats: () => api.get('/dashboard/stats'),
};

export default api;
