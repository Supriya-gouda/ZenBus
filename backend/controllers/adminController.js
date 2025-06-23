const Admin = require('../models/adminModel');
const db = require('../db/connection');

// Login admin
const login = async (req, res) => {
  try {
    const { username, password } = req.body;
    
    // Validate input
    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password are required' });
    }
    
    // Login admin
    const admin = await Admin.login(username, password);
    
    if (!admin) {
      return res.status(401).json({ message: 'Invalid username or password' });
    }
    
    // Set session
    req.session.adminId = admin.adminId;
    
    res.status(200).json({
      message: 'Login successful',
      admin: {
        adminId: admin.adminId,
        username: admin.username,
        fullName: admin.fullName
      }
    });
  } catch (error) {
    console.error('Error logging in admin:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Logout admin
const logout = (req, res) => {
  req.session.destroy(err => {
    if (err) {
      return res.status(500).json({ message: 'Error logging out' });
    }
    
    res.status(200).json({ message: 'Logout successful' });
  });
};

// Get admin profile
const getProfile = async (req, res) => {
  try {
    const adminId = req.session.adminId;

    const admin = await Admin.getById(adminId);

    if (!admin) {
      return res.status(404).json({ message: 'Admin not found' });
    }

    res.status(200).json({
      admin: {
        adminId: admin.admin_id,
        username: admin.username,
        fullName: admin.full_name,
        createdAt: admin.created_at
      }
    });
  } catch (error) {
    console.error('Error getting admin profile:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get dashboard statistics
const getDashboardStats = async (req, res) => {
  try {
    const rawStats = await Admin.getDashboardStats();

    // Flatten the stats structure for frontend consumption
    const stats = {
      totalUsers: rawStats.users?.total_users || 0,
      totalBuses: rawStats.buses?.total_buses || 0,
      totalRoutes: rawStats.routes?.total_routes || 0,
      totalBookings: rawStats.revenue?.total_bookings || 0,
      totalRevenue: rawStats.revenue?.total_revenue || 0,
      averageRating: 4.5 // Mock value for now
    };

    res.status(200).json({
      stats
    });
  } catch (error) {
    console.error('Error getting dashboard stats:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get all users
const getAllUsers = async (req, res) => {
  try {
    const users = await Admin.getAllUsers();

    res.status(200).json({
      users
    });
  } catch (error) {
    console.error('Error getting users:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete user and all their bookings
const deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;

    // Check if user exists
    const [userExists] = await db.execute('SELECT user_id, full_name FROM users WHERE user_id = ?', [userId]);
    if (userExists.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    const userName = userExists[0].full_name;

    // Delete user and all related data
    const result = await Admin.deleteUser(userId);

    res.status(200).json({
      message: `User "${userName}" deleted successfully. ${result.deletedBookings} bookings and ${result.deletedFeedback} feedback entries were also deleted.`,
      deletedBookings: result.deletedBookings,
      deletedFeedback: result.deletedFeedback,
      userName: userName
    });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Toggle user status (block/unblock)
const toggleUserStatus = async (req, res) => {
  try {
    const { userId } = req.params;
    const { action } = req.body;

    if (!['block', 'unblock'].includes(action)) {
      return res.status(400).json({ message: 'Invalid action. Use "block" or "unblock".' });
    }

    const result = await Admin.toggleUserStatus(userId, action);

    res.status(200).json({
      message: `User ${action}ed successfully.`,
      action
    });
  } catch (error) {
    console.error('Error toggling user status:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  login,
  logout,
  getProfile,
  getDashboardStats,
  getAllUsers,
  deleteUser,
  toggleUserStatus
};