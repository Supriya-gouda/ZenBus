// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

// API endpoints
export const API_ENDPOINTS = {
  // User endpoints
  USER_REGISTER: '/users/register',
  USER_LOGIN: '/users/login',
  USER_LOGOUT: '/users/logout',
  USER_PROFILE: '/users/profile',
  
  // Bus endpoints
  BUSES_SEARCH: '/buses/search',
  BUSES_LIST: '/buses',
  BUSES_LOCATIONS: '/buses/locations',
  
  // Route endpoints
  ROUTES_LIST: '/routes/public',
  
  // Schedule endpoints
  SCHEDULES_SEARCH: '/schedules/search',
  SCHEDULES_LIST: '/schedules',
  
  // Booking endpoints
  BOOKINGS_CREATE: '/bookings',
  BOOKINGS_LIST: '/bookings',
  BOOKINGS_CANCEL: '/bookings/cancel',
  BOOKINGS_USER: '/bookings/user',
  
  // Admin endpoints
  ADMIN_LOGIN: '/admin/login',
  ADMIN_LOGOUT: '/admin/logout',
  ADMIN_PROFILE: '/admin/profile',
  ADMIN_DASHBOARD: '/admin/dashboard-stats',
  ADMIN_USERS: '/admin/users',

  // Maintenance endpoints
  MAINTENANCE_LIST: '/maintenance',
  MAINTENANCE_CREATE: '/maintenance',
  MAINTENANCE_UPDATE: '/maintenance',
  MAINTENANCE_DELETE: '/maintenance',

  // Feedback endpoints
  FEEDBACK_LIST: '/feedback',
  FEEDBACK_STATS: '/feedback/statistics',

  // Refund endpoints
  REFUNDS_LIST: '/refunds',
  REFUNDS_UPDATE_STATUS: '/refunds',
};

// HTTP client configuration
export const apiClient = {
  baseURL: API_BASE_URL,
  
  // Generic request method
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      credentials: 'include', // Include cookies for session management
      ...options,
    };

    if (config.body && typeof config.body === 'object') {
      config.body = JSON.stringify(config.body);
    }

    try {
      const response = await fetch(url, config);
      
      // Handle non-JSON responses
      const contentType = response.headers.get('content-type');
      let data;
      
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        data = await response.text();
      }

      if (!response.ok) {
        throw new Error(data.message || data || `HTTP error! status: ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  },

  // HTTP methods
  get(endpoint, options = {}) {
    return this.request(endpoint, { ...options, method: 'GET' });
  },

  post(endpoint, data, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: 'POST',
      body: data,
    });
  },

  put(endpoint, data, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: 'PUT',
      body: data,
    });
  },

  delete(endpoint, options = {}) {
    return this.request(endpoint, { ...options, method: 'DELETE' });
  },
};

export default apiClient;
