const Passenger = require('../models/passengerModel');

// Get all passengers
const getAllPassengers = async (req, res) => {
  try {
    const filters = {
      search: req.query.search,
      status: req.query.status
    };
    
    const passengers = await Passenger.getAll(filters);
    
    res.status(200).json({
      success: true,
      passengers
    });
  } catch (error) {
    console.error('Error getting passengers:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Get passenger by ID
const getPassengerById = async (req, res) => {
  try {
    const { id } = req.params;
    const passenger = await Passenger.getById(id);
    
    if (!passenger) {
      return res.status(404).json({
        success: false,
        message: 'Passenger not found'
      });
    }
    
    res.status(200).json({
      success: true,
      passenger
    });
  } catch (error) {
    console.error('Error getting passenger:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Get passenger booking history
const getPassengerBookingHistory = async (req, res) => {
  try {
    const { id } = req.params;
    const { limit = 20, offset = 0 } = req.query;
    
    const bookings = await Passenger.getBookingHistory(id, parseInt(limit), parseInt(offset));
    
    res.status(200).json({
      success: true,
      bookings
    });
  } catch (error) {
    console.error('Error getting passenger booking history:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Get passenger travel preferences
const getPassengerTravelPreferences = async (req, res) => {
  try {
    const { id } = req.params;
    const preferences = await Passenger.getTravelPreferences(id);
    
    res.status(200).json({
      success: true,
      preferences
    });
  } catch (error) {
    console.error('Error getting passenger travel preferences:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Update passenger information
const updatePassenger = async (req, res) => {
  try {
    const { id } = req.params;
    const { full_name, email, phone } = req.body;
    
    const passengerData = {
      full_name,
      email,
      phone
    };
    
    const passenger = await Passenger.update(id, passengerData);
    
    res.status(200).json({
      success: true,
      message: 'Passenger updated successfully',
      passenger
    });
  } catch (error) {
    console.error('Error updating passenger:', error);
    if (error.code === 'ER_DUP_ENTRY') {
      res.status(400).json({
        success: false,
        message: 'Email already exists'
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

// Deactivate passenger account
const deactivatePassenger = async (req, res) => {
  try {
    const { id } = req.params;
    
    await Passenger.deactivate(id);
    
    res.status(200).json({
      success: true,
      message: 'Passenger account deactivated successfully'
    });
  } catch (error) {
    console.error('Error deactivating passenger:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error'
    });
  }
};

// Get passenger statistics
const getPassengerStatistics = async (req, res) => {
  try {
    const statistics = await Passenger.getStatistics();
    
    res.status(200).json({
      success: true,
      statistics
    });
  } catch (error) {
    console.error('Error getting passenger statistics:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Get top passengers by spending
const getTopPassengers = async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    const passengers = await Passenger.getTopPassengers(parseInt(limit));
    
    res.status(200).json({
      success: true,
      passengers
    });
  } catch (error) {
    console.error('Error getting top passengers:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Get passenger analytics
const getPassengerAnalytics = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: 'Start date and end date are required'
      });
    }
    
    const analytics = await Passenger.getAnalytics(startDate, endDate);
    
    res.status(200).json({
      success: true,
      analytics
    });
  } catch (error) {
    console.error('Error getting passenger analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Get frequent travelers
const getFrequentTravelers = async (req, res) => {
  try {
    const { minBookings = 5 } = req.query;
    const travelers = await Passenger.getFrequentTravelers(parseInt(minBookings));
    
    res.status(200).json({
      success: true,
      travelers
    });
  } catch (error) {
    console.error('Error getting frequent travelers:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Search passengers
const searchPassengers = async (req, res) => {
  try {
    const { q: searchTerm, limit = 20 } = req.query;
    
    if (!searchTerm) {
      return res.status(400).json({
        success: false,
        message: 'Search term is required'
      });
    }
    
    const passengers = await Passenger.search(searchTerm, parseInt(limit));
    
    res.status(200).json({
      success: true,
      passengers
    });
  } catch (error) {
    console.error('Error searching passengers:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Block/Unblock passenger account
const blockPassenger = async (req, res) => {
  try {
    const { passengerId } = req.params;
    const { reason } = req.body;

    const result = await Passenger.blockAccount(passengerId, reason);

    res.status(200).json({
      success: true,
      message: 'Passenger account blocked successfully',
      result
    });
  } catch (error) {
    console.error('Error blocking passenger:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

const unblockPassenger = async (req, res) => {
  try {
    const { passengerId } = req.params;

    const result = await Passenger.unblockAccount(passengerId);

    res.status(200).json({
      success: true,
      message: 'Passenger account unblocked successfully',
      result
    });
  } catch (error) {
    console.error('Error unblocking passenger:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

module.exports = {
  getAllPassengers,
  getPassengerById,
  getPassengerBookingHistory,
  getPassengerTravelPreferences,
  updatePassenger,
  deactivatePassenger,
  getPassengerStatistics,
  getTopPassengers,
  getPassengerAnalytics,
  getFrequentTravelers,
  searchPassengers,
  blockPassenger,
  unblockPassenger
};
