import { apiClient, API_ENDPOINTS } from '../config/api.js';

export const busService = {
  // Search buses with improved endpoint
  async searchBuses(searchData) {
    try {
      const params = new URLSearchParams({
        source: searchData.source,
        destination: searchData.destination,
        date: searchData.date,
      });

      if (searchData.endDate) {
        params.append('endDate', searchData.endDate);
      }

      const response = await apiClient.get(`/buses/search?${params.toString()}`);

      return {
        success: true,
        buses: response.buses || [],
        count: response.count || 0
      };
    } catch (error) {
      console.error('Bus search error:', error);
      return { success: false, error: error.message, buses: [] };
    }
  },

  // Get all buses
  async getAllBuses() {
    try {
      const response = await apiClient.get(API_ENDPOINTS.BUSES_LIST);
      return { success: true, buses: response.buses || [] };
    } catch (error) {
      return { success: false, error: error.message, buses: [] };
    }
  },

  // Get all routes
  async getAllRoutes() {
    try {
      const response = await apiClient.get(API_ENDPOINTS.ROUTES_LIST);
      return { success: true, routes: response.routes || [] };
    } catch (error) {
      return { success: false, error: error.message, routes: [] };
    }
  },

  // Get schedules
  async getSchedules() {
    try {
      const response = await apiClient.get(API_ENDPOINTS.SCHEDULES_LIST);
      return { success: true, schedules: response.schedules || [] };
    } catch (error) {
      return { success: false, error: error.message, schedules: [] };
    }
  },

  // Get available locations from improved endpoint
  async getLocations() {
    try {
      const response = await apiClient.get('/buses/locations');
      if (response.success) {
        return { success: true, locations: response.locations || [] };
      }
      return { success: false, error: 'Failed to fetch locations', locations: [] };
    } catch (error) {
      console.error('Error fetching locations:', error);
      return { success: false, error: error.message, locations: [] };
    }
  },
};

export default busService;
