const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { isAdminLoggedIn } = require('../middleware/auth');

// Public routes
router.post('/login', adminController.login);
router.post('/logout', adminController.logout);

// Protected routes
router.get('/profile', isAdminLoggedIn, adminController.getProfile);
router.get('/dashboard-stats', isAdminLoggedIn, adminController.getDashboardStats);
router.get('/users', isAdminLoggedIn, adminController.getAllUsers);
router.delete('/users/:userId', isAdminLoggedIn, adminController.deleteUser);
router.patch('/users/:userId/status', isAdminLoggedIn, adminController.toggleUserStatus);

module.exports = router;