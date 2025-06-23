const BusStop = require('../models/busStopModel');

// Get all bus stops
const getAllBusStops = async (req, res) => {
  try {
    const filters = {
      search: req.query.search,
      status: req.query.status,
      city: req.query.city
    };
    
    const stops = await BusStop.getAll(filters);
    
    res.status(200).json({
      success: true,
      stops
    });
  } catch (error) {
    console.error('Error getting bus stops:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Get bus stop by ID
const getBusStopById = async (req, res) => {
  try {
    const { id } = req.params;
    const stop = await BusStop.getById(id);
    
    if (!stop) {
      return res.status(404).json({
        success: false,
        message: 'Bus stop not found'
      });
    }
    
    res.status(200).json({
      success: true,
      stop
    });
  } catch (error) {
    console.error('Error getting bus stop by ID:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Create new bus stop
const createBusStop = async (req, res) => {
  try {
    const { stop_name, city, state, address, latitude, longitude, facilities } = req.body;
    
    // Validate required fields
    if (!stop_name || !city || !state) {
      return res.status(400).json({
        success: false,
        message: 'Stop name, city, and state are required'
      });
    }
    
    const stopData = {
      stop_name,
      city,
      state,
      address: address || null,
      latitude: latitude ? parseFloat(latitude) : null,
      longitude: longitude ? parseFloat(longitude) : null,
      facilities: facilities || null
    };
    
    const stop = await BusStop.create(stopData);
    
    res.status(201).json({
      success: true,
      message: 'Bus stop created successfully',
      stop
    });
  } catch (error) {
    console.error('Error creating bus stop:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Update bus stop
const updateBusStop = async (req, res) => {
  try {
    const { id } = req.params;
    const { stop_name, city, state, address, latitude, longitude, facilities, status } = req.body;
    
    // Validate required fields
    if (!stop_name || !city || !state) {
      return res.status(400).json({
        success: false,
        message: 'Stop name, city, and state are required'
      });
    }
    
    // Check if bus stop exists
    const existingStop = await BusStop.getById(id);
    if (!existingStop) {
      return res.status(404).json({
        success: false,
        message: 'Bus stop not found'
      });
    }
    
    const stopData = {
      stop_name,
      city,
      state,
      address: address || null,
      latitude: latitude ? parseFloat(latitude) : null,
      longitude: longitude ? parseFloat(longitude) : null,
      facilities: facilities || null,
      status: status || 'Active'
    };
    
    const stop = await BusStop.update(id, stopData);
    
    res.status(200).json({
      success: true,
      message: 'Bus stop updated successfully',
      stop
    });
  } catch (error) {
    console.error('Error updating bus stop:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Delete bus stop
const deleteBusStop = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if bus stop exists
    const existingStop = await BusStop.getById(id);
    if (!existingStop) {
      return res.status(404).json({
        success: false,
        message: 'Bus stop not found'
      });
    }
    
    await BusStop.delete(id);
    
    res.status(200).json({
      success: true,
      message: 'Bus stop deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting bus stop:', error);
    
    if (error.message.includes('Cannot delete bus stop that is used in routes')) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete bus stop that is currently used in routes'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Get all cities
const getAllCities = async (req, res) => {
  try {
    const cities = await BusStop.getAllCities();
    
    res.status(200).json({
      success: true,
      cities
    });
  } catch (error) {
    console.error('Error getting cities:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Get bus stops statistics
const getBusStopStatistics = async (req, res) => {
  try {
    const statistics = await BusStop.getStatistics();
    
    res.status(200).json({
      success: true,
      statistics
    });
  } catch (error) {
    console.error('Error getting bus stop statistics:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Search bus stops
const searchBusStops = async (req, res) => {
  try {
    const { q: searchTerm, limit = 20 } = req.query;
    
    if (!searchTerm) {
      return res.status(400).json({
        success: false,
        message: 'Search term is required'
      });
    }
    
    const stops = await BusStop.search(searchTerm, parseInt(limit));
    
    res.status(200).json({
      success: true,
      stops
    });
  } catch (error) {
    console.error('Error searching bus stops:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

module.exports = {
  getAllBusStops,
  getBusStopById,
  createBusStop,
  updateBusStop,
  deleteBusStop,
  getAllCities,
  getBusStopStatistics,
  searchBusStops
};
