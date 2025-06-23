const express = require('express');
const router = express.Router();
const feedbackController = require('../controllers/feedbackController');
const { isUserLoggedIn, isAdminLoggedIn } = require('../middleware/auth');

// User routes
router.post('/', isUserLoggedIn, feedbackController.createFeedback);
router.get('/user', isUserLoggedIn, feedbackController.getUserFeedback);
router.put('/:id', isUserLoggedIn, feedbackController.updateFeedback);
router.delete('/:id', isUserLoggedIn, feedbackController.deleteFeedback);

// Admin routes
router.get('/', isAdminLoggedIn, feedbackController.getAllFeedback);
router.get('/statistics', isAdminLoggedIn, feedbackController.getFeedbackStatistics);
router.get('/filtered', isAdminLoggedIn, feedbackController.getFeedbackWithFilters);
router.post('/:id/respond', isAdminLoggedIn, feedbackController.respondToFeedback);

module.exports = router;