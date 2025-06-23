const User = require('../models/userModel');

// Register a new user
const register = async (req, res) => {
  try {
    const { email, password, fullName, phone } = req.body;
    
    // Validate input
    if (!email || !password || !fullName) {
      return res.status(400).json({ message: 'Email, password, and full name are required' });
    }
    
    // Register user
    const user = await User.register(email, password, fullName, phone);
    
    // Set session
    req.session.userId = user.userId;
    
    res.status(201).json({
      message: 'User registered successfully',
      user: {
        userId: user.userId,
        email: user.email,
        fullName: user.fullName,
        phone: user.phone
      }
    });
  } catch (error) {
    console.error('Error registering user:', error);
    
    // Handle duplicate email
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ message: 'Email already exists' });
    }
    
    res.status(500).json({ message: 'Server error' });
  }
};

// Login user
const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Validate input
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }
    
    // Login user
    const user = await User.login(email, password);
    
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    
    // Set session
    req.session.userId = user.userId;

    res.status(200).json({
      message: 'Login successful',
      user: {
        userId: user.userId,
        email: user.email,
        fullName: user.fullName,
        phone: user.phone
      }
    });
  } catch (error) {
    console.error('Error logging in user:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Logout user
const logout = (req, res) => {
  req.session.destroy(err => {
    if (err) {
      return res.status(500).json({ message: 'Error logging out' });
    }
    
    res.status(200).json({ message: 'Logout successful' });
  });
};

// Get user profile
const getProfile = async (req, res) => {
  try {
    const userId = req.session.userId;

    const user = await User.getById(userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.status(200).json({
      user: {
        userId: user.user_id,
        email: user.email,
        fullName: user.full_name,
        phone: user.phone,
        createdAt: user.created_at
      }
    });
  } catch (error) {
    console.error('Error getting user profile:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update user profile
const updateProfile = async (req, res) => {
  try {
    const userId = req.session.userId;
    const { fullName, phone } = req.body;
    
    // Validate input
    if (!fullName) {
      return res.status(400).json({ message: 'Full name is required' });
    }
    
    const user = await User.updateProfile(userId, fullName, phone);
    
    res.status(200).json({
      message: 'Profile updated successfully',
      user: {
        userId: user.userId,
        fullName: user.fullName,
        phone: user.phone
      }
    });
  } catch (error) {
    console.error('Error updating user profile:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Block user (admin only)
const blockUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const { reason } = req.body;

    if (!reason) {
      return res.status(400).json({ message: 'Block reason is required' });
    }

    const success = await User.blockUser(userId, reason);

    if (success) {
      res.status(200).json({ message: 'User blocked successfully' });
    } else {
      res.status(400).json({ message: 'Failed to block user' });
    }
  } catch (error) {
    console.error('Error blocking user:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Unblock user (admin only)
const unblockUser = async (req, res) => {
  try {
    const { userId } = req.params;

    const success = await User.unblockUser(userId);

    if (success) {
      res.status(200).json({ message: 'User unblocked successfully' });
    } else {
      res.status(400).json({ message: 'Failed to unblock user' });
    }
  } catch (error) {
    console.error('Error unblocking user:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  register,
  login,
  logout,
  getProfile,
  updateProfile,
  blockUser,
  unblockUser
};