const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const { isAdminLoggedIn } = require('../middleware/auth');

// Admin routes - all payment and refund management operations require admin authentication
router.use(isAdminLoggedIn);

// Payment routes
// Get all payments
router.get('/', paymentController.getAllPayments);

// Get payment statistics
router.get('/statistics', paymentController.getPaymentStatistics);

// Get payment methods breakdown
router.get('/methods-breakdown', paymentController.getPaymentMethodsBreakdown);

// Get daily revenue report
router.get('/daily-revenue', paymentController.getDailyRevenue);

// Get failed payments
router.get('/failed', paymentController.getFailedPayments);

// Get payment by ID
router.get('/:id', paymentController.getPaymentById);

// Create new payment
router.post('/', paymentController.createPayment);

// Update payment status
router.put('/:id/status', paymentController.updatePaymentStatus);

// Refund routes
// Get all refunds
router.get('/refunds', paymentController.getAllRefunds);

// Get pending refunds
router.get('/refunds/pending', paymentController.getPendingRefunds);

// Get refund statistics
router.get('/refunds/statistics', paymentController.getRefundStatistics);

// Get refund by ID
router.get('/refunds/:id', paymentController.getRefundById);

// Create new refund
router.post('/refunds', paymentController.createRefund);

// Process refund
router.put('/refunds/:id/process', paymentController.processRefund);

module.exports = router;
