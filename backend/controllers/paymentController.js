const { Payment, Refund } = require('../models/paymentModel');

// Payment Controllers

// Get all payments
const getAllPayments = async (req, res) => {
  try {
    const filters = {
      status: req.query.status,
      method: req.query.method,
      startDate: req.query.startDate,
      endDate: req.query.endDate,
      userId: req.query.userId
    };
    
    const payments = await Payment.getAll(filters);
    
    res.status(200).json({
      success: true,
      payments
    });
  } catch (error) {
    console.error('Error getting payments:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Get payment by ID
const getPaymentById = async (req, res) => {
  try {
    const { id } = req.params;
    const payment = await Payment.getById(id);
    
    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }
    
    res.status(200).json({
      success: true,
      payment
    });
  } catch (error) {
    console.error('Error getting payment:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Create new payment
const createPayment = async (req, res) => {
  try {
    const { booking_id, amount, payment_method, transaction_id, payment_status } = req.body;
    
    if (!booking_id || !amount || !payment_method) {
      return res.status(400).json({
        success: false,
        message: 'Booking ID, amount, and payment method are required'
      });
    }
    
    const paymentData = {
      booking_id,
      amount,
      payment_method,
      transaction_id,
      payment_status
    };
    
    const payment = await Payment.create(paymentData);
    
    res.status(201).json({
      success: true,
      message: 'Payment created successfully',
      payment
    });
  } catch (error) {
    console.error('Error creating payment:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Update payment status
const updatePaymentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, transaction_id } = req.body;
    
    if (!status) {
      return res.status(400).json({
        success: false,
        message: 'Status is required'
      });
    }
    
    const payment = await Payment.updateStatus(id, status, transaction_id);
    
    res.status(200).json({
      success: true,
      message: 'Payment status updated successfully',
      payment
    });
  } catch (error) {
    console.error('Error updating payment status:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Get payment statistics
const getPaymentStatistics = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const statistics = await Payment.getStatistics(startDate, endDate);
    
    res.status(200).json({
      success: true,
      statistics
    });
  } catch (error) {
    console.error('Error getting payment statistics:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Get payment methods breakdown
const getPaymentMethodsBreakdown = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const breakdown = await Payment.getPaymentMethodsBreakdown(startDate, endDate);
    
    res.status(200).json({
      success: true,
      breakdown
    });
  } catch (error) {
    console.error('Error getting payment methods breakdown:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Get daily revenue report
const getDailyRevenue = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: 'Start date and end date are required'
      });
    }
    
    const revenue = await Payment.getDailyRevenue(startDate, endDate);
    
    res.status(200).json({
      success: true,
      revenue
    });
  } catch (error) {
    console.error('Error getting daily revenue:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Get failed payments
const getFailedPayments = async (req, res) => {
  try {
    const { limit = 50 } = req.query;
    const payments = await Payment.getFailedPayments(parseInt(limit));
    
    res.status(200).json({
      success: true,
      payments
    });
  } catch (error) {
    console.error('Error getting failed payments:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Refund Controllers

// Get all refunds
const getAllRefunds = async (req, res) => {
  try {
    const filters = {
      status: req.query.status,
      startDate: req.query.startDate,
      endDate: req.query.endDate
    };
    
    const refunds = await Refund.getAll(filters);
    
    res.status(200).json({
      success: true,
      refunds
    });
  } catch (error) {
    console.error('Error getting refunds:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Get refund by ID
const getRefundById = async (req, res) => {
  try {
    const { id } = req.params;
    const refund = await Refund.getById(id);
    
    if (!refund) {
      return res.status(404).json({
        success: false,
        message: 'Refund not found'
      });
    }
    
    res.status(200).json({
      success: true,
      refund
    });
  } catch (error) {
    console.error('Error getting refund:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Create new refund
const createRefund = async (req, res) => {
  try {
    const { booking_id, payment_id, refund_amount, refund_reason, refund_method } = req.body;
    
    if (!booking_id || !payment_id || !refund_amount || !refund_reason) {
      return res.status(400).json({
        success: false,
        message: 'Booking ID, payment ID, refund amount, and refund reason are required'
      });
    }
    
    const refundData = {
      booking_id,
      payment_id,
      refund_amount,
      refund_reason,
      refund_method
    };
    
    const refund = await Refund.create(refundData);
    
    res.status(201).json({
      success: true,
      message: 'Refund created successfully',
      refund
    });
  } catch (error) {
    console.error('Error creating refund:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Process refund
const processRefund = async (req, res) => {
  try {
    const { id } = req.params;
    const { transaction_id } = req.body;
    
    const refund = await Refund.process(id, transaction_id);
    
    res.status(200).json({
      success: true,
      message: 'Refund processed successfully',
      refund
    });
  } catch (error) {
    console.error('Error processing refund:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Get pending refunds
const getPendingRefunds = async (req, res) => {
  try {
    const refunds = await Refund.getPending();
    
    res.status(200).json({
      success: true,
      refunds
    });
  } catch (error) {
    console.error('Error getting pending refunds:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Get refund statistics
const getRefundStatistics = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const statistics = await Refund.getStatistics(startDate, endDate);
    
    res.status(200).json({
      success: true,
      statistics
    });
  } catch (error) {
    console.error('Error getting refund statistics:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

module.exports = {
  // Payment controllers
  getAllPayments,
  getPaymentById,
  createPayment,
  updatePaymentStatus,
  getPaymentStatistics,
  getPaymentMethodsBreakdown,
  getDailyRevenue,
  getFailedPayments,
  
  // Refund controllers
  getAllRefunds,
  getRefundById,
  createRefund,
  processRefund,
  getPendingRefunds,
  getRefundStatistics
};
