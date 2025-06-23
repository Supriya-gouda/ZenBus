const express = require('express');
const router = express.Router();
const busStaffController = require('../controllers/busStaffController');
const { isAdminLoggedIn } = require('../middleware/auth');

// All routes require admin authentication
router.use(isAdminLoggedIn);

// Get all bus staff
router.get('/', busStaffController.getAllBusStaff);

// Get bus staff statistics
router.get('/statistics', busStaffController.getBusStaffStatistics);

// Search bus staff
router.get('/search', busStaffController.searchBusStaff);

// Get bus staff by role
router.get('/role/:role', busStaffController.getBusStaffByRole);

// Get bus staff by ID
router.get('/:id', busStaffController.getBusStaffById);

// Create new bus staff
router.post('/', busStaffController.createBusStaff);

// Update bus staff
router.put('/:id', busStaffController.updateBusStaff);

// Update bus staff status
router.put('/:id/status', busStaffController.updateBusStaffStatus);

// Delete bus staff
router.delete('/:id', busStaffController.deleteBusStaff);

module.exports = router;
