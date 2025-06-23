const express = require('express');
const router = express.Router();
const passengerController = require('../controllers/passengerController');
const { isAdminLoggedIn } = require('../middleware/auth');

// Admin routes - all passenger management operations require admin authentication
router.use(isAdminLoggedIn);

// Get all passengers
router.get('/', passengerController.getAllPassengers);

// Search passengers
router.get('/search', passengerController.searchPassengers);

// Get passenger statistics
router.get('/statistics', passengerController.getPassengerStatistics);

// Get top passengers by spending
router.get('/top', passengerController.getTopPassengers);

// Get frequent travelers
router.get('/frequent', passengerController.getFrequentTravelers);

// Get passenger analytics
router.get('/analytics', passengerController.getPassengerAnalytics);

// Get passenger by ID
router.get('/:id', passengerController.getPassengerById);

// Get passenger booking history
router.get('/:id/bookings', passengerController.getPassengerBookingHistory);

// Get passenger travel preferences
router.get('/:id/preferences', passengerController.getPassengerTravelPreferences);

// Update passenger information
router.put('/:id', passengerController.updatePassenger);

// Deactivate passenger account
router.delete('/:id', passengerController.deactivatePassenger);

// Block passenger account
router.put('/:id/block', passengerController.blockPassenger);

// Unblock passenger account
router.put('/:id/unblock', passengerController.unblockPassenger);

module.exports = router;
