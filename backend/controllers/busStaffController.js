const BusStaff = require('../models/busStaffModel');

// Get all bus staff
const getAllBusStaff = async (req, res) => {
  try {
    const staff = await BusStaff.getAll();
    
    res.status(200).json({
      success: true,
      staff
    });
  } catch (error) {
    console.error('Error getting bus staff:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Get bus staff by ID
const getBusStaffById = async (req, res) => {
  try {
    const { id } = req.params;
    const staff = await BusStaff.getById(id);
    
    if (!staff) {
      return res.status(404).json({
        success: false,
        message: 'Bus staff not found'
      });
    }
    
    res.status(200).json({
      success: true,
      staff
    });
  } catch (error) {
    console.error('Error getting bus staff by ID:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Create new bus staff
const createBusStaff = async (req, res) => {
  try {
    const { full_name, role, contact_number, email, address, date_of_joining, salary } = req.body;
    
    // Validate required fields
    if (!full_name || !role || !contact_number) {
      return res.status(400).json({
        success: false,
        message: 'Full name, role, and contact number are required'
      });
    }
    
    const staffData = {
      full_name,
      role,
      contact_number,
      email,
      address,
      date_of_joining,
      salary
    };
    
    const staff = await BusStaff.create(staffData);
    
    res.status(201).json({
      success: true,
      message: 'Bus staff created successfully',
      staff
    });
  } catch (error) {
    console.error('Error creating bus staff:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Update bus staff
const updateBusStaff = async (req, res) => {
  try {
    const { id } = req.params;
    const { full_name, role, contact_number, email, address, date_of_joining, salary } = req.body;
    
    // Check if staff exists
    const existingStaff = await BusStaff.getById(id);
    if (!existingStaff) {
      return res.status(404).json({
        success: false,
        message: 'Bus staff not found'
      });
    }
    
    const staffData = {
      full_name,
      role,
      contact_number,
      email,
      address,
      date_of_joining,
      salary
    };
    
    const staff = await BusStaff.update(id, staffData);
    
    res.status(200).json({
      success: true,
      message: 'Bus staff updated successfully',
      staff
    });
  } catch (error) {
    console.error('Error updating bus staff:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Delete bus staff
const deleteBusStaff = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if staff exists
    const existingStaff = await BusStaff.getById(id);
    if (!existingStaff) {
      return res.status(404).json({
        success: false,
        message: 'Bus staff not found'
      });
    }
    
    const deleted = await BusStaff.delete(id);
    
    if (deleted) {
      res.status(200).json({
        success: true,
        message: 'Bus staff deleted successfully'
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Failed to delete bus staff'
      });
    }
  } catch (error) {
    console.error('Error deleting bus staff:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Get staff by role
const getBusStaffByRole = async (req, res) => {
  try {
    const { role } = req.params;
    const staff = await BusStaff.getByRole(role);
    
    res.status(200).json({
      success: true,
      staff
    });
  } catch (error) {
    console.error('Error getting bus staff by role:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Get bus staff statistics
const getBusStaffStatistics = async (req, res) => {
  try {
    const statistics = await BusStaff.getStatistics();
    
    res.status(200).json({
      success: true,
      statistics
    });
  } catch (error) {
    console.error('Error getting bus staff statistics:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Update staff status
const updateBusStaffStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    // Validate status
    const validStatuses = ['Active', 'On Leave', 'Inactive'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be Active, On Leave, or Inactive'
      });
    }
    
    // Check if staff exists
    const existingStaff = await BusStaff.getById(id);
    if (!existingStaff) {
      return res.status(404).json({
        success: false,
        message: 'Bus staff not found'
      });
    }
    
    await BusStaff.updateStatus(id, status);
    
    res.status(200).json({
      success: true,
      message: 'Staff status updated successfully'
    });
  } catch (error) {
    console.error('Error updating staff status:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Search bus staff
const searchBusStaff = async (req, res) => {
  try {
    const { q } = req.query;
    
    if (!q) {
      return res.status(400).json({
        success: false,
        message: 'Search query is required'
      });
    }
    
    const staff = await BusStaff.search(q);
    
    res.status(200).json({
      success: true,
      staff
    });
  } catch (error) {
    console.error('Error searching bus staff:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

module.exports = {
  getAllBusStaff,
  getBusStaffById,
  createBusStaff,
  updateBusStaff,
  deleteBusStaff,
  getBusStaffByRole,
  getBusStaffStatistics,
  updateBusStaffStatus,
  searchBusStaff
};
