const express = require('express');
const router = express.Router();
const refundController = require('../controllers/refundController');
const { isUserLoggedIn, isAdminLoggedIn } = require('../middleware/auth');

// User routes
router.post('/', isUserLoggedIn, refundController.createRefund);
router.get('/booking/:bookingId', isUserLoggedIn, refundController.getRefundByBookingId);
router.get('/calculate/:bookingId', isUserLoggedIn, refundController.calculateRefund);
router.get('/:id', isUserLoggedIn, refundController.getRefundById);

// Admin routes
router.get('/', isAdminLoggedIn, refundController.getAllRefunds);
router.put('/:id/status', isAdminLoggedIn, refundController.updateRefundStatus);

module.exports = router;
