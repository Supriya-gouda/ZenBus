const Feedback = require('../models/feedbackModel');
const db = require('../db/connection');

// Create new feedback
const createFeedback = async (req, res) => {
  try {
    const userId = req.session.userId;
    const { bookingId, rating, comments } = req.body;

    // Validate input
    if (!rating) {
      return res.status(400).json({ message: 'Rating is required' });
    }

    // Validate rating range
    if (rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Rating must be between 1 and 5' });
    }

    // bookingId is optional, can be null for general feedback
    const feedback = await Feedback.create(userId, bookingId || null, rating, comments);
    
    res.status(201).json({
      message: 'Feedback submitted successfully',
      feedback
    });
  } catch (error) {
    console.error('Error creating feedback:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get all feedback (admin)
const getAllFeedback = async (req, res) => {
  try {
    const feedback = await Feedback.getAll();
    
    res.status(200).json({ feedback });
  } catch (error) {
    console.error('Error getting all feedback:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get feedback by user ID
const getFeedbackByUserId = async (req, res) => {
  try {
    const userId = req.session.userId;
    console.log('Getting feedback for user ID:', userId);

    if (!userId) {
      console.log('No user ID in session');
      return res.status(401).json({ message: 'User not authenticated' });
    }

    console.log('Executing feedback query...');

    // Use a simple query first to test
    const [feedback] = await db.execute(`
      SELECT f.feedback_id, f.booking_id, f.rating, f.comments, f.feedback_date,
             f.admin_response, f.response_date
      FROM feedback f
      WHERE f.user_id = ?
      ORDER BY f.feedback_date DESC
    `, [userId]);

    console.log('Found feedback count:', feedback.length);
    console.log('Feedback data:', JSON.stringify(feedback, null, 2));

    res.status(200).json({ feedback });
  } catch (error) {
    console.error('Error getting feedback by user ID:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update feedback
const updateFeedback = async (req, res) => {
  try {
    const userId = req.session.userId;
    const feedbackId = req.params.id;
    const { rating, comments } = req.body;

    // Validate input
    if (!rating) {
      return res.status(400).json({ message: 'Rating is required' });
    }

    // Validate rating range
    if (rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Rating must be between 1 and 5' });
    }

    // Check if feedback belongs to user
    const existingFeedback = await Feedback.getById(feedbackId);
    if (!existingFeedback || existingFeedback.user_id !== userId) {
      return res.status(403).json({ message: 'Unauthorized to update this feedback' });
    }

    const feedback = await Feedback.update(feedbackId, rating, comments);

    res.status(200).json({
      message: 'Feedback updated successfully',
      feedback
    });
  } catch (error) {
    console.error('Error updating feedback:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete feedback
const deleteFeedback = async (req, res) => {
  try {
    const userId = req.session.userId;
    const feedbackId = req.params.id;

    // Check if feedback belongs to user
    const existingFeedback = await Feedback.getById(feedbackId);
    if (!existingFeedback || existingFeedback.user_id !== userId) {
      return res.status(403).json({ message: 'Unauthorized to delete this feedback' });
    }

    await Feedback.delete(feedbackId);

    res.status(200).json({
      message: 'Feedback deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting feedback:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get feedback statistics (admin)
const getFeedbackStatistics = async (req, res) => {
  try {
    const statistics = await Feedback.getStatistics();

    res.status(200).json({ statistics });
  } catch (error) {
    console.error('Error getting feedback statistics:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Respond to feedback (admin)
const respondToFeedback = async (req, res) => {
  try {
    const feedbackId = req.params.id;
    const { response } = req.body;

    if (!response) {
      return res.status(400).json({ message: 'Response is required' });
    }

    const result = await Feedback.addResponse(feedbackId, response);

    res.status(200).json({
      message: 'Response added successfully',
      result
    });
  } catch (error) {
    console.error('Error responding to feedback:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get feedback with filters (admin)
const getFeedbackWithFilters = async (req, res) => {
  try {
    const filters = {
      rating: req.query.rating,
      category: req.query.category,
      dateRange: req.query.dateRange,
      hasResponse: req.query.hasResponse
    };

    const feedback = await Feedback.getWithFilters(filters);

    res.status(200).json({
      success: true,
      feedback
    });
  } catch (error) {
    console.error('Error getting filtered feedback:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Get user's feedback
const getUserFeedback = async (req, res) => {
  try {
    const userId = req.session.userId;

    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    const feedback = await Feedback.getUserFeedback(userId);

    res.status(200).json({
      message: 'User feedback retrieved successfully',
      feedback
    });
  } catch (error) {
    console.error('Error fetching user feedback:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  createFeedback,
  getAllFeedback,
  getFeedbackByUserId,
  updateFeedback,
  deleteFeedback,
  getFeedbackStatistics,
  respondToFeedback,
  getFeedbackWithFilters,
  getUserFeedback
};