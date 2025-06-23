const Bus = require('../models/busModel');

// Get all buses
const getAllBuses = async (req, res) => {
  try {
    const buses = await Bus.getAll();
    res.status(200).json({
      success: true,
      buses
    });
  } catch (error) {
    console.error('Error getting buses:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Get bus by ID
const getBusById = async (req, res) => {
  try {
    const busId = req.params.id;
    
    const bus = await Bus.getById(busId);
    
    if (!bus) {
      return res.status(404).json({ message: 'Bus not found' });
    }
    
    res.status(200).json({ bus });
  } catch (error) {
    console.error('Error getting bus:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Create new bus
const createBus = async (req, res) => {
  try {
    const { busNumber, busType, capacity, totalSeats, amenities } = req.body;

    // Use capacity or totalSeats for backward compatibility
    const busCapacity = capacity || totalSeats;

    // Validate input
    if (!busNumber || !busType || !busCapacity) {
      return res.status(400).json({ message: 'Bus number, type, and capacity are required' });
    }

    const bus = await Bus.create(busNumber, busType, busCapacity, amenities);
    
    res.status(201).json({
      success: true,
      message: 'Bus created successfully',
      bus
    });
  } catch (error) {
    console.error('Error creating bus:', error);
    
    // Handle duplicate bus number
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ message: 'Bus number already exists' });
    }
    
    res.status(500).json({ message: 'Server error' });
  }
};

// Update bus
const updateBus = async (req, res) => {
  try {
    const busId = req.params.id;
    const { busType, capacity, totalSeats, amenities, status } = req.body;

    // Use capacity or totalSeats for backward compatibility
    const busCapacity = capacity || totalSeats;

    // Validate input
    if (!busType || !busCapacity || !status) {
      return res.status(400).json({ message: 'Bus type, capacity, and status are required' });
    }

    const bus = await Bus.update(busId, busType, busCapacity, amenities, status);
    
    res.status(200).json({
      success: true,
      message: 'Bus updated successfully',
      bus
    });
  } catch (error) {
    console.error('Error updating bus:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete bus
const deleteBus = async (req, res) => {
  try {
    const busId = req.params.id;
    
    await Bus.delete(busId);
    
    res.status(200).json({
      success: true,
      message: 'Bus deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting bus:', error);
    
    // Handle foreign key constraint
    if (error.code === 'ER_ROW_IS_REFERENCED_2') {
      return res.status(400).json({ message: 'Cannot delete bus as it is referenced in schedules' });
    }
    
    res.status(500).json({ message: 'Server error' });
  }
};

// Search for available buses
const searchBuses = async (req, res) => {
  try {
    const { source, destination, date, endDate } = req.query;

    // Validate input
    if (!source || !destination || !date) {
      return res.status(400).json({ message: 'Source, destination, and date are required' });
    }

    let buses;
    if (endDate) {
      buses = await Bus.searchBusesFlexible(source, destination, date, endDate);
    } else {
      buses = await Bus.searchAvailable(source, destination, date);
    }

    res.status(200).json({
      success: true,
      buses,
      count: buses.length
    });
  } catch (error) {
    console.error('Error searching buses:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Get all available locations
const getLocations = async (req, res) => {
  try {
    const locations = await Bus.getLocations();

    res.status(200).json({
      success: true,
      locations
    });
  } catch (error) {
    console.error('Error getting locations:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

module.exports = {
  getAllBuses,
  getBusById,
  createBus,
  updateBus,
  deleteBus,
  searchBuses,
  getLocations
};