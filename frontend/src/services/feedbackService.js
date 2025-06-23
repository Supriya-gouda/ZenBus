import { apiClient } from '../config/api.js';

export const feedbackService = {
  // Get user's feedback
  async getUserFeedback() {
    try {
      const response = await apiClient.get('/feedback/user');
      return {
        success: true,
        feedback: response.feedback || []
      };
    } catch (error) {
      console.error('Error fetching user feedback:', error);
      return {
        success: false,
        error: error.response?.data?.message || error.message,
        feedback: []
      };
    }
  },

  // Submit new feedback
  async submitFeedback(bookingId, rating, comments) {
    try {
      const response = await apiClient.post('/feedback', {
        bookingId,
        rating,
        comments
      });
      return {
        success: true,
        feedback: response.feedback
      };
    } catch (error) {
      console.error('Error submitting feedback:', error);
      return {
        success: false,
        error: error.response?.data?.message || error.message
      };
    }
  },

  // Update feedback
  async updateFeedback(feedbackId, { rating, comments }) {
    try {
      const response = await apiClient.put(`/feedback/${feedbackId}`, {
        rating,
        comments
      });
      return {
        success: true,
        feedback: response.feedback
      };
    } catch (error) {
      console.error('Error updating feedback:', error);
      return {
        success: false,
        error: error.response?.data?.message || error.message
      };
    }
  },

  // Delete feedback
  async deleteFeedback(feedbackId) {
    try {
      await apiClient.delete(`/feedback/${feedbackId}`);
      return { success: true };
    } catch (error) {
      console.error('Error deleting feedback:', error);
      return {
        success: false,
        error: error.response?.data?.message || error.message
      };
    }
  },

  // Get all feedback (admin)
  async getAllFeedback() {
    try {
      const response = await apiClient.get('/feedback');
      return {
        success: true,
        feedback: response.feedback || []
      };
    } catch (error) {
      console.error('Error fetching all feedback:', error);
      return {
        success: false,
        error: error.response?.data?.message || error.message,
        feedback: []
      };
    }
  }
};

export default feedbackService;
