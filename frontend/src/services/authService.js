import { apiClient, API_ENDPOINTS } from '../config/api.js';

export const authService = {
  // Register a new user
  async register(userData) {
    try {
      const response = await apiClient.post(API_ENDPOINTS.USER_REGISTER, {
        email: userData.email,
        password: userData.password,
        fullName: userData.name,
        phone: userData.phone,
      });
      return { success: true, user: response.user };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Login user
  async login(email, password) {
    try {
      const response = await apiClient.post(API_ENDPOINTS.USER_LOGIN, {
        email,
        password,
      });
      return { success: true, user: response.user };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Logout user
  async logout() {
    try {
      await apiClient.post(API_ENDPOINTS.USER_LOGOUT);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Get user profile
  async getProfile() {
    try {
      const response = await apiClient.get(API_ENDPOINTS.USER_PROFILE);
      return { success: true, user: response.user };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Update user profile
  async updateProfile(userData) {
    try {
      const response = await apiClient.put(API_ENDPOINTS.USER_PROFILE, {
        fullName: userData.fullName,
        phone: userData.phone,
      });
      return { success: true, user: response.user };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Admin login
  async adminLogin(username, password) {
    try {
      const response = await apiClient.post(API_ENDPOINTS.ADMIN_LOGIN, {
        username,
        password,
      });
      return { success: true, admin: response.admin };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },
};

export default authService;
