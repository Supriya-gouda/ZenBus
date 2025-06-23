const Booking = require('../models/bookingModel');
const Refund = require('../models/refundModel');
const Feedback = require('../models/feedbackModel');
const User = require('../models/userModel');

// Create new booking
const createBooking = async (req, res) => {
  try {
    const userId = req.session.userId || 16; // Use test user ID if no session (for testing)
    const { scheduleId, journeyDate, seatNumbers, totalSeats, totalFare, passengerDetails } = req.body;

    console.log('Creating booking for user:', userId);
    console.log('Booking data:', { scheduleId, journeyDate, seatNumbers, totalSeats, totalFare, passengerDetails });

    // Validate input
    if (!scheduleId || !journeyDate || !seatNumbers || !totalSeats || !totalFare) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Additional validation
    if (totalSeats <= 0 || totalFare <= 0) {
      return res.status(400).json({ message: 'Invalid seat count or fare amount' });
    }

    // Check if user is blocked
    const isBlocked = await User.isUserBlocked(userId);
    if (isBlocked) {
      return res.status(403).json({
        message: 'Your account has been blocked. You cannot make new bookings. Please contact support.'
      });
    }

    // Validate journey date is not in the past
    const journeyDateObj = new Date(journeyDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (journeyDateObj < today) {
      return res.status(400).json({ message: 'Journey date cannot be in the past' });
    }

    const booking = await Booking.create(userId, scheduleId, journeyDate, seatNumbers, totalSeats, totalFare, passengerDetails);

    res.status(201).json({
      success: true,
      message: 'Booking created successfully',
      booking
    });
  } catch (error) {
    console.error('Error creating booking:', error);

    // Handle specific errors
    if (error.message.includes('insufficient seats')) {
      return res.status(400).json({ success: false, message: 'Insufficient seats available' });
    }
    if (error.message.includes('schedule not found')) {
      return res.status(404).json({ success: false, message: 'Bus schedule not found' });
    }

    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Get booking by ID
const getBookingById = async (req, res) => {
  try {
    const bookingId = req.params.id;
    const userId = req.session.userId;
    const isAdmin = !!req.session.adminId;
    
    const booking = await Booking.getById(bookingId);
    
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }
    
    // Check if user is authorized to view this booking
    if (!isAdmin && booking.user_id !== userId) {
      return res.status(403).json({ message: 'Not authorized to view this booking' });
    }
    
    res.status(200).json({ booking });
  } catch (error) {
    console.error('Error getting booking:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get bookings by user ID
const getBookingsByUserId = async (req, res) => {
  try {
    const userId = req.session.userId;
    console.log('Getting bookings for user ID:', userId); // Debug log

    const bookings = await Booking.getByUserId(userId);
    console.log('Found bookings:', bookings.length); // Debug log

    res.status(200).json({ bookings });
  } catch (error) {
    console.error('Error getting bookings:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get all bookings (admin)
const getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.getAll();
    
    res.status(200).json({ bookings });
  } catch (error) {
    console.error('Error getting all bookings:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Cancel booking
const cancelBooking = async (req, res) => {
  try {
    const bookingId = req.params.id;
    const userId = req.session.userId;
    const isAdmin = !!req.session.adminId;
    const { cancellationReason, processRefund } = req.body;

    // Check if booking exists and belongs to user
    const booking = await Booking.getById(bookingId);

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Check if user is authorized to cancel this booking
    if (!isAdmin && booking.user_id !== userId) {
      return res.status(403).json({ message: 'Not authorized to cancel this booking' });
    }

    // Check if booking is already cancelled
    if (booking.booking_status === 'Cancelled') {
      return res.status(400).json({ message: 'Booking is already cancelled' });
    }

    // Check if cancellation is allowed (2 hours before departure)
    const departureTime = new Date(booking.departure_time);
    const currentTime = new Date();
    const hoursUntilDeparture = (departureTime - currentTime) / (1000 * 60 * 60);

    if (hoursUntilDeparture < 2 && !isAdmin) {
      return res.status(400).json({
        message: 'Cancellation not allowed. Bookings can only be cancelled up to 2 hours before departure.'
      });
    }

    // Cancel the booking
    const cancellationResult = await Booking.cancel(
      bookingId,
      cancellationReason || 'User cancellation'
    );

    let refundInfo = null;

    // Process refund if requested and eligible
    if (processRefund !== false) {
      try {
        // Calculate refund amount using the Refund model
        const refundCalculation = Refund.calculateRefundAmount(
          booking.total_fare,
          booking.departure_time,
          cancellationResult.cancellationDate
        );

        if (refundCalculation.refundAmount > 0) {
          try {
            // Get payment ID
            const db = require('../db/connection');
            const [payments] = await db.execute(
              'SELECT payment_id FROM payments WHERE booking_id = ? LIMIT 1',
              [bookingId]
            );

            if (payments.length > 0) {
              const paymentId = payments[0].payment_id;

              // Create refund
              const refund = await Refund.create(
                bookingId,
                paymentId,
                refundCalculation.refundAmount,
                refundCalculation.reason
              );

              refundInfo = {
                ...refund,
                refundPercentage: refundCalculation.refundPercentage,
                reason: refundCalculation.reason
              };
            } else {
              // No payment found, but still provide refund info
              refundInfo = {
                refundAmount: refundCalculation.refundAmount,
                refundPercentage: refundCalculation.refundPercentage,
                reason: refundCalculation.reason,
                status: 'Pending - No payment record found'
              };
            }
          } catch (refundCreationError) {
            console.error('Error creating refund record:', refundCreationError);
            // Still provide refund calculation info even if we can't create the record
            refundInfo = {
              refundAmount: refundCalculation.refundAmount,
              refundPercentage: refundCalculation.refundPercentage,
              reason: refundCalculation.reason,
              status: 'Calculated - Refund processing failed'
            };
          }
        } else {
          refundInfo = {
            refundAmount: 0,
            refundPercentage: 0,
            reason: refundCalculation.reason,
            status: 'No refund eligible'
          };
        }
      } catch (refundError) {
        console.error('Error processing refund:', refundError);
        // Provide basic refund info even if calculation fails
        refundInfo = {
          refundAmount: 0,
          refundPercentage: 0,
          reason: 'Refund calculation failed',
          status: 'Error'
        };
      }
    }

    res.status(200).json({
      message: 'Booking cancelled successfully',
      cancellation: cancellationResult,
      refund: refundInfo
    });
  } catch (error) {
    console.error('Error cancelling booking:', error);

    if (error.message.includes('already cancelled')) {
      return res.status(400).json({ message: error.message });
    }

    res.status(500).json({ message: 'Server error' });
  }
};

// Get bookings by date range (admin)
const getBookingsByDateRange = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    // Validate input
    if (!startDate || !endDate) {
      return res.status(400).json({ message: 'Start date and end date are required' });
    }

    const bookings = await Booking.getByDateRange(startDate, endDate);

    res.status(200).json({ bookings });
  } catch (error) {
    console.error('Error getting bookings by date range:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Submit feedback for a booking
const submitFeedback = async (req, res) => {
  try {
    const bookingId = req.params.id;
    const userId = req.session.userId;
    const { rating, comments } = req.body;

    // Validate input
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Rating must be between 1 and 5' });
    }

    // Check if booking exists and belongs to user
    const booking = await Booking.getById(bookingId);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    if (booking.user_id !== userId) {
      return res.status(403).json({ message: 'Not authorized to provide feedback for this booking' });
    }

    // Check if booking is completed (journey date has passed)
    // For daily schedules, allow feedback if the journey date is today or in the past
    const journeyDate = new Date(booking.journey_date);
    const currentDate = new Date();

    // Set time to start of day for comparison
    journeyDate.setHours(0, 0, 0, 0);
    currentDate.setHours(0, 0, 0, 0);

    if (journeyDate > currentDate) {
      return res.status(400).json({ message: 'Cannot provide feedback for future bookings' });
    }

    // Check if feedback already exists
    const existingFeedback = await Feedback.getByUserId(userId);
    const bookingFeedback = existingFeedback.find(f => f.booking_id === parseInt(bookingId));
    if (bookingFeedback) {
      return res.status(400).json({ message: 'Feedback already submitted for this booking' });
    }

    // Create feedback
    const feedback = await Feedback.create(userId, bookingId, rating, comments);

    res.status(201).json({
      message: 'Feedback submitted successfully',
      feedback
    });
  } catch (error) {
    console.error('Error submitting feedback:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get refund details for a booking
const getRefundDetails = async (req, res) => {
  try {
    const bookingId = req.params.id;
    const userId = req.session.userId;

    // Check if booking exists and belongs to user
    const booking = await Booking.getById(bookingId);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    if (booking.user_id !== userId) {
      return res.status(403).json({ message: 'Not authorized to view refund details for this booking' });
    }

    // Get refund details
    const refunds = await Refund.getByBookingId(bookingId);

    if (refunds.length === 0) {
      return res.status(404).json({ message: 'No refund found for this booking' });
    }

    res.status(200).json({ refund: refunds[0] });
  } catch (error) {
    console.error('Error getting refund details:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  createBooking,
  getBookingById,
  getBookingsByUserId,
  getAllBookings,
  cancelBooking,
  getBookingsByDateRange,
  submitFeedback,
  getRefundDetails
};