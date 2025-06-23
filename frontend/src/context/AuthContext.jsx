import React, { createContext, useContext, useState, useEffect } from 'react';
import authService from '../services/authService.js';
import adminService from '../services/adminService.js';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing session with backend
    const checkSession = async () => {
      try {
        // First try to get user profile
        const userResult = await authService.getProfile();
        if (userResult.success) {
          setUser(userResult.user);
          return;
        }
      } catch (error) {
        // If user profile fails, try admin profile
        try {
          const adminResult = await adminService.getProfile();
          if (adminResult.success) {
            setUser({ ...adminResult.admin, role: 'admin' });
            return;
          }
        } catch (adminError) {
          console.log('No active session');
        }
      } finally {
        setLoading(false);
      }
    };

    checkSession();
  }, []);

  const login = async (email, password) => {
    try {
      const result = await authService.login(email, password);
      if (result.success) {
        setUser(result.user);
        return { success: true };
      }
      return { success: false, error: result.error };
    } catch (error) {
      return { success: false, error: 'Login failed. Please try again.' };
    }
  };

  const register = async (userData) => {
    try {
      const result = await authService.register(userData);
      if (result.success) {
        setUser(result.user);
        return { success: true };
      }
      return { success: false, error: result.error };
    } catch (error) {
      return { success: false, error: 'Registration failed. Please try again.' };
    }
  };

  const logout = async () => {
    try {
      if (user?.role === 'admin') {
        await adminService.logout();
      } else {
        await authService.logout();
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
    }
  };

  const updateProfile = async (updates) => {
    try {
      const result = await authService.updateProfile(updates);
      if (result.success) {
        setUser(result.user);
        return { success: true };
      }
      return { success: false, error: result.error };
    } catch (error) {
      return { success: false, error: 'Profile update failed. Please try again.' };
    }
  };

  const adminLogin = async (username, password) => {
    try {
      const result = await adminService.login(username, password);
      if (result.success) {
        // Set admin user with role
        setUser({ ...result.admin, role: 'admin' });
        return { success: true };
      }
      return { success: false, error: result.error };
    } catch (error) {
      return { success: false, error: 'Admin login failed. Please try again.' };
    }
  };

  const value = {
    user,
    login,
    register,
    logout,
    updateProfile,
    adminLogin,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};