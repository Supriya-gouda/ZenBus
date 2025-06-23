const Refund = require('../models/refundModel');
const Booking = require('../models/bookingModel');

// Create refund for cancelled booking
const createRefund = async (req, res) => {
  try {
    const { bookingId } = req.body;
    const userId = req.session.userId;
    const isAdmin = !!req.session.adminId;
    
    // Validate input
    if (!bookingId) {
      return res.status(400).json({ message: 'Booking ID is required' });
    }
    
    // Get booking details
    const booking = await Booking.getById(bookingId);
    
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }
    
    // Check if user is authorized
    if (!isAdmin && booking.user_id !== userId) {
      return res.status(403).json({ message: 'Not authorized to process refund for this booking' });
    }
    
    // Check if booking is cancelled
    if (booking.booking_status !== 'Cancelled') {
      return res.status(400).json({ message: 'Booking must be cancelled before processing refund' });
    }
    
    // Check if refund already exists
    const existingRefunds = await Refund.getByBookingId(bookingId);
    if (existingRefunds.length > 0) {
      return res.status(400).json({ message: 'Refund already processed for this booking' });
    }
    
    // Calculate refund amount
    const refundCalculation = Refund.calculateRefundAmount(
      booking.total_fare, 
      booking.departure_time,
      booking.cancellation_date || new Date()
    );
    
    if (refundCalculation.refundAmount <= 0) {
      return res.status(400).json({ 
        message: 'No refund available for this booking',
        reason: refundCalculation.reason
      });
    }
    
    // Get payment ID (assuming one payment per booking)
    const [payments] = await require('../db/connection').execute(
      'SELECT payment_id FROM payments WHERE booking_id = ? LIMIT 1',
      [bookingId]
    );
    
    if (payments.length === 0) {
      return res.status(404).json({ message: 'Payment record not found for this booking' });
    }
    
    const paymentId = payments[0].payment_id;
    
    // Create refund
    const refund = await Refund.create(
      bookingId, 
      paymentId, 
      refundCalculation.refundAmount,
      refundCalculation.reason
    );
    
    res.status(201).json({
      message: 'Refund processed successfully',
      refund: {
        ...refund,
        refundPercentage: refundCalculation.refundPercentage,
        reason: refundCalculation.reason
      }
    });
  } catch (error) {
    console.error('Error creating refund:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get refund by booking ID
const getRefundByBookingId = async (req, res) => {
  try {
    const bookingId = req.params.bookingId;
    const userId = req.session.userId;
    const isAdmin = !!req.session.adminId;
    
    // Get booking to check authorization
    const booking = await Booking.getById(bookingId);
    
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }
    
    // Check if user is authorized
    if (!isAdmin && booking.user_id !== userId) {
      return res.status(403).json({ message: 'Not authorized to view refund for this booking' });
    }
    
    const refunds = await Refund.getByBookingId(bookingId);
    
    res.status(200).json({ refunds });
  } catch (error) {
    console.error('Error getting refund:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get refund by ID
const getRefundById = async (req, res) => {
  try {
    const refundId = req.params.id;
    const userId = req.session.userId;
    const isAdmin = !!req.session.adminId;
    
    const refund = await Refund.getById(refundId);
    
    if (!refund) {
      return res.status(404).json({ message: 'Refund not found' });
    }
    
    // Get booking to check authorization
    const booking = await Booking.getById(refund.booking_id);
    
    if (!isAdmin && booking.user_id !== userId) {
      return res.status(403).json({ message: 'Not authorized to view this refund' });
    }
    
    res.status(200).json({ refund });
  } catch (error) {
    console.error('Error getting refund:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get all refunds (admin only)
const getAllRefunds = async (req, res) => {
  try {
    const refunds = await Refund.getAll();
    
    res.status(200).json({ refunds });
  } catch (error) {
    console.error('Error getting all refunds:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Calculate refund amount for a booking
const calculateRefund = async (req, res) => {
  try {
    const bookingId = req.params.bookingId;
    const userId = req.session.userId;
    const isAdmin = !!req.session.adminId;
    
    // Get booking details
    const booking = await Booking.getById(bookingId);
    
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }
    
    // Check if user is authorized
    if (!isAdmin && booking.user_id !== userId) {
      return res.status(403).json({ message: 'Not authorized to calculate refund for this booking' });
    }
    
    // Calculate refund amount
    const refundCalculation = Refund.calculateRefundAmount(
      booking.total_fare, 
      booking.departure_time
    );
    
    res.status(200).json({
      bookingId,
      totalFare: booking.total_fare,
      ...refundCalculation
    });
  } catch (error) {
    console.error('Error calculating refund:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update refund status (admin only)
const updateRefundStatus = async (req, res) => {
  try {
    const refundId = req.params.id;
    const { status, transactionId } = req.body;

    // Validate status
    const validStatuses = ['Pending', 'Processed', 'Failed', 'Cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid refund status' });
    }

    // Get refund details
    const refund = await Refund.getById(refundId);
    if (!refund) {
      return res.status(404).json({ message: 'Refund not found' });
    }

    // Update refund status
    await Refund.updateStatus(refundId, status, transactionId);

    // Get updated refund
    const updatedRefund = await Refund.getById(refundId);

    res.status(200).json({
      message: 'Refund status updated successfully',
      refund: updatedRefund
    });
  } catch (error) {
    console.error('Error updating refund status:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  createRefund,
  getRefundByBookingId,
  getRefundById,
  getAllRefunds,
  calculateRefund,
  updateRefundStatus
};
