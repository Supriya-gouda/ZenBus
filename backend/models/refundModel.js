const db = require('../db/connection');

class Refund {
  // Create new refund
  static async create(bookingId, paymentId, refundAmount, refundReason = 'User cancellation') {
    try {
      const connection = await db.getConnection();
      
      try {
        await connection.beginTransaction();
        
        // Create refund record
        const [refundResult] = await connection.execute(
          `INSERT INTO refunds 
           (booking_id, payment_id, refund_amount, refund_reason, refund_status, refund_transaction_id) 
           VALUES (?, ?, ?, ?, 'Pending', CONCAT('REF', FLOOR(RAND() * 1000000000)))`,
          [bookingId, paymentId, refundAmount, refundReason]
        );
        
        const refundId = refundResult.insertId;
        
        // In a real system, you would integrate with payment gateway here
        // For now, we'll simulate immediate processing
        await connection.execute(
          `UPDATE refunds 
           SET refund_status = 'Processed', processed_date = CURRENT_TIMESTAMP 
           WHERE refund_id = ?`,
          [refundId]
        );
        
        await connection.commit();
        
        return { refundId, bookingId, paymentId, refundAmount, refundReason };
      } catch (error) {
        await connection.rollback();
        throw error;
      } finally {
        connection.release();
      }
    } catch (error) {
      throw error;
    }
  }
  
  // Get refund by booking ID
  static async getByBookingId(bookingId) {
    try {
      const [refunds] = await db.execute(`
        SELECT r.*, p.payment_method, p.transaction_id as original_transaction_id
        FROM refunds r
        LEFT JOIN payments p ON r.payment_id = p.payment_id
        WHERE r.booking_id = ?
        ORDER BY r.refund_date DESC
      `, [bookingId]);
      
      return refunds;
    } catch (error) {
      throw error;
    }
  }
  
  // Get refund by ID
  static async getById(refundId) {
    try {
      const [refunds] = await db.execute(`
        SELECT r.*, p.payment_method, p.transaction_id as original_transaction_id,
               b.total_fare, b.booking_status
        FROM refunds r
        LEFT JOIN payments p ON r.payment_id = p.payment_id
        LEFT JOIN bookings b ON r.booking_id = b.booking_id
        WHERE r.refund_id = ?
      `, [refundId]);
      
      if (refunds.length === 0) {
        return null;
      }
      
      return refunds[0];
    } catch (error) {
      throw error;
    }
  }
  
  // Get all refunds (admin)
  static async getAll() {
    try {
      const [refunds] = await db.execute(`
        SELECT r.*, p.payment_method, p.transaction_id as original_transaction_id,
               b.total_fare, b.booking_status, u.full_name as user_name, u.email
        FROM refunds r
        LEFT JOIN payments p ON r.payment_id = p.payment_id
        LEFT JOIN bookings b ON r.booking_id = b.booking_id
        LEFT JOIN users u ON b.user_id = u.user_id
        ORDER BY r.refund_date DESC
      `);
      
      return refunds;
    } catch (error) {
      throw error;
    }
  }
  
  // Calculate refund amount based on cancellation policy
  static calculateRefundAmount(totalFare, departureTime, cancellationTime = new Date()) {
    const serviceFee = 2.50;
    const baseFare = totalFare - serviceFee;
    
    // Calculate hours until departure
    const hoursUntilDeparture = (new Date(departureTime) - cancellationTime) / (1000 * 60 * 60);
    
    if (hoursUntilDeparture < 2) {
      // No refund if cancelled less than 2 hours before departure
      return {
        refundAmount: 0,
        refundPercentage: 0,
        reason: 'Cancellation too close to departure time (less than 2 hours)'
      };
    } else if (hoursUntilDeparture < 24) {
      // 50% refund if cancelled less than 24 hours before departure
      return {
        refundAmount: baseFare * 0.5,
        refundPercentage: 50,
        reason: 'Cancellation within 24 hours of departure'
      };
    } else {
      // Full refund (minus service fee) if cancelled more than 24 hours before departure
      return {
        refundAmount: baseFare,
        refundPercentage: 100,
        reason: 'Cancellation more than 24 hours before departure'
      };
    }
  }
  
  // Update refund status
  static async updateStatus(refundId, status, transactionId = null) {
    try {
      const updateFields = ['refund_status = ?'];
      const updateValues = [status];
      
      if (status === 'Processed') {
        updateFields.push('processed_date = CURRENT_TIMESTAMP');
      }
      
      if (transactionId) {
        updateFields.push('refund_transaction_id = ?');
        updateValues.push(transactionId);
      }
      
      updateValues.push(refundId);
      
      await db.execute(
        `UPDATE refunds SET ${updateFields.join(', ')} WHERE refund_id = ?`,
        updateValues
      );
      
      return true;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = Refund;
