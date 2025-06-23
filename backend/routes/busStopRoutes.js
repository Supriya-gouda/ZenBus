const express = require('express');
const router = express.Router();
const busStopController = require('../controllers/busStopController');
const { isAdminLoggedIn } = require('../middleware/auth');

// Admin routes - all bus stop operations require admin authentication
router.use(isAdminLoggedIn);

// Get all bus stops
router.get('/', busStopController.getAllBusStops);

// Search bus stops
router.get('/search', busStopController.searchBusStops);

// Get bus stop statistics
router.get('/statistics', busStopController.getBusStopStatistics);

// Get all cities
router.get('/cities', busStopController.getAllCities);

// Get bus stop by ID
router.get('/:id', busStopController.getBusStopById);

// Create new bus stop
router.post('/', busStopController.createBusStop);

// Update bus stop
router.put('/:id', busStopController.updateBusStop);

// Delete bus stop
router.delete('/:id', busStopController.deleteBusStop);

module.exports = router;
