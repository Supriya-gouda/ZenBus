const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');
const { isUserLoggedIn, isAdminLoggedIn } = require('../middleware/auth');

// User routes
router.post('/', bookingController.createBooking); // Temporarily disabled auth for testing
router.get('/user', isUserLoggedIn, bookingController.getBookingsByUserId);
router.get('/user/:userId', isUserLoggedIn, bookingController.getBookingsByUserId);
router.post('/cancel/:id', isUserLoggedIn, bookingController.cancelBooking);
router.get('/:id', isUserLoggedIn, bookingController.getBookingById);
router.put('/:id/cancel', isUserLoggedIn, bookingController.cancelBooking);
router.post('/:id/feedback', isUserLoggedIn, bookingController.submitFeedback);
router.get('/:id/refund', isUserLoggedIn, bookingController.getRefundDetails);

// Admin routes
router.get('/', isAdminLoggedIn, bookingController.getAllBookings);
router.get('/date-range', isAdminLoggedIn, bookingController.getBookingsByDateRange);

module.exports = router;