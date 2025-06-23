const Driver = require('../models/driverModel');

// Get all drivers
const getAllDrivers = async (req, res) => {
  try {
    const drivers = await Driver.getAll();
    
    res.status(200).json({
      success: true,
      drivers
    });
  } catch (error) {
    console.error('Error getting drivers:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Get driver by ID
const getDriverById = async (req, res) => {
  try {
    const { id } = req.params;
    const driver = await Driver.getById(id);
    
    if (!driver) {
      return res.status(404).json({
        success: false,
        message: 'Driver not found'
      });
    }
    
    res.status(200).json({
      success: true,
      driver
    });
  } catch (error) {
    console.error('Error getting driver:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Create new driver
const createDriver = async (req, res) => {
  try {
    const { full_name, license_number, phone, contact_number, experience_years, address, date_of_birth, emergency_contact } = req.body;

    // Use phone or contact_number (for backward compatibility)
    const phoneNumber = phone || contact_number;

    // Validate required fields
    if (!full_name || !license_number || !phoneNumber) {
      return res.status(400).json({
        success: false,
        message: 'Full name, license number, and phone number are required'
      });
    }

    const driverData = {
      full_name,
      license_number,
      phone: phoneNumber,
      experience_years,
      address,
      date_of_birth,
      emergency_contact
    };
    
    const driver = await Driver.create(driverData);
    
    res.status(201).json({
      success: true,
      message: 'Driver created successfully',
      driver
    });
  } catch (error) {
    console.error('Error creating driver:', error);
    if (error.code === 'ER_DUP_ENTRY') {
      res.status(400).json({
        success: false,
        message: 'License number already exists'
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Server error',
        error: error.message
      });
    }
  }
};

// Update driver
const updateDriver = async (req, res) => {
  try {
    const { id } = req.params;
    const { full_name, license_number, phone, contact_number, experience_years, address, date_of_birth, emergency_contact } = req.body;

    // Use phone or contact_number (for backward compatibility)
    const phoneNumber = phone || contact_number;

    const driverData = {
      full_name,
      license_number,
      phone: phoneNumber,
      experience_years,
      address,
      date_of_birth,
      emergency_contact
    };
    
    const driver = await Driver.update(id, driverData);
    
    res.status(200).json({
      success: true,
      message: 'Driver updated successfully',
      driver
    });
  } catch (error) {
    console.error('Error updating driver:', error);
    if (error.code === 'ER_DUP_ENTRY') {
      res.status(400).json({
        success: false,
        message: 'License number already exists'
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Server error',
        error: error.message
      });
    }
  }
};

// Delete driver
const deleteDriver = async (req, res) => {
  try {
    const { id } = req.params;
    
    await Driver.delete(id);
    
    res.status(200).json({
      success: true,
      message: 'Driver deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting driver:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error'
    });
  }
};

// Get driver schedules
const getDriverSchedules = async (req, res) => {
  try {
    const { id } = req.params;
    const { startDate, endDate } = req.query;
    
    const schedules = await Driver.getSchedules(id, startDate, endDate);
    
    res.status(200).json({
      success: true,
      schedules
    });
  } catch (error) {
    console.error('Error getting driver schedules:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Assign driver to schedule
const assignDriverToSchedule = async (req, res) => {
  try {
    const { driverId, scheduleId } = req.body;
    
    if (!driverId || !scheduleId) {
      return res.status(400).json({
        success: false,
        message: 'Driver ID and Schedule ID are required'
      });
    }
    
    const assignment = await Driver.assignToSchedule(driverId, scheduleId);
    
    res.status(200).json({
      success: true,
      message: 'Driver assigned to schedule successfully',
      assignment
    });
  } catch (error) {
    console.error('Error assigning driver to schedule:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error'
    });
  }
};

// Remove driver from schedule
const removeDriverFromSchedule = async (req, res) => {
  try {
    const { driverId, scheduleId } = req.body;
    
    if (!driverId || !scheduleId) {
      return res.status(400).json({
        success: false,
        message: 'Driver ID and Schedule ID are required'
      });
    }
    
    await Driver.removeFromSchedule(driverId, scheduleId);
    
    res.status(200).json({
      success: true,
      message: 'Driver removed from schedule successfully'
    });
  } catch (error) {
    console.error('Error removing driver from schedule:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Get available drivers for time slot
const getAvailableDrivers = async (req, res) => {
  try {
    const { departureTime, arrivalTime } = req.query;
    
    if (!departureTime || !arrivalTime) {
      return res.status(400).json({
        success: false,
        message: 'Departure time and arrival time are required'
      });
    }
    
    const drivers = await Driver.getAvailableDrivers(departureTime, arrivalTime);
    
    res.status(200).json({
      success: true,
      drivers
    });
  } catch (error) {
    console.error('Error getting available drivers:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Get driver statistics
const getDriverStatistics = async (req, res) => {
  try {
    const statistics = await Driver.getStatistics();
    
    res.status(200).json({
      success: true,
      statistics
    });
  } catch (error) {
    console.error('Error getting driver statistics:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Get driver performance metrics
const getDriverPerformance = async (req, res) => {
  try {
    const { id } = req.params;
    const { startDate, endDate } = req.query;
    
    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: 'Start date and end date are required'
      });
    }
    
    const metrics = await Driver.getPerformanceMetrics(id, startDate, endDate);
    
    res.status(200).json({
      success: true,
      metrics
    });
  } catch (error) {
    console.error('Error getting driver performance:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

module.exports = {
  getAllDrivers,
  getDriverById,
  createDriver,
  updateDriver,
  deleteDriver,
  getDriverSchedules,
  assignDriverToSchedule,
  removeDriverFromSchedule,
  getAvailableDrivers,
  getDriverStatistics,
  getDriverPerformance
};
