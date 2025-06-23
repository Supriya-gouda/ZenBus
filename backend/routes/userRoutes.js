const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { isUserLoggedIn, isAdminLoggedIn } = require('../middleware/auth');

// Public routes
router.post('/register', userController.register);
router.post('/login', userController.login);
router.post('/logout', userController.logout);

// Protected routes
router.get('/profile', isUserLoggedIn, userController.getProfile);
router.put('/profile', isUserLoggedIn, userController.updateProfile);

// Admin routes for user management
router.put('/:userId/block', isAdminLoggedIn, userController.blockUser);
router.put('/:userId/unblock', isAdminLoggedIn, userController.unblockUser);

module.exports = router;