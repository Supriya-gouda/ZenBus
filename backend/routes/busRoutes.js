const express = require('express');
const router = express.Router();
const busController = require('../controllers/busController');
const { isAdminLoggedIn } = require('../middleware/auth');

// Public routes
router.get('/search', busController.searchBuses);
router.get('/locations', busController.getLocations);

// Admin routes
router.get('/', isAdminLoggedIn, busController.getAllBuses);
router.get('/:id', isAdminLoggedIn, busController.getBusById);
router.post('/', isAdminLoggedIn, busController.createBus);
router.put('/:id', isAdminLoggedIn, busController.updateBus);
router.delete('/:id', isAdminLoggedIn, busController.deleteBus);

module.exports = router;