const db = require('../db/connection');

class Passenger {
  // Get all passengers with booking information
  static async getAll(filters = {}) {
    try {
      let query = `
        SELECT u.*, 
               COUNT(DISTINCT b.booking_id) as total_bookings,
               COUNT(DISTINCT CASE WHEN b.booking_status = 'Confirmed' THEN b.booking_id END) as confirmed_bookings,
               COUNT(DISTINCT CASE WHEN b.booking_status = 'Cancelled' THEN b.booking_id END) as cancelled_bookings,
               SUM(CASE WHEN b.booking_status = 'Confirmed' THEN b.total_fare ELSE 0 END) as total_spent,
               MAX(b.booking_date) as last_booking_date,
               AVG(f.rating) as average_rating
        FROM users u
        LEFT JOIN bookings b ON u.user_id = b.user_id
        LEFT JOIN feedback f ON b.booking_id = f.booking_id
      `;
      
      const conditions = [];
      const params = [];
      
      if (filters.search) {
        conditions.push('(u.full_name LIKE ? OR u.email LIKE ? OR u.phone LIKE ?)');
        params.push(`%${filters.search}%`, `%${filters.search}%`, `%${filters.search}%`);
      }
      
      if (filters.status) {
        if (filters.status === 'active') {
          conditions.push('u.created_at >= DATE_SUB(NOW(), INTERVAL 6 MONTH)');
        } else if (filters.status === 'inactive') {
          conditions.push('u.created_at < DATE_SUB(NOW(), INTERVAL 6 MONTH)');
        }
      }
      
      if (conditions.length > 0) {
        query += ' WHERE ' + conditions.join(' AND ');
      }
      
      query += `
        GROUP BY u.user_id
        ORDER BY u.created_at DESC
      `;
      
      const [passengers] = await db.execute(query, params);
      return passengers;
    } catch (error) {
      throw error;
    }
  }

  // Get passenger by ID with detailed information
  static async getById(userId) {
    try {
      const [passengers] = await db.execute(`
        SELECT u.*, 
               COUNT(DISTINCT b.booking_id) as total_bookings,
               COUNT(DISTINCT CASE WHEN b.booking_status = 'Confirmed' THEN b.booking_id END) as confirmed_bookings,
               COUNT(DISTINCT CASE WHEN b.booking_status = 'Cancelled' THEN b.booking_id END) as cancelled_bookings,
               SUM(CASE WHEN b.booking_status = 'Confirmed' THEN b.total_fare ELSE 0 END) as total_spent,
               MAX(b.booking_date) as last_booking_date,
               AVG(f.rating) as average_rating
        FROM users u
        LEFT JOIN bookings b ON u.user_id = b.user_id
        LEFT JOIN feedback f ON b.booking_id = f.booking_id
        WHERE u.user_id = ?
        GROUP BY u.user_id
      `, [userId]);
      
      return passengers.length > 0 ? passengers[0] : null;
    } catch (error) {
      throw error;
    }
  }

  // Get passenger booking history
  static async getBookingHistory(userId, limit = 20, offset = 0) {
    try {
      const [bookings] = await db.execute(`
        SELECT b.*, bs.departure_time, bs.arrival_time, bs.fare,
               r.source, r.destination, r.distance,
               bus.bus_number, bus.bus_type,
               p.payment_status, p.payment_method,
               f.rating, f.comments as feedback_comments
        FROM bookings b
        JOIN bus_schedules bs ON b.schedule_id = bs.schedule_id
        JOIN routes r ON bs.route_id = r.route_id
        JOIN buses bus ON bs.bus_id = bus.bus_id
        LEFT JOIN payments p ON b.booking_id = p.booking_id
        LEFT JOIN feedback f ON b.booking_id = f.booking_id
        WHERE b.user_id = ?
        ORDER BY b.booking_date DESC
        LIMIT ? OFFSET ?
      `, [userId, limit, offset]);
      
      return bookings;
    } catch (error) {
      throw error;
    }
  }

  // Get passenger travel preferences
  static async getTravelPreferences(userId) {
    try {
      const [preferences] = await db.execute(`
        SELECT 
          r.source as preferred_source,
          r.destination as preferred_destination,
          COUNT(*) as frequency,
          AVG(b.total_fare) as average_fare,
          bus.bus_type as preferred_bus_type
        FROM bookings b
        JOIN bus_schedules bs ON b.schedule_id = bs.schedule_id
        JOIN routes r ON bs.route_id = r.route_id
        JOIN buses bus ON bs.bus_id = bus.bus_id
        WHERE b.user_id = ? AND b.booking_status = 'Confirmed'
        GROUP BY r.source, r.destination, bus.bus_type
        ORDER BY frequency DESC
        LIMIT 5
      `, [userId]);
      
      return preferences;
    } catch (error) {
      throw error;
    }
  }

  // Update passenger information
  static async update(userId, passengerData) {
    try {
      const { full_name, email, phone } = passengerData;
      
      await db.execute(`
        UPDATE users 
        SET full_name = ?, email = ?, phone = ?
        WHERE user_id = ?
      `, [full_name, email, phone, userId]);
      
      return { user_id: userId, ...passengerData };
    } catch (error) {
      throw error;
    }
  }

  // Deactivate passenger account
  static async deactivate(userId) {
    try {
      // Check for upcoming bookings
      const [upcomingBookings] = await db.execute(`
        SELECT COUNT(*) as count
        FROM bookings b
        JOIN bus_schedules bs ON b.schedule_id = bs.schedule_id
        WHERE b.user_id = ? 
        AND b.booking_status = 'Confirmed'
        AND bs.departure_time > NOW()
      `, [userId]);
      
      if (upcomingBookings[0].count > 0) {
        throw new Error('Cannot deactivate account with upcoming bookings');
      }
      
      // For now, we'll just mark with a flag or delete - depending on business logic
      // Here we'll add a status field approach
      await db.execute(`
        UPDATE users 
        SET email = CONCAT('deactivated_', user_id, '_', email)
        WHERE user_id = ?
      `, [userId]);
      
      return true;
    } catch (error) {
      throw error;
    }
  }

  // Get passenger statistics
  static async getStatistics() {
    try {
      const [stats] = await db.execute(`
        SELECT 
          COUNT(DISTINCT u.user_id) as total_passengers,
          COUNT(DISTINCT CASE WHEN u.created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY) THEN u.user_id END) as new_passengers_month,
          COUNT(DISTINCT CASE WHEN b.booking_date >= DATE_SUB(NOW(), INTERVAL 30 DAY) THEN u.user_id END) as active_passengers_month,
          AVG(passenger_stats.total_bookings) as avg_bookings_per_passenger,
          AVG(passenger_stats.total_spent) as avg_spent_per_passenger
        FROM users u
        LEFT JOIN bookings b ON u.user_id = b.user_id
        LEFT JOIN (
          SELECT 
            user_id,
            COUNT(*) as total_bookings,
            SUM(total_fare) as total_spent
          FROM bookings
          WHERE booking_status = 'Confirmed'
          GROUP BY user_id
        ) passenger_stats ON u.user_id = passenger_stats.user_id
      `);
      
      return stats[0];
    } catch (error) {
      throw error;
    }
  }

  // Get top passengers by spending
  static async getTopPassengers(limit = 10) {
    try {
      const [passengers] = await db.execute(`
        SELECT u.*, 
               COUNT(b.booking_id) as total_bookings,
               SUM(b.total_fare) as total_spent,
               AVG(f.rating) as average_rating
        FROM users u
        JOIN bookings b ON u.user_id = b.user_id
        LEFT JOIN feedback f ON b.booking_id = f.booking_id
        WHERE b.booking_status = 'Confirmed'
        GROUP BY u.user_id
        ORDER BY total_spent DESC
        LIMIT ?
      `, [limit]);
      
      return passengers;
    } catch (error) {
      throw error;
    }
  }

  // Get passenger analytics for a date range
  static async getAnalytics(startDate, endDate) {
    try {
      const [analytics] = await db.execute(`
        SELECT 
          DATE(b.booking_date) as booking_date,
          COUNT(DISTINCT b.user_id) as unique_passengers,
          COUNT(b.booking_id) as total_bookings,
          SUM(b.total_fare) as total_revenue,
          AVG(b.total_fare) as average_booking_value
        FROM bookings b
        WHERE DATE(b.booking_date) BETWEEN ? AND ?
        AND b.booking_status = 'Confirmed'
        GROUP BY DATE(b.booking_date)
        ORDER BY booking_date ASC
      `, [startDate, endDate]);
      
      return analytics;
    } catch (error) {
      throw error;
    }
  }

  // Get frequent travelers
  static async getFrequentTravelers(minBookings = 5) {
    try {
      const [travelers] = await db.execute(`
        SELECT u.*, 
               COUNT(b.booking_id) as total_bookings,
               SUM(b.total_fare) as total_spent,
               MIN(b.booking_date) as first_booking,
               MAX(b.booking_date) as last_booking,
               AVG(f.rating) as average_rating
        FROM users u
        JOIN bookings b ON u.user_id = b.user_id
        LEFT JOIN feedback f ON b.booking_id = f.booking_id
        WHERE b.booking_status = 'Confirmed'
        GROUP BY u.user_id
        HAVING total_bookings >= ?
        ORDER BY total_bookings DESC
      `, [minBookings]);
      
      return travelers;
    } catch (error) {
      throw error;
    }
  }

  // Search passengers
  static async search(searchTerm, limit = 20) {
    try {
      const [passengers] = await db.execute(`
        SELECT u.*,
               COUNT(b.booking_id) as total_bookings,
               SUM(CASE WHEN b.booking_status = 'Confirmed' THEN b.total_fare ELSE 0 END) as total_spent
        FROM users u
        LEFT JOIN bookings b ON u.user_id = b.user_id
        WHERE u.full_name LIKE ? OR u.email LIKE ? OR u.phone LIKE ?
        GROUP BY u.user_id
        ORDER BY u.full_name ASC
        LIMIT ?
      `, [`%${searchTerm}%`, `%${searchTerm}%`, `%${searchTerm}%`, limit]);

      return passengers;
    } catch (error) {
      throw error;
    }
  }

  // Block passenger account
  static async blockAccount(passengerId, reason) {
    try {
      await db.execute(`
        UPDATE users
        SET account_status = 'Blocked',
            blocked_reason = ?,
            blocked_date = CURRENT_TIMESTAMP
        WHERE user_id = ?
      `, [reason, passengerId]);

      return { passengerId, status: 'Blocked', reason };
    } catch (error) {
      throw error;
    }
  }

  // Unblock passenger account
  static async unblockAccount(passengerId) {
    try {
      await db.execute(`
        UPDATE users
        SET account_status = 'Active',
            blocked_reason = NULL,
            blocked_date = NULL,
            unblocked_date = CURRENT_TIMESTAMP
        WHERE user_id = ?
      `, [passengerId]);

      return { passengerId, status: 'Active' };
    } catch (error) {
      throw error;
    }
  }
}

module.exports = Passenger;
