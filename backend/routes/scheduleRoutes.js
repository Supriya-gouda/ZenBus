const express = require('express');
const router = express.Router();
const scheduleController = require('../controllers/scheduleController');
const { isAdminLoggedIn } = require('../middleware/auth');

// Public routes
router.get('/', scheduleController.getAllSchedules);
router.post('/search', scheduleController.searchSchedules);
router.get('/:id', scheduleController.getScheduleById);

// Admin routes
router.get('/admin/filters', isAdminLoggedIn, scheduleController.getSchedulesWithFilters);
router.get('/admin/statistics', isAdminLoggedIn, scheduleController.getScheduleStatistics);
router.get('/admin/upcoming', isAdminLoggedIn, scheduleController.getUpcomingSchedules);
router.get('/admin/unassigned', isAdminLoggedIn, scheduleController.getUnassignedSchedules);
router.get('/admin/conflicts', isAdminLoggedIn, scheduleController.checkScheduleConflicts);
router.post('/', isAdminLoggedIn, scheduleController.createSchedule);
router.put('/:id', isAdminLoggedIn, scheduleController.updateSchedule);
router.delete('/:id', isAdminLoggedIn, scheduleController.deleteSchedule);

module.exports = router;