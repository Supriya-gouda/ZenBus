const express = require('express');
const router = express.Router();
const routeController = require('../controllers/routeController');
const { isAdminLoggedIn } = require('../middleware/auth');

// Public routes
router.get('/public', routeController.getAllRoutesPublic);
router.get('/sources', routeController.getAllSources);
router.get('/destinations/:source', routeController.getDestinationsForSource);

// Admin routes
router.get('/', isAdminLoggedIn, routeController.getAllRoutes);
router.get('/:id', isAdminLoggedIn, routeController.getRouteById);
router.post('/', isAdminLoggedIn, routeController.createRoute);
router.put('/:id', isAdminLoggedIn, routeController.updateRoute);
router.delete('/:id', isAdminLoggedIn, routeController.deleteRoute);

module.exports = router;