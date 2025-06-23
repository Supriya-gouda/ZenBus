const express = require('express');
const router = express.Router();
const driverController = require('../controllers/driverController');
const { isAdminLoggedIn } = require('../middleware/auth');

// Admin routes - all driver operations require admin authentication
router.use(isAdminLoggedIn);

// Get all drivers
router.get('/', driverController.getAllDrivers);

// Get driver statistics
router.get('/statistics', driverController.getDriverStatistics);

// Get available drivers for time slot
router.get('/available', driverController.getAvailableDrivers);

// Get driver by ID
router.get('/:id', driverController.getDriverById);

// Get driver schedules
router.get('/:id/schedules', driverController.getDriverSchedules);

// Get driver performance metrics
router.get('/:id/performance', driverController.getDriverPerformance);

// Create new driver
router.post('/', driverController.createDriver);

// Update driver
router.put('/:id', driverController.updateDriver);

// Delete driver
router.delete('/:id', driverController.deleteDriver);

// Assign driver to schedule
router.post('/assign', driverController.assignDriverToSchedule);

// Remove driver from schedule
router.post('/remove', driverController.removeDriverFromSchedule);

module.exports = router;
