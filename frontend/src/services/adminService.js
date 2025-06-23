import { apiClient, API_ENDPOINTS } from '../config/api.js';

const adminService = {
  // Authentication
  async login(username, password) {
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

  async logout() {
    try {
      await apiClient.post('/admin/logout');
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  async getProfile() {
    try {
      const response = await apiClient.get('/admin/profile');
      return { success: true, admin: response.admin };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Dashboard Statistics
  async getDashboardStats() {
    try {
      const response = await apiClient.get('/admin/dashboard-stats');
      return { success: true, stats: response.stats };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Bus Management
  async getAllBuses() {
    try {
      const response = await apiClient.get('/buses');
      return { success: true, buses: response.buses };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  async getBusById(id) {
    try {
      const response = await apiClient.get(`/buses/${id}`);
      return { success: true, bus: response.bus };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  async createBus(busData) {
    try {
      const response = await apiClient.post('/buses', busData);
      return { success: true, bus: response.bus };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  async updateBus(id, busData) {
    try {
      const response = await apiClient.put(`/buses/${id}`, busData);
      return { success: true, bus: response.bus };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  async deleteBus(id) {
    try {
      await apiClient.delete(`/buses/${id}`);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Route Management
  async getAllRoutes() {
    try {
      const response = await apiClient.get('/routes');
      return { success: true, routes: response.routes };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  async createRoute(routeData) {
    try {
      const response = await apiClient.post('/routes', routeData);
      return { success: true, route: response.route };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  async updateRoute(id, routeData) {
    try {
      const response = await apiClient.put(`/routes/${id}`, routeData);
      return { success: true, route: response.route };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  async deleteRoute(id) {
    try {
      await apiClient.delete(`/routes/${id}`);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Schedule Management
  async getAllSchedules() {
    try {
      const response = await apiClient.get('/schedules');
      return { success: true, schedules: response.schedules };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  async createSchedule(scheduleData) {
    try {
      const response = await apiClient.post('/schedules', scheduleData);
      return { success: true, schedule: response.schedule };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  async updateSchedule(id, scheduleData) {
    try {
      const response = await apiClient.put(`/schedules/${id}`, scheduleData);
      return { success: true, schedule: response.schedule };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  async deleteSchedule(id) {
    try {
      await apiClient.delete(`/schedules/${id}`);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  async getScheduleConflicts() {
    try {
      const response = await apiClient.get('/schedules/admin/conflicts');
      return { success: true, conflicts: response.conflicts };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Booking Management
  async getAllBookings() {
    try {
      const response = await apiClient.get('/bookings');
      return { success: true, bookings: response.bookings };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  async getBookingsByDateRange(startDate, endDate) {
    try {
      const response = await apiClient.get(`/bookings/date-range?start=${startDate}&end=${endDate}`);
      return { success: true, bookings: response.bookings };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // User Management
  async getAllUsers() {
    try {
      const response = await apiClient.get('/admin/users');
      return { success: true, users: response.users };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Maintenance Management
  async getAllMaintenance() {
    try {
      const response = await apiClient.get('/maintenance');
      return { success: true, maintenance: response.maintenance };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  async createMaintenance(maintenanceData) {
    try {
      const response = await apiClient.post('/maintenance', maintenanceData);
      return { success: true, maintenance: response.maintenance };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  async updateMaintenance(id, maintenanceData) {
    try {
      const response = await apiClient.put(`/maintenance/${id}`, maintenanceData);
      return { success: true, maintenance: response.maintenance };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  async deleteMaintenance(id) {
    try {
      await apiClient.delete(`/maintenance/${id}`);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  async getMaintenanceStatistics() {
    try {
      const response = await apiClient.get('/maintenance/statistics');
      return { success: true, statistics: response.statistics };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Feedback Management
  async getAllFeedback() {
    try {
      const response = await apiClient.get('/feedback');
      return { success: true, feedback: response.feedback };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  async getFeedbackStatistics() {
    try {
      const response = await apiClient.get('/feedback/statistics');
      return { success: true, statistics: response.statistics };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  async respondToFeedback(id, responseData) {
    try {
      const response = await apiClient.post(`/feedback/${id}/respond`, responseData);
      return { success: true, feedback: response.feedback };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  async deleteFeedback(id) {
    try {
      await apiClient.delete(`/feedback/${id}`);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Refund Management
  async getAllRefunds() {
    try {
      const response = await apiClient.get('/refunds');
      return { success: true, refunds: response.refunds };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  async updateRefundStatus(id, status) {
    try {
      const response = await apiClient.put(`/refunds/${id}/status`, { status });
      return { success: true, refund: response.refund };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  async processRefund(id, actionData) {
    try {
      const response = await apiClient.put(`/refunds/${id}/process`, actionData);
      return { success: true, refund: response.refund };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Bus Stops Management
  async getAllBusStops() {
    try {
      const response = await apiClient.get('/bus-stops');
      return { success: true, stops: response.stops };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  async createBusStop(stopData) {
    try {
      const response = await apiClient.post('/bus-stops', stopData);
      return { success: true, stop: response.stop };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  async updateBusStop(id, stopData) {
    try {
      const response = await apiClient.put(`/bus-stops/${id}`, stopData);
      return { success: true, stop: response.stop };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  async deleteBusStop(id) {
    try {
      await apiClient.delete(`/bus-stops/${id}`);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Driver Management
  async getAllDrivers() {
    try {
      const response = await apiClient.get('/drivers');
      return { success: true, drivers: response.drivers };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  async createDriver(driverData) {
    try {
      const response = await apiClient.post('/drivers', driverData);
      return { success: true, driver: response.driver };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  async updateDriver(id, driverData) {
    try {
      const response = await apiClient.put(`/drivers/${id}`, driverData);
      return { success: true, driver: response.driver };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  async deleteDriver(id) {
    try {
      await apiClient.delete(`/drivers/${id}`);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Passenger Management
  async getAllPassengers() {
    try {
      const response = await apiClient.get('/passengers');
      return { success: true, passengers: response.passengers };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  async getPassengerBookingHistory(passengerId) {
    try {
      const response = await apiClient.get(`/passengers/${passengerId}/bookings`);
      return { success: true, bookings: response.bookings };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  async blockPassenger(passengerId, blockData) {
    try {
      const response = await apiClient.put(`/users/${passengerId}/block`, blockData);
      return { success: true, passenger: response.passenger };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  async unblockPassenger(passengerId) {
    try {
      const response = await apiClient.put(`/users/${passengerId}/unblock`);
      return { success: true, passenger: response.passenger };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Payment Management
  async getAllPayments() {
    try {
      const response = await apiClient.get('/payments');
      return { success: true, payments: response.payments };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  async getPaymentStatistics() {
    try {
      const response = await apiClient.get('/payments/statistics');
      return { success: true, statistics: response.statistics };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Bus Staff Management
  async getAllBusStaff() {
    try {
      const response = await apiClient.get('/bus-staff');
      return { success: true, staff: response.staff };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  async getBusStaffById(id) {
    try {
      const response = await apiClient.get(`/bus-staff/${id}`);
      return { success: true, staff: response.staff };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  async createBusStaff(staffData) {
    try {
      const response = await apiClient.post('/bus-staff', staffData);
      return { success: true, staff: response.staff };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  async updateBusStaff(id, staffData) {
    try {
      const response = await apiClient.put(`/bus-staff/${id}`, staffData);
      return { success: true, staff: response.staff };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  async deleteBusStaff(id) {
    try {
      await apiClient.delete(`/bus-staff/${id}`);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // User Deletion
  async deleteUser(userId) {
    try {
      const response = await apiClient.delete(`/admin/users/${userId}`);
      return { success: true, message: response.message };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Toggle User Status (Block/Unblock)
  async toggleUserStatus(userId, action) {
    try {
      const response = await apiClient.patch(`/admin/users/${userId}/status`, { action });
      return { success: true, message: response.message };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

};

export default adminService;
