const Maintenance = require('../models/maintenanceModel');

// Get all maintenance records
const getAllMaintenance = async (req, res) => {
  try {
    const maintenance = await Maintenance.getAll();
    res.status(200).json({
      success: true,
      maintenance
    });
  } catch (error) {
    console.error('Error getting maintenance records:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Get maintenance by ID
const getMaintenanceById = async (req, res) => {
  try {
    const maintenanceId = req.params.id;
    
    const record = await Maintenance.getById(maintenanceId);
    
    if (!record) {
      return res.status(404).json({ message: 'Maintenance record not found' });
    }
    
    res.status(200).json({ record });
  } catch (error) {
    console.error('Error getting maintenance record:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Create new maintenance record
const createMaintenance = async (req, res) => {
  try {
    const { busId, maintenanceType, description, scheduledDate, cost, serviceProvider, priority } = req.body;

    // Validate input
    if (!busId || !maintenanceType || !scheduledDate) {
      return res.status(400).json({
        success: false,
        message: 'Bus ID, maintenance type, and scheduled date are required'
      });
    }

    const maintenanceData = {
      busId,
      maintenanceType,
      description,
      scheduledDate,
      cost,
      serviceProvider,
      priority: priority || 'Medium'
    };

    const record = await Maintenance.create(maintenanceData);

    res.status(201).json({
      success: true,
      message: 'Maintenance record created successfully',
      maintenance: record
    });
  } catch (error) {
    console.error('Error creating maintenance record:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Update maintenance record
const updateMaintenance = async (req, res) => {
  try {
    const maintenanceId = req.params.id;
    const updateData = req.body;

    const record = await Maintenance.update(maintenanceId, updateData);

    res.status(200).json({
      success: true,
      message: 'Maintenance record updated successfully',
      maintenance: record
    });
  } catch (error) {
    console.error('Error updating maintenance record:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Delete maintenance record
const deleteMaintenance = async (req, res) => {
  try {
    const maintenanceId = req.params.id;

    await Maintenance.delete(maintenanceId);

    res.status(200).json({
      success: true,
      message: 'Maintenance record deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting maintenance record:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Get maintenance statistics
const getMaintenanceStatistics = async (req, res) => {
  try {
    const statistics = await Maintenance.getStatistics();

    res.status(200).json({
      success: true,
      statistics
    });
  } catch (error) {
    console.error('Error getting maintenance statistics:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Get upcoming maintenance
const getUpcomingMaintenance = async (req, res) => {
  try {
    const { days = 7 } = req.query;
    const maintenance = await Maintenance.getUpcoming(parseInt(days));

    res.status(200).json({
      success: true,
      maintenance
    });
  } catch (error) {
    console.error('Error getting upcoming maintenance:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Get overdue maintenance
const getOverdueMaintenance = async (req, res) => {
  try {
    const maintenance = await Maintenance.getOverdue();

    res.status(200).json({
      success: true,
      maintenance
    });
  } catch (error) {
    console.error('Error getting overdue maintenance:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Get buses under maintenance
const getBusesUnderMaintenance = async (req, res) => {
  try {
    const buses = await Maintenance.getBusesUnderMaintenance();

    res.status(200).json({
      success: true,
      buses
    });
  } catch (error) {
    console.error('Error getting buses under maintenance:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Get maintenance by bus ID
const getMaintenanceByBusId = async (req, res) => {
  try {
    const { busId } = req.params;
    const maintenance = await Maintenance.getByBusId(busId);

    res.status(200).json({
      success: true,
      maintenance
    });
  } catch (error) {
    console.error('Error getting maintenance by bus ID:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

module.exports = {
  getAllMaintenance,
  getMaintenanceById,
  createMaintenance,
  updateMaintenance,
  deleteMaintenance,
  getMaintenanceStatistics,
  getUpcomingMaintenance,
  getOverdueMaintenance,
  getBusesUnderMaintenance,
  getMaintenanceByBusId
};