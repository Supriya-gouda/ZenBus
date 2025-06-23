const db = require('../db/connection');
const bcrypt = require('bcrypt');

class Admin {
  // Login admin
  static async login(username, password) {
    try {
      // Find admin by username
      const [admins] = await db.execute('SELECT * FROM admins WHERE username = ?', [username]);
      
      if (admins.length === 0) {
        return null;
      }
      
      const admin = admins[0];
      
      // Compare password
      const isPasswordValid = await bcrypt.compare(password, admin.password);
      
      if (!isPasswordValid) {
        return null;
      }
      
      return {
        adminId: admin.admin_id,
        username: admin.username,
        fullName: admin.full_name
      };
    } catch (error) {
      throw error;
    }
  }
  
  // Get admin by ID
  static async getById(adminId) {
    try {
      const [admins] = await db.execute('SELECT admin_id, username, full_name, created_at FROM admins WHERE admin_id = ?', [adminId]);

      if (admins.length === 0) {
        return null;
      }

      return admins[0];
    } catch (error) {
      throw error;
    }
  }

  // Get dashboard statistics
  static async getDashboardStats() {
    try {
      // Get total revenue
      const [revenueResult] = await db.execute(`
        SELECT
          COALESCE(SUM(CASE WHEN booking_status = 'Confirmed' THEN total_fare ELSE 0 END), 0) as total_revenue,
          COALESCE(SUM(CASE WHEN booking_status = 'Confirmed' AND MONTH(booking_date) = MONTH(CURDATE()) THEN total_fare ELSE 0 END), 0) as monthly_revenue,
          COUNT(CASE WHEN booking_status = 'Confirmed' THEN 1 END) as total_bookings,
          COUNT(CASE WHEN booking_status = 'Confirmed' AND DATE(booking_date) = CURDATE() THEN 1 END) as today_bookings
        FROM bookings
      `);

      // Get bus statistics
      const [busResult] = await db.execute(`
        SELECT
          COUNT(*) as total_buses,
          COUNT(CASE WHEN status = 'Active' THEN 1 END) as active_buses,
          COUNT(CASE WHEN status = 'Maintenance' THEN 1 END) as maintenance_buses
        FROM buses
      `);

      // Get route statistics
      const [routeResult] = await db.execute(`
        SELECT COUNT(*) as total_routes FROM routes
      `);

      // Get user statistics
      const [userResult] = await db.execute(`
        SELECT
          COUNT(*) as total_users,
          COUNT(CASE WHEN DATE(created_at) = CURDATE() THEN 1 END) as new_users_today
        FROM users
      `);

      // Get maintenance statistics
      const [maintenanceResult] = await db.execute(`
        SELECT
          COUNT(*) as total_maintenance,
          COUNT(CASE WHEN status = 'Scheduled' THEN 1 END) as scheduled_maintenance,
          COUNT(CASE WHEN status = 'In Progress' THEN 1 END) as ongoing_maintenance
        FROM maintenance
      `);

      return {
        revenue: revenueResult[0],
        buses: busResult[0],
        routes: routeResult[0],
        users: userResult[0],
        maintenance: maintenanceResult[0]
      };
    } catch (error) {
      throw error;
    }
  }

  // Get all users
  static async getAllUsers() {
    try {
      const [users] = await db.execute(`
        SELECT
          user_id,
          email,
          full_name,
          phone,
          created_at,
          status,
          (SELECT COUNT(*) FROM bookings WHERE bookings.user_id = users.user_id) as total_bookings,
          (SELECT COALESCE(SUM(total_fare), 0) FROM bookings WHERE bookings.user_id = users.user_id AND status = 'confirmed') as total_spent
        FROM users
        ORDER BY created_at DESC
      `);

      return users;
    } catch (error) {
      throw error;
    }
  }

  // Delete user and all their bookings
  static async deleteUser(userId) {
    const connection = await db.getConnection();

    try {
      // Start transaction
      await connection.beginTransaction();

      // Count data to be deleted for reporting
      const [bookingCount] = await connection.execute(
        'SELECT COUNT(*) as count FROM bookings WHERE user_id = ?',
        [userId]
      );

      const [feedbackCount] = await connection.execute(
        'SELECT COUNT(*) as count FROM feedback WHERE user_id = ?',
        [userId]
      );

      // Delete feedback related to user's bookings (if any feedback is linked via booking_id)
      await connection.execute(`
        DELETE f FROM feedback f
        INNER JOIN bookings b ON f.booking_id = b.booking_id
        WHERE b.user_id = ?
      `, [userId]);

      // Delete feedback directly linked to user (if any)
      await connection.execute('DELETE FROM feedback WHERE user_id = ?', [userId]);

      // Delete payments related to user's bookings (if payments table exists)
      try {
        await connection.execute(`
          DELETE p FROM payments p
          INNER JOIN bookings b ON p.booking_id = b.booking_id
          WHERE b.user_id = ?
        `, [userId]);
      } catch (paymentError) {
        // Payments table might not exist, continue
        console.log('Payments table not found, skipping payment deletion');
      }

      // Delete user's bookings
      await connection.execute('DELETE FROM bookings WHERE user_id = ?', [userId]);

      // Delete the user
      await connection.execute('DELETE FROM users WHERE user_id = ?', [userId]);

      // Commit transaction
      await connection.commit();

      return {
        deletedBookings: bookingCount[0].count,
        deletedFeedback: feedbackCount[0].count
      };
    } catch (error) {
      // Rollback transaction on error
      await connection.rollback();
      throw error;
    } finally {
      // Release connection
      connection.release();
    }
  }

  // Toggle user status (block/unblock)
  static async toggleUserStatus(userId, action) {
    try {
      const status = action === 'block' ? 'blocked' : 'active';

      await db.execute(
        'UPDATE users SET status = ? WHERE user_id = ?',
        [status, userId]
      );

      return { status };
    } catch (error) {
      throw error;
    }
  }
}

module.exports = Admin;