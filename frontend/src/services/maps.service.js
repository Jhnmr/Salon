import api from './api';

/**
 * Maps Service
 * Handles location-based searches and distance calculations
 */
const mapsService = {
  /**
   * Get stylists near a specific location
   * @param {number} latitude - User latitude
   * @param {number} longitude - User longitude
   * @param {number} radiusKm - Search radius in kilometers
   * @returns {Promise<Array>} Array of nearby stylists
   */
  async getNearbyStylists(latitude, longitude, radiusKm = 5) {
    try {
      const response = await api.get('/stylists', {
        params: {
          latitude,
          longitude,
          radius: radiusKm,
        },
      });

      if (response.data.status === 'success') {
        // Calculate distance for each stylist
        return (response.data.data || []).map((stylist) => ({
          ...stylist,
          distance: calculateDistance(
            latitude,
            longitude,
            stylist.branch?.latitude,
            stylist.branch?.longitude
          ),
        }));
      }

      return [];
    } catch (error) {
      console.error('Error fetching nearby stylists:', error);
      throw error;
    }
  },

  /**
   * Search stylists with optional filters
   * @param {Object} filters - Search filters
   * @returns {Promise<Array>}
   */
  async searchStylists(filters = {}) {
    try {
      const response = await api.get('/stylists', { params: filters });

      if (response.data.status === 'success') {
        return response.data.data || [];
      }

      return [];
    } catch (error) {
      console.error('Error searching stylists:', error);
      throw error;
    }
  },

  /**
   * Get stylist details with services
   * @param {number} stylistId - Stylist ID
   * @returns {Promise<Object>}
   */
  async getStylistDetails(stylistId) {
    try {
      const response = await api.get(`/stylists/${stylistId}`);

      if (response.data.status === 'success') {
        return response.data.data;
      }

      throw new Error('Stylist not found');
    } catch (error) {
      console.error('Error fetching stylist details:', error);
      throw error;
    }
  },

  /**
   * Get stylist services
   * @param {number} stylistId - Stylist ID
   * @returns {Promise<Array>}
   */
  async getStylistServices(stylistId) {
    try {
      const response = await api.get(
        `/stylists/${stylistId}/services`
      );

      if (response.data.status === 'success') {
        return response.data.data || [];
      }

      return [];
    } catch (error) {
      console.error('Error fetching stylist services:', error);
      throw error;
    }
  },

  /**
   * Get stylist availability
   * @param {number} stylistId - Stylist ID
   * @param {string} date - Date in YYYY-MM-DD format
   * @returns {Promise<Array>}
   */
  async getStylistAvailability(stylistId, date) {
    try {
      const response = await api.get(
        `/stylists/${stylistId}/availability`,
        {
          params: { date },
        }
      );

      if (response.data.status === 'success') {
        return response.data.data || [];
      }

      return [];
    } catch (error) {
      console.error('Error fetching availability:', error);
      throw error;
    }
  },
};

/**
 * Calculate distance between two coordinates using Haversine formula
 * Returns distance in kilometers
 * @param {number} lat1 - Latitude of point 1
 * @param {number} lon1 - Longitude of point 1
 * @param {number} lat2 - Latitude of point 2
 * @param {number} lon2 - Longitude of point 2
 * @returns {number} Distance in kilometers
 */
function calculateDistance(lat1, lon1, lat2, lon2) {
  if (!lat2 || !lon2) return null;

  const R = 6371; // Earth's radius in kilometers
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  return Math.round(distance * 10) / 10; // Round to 1 decimal place
}

export default mapsService;
