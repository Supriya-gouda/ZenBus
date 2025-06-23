const db = require('../db/connection');

class Feedback {
  // Create new feedback
  static async create(userId, bookingId, rating, comments) {
    try {
      const [result] = await db.execute(
        'INSERT INTO feedback (user_id, booking_id, rating, comments) VALUES (?, ?, ?, ?)',
        [userId, bookingId, rating, comments]
      );
      
      return { 
        feedbackId: result.insertId, 
        userId, 
        bookingId, 
        rating, 
        comments 
      };
    } catch (error) {
      throw error;
    }
  }
  
  // Get all feedback
  static async getAll() {
    try {
      const [feedback] = await db.execute(`
        SELECT f.*, u.full_name as user_name, 
               b.booking_id, b.journey_date,
               r.source, r.destination
        FROM feedback f
        JOIN users u ON f.user_id = u.user_id
        LEFT JOIN bookings b ON f.booking_id = b.booking_id
        LEFT JOIN bus_schedules bs ON b.schedule_id = bs.schedule_id
        LEFT JOIN routes r ON bs.route_id = r.route_id
        ORDER BY f.feedback_date DESC
      `);
      
      return feedback;
    } catch (error) {
      throw error;
    }
  }
  
  // Get feedback by user ID
  static async getByUserId(userId) {
    try {
      const [feedback] = await db.execute(`
        SELECT f.*, b.booking_id, b.journey_date,
               r.source, r.destination
        FROM feedback f
        LEFT JOIN bookings b ON f.booking_id = b.booking_id
        LEFT JOIN bus_schedules bs ON b.schedule_id = bs.schedule_id
        LEFT JOIN routes r ON bs.route_id = r.route_id
        WHERE f.user_id = ?
        ORDER BY f.feedback_date DESC
      `, [userId]);
      
      return feedback;
    } catch (error) {
      throw error;
    }
  }
  
  // Get feedback by ID
  static async getById(feedbackId) {
    try {
      const [feedback] = await db.execute(
        'SELECT * FROM feedback WHERE feedback_id = ?',
        [feedbackId]
      );

      return feedback.length > 0 ? feedback[0] : null;
    } catch (error) {
      throw error;
    }
  }

  // Update feedback
  static async update(feedbackId, rating, comments) {
    try {
      await db.execute(
        'UPDATE feedback SET rating = ?, comments = ? WHERE feedback_id = ?',
        [rating, comments, feedbackId]
      );

      return { feedbackId, rating, comments };
    } catch (error) {
      throw error;
    }
  }

  // Delete feedback
  static async delete(feedbackId) {
    try {
      await db.execute('DELETE FROM feedback WHERE feedback_id = ?', [feedbackId]);
      return true;
    } catch (error) {
      throw error;
    }
  }

  // Get feedback statistics
  static async getStatistics() {
    try {
      const [stats] = await db.execute(`
        SELECT
          COUNT(*) as total_feedback,
          AVG(rating) as average_rating,
          COUNT(CASE WHEN rating = 5 THEN 1 END) as five_star,
          COUNT(CASE WHEN rating = 4 THEN 1 END) as four_star,
          COUNT(CASE WHEN rating = 3 THEN 1 END) as three_star,
          COUNT(CASE WHEN rating = 2 THEN 1 END) as two_star,
          COUNT(CASE WHEN rating = 1 THEN 1 END) as one_star
        FROM feedback
      `);

      return stats[0];
    } catch (error) {
      throw error;
    }
  }

  // Add response to feedback
  static async addResponse(feedbackId, response) {
    try {
      await db.execute(`
        UPDATE feedback
        SET admin_response = ?, response_date = CURRENT_TIMESTAMP
        WHERE feedback_id = ?
      `, [response, feedbackId]);

      return { feedbackId, response };
    } catch (error) {
      throw error;
    }
  }

  // Get feedback with filters
  static async getWithFilters(filters = {}) {
    try {
      let query = `
        SELECT f.*, u.full_name as user_name, u.email as user_email,
               b.booking_id, bs.departure_time, r.source, r.destination
        FROM feedback f
        JOIN users u ON f.user_id = u.user_id
        LEFT JOIN bookings b ON f.booking_id = b.booking_id
        LEFT JOIN bus_schedules bs ON b.schedule_id = bs.schedule_id
        LEFT JOIN routes r ON bs.route_id = r.route_id
      `;
      let params = [];
      let conditions = [];

      if (filters.rating) {
        conditions.push('f.rating = ?');
        params.push(filters.rating);
      }

      if (filters.hasResponse === 'true') {
        conditions.push('f.admin_response IS NOT NULL');
      } else if (filters.hasResponse === 'false') {
        conditions.push('f.admin_response IS NULL');
      }

      if (filters.dateRange) {
        const [startDate, endDate] = filters.dateRange.split(',');
        conditions.push('DATE(f.feedback_date) BETWEEN ? AND ?');
        params.push(startDate, endDate);
      }

      if (conditions.length > 0) {
        query += ' WHERE ' + conditions.join(' AND ');
      }

      query += ' ORDER BY f.feedback_date DESC';

      const [feedback] = await db.execute(query, params);
      return feedback;
    } catch (error) {
      throw error;
    }
  }

  // Get user's feedback with admin responses
  static async getUserFeedback(userId) {
    try {
      const [feedback] = await db.execute(`
        SELECT f.feedback_id, f.booking_id, f.rating, f.comments, f.feedback_date,
               f.admin_response, f.response_date,
               b.journey_date, r.source, r.destination,
               bs.departure_time, bs.arrival_time
        FROM feedback f
        LEFT JOIN bookings b ON f.booking_id = b.booking_id
        LEFT JOIN bus_schedules bs ON b.schedule_id = bs.schedule_id
        LEFT JOIN routes r ON bs.route_id = r.route_id
        WHERE f.user_id = ?
        ORDER BY f.feedback_date DESC
      `, [userId]);

      return feedback;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = Feedback;