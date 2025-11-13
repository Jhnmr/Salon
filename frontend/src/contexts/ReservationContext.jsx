/**
 * SALON PWA - Reservation Context
 * Manages reservations state and operations
 */

import { createContext, useContext, useState, useCallback } from 'react';
import * as reservationsService from '../services/reservations.service';

const ReservationContext = createContext(null);

/**
 * Reservation Provider Component
 * Manages reservation-related state and operations
 */
export const ReservationProvider = ({ children }) => {
  const [reservations, setReservations] = useState([]);
  const [selectedReservation, setSelectedReservation] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    status: null,
    stylist_id: null,
    start_date: null,
    end_date: null,
  });
  const [pagination, setPagination] = useState({
    current_page: 1,
    per_page: 10,
    total: 0,
    total_pages: 0,
  });

  /**
   * Fetch reservations with filters
   * @param {Object} customFilters - Custom filter parameters
   */
  const fetchReservations = useCallback(async (customFilters = {}) => {
    try {
      setIsLoading(true);
      setError(null);

      const mergedFilters = { ...filters, ...customFilters };
      const response = await reservationsService.getReservations(mergedFilters);

      setReservations(response.data || response);
      if (response.pagination) {
        setPagination(response.pagination);
      }

      return response;
    } catch (error) {
      setError(error.message || 'Failed to fetch reservations');
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  /**
   * Fetch single reservation by ID
   * @param {string|number} id - Reservation ID
   */
  const fetchReservation = useCallback(async (id) => {
    try {
      setIsLoading(true);
      setError(null);

      const reservation = await reservationsService.getReservation(id);
      setSelectedReservation(reservation);

      return reservation;
    } catch (error) {
      setError(error.message || 'Failed to fetch reservation');
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Create new reservation
   * @param {Object} data - Reservation data
   */
  const createReservation = useCallback(async (data) => {
    try {
      setIsLoading(true);
      setError(null);

      const newReservation = await reservationsService.createReservation(data);

      // Add to reservations list
      setReservations((prev) => [newReservation, ...prev]);

      return newReservation;
    } catch (error) {
      setError(error.message || 'Failed to create reservation');
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Update existing reservation
   * @param {string|number} id - Reservation ID
   * @param {Object} data - Updated data
   */
  const updateReservation = useCallback(async (id, data) => {
    try {
      setIsLoading(true);
      setError(null);

      const updatedReservation = await reservationsService.updateReservation(id, data);

      // Update in reservations list
      setReservations((prev) =>
        prev.map((reservation) =>
          reservation.id === id ? updatedReservation : reservation
        )
      );

      // Update selected reservation if it's the one being updated
      if (selectedReservation?.id === id) {
        setSelectedReservation(updatedReservation);
      }

      return updatedReservation;
    } catch (error) {
      setError(error.message || 'Failed to update reservation');
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [selectedReservation]);

  /**
   * Cancel reservation
   * @param {string|number} id - Reservation ID
   * @param {string} reason - Cancellation reason
   */
  const cancelReservation = useCallback(async (id, reason = '') => {
    try {
      setIsLoading(true);
      setError(null);

      const cancelledReservation = await reservationsService.cancelReservation(id, reason);

      // Update in reservations list
      setReservations((prev) =>
        prev.map((reservation) =>
          reservation.id === id ? cancelledReservation : reservation
        )
      );

      // Update selected reservation
      if (selectedReservation?.id === id) {
        setSelectedReservation(cancelledReservation);
      }

      return cancelledReservation;
    } catch (error) {
      setError(error.message || 'Failed to cancel reservation');
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [selectedReservation]);

  /**
   * Confirm reservation (stylist action)
   * @param {string|number} id - Reservation ID
   */
  const confirmReservation = useCallback(async (id) => {
    try {
      setIsLoading(true);
      setError(null);

      const confirmedReservation = await reservationsService.confirmReservation(id);

      // Update in reservations list
      setReservations((prev) =>
        prev.map((reservation) =>
          reservation.id === id ? confirmedReservation : reservation
        )
      );

      // Update selected reservation
      if (selectedReservation?.id === id) {
        setSelectedReservation(confirmedReservation);
      }

      return confirmedReservation;
    } catch (error) {
      setError(error.message || 'Failed to confirm reservation');
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [selectedReservation]);

  /**
   * Complete reservation
   * @param {string|number} id - Reservation ID
   */
  const completeReservation = useCallback(async (id) => {
    try {
      setIsLoading(true);
      setError(null);

      const completedReservation = await reservationsService.completeReservation(id);

      // Update in reservations list
      setReservations((prev) =>
        prev.map((reservation) =>
          reservation.id === id ? completedReservation : reservation
        )
      );

      // Update selected reservation
      if (selectedReservation?.id === id) {
        setSelectedReservation(completedReservation);
      }

      return completedReservation;
    } catch (error) {
      setError(error.message || 'Failed to complete reservation');
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [selectedReservation]);

  /**
   * Reschedule reservation
   * @param {string|number} id - Reservation ID
   * @param {string} scheduledAt - New date/time
   */
  const rescheduleReservation = useCallback(async (id, scheduledAt) => {
    try {
      setIsLoading(true);
      setError(null);

      const rescheduledReservation = await reservationsService.rescheduleReservation(id, scheduledAt);

      // Update in reservations list
      setReservations((prev) =>
        prev.map((reservation) =>
          reservation.id === id ? rescheduledReservation : reservation
        )
      );

      // Update selected reservation
      if (selectedReservation?.id === id) {
        setSelectedReservation(rescheduledReservation);
      }

      return rescheduledReservation;
    } catch (error) {
      setError(error.message || 'Failed to reschedule reservation');
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [selectedReservation]);

  /**
   * Check availability
   * @param {string|number} stylistId - Stylist ID
   * @param {string|number} serviceId - Service ID
   * @param {string} date - Date to check
   */
  const checkAvailability = useCallback(async (stylistId, serviceId, date) => {
    try {
      setIsLoading(true);
      setError(null);

      const availability = await reservationsService.checkAvailability(stylistId, serviceId, date);

      return availability;
    } catch (error) {
      setError(error.message || 'Failed to check availability');
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Update filters
   * @param {Object} newFilters - New filter values
   */
  const updateFilters = useCallback((newFilters) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  }, []);

  /**
   * Clear filters
   */
  const clearFilters = useCallback(() => {
    setFilters({
      status: null,
      stylist_id: null,
      start_date: null,
      end_date: null,
    });
  }, []);

  /**
   * Clear selected reservation
   */
  const clearSelectedReservation = useCallback(() => {
    setSelectedReservation(null);
  }, []);

  const value = {
    // State
    reservations,
    selectedReservation,
    isLoading,
    error,
    filters,
    pagination,

    // Actions
    fetchReservations,
    fetchReservation,
    createReservation,
    updateReservation,
    cancelReservation,
    confirmReservation,
    completeReservation,
    rescheduleReservation,
    checkAvailability,
    updateFilters,
    clearFilters,
    setSelectedReservation,
    clearSelectedReservation,
  };

  return (
    <ReservationContext.Provider value={value}>
      {children}
    </ReservationContext.Provider>
  );
};

/**
 * Hook to use Reservation Context
 * @returns {Object} Reservation context value
 */
export const useReservations = () => {
  const context = useContext(ReservationContext);

  if (!context) {
    throw new Error('useReservations must be used within a ReservationProvider');
  }

  return context;
};

export default ReservationContext;
