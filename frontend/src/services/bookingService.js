import { apiClient, API_ENDPOINTS } from '../config/api.js';

export const bookingService = {
  // Create a new booking
  async createBooking(bookingData) {
    try {
      console.log('Booking service received data:', bookingData);

      const response = await apiClient.post(API_ENDPOINTS.BOOKINGS_CREATE, {
        scheduleId: bookingData.scheduleId,
        seatNumbers: bookingData.seatNumbers, // Use seatNumbers directly
        totalSeats: bookingData.totalSeats,
        totalFare: bookingData.totalFare,
        journeyDate: bookingData.journeyDate,
        passengerDetails: bookingData.passengerDetails,
      });
      return { success: true, booking: response.booking };
    } catch (error) {
      console.error('Booking service error:', error);
      return { success: false, error: error.message };
    }
  },

  // Get user bookings
  async getUserBookings(userId) {
    try {
      const response = await apiClient.get(`${API_ENDPOINTS.BOOKINGS_LIST}/user`);
      return response.bookings || [];
    } catch (error) {
      console.error('Error fetching user bookings:', error);
      return [];
    }
  },

  // Get all bookings (admin)
  async getAllBookings() {
    try {
      const response = await apiClient.get(API_ENDPOINTS.BOOKINGS_LIST);
      return { success: true, bookings: response.bookings || [] };
    } catch (error) {
      return { success: false, error: error.message, bookings: [] };
    }
  },

  // Cancel booking
  async cancelBooking(bookingId, reason = '') {
    try {
      const response = await apiClient.post(`${API_ENDPOINTS.BOOKINGS_LIST}/cancel/${bookingId}`, {
        cancellationReason: reason,
        processRefund: true
      });
      return {
        success: true,
        message: response.message,
        cancellation: response.cancellation,
        refund: response.refund
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || error.message
      };
    }
  },

  // Get booking details
  async getBookingDetails(bookingId) {
    try {
      const response = await apiClient.get(`${API_ENDPOINTS.BOOKINGS_LIST}/${bookingId}`);
      return { success: true, booking: response.booking };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },



  // Submit feedback
  async submitFeedback(bookingId, rating, comments) {
    try {
      const response = await apiClient.post('/feedback', {
        bookingId,
        rating,
        comments
      });
      return { success: true, feedback: response.feedback };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || error.message
      };
    }
  },

  // Get refund details
  async getRefundDetails(bookingId) {
    try {
      const response = await apiClient.get(`${API_ENDPOINTS.BOOKINGS_LIST}/${bookingId}/refund`);
      return response.refund;
    } catch (error) {
      console.error('Error fetching refund details:', error);
      return null;
    }
  }
};

export default bookingService;
