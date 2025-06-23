const Route = require('../models/routeModel');

// Get all routes (admin)
const getAllRoutes = async (req, res) => {
  try {
    const routes = await Route.getAll();
    res.status(200).json({ routes });
  } catch (error) {
    console.error('Error getting routes:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get all routes (public)
const getAllRoutesPublic = async (req, res) => {
  try {
    const routes = await Route.getAll();
    res.status(200).json({ success: true, routes });
  } catch (error) {
    console.error('Error getting routes:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Get route by ID
const getRouteById = async (req, res) => {
  try {
    const routeId = req.params.id;
    
    const route = await Route.getById(routeId);
    
    if (!route) {
      return res.status(404).json({ message: 'Route not found' });
    }
    
    res.status(200).json({ route });
  } catch (error) {
    console.error('Error getting route:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Create new route
const createRoute = async (req, res) => {
  try {
    const { source, destination, distance, baseFare } = req.body;

    // Validate input
    if (!source || !destination) {
      return res.status(400).json({ message: 'Source and destination are required' });
    }

    const route = await Route.create(source, destination, distance || 0, baseFare || 0);

    res.status(201).json({
      message: 'Route created successfully',
      route
    });
  } catch (error) {
    console.error('Error creating route:', error);
    
    // Handle duplicate route
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ message: 'Route already exists' });
    }
    
    res.status(500).json({ message: 'Server error' });
  }
};

// Update route
const updateRoute = async (req, res) => {
  try {
    const routeId = req.params.id;
    const { source, destination, distance } = req.body;
    
    // Validate input
    if (!source || !destination) {
      return res.status(400).json({ message: 'Source and destination are required' });
    }
    
    const route = await Route.update(routeId, source, destination, distance);
    
    res.status(200).json({
      message: 'Route updated successfully',
      route
    });
  } catch (error) {
    console.error('Error updating route:', error);
    
    // Handle duplicate route
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ message: 'Route already exists' });
    }
    
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete route
const deleteRoute = async (req, res) => {
  try {
    const routeId = req.params.id;
    
    await Route.delete(routeId);
    
    res.status(200).json({
      message: 'Route deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting route:', error);
    
    // Handle foreign key constraint
    if (error.code === 'ER_ROW_IS_REFERENCED_2') {
      return res.status(400).json({ message: 'Cannot delete route as it is referenced in schedules' });
    }
    
    res.status(500).json({ message: 'Server error' });
  }
};

// Get all sources
const getAllSources = async (req, res) => {
  try {
    const sources = await Route.getAllSources();
    res.status(200).json({ sources });
  } catch (error) {
    console.error('Error getting sources:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get destinations for source
const getDestinationsForSource = async (req, res) => {
  try {
    const { source } = req.params;
    
    if (!source) {
      return res.status(400).json({ message: 'Source is required' });
    }
    
    const destinations = await Route.getDestinationsForSource(source);
    res.status(200).json({ destinations });
  } catch (error) {
    console.error('Error getting destinations:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getAllRoutes,
  getAllRoutesPublic,
  getRouteById,
  createRoute,
  updateRoute,
  deleteRoute,
  getAllSources,
  getDestinationsForSource
};