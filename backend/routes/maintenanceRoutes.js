const express = require('express');
const router = express.Router();
const maintenanceController = require('../controllers/maintenanceController');
const { isAdminLoggedIn } = require('../middleware/auth');

// Admin routes - all maintenance operations require admin authentication
router.use(isAdminLoggedIn);

// Get all maintenance records
router.get('/', maintenanceController.getAllMaintenance);

// Get maintenance statistics
router.get('/statistics', maintenanceController.getMaintenanceStatistics);

// Get upcoming maintenance
router.get('/upcoming', maintenanceController.getUpcomingMaintenance);

// Get overdue maintenance
router.get('/overdue', maintenanceController.getOverdueMaintenance);

// Get buses under maintenance
router.get('/buses-under-maintenance', maintenanceController.getBusesUnderMaintenance);

// Get maintenance by bus ID
router.get('/bus/:busId', maintenanceController.getMaintenanceByBusId);

// Get maintenance by ID
router.get('/:id', maintenanceController.getMaintenanceById);

// Create new maintenance record
router.post('/', maintenanceController.createMaintenance);

// Update maintenance record
router.put('/:id', maintenanceController.updateMaintenance);

// Delete maintenance record
router.delete('/:id', maintenanceController.deleteMaintenance);

module.exports = router;