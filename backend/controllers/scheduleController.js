const Schedule = require('../models/scheduleModel');

// Get all schedules
const getAllSchedules = async (req, res) => {
  try {
    const schedules = await Schedule.getAll();
    res.status(200).json({ schedules });
  } catch (error) {
    console.error('Error getting schedules:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get schedule by ID
const getScheduleById = async (req, res) => {
  try {
    const scheduleId = req.params.id;

    const schedule = await Schedule.getById(scheduleId);

    if (!schedule) {
      return res.status(404).json({ message: 'Schedule not found' });
    }

    res.status(200).json({ schedule });
  } catch (error) {
    console.error('Error getting schedule:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Search schedules
const searchSchedules = async (req, res) => {
  try {
    const { source, destination, journeyDate } = req.body;

    // Validate input
    if (!source || !destination || !journeyDate) {
      return res.status(400).json({ message: 'Source, destination, and journey date are required' });
    }

    const schedules = await Schedule.search(source, destination, journeyDate);

    res.status(200).json({ schedules });
  } catch (error) {
    console.error('Error searching schedules:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Create new schedule
const createSchedule = async (req, res) => {
  try {
    const { busId, routeId, driverId, departureTime, arrivalTime, fare } = req.body;

    // Validate input
    if (!busId || !routeId || !departureTime || !arrivalTime || !fare) {
      return res.status(400).json({ message: 'Bus ID, route ID, departure time, arrival time, and fare are required' });
    }

    // Convert datetime to time format if needed
    const formatTime = (timeStr) => {
      if (timeStr.includes('T')) {
        // If it's a datetime format, extract just the time part
        return timeStr.split('T')[1].substring(0, 5); // Get HH:MM
      }
      return timeStr;
    };

    const formattedDepartureTime = formatTime(departureTime);
    const formattedArrivalTime = formatTime(arrivalTime);

    const schedule = await Schedule.create(busId, routeId, driverId, formattedDepartureTime, formattedArrivalTime, fare);

    res.status(201).json({
      message: 'Schedule created successfully',
      schedule
    });
  } catch (error) {
    console.error('Error creating schedule:', error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

// Update schedule
const updateSchedule = async (req, res) => {
  try {
    const scheduleId = req.params.id;
    const { busId, routeId, driverId, departureTime, arrivalTime, fare } = req.body;
    
    // Validate input
    if (!busId || !routeId || !departureTime || !arrivalTime || !fare) {
      return res.status(400).json({ message: 'Bus ID, route ID, departure time, arrival time, and fare are required' });
    }
    
    const schedule = await Schedule.update(scheduleId, busId, routeId, driverId, departureTime, arrivalTime, fare);
    
    res.status(200).json({
      message: 'Schedule updated successfully',
      schedule
    });
  } catch (error) {
    console.error('Error updating schedule:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete schedule
const deleteSchedule = async (req, res) => {
  try {
    const scheduleId = req.params.id;
    
    await Schedule.delete(scheduleId);
    
    res.status(200).json({
      message: 'Schedule deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting schedule:', error);
    
    // Handle foreign key constraint
    if (error.code === 'ER_ROW_IS_REFERENCED_2') {
      return res.status(400).json({ message: 'Cannot delete schedule as it is referenced in bookings' });
    }
    
    res.status(500).json({ message: 'Server error' });
  }
};

// Get schedules with filters
const getSchedulesWithFilters = async (req, res) => {
  try {
    const filters = {
      source: req.query.source,
      destination: req.query.destination,
      date: req.query.date,
      bus_id: req.query.bus_id
    };

    const schedules = await Schedule.getAllWithFilters(filters);

    res.status(200).json({
      success: true,
      schedules
    });
  } catch (error) {
    console.error('Error getting schedules with filters:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Check schedule conflicts
const checkScheduleConflicts = async (req, res) => {
  try {
    const { bus_id, departure_time, arrival_time, exclude_schedule_id } = req.query;

    if (!bus_id || !departure_time || !arrival_time) {
      return res.status(400).json({
        success: false,
        message: 'Bus ID, departure time, and arrival time are required'
      });
    }

    const conflicts = await Schedule.checkScheduleConflicts(
      bus_id,
      departure_time,
      arrival_time,
      exclude_schedule_id
    );

    res.status(200).json({
      success: true,
      conflicts,
      hasConflicts: conflicts.length > 0
    });
  } catch (error) {
    console.error('Error checking schedule conflicts:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Get upcoming schedules
const getUpcomingSchedules = async (req, res) => {
  try {
    const { days = 7 } = req.query;
    const schedules = await Schedule.getUpcoming(parseInt(days));

    res.status(200).json({
      success: true,
      schedules
    });
  } catch (error) {
    console.error('Error getting upcoming schedules:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Get schedule statistics
const getScheduleStatistics = async (req, res) => {
  try {
    const statistics = await Schedule.getStatistics();

    res.status(200).json({
      success: true,
      statistics
    });
  } catch (error) {
    console.error('Error getting schedule statistics:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Get unassigned schedules
const getUnassignedSchedules = async (req, res) => {
  try {
    const schedules = await Schedule.getUnassignedSchedules();

    res.status(200).json({
      success: true,
      schedules
    });
  } catch (error) {
    console.error('Error getting unassigned schedules:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

module.exports = {
  getAllSchedules,
  getScheduleById,
  searchSchedules,
  createSchedule,
  updateSchedule,
  deleteSchedule,
  getSchedulesWithFilters,
  checkScheduleConflicts,
  getUpcomingSchedules,
  getScheduleStatistics,
  getUnassignedSchedules
};