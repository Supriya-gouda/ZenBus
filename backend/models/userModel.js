const db = require('../db/connection');
const bcrypt = require('bcrypt');

class User {
  // Register a new user
  static async register(email, password, fullName, phone) {
    try {
      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);
      
      // Insert user into database
      const [result] = await db.execute(
        'INSERT INTO users (email, password, full_name, phone) VALUES (?, ?, ?, ?)',
        [email, hashedPassword, fullName, phone]
      );
      
      return { userId: result.insertId, email, fullName, phone };
    } catch (error) {
      throw error;
    }
  }
  
  // Login user
  static async login(email, password) {
    try {
      // Find user by email
      const [users] = await db.execute('SELECT * FROM users WHERE email = ?', [email]);
      
      if (users.length === 0) {
        return null;
      }
      
      const user = users[0];
      
      // Compare password
      const isPasswordValid = await bcrypt.compare(password, user.password);
      
      if (!isPasswordValid) {
        return null;
      }
      
      return {
        userId: user.user_id,
        email: user.email,
        fullName: user.full_name,
        phone: user.phone
      };
    } catch (error) {
      throw error;
    }
  }
  
  // Get user by ID
  static async getById(userId) {
    try {
      const [users] = await db.execute('SELECT user_id, email, full_name, phone, created_at, account_status FROM users WHERE user_id = ?', [userId]);

      if (users.length === 0) {
        return null;
      }

      return users[0];
    } catch (error) {
      throw error;
    }
  }
  
  // Update user profile
  static async updateProfile(userId, fullName, phone) {
    try {
      await db.execute(
        'UPDATE users SET full_name = ?, phone = ? WHERE user_id = ?',
        [fullName, phone, userId]
      );

      return { userId, fullName, phone };
    } catch (error) {
      throw error;
    }
  }

  // Block user
  static async blockUser(userId, reason) {
    try {
      await db.execute(
        'UPDATE users SET account_status = ? WHERE user_id = ?',
        ['Blocked', userId]
      );

      return true;
    } catch (error) {
      throw error;
    }
  }

  // Unblock user
  static async unblockUser(userId) {
    try {
      await db.execute(
        'UPDATE users SET account_status = ? WHERE user_id = ?',
        ['Active', userId]
      );

      return true;
    } catch (error) {
      throw error;
    }
  }

  // Check if user is blocked
  static async isUserBlocked(userId) {
    try {
      const [users] = await db.execute('SELECT account_status FROM users WHERE user_id = ?', [userId]);

      if (users.length === 0) {
        return true; // User not found, consider as blocked
      }

      return users[0].account_status === 'Blocked';
    } catch (error) {
      throw error;
    }
  }
}

module.exports = User;