const db = require('../db/connection');

class Payment {
  // Get all payments with booking information
  static async getAll(filters = {}) {
    try {
      let query = `
        SELECT p.*, b.booking_id, b.user_id, b.journey_date, b.total_seats,
               u.full_name as user_name, u.email as user_email,
               r.source, r.destination,
               bus.bus_number
        FROM payments p
        JOIN bookings b ON p.booking_id = b.booking_id
        JOIN users u ON b.user_id = u.user_id
        JOIN bus_schedules bs ON b.schedule_id = bs.schedule_id
        JOIN routes r ON bs.route_id = r.route_id
        JOIN buses bus ON bs.bus_id = bus.bus_id
      `;
      
      const conditions = [];
      const params = [];
      
      if (filters.status) {
        conditions.push('p.payment_status = ?');
        params.push(filters.status);
      }
      
      if (filters.method) {
        conditions.push('p.payment_method = ?');
        params.push(filters.method);
      }
      
      if (filters.startDate && filters.endDate) {
        conditions.push('DATE(p.payment_date) BETWEEN ? AND ?');
        params.push(filters.startDate, filters.endDate);
      }
      
      if (filters.userId) {
        conditions.push('b.user_id = ?');
        params.push(filters.userId);
      }
      
      if (conditions.length > 0) {
        query += ' WHERE ' + conditions.join(' AND ');
      }
      
      query += ' ORDER BY p.payment_date DESC';
      
      const [payments] = await db.execute(query, params);
      return payments;
    } catch (error) {
      throw error;
    }
  }

  // Get payment by ID
  static async getById(paymentId) {
    try {
      const [payments] = await db.execute(`
        SELECT p.*, b.booking_id, b.user_id, b.journey_date, b.total_seats, b.seat_numbers,
               u.full_name as user_name, u.email as user_email, u.phone as user_phone,
               r.source, r.destination,
               bus.bus_number, bus.bus_type,
               bs.departure_time, bs.arrival_time
        FROM payments p
        JOIN bookings b ON p.booking_id = b.booking_id
        JOIN users u ON b.user_id = u.user_id
        JOIN bus_schedules bs ON b.schedule_id = bs.schedule_id
        JOIN routes r ON bs.route_id = r.route_id
        JOIN buses bus ON bs.bus_id = bus.bus_id
        WHERE p.payment_id = ?
      `, [paymentId]);
      
      return payments.length > 0 ? payments[0] : null;
    } catch (error) {
      throw error;
    }
  }

  // Create new payment
  static async create(paymentData) {
    try {
      const { booking_id, amount, payment_method, transaction_id, payment_status = 'Success' } = paymentData;
      
      const [result] = await db.execute(`
        INSERT INTO payments (booking_id, amount, payment_method, transaction_id, payment_status)
        VALUES (?, ?, ?, ?, ?)
      `, [booking_id, amount, payment_method, transaction_id, payment_status]);
      
      return { payment_id: result.insertId, ...paymentData };
    } catch (error) {
      throw error;
    }
  }

  // Update payment status
  static async updateStatus(paymentId, status, transactionId = null) {
    try {
      await db.execute(`
        UPDATE payments 
        SET payment_status = ?, transaction_id = COALESCE(?, transaction_id)
        WHERE payment_id = ?
      `, [status, transactionId, paymentId]);
      
      return { payment_id: paymentId, payment_status: status };
    } catch (error) {
      throw error;
    }
  }

  // Get payment statistics
  static async getStatistics(startDate = null, endDate = null) {
    try {
      let query = `
        SELECT 
          COUNT(*) as total_payments,
          COUNT(CASE WHEN payment_status = 'Success' THEN 1 END) as successful_payments,
          COUNT(CASE WHEN payment_status = 'Failed' THEN 1 END) as failed_payments,
          COUNT(CASE WHEN payment_status = 'Pending' THEN 1 END) as pending_payments,
          SUM(CASE WHEN payment_status = 'Success' THEN amount ELSE 0 END) as total_revenue,
          AVG(CASE WHEN payment_status = 'Success' THEN amount ELSE NULL END) as average_payment,
          COUNT(DISTINCT CASE WHEN payment_status = 'Success' THEN payment_method END) as payment_methods_used
        FROM payments p
      `;
      
      const params = [];
      
      if (startDate && endDate) {
        query += ' WHERE DATE(p.payment_date) BETWEEN ? AND ?';
        params.push(startDate, endDate);
      }
      
      const [stats] = await db.execute(query, params);
      return stats[0];
    } catch (error) {
      throw error;
    }
  }

  // Get payment methods breakdown
  static async getPaymentMethodsBreakdown(startDate = null, endDate = null) {
    try {
      let query = `
        SELECT 
          payment_method,
          COUNT(*) as transaction_count,
          SUM(amount) as total_amount,
          AVG(amount) as average_amount,
          COUNT(CASE WHEN payment_status = 'Success' THEN 1 END) as successful_count,
          COUNT(CASE WHEN payment_status = 'Failed' THEN 1 END) as failed_count
        FROM payments
      `;
      
      const params = [];
      
      if (startDate && endDate) {
        query += ' WHERE DATE(payment_date) BETWEEN ? AND ?';
        params.push(startDate, endDate);
      }
      
      query += ' GROUP BY payment_method ORDER BY total_amount DESC';
      
      const [breakdown] = await db.execute(query, params);
      return breakdown;
    } catch (error) {
      throw error;
    }
  }

  // Get daily revenue report
  static async getDailyRevenue(startDate, endDate) {
    try {
      const [revenue] = await db.execute(`
        SELECT 
          DATE(payment_date) as payment_date,
          COUNT(*) as transaction_count,
          SUM(CASE WHEN payment_status = 'Success' THEN amount ELSE 0 END) as total_revenue,
          COUNT(CASE WHEN payment_status = 'Success' THEN 1 END) as successful_transactions,
          COUNT(CASE WHEN payment_status = 'Failed' THEN 1 END) as failed_transactions
        FROM payments
        WHERE DATE(payment_date) BETWEEN ? AND ?
        GROUP BY DATE(payment_date)
        ORDER BY payment_date ASC
      `, [startDate, endDate]);
      
      return revenue;
    } catch (error) {
      throw error;
    }
  }

  // Get failed payments for retry
  static async getFailedPayments(limit = 50) {
    try {
      const [payments] = await db.execute(`
        SELECT p.*, b.booking_id, u.full_name as user_name, u.email as user_email,
               r.source, r.destination, bs.departure_time
        FROM payments p
        JOIN bookings b ON p.booking_id = b.booking_id
        JOIN users u ON b.user_id = u.user_id
        JOIN bus_schedules bs ON b.schedule_id = bs.schedule_id
        JOIN routes r ON bs.route_id = r.route_id
        WHERE p.payment_status = 'Failed'
        AND bs.departure_time > NOW()
        ORDER BY p.payment_date DESC
        LIMIT ?
      `, [limit]);
      
      return payments;
    } catch (error) {
      throw error;
    }
  }
}

class Refund {
  // Get all refunds
  static async getAll(filters = {}) {
    try {
      let query = `
        SELECT rf.*, p.payment_method, p.transaction_id as original_transaction_id,
               b.booking_id, b.user_id, b.journey_date, b.total_fare,
               u.full_name as user_name, u.email as user_email,
               r.source, r.destination
        FROM refunds rf
        JOIN payments p ON rf.payment_id = p.payment_id
        JOIN bookings b ON rf.booking_id = b.booking_id
        JOIN users u ON b.user_id = u.user_id
        JOIN bus_schedules bs ON b.schedule_id = bs.schedule_id
        JOIN routes r ON bs.route_id = r.route_id
      `;
      
      const conditions = [];
      const params = [];
      
      if (filters.status) {
        conditions.push('rf.refund_status = ?');
        params.push(filters.status);
      }
      
      if (filters.startDate && filters.endDate) {
        conditions.push('DATE(rf.refund_date) BETWEEN ? AND ?');
        params.push(filters.startDate, filters.endDate);
      }
      
      if (conditions.length > 0) {
        query += ' WHERE ' + conditions.join(' AND ');
      }
      
      query += ' ORDER BY rf.refund_date DESC';
      
      const [refunds] = await db.execute(query, params);
      return refunds;
    } catch (error) {
      throw error;
    }
  }

  // Get refund by ID
  static async getById(refundId) {
    try {
      const [refunds] = await db.execute(`
        SELECT rf.*, p.payment_method, p.transaction_id as original_transaction_id,
               b.booking_id, b.user_id, b.journey_date, b.total_fare, b.seat_numbers,
               u.full_name as user_name, u.email as user_email, u.phone as user_phone,
               r.source, r.destination,
               bus.bus_number, bs.departure_time
        FROM refunds rf
        JOIN payments p ON rf.payment_id = p.payment_id
        JOIN bookings b ON rf.booking_id = b.booking_id
        JOIN users u ON b.user_id = u.user_id
        JOIN bus_schedules bs ON b.schedule_id = bs.schedule_id
        JOIN routes r ON bs.route_id = r.route_id
        JOIN buses bus ON bs.bus_id = bus.bus_id
        WHERE rf.refund_id = ?
      `, [refundId]);
      
      return refunds.length > 0 ? refunds[0] : null;
    } catch (error) {
      throw error;
    }
  }

  // Create new refund
  static async create(refundData) {
    try {
      const { booking_id, payment_id, refund_amount, refund_reason, refund_method = 'Original Payment Method' } = refundData;
      
      const [result] = await db.execute(`
        INSERT INTO refunds (booking_id, payment_id, refund_amount, refund_reason, refund_method, refund_status)
        VALUES (?, ?, ?, ?, ?, 'Pending')
      `, [booking_id, payment_id, refund_amount, refund_reason, refund_method]);
      
      return { refund_id: result.insertId, ...refundData, refund_status: 'Pending' };
    } catch (error) {
      throw error;
    }
  }

  // Process refund
  static async process(refundId, transactionId = null) {
    try {
      const processedDate = new Date();
      
      await db.execute(`
        UPDATE refunds 
        SET refund_status = 'Processed', 
            processed_date = ?, 
            refund_transaction_id = ?
        WHERE refund_id = ?
      `, [processedDate, transactionId, refundId]);
      
      return { refund_id: refundId, refund_status: 'Processed', processed_date: processedDate };
    } catch (error) {
      throw error;
    }
  }

  // Get pending refunds
  static async getPending() {
    try {
      const [refunds] = await db.execute(`
        SELECT rf.*, p.payment_method,
               b.booking_id, b.total_fare,
               u.full_name as user_name, u.email as user_email,
               r.source, r.destination, bs.departure_time
        FROM refunds rf
        JOIN payments p ON rf.payment_id = p.payment_id
        JOIN bookings b ON rf.booking_id = b.booking_id
        JOIN users u ON b.user_id = u.user_id
        JOIN bus_schedules bs ON b.schedule_id = bs.schedule_id
        JOIN routes r ON bs.route_id = r.route_id
        WHERE rf.refund_status = 'Pending'
        ORDER BY rf.refund_date ASC
      `);
      
      return refunds;
    } catch (error) {
      throw error;
    }
  }

  // Get refund statistics
  static async getStatistics(startDate = null, endDate = null) {
    try {
      let query = `
        SELECT 
          COUNT(*) as total_refunds,
          COUNT(CASE WHEN refund_status = 'Pending' THEN 1 END) as pending_refunds,
          COUNT(CASE WHEN refund_status = 'Processed' THEN 1 END) as processed_refunds,
          COUNT(CASE WHEN refund_status = 'Failed' THEN 1 END) as failed_refunds,
          SUM(refund_amount) as total_refund_amount,
          AVG(refund_amount) as average_refund_amount
        FROM refunds
      `;
      
      const params = [];
      
      if (startDate && endDate) {
        query += ' WHERE DATE(refund_date) BETWEEN ? AND ?';
        params.push(startDate, endDate);
      }
      
      const [stats] = await db.execute(query, params);
      return stats[0];
    } catch (error) {
      throw error;
    }
  }
}

module.exports = { Payment, Refund };
