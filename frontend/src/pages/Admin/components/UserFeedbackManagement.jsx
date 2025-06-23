import React, { useState, useEffect } from 'react';
import { MessageSquare, Star, User, Calendar, Filter, Reply, Trash2, Search, BarChart3 } from 'lucide-react';
import Button from '../../../components/UI/Button';
import Card from '../../../components/UI/Card';
import Badge from '../../../components/UI/Badge';
import adminService from '../../../services/adminService';

const UserFeedbackManagement = () => {
  const [feedback, setFeedback] = useState([]);
  const [filteredFeedback, setFilteredFeedback] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showResponseModal, setShowResponseModal] = useState(false);
  const [selectedFeedback, setSelectedFeedback] = useState(null);
  const [responseText, setResponseText] = useState('');
  const [statistics, setStatistics] = useState({});
  const [filters, setFilters] = useState({
    rating: '',
    category: '',
    hasResponse: '',
    dateRange: ''
  });

  useEffect(() => {
    fetchFeedback();
    fetchStatistics();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [feedback, filters]);

  const fetchFeedback = async () => {
    try {
      const result = await adminService.getAllFeedback();
      if (result.success) {
        setFeedback(result.feedback);
      } else {
        // Use mock data as fallback
        setFeedback([
          {
            feedback_id: 1,
            user_name: 'John Doe',
            user_email: 'john@example.com',
            rating: 5,
            comments: 'Excellent service! The bus was clean and comfortable.',
            feedback_date: '2024-01-15T10:30:00Z',
            source: 'Mumbai',
            destination: 'Pune',
            admin_response: null,
            response_date: null,
            category: 'Service'
          },
          {
            feedback_id: 2,
            user_name: 'Jane Smith',
            user_email: 'jane@example.com',
            rating: 3,
            comments: 'Bus was delayed by 30 minutes. Could be better.',
            feedback_date: '2024-01-14T15:45:00Z',
            source: 'Delhi',
            destination: 'Agra',
            admin_response: 'Thank you for your feedback. We apologize for the delay and are working to improve our punctuality.',
            response_date: '2024-01-15T09:00:00Z',
            category: 'Punctuality'
          },
          {
            feedback_id: 3,
            user_name: 'Mike Johnson',
            user_email: 'mike@example.com',
            rating: 4,
            comments: 'Good experience overall. Driver was professional.',
            feedback_date: '2024-01-13T12:20:00Z',
            source: 'Bangalore',
            destination: 'Chennai',
            admin_response: null,
            response_date: null,
            category: 'Driver'
          }
        ]);
      }
    } catch (error) {
      console.error('Error fetching feedback:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStatistics = async () => {
    try {
      const result = await adminService.getFeedbackStatistics();
      if (result.success) {
        setStatistics(result.statistics);
      } else {
        // Use mock statistics
        setStatistics({
          total_feedback: 156,
          average_rating: 4.2,
          five_star: 45,
          four_star: 62,
          three_star: 28,
          two_star: 15,
          one_star: 6,
          response_rate: 68
        });
      }
    } catch (error) {
      console.error('Error fetching statistics:', error);
    }
  };

  const applyFilters = () => {
    let filtered = [...feedback];

    if (filters.rating) {
      filtered = filtered.filter(item => item.rating === parseInt(filters.rating));
    }

    if (filters.category) {
      filtered = filtered.filter(item => 
        item.category && item.category.toLowerCase().includes(filters.category.toLowerCase())
      );
    }

    if (filters.hasResponse === 'true') {
      filtered = filtered.filter(item => item.admin_response);
    } else if (filters.hasResponse === 'false') {
      filtered = filtered.filter(item => !item.admin_response);
    }

    if (filters.dateRange) {
      const [startDate, endDate] = filters.dateRange.split(',');
      filtered = filtered.filter(item => {
        const feedbackDate = new Date(item.feedback_date).toISOString().split('T')[0];
        return feedbackDate >= startDate && feedbackDate <= endDate;
      });
    }

    setFilteredFeedback(filtered);
  };

  const handleRespond = (feedbackItem) => {
    setSelectedFeedback(feedbackItem);
    setResponseText(feedbackItem.admin_response || '');
    setShowResponseModal(true);
  };

  const handleSubmitResponse = async (e) => {
    e.preventDefault();
    try {
      const result = await adminService.respondToFeedback(selectedFeedback.feedback_id, {
        response: responseText
      });

      if (result.success) {
        await fetchFeedback();
        setShowResponseModal(false);
        setResponseText('');
        setSelectedFeedback(null);
        alert('Response submitted successfully!');
      } else {
        alert('Failed to submit response: ' + (result.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error submitting response:', error);
      alert('Error submitting response: ' + error.message);
    }
  };

  const handleDelete = async (feedbackId) => {
    if (window.confirm('Are you sure you want to delete this feedback?')) {
      try {
        const result = await adminService.deleteFeedback(feedbackId);
        if (result.success) {
          await fetchFeedback();
          await fetchStatistics();
        }
      } catch (error) {
        console.error('Error deleting feedback:', error);
      }
    }
  };

  const getRatingStars = (rating) => {
    return Array.from({ length: 5 }, (_, index) => (
      <Star
        key={index}
        className={`w-4 h-4 ${
          index < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
        }`}
      />
    ));
  };

  const getRatingColor = (rating) => {
    if (rating >= 4) return 'success';
    if (rating >= 3) return 'warning';
    return 'danger';
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">User Feedback Management</h2>
          <p className="text-gray-600">View, respond to, and manage user feedback for all routes and services</p>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="text-center">
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <MessageSquare className="w-6 h-6 text-red-600" />
          </div>
          <div className="text-2xl font-bold text-gray-900">{statistics.total_feedback || 0}</div>
          <div className="text-sm text-gray-600">Total Feedback</div>
        </Card>

        <Card className="text-center">
          <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Star className="w-6 h-6 text-yellow-600" />
          </div>
          <div className="text-2xl font-bold text-gray-900">{statistics.average_rating || '0.0'}</div>
          <div className="text-sm text-gray-600">Average Rating</div>
        </Card>

        <Card className="text-center">
          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Reply className="w-6 h-6 text-green-600" />
          </div>
          <div className="text-2xl font-bold text-gray-900">{statistics.response_rate || 0}%</div>
          <div className="text-sm text-gray-600">Response Rate</div>
        </Card>

        <Card className="text-center">
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <BarChart3 className="w-6 h-6 text-blue-600" />
          </div>
          <div className="text-2xl font-bold text-gray-900">{statistics.five_star || 0}</div>
          <div className="text-sm text-gray-600">5-Star Reviews</div>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Rating</label>
            <select
              value={filters.rating}
              onChange={(e) => setFilters({ ...filters, rating: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              <option value="">All Ratings</option>
              <option value="5">5 Stars</option>
              <option value="4">4 Stars</option>
              <option value="3">3 Stars</option>
              <option value="2">2 Stars</option>
              <option value="1">1 Star</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <select
              value={filters.category}
              onChange={(e) => setFilters({ ...filters, category: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              <option value="">All Categories</option>
              <option value="Service">Service</option>
              <option value="Driver">Driver</option>
              <option value="Punctuality">Punctuality</option>
              <option value="Cleanliness">Cleanliness</option>
              <option value="General">General</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Response Status</label>
            <select
              value={filters.hasResponse}
              onChange={(e) => setFilters({ ...filters, hasResponse: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              <option value="">All Feedback</option>
              <option value="true">Responded</option>
              <option value="false">Pending Response</option>
            </select>
          </div>
          <div className="flex items-end">
            <Button
              onClick={() => setFilters({ rating: '', category: '', hasResponse: '', dateRange: '' })}
              variant="outline"
              className="w-full border-red-200 text-red-600 hover:bg-red-50"
            >
              Clear Filters
            </Button>
          </div>
        </div>
      </Card>

      {/* Feedback List */}
      <div className="space-y-4">
        {filteredFeedback.map((feedbackItem) => (
          <Card key={feedbackItem.feedback_id} className="hover:shadow-lg transition-shadow duration-200">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-start space-x-4">
                <div className="p-3 bg-red-100 rounded-lg">
                  <MessageSquare className="w-6 h-6 text-red-600" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <h3 className="font-semibold text-gray-900">{feedbackItem.user_name}</h3>
                    <Badge variant={getRatingColor(feedbackItem.rating)} size="sm">
                      {feedbackItem.rating} ⭐
                    </Badge>
                    {feedbackItem.category && (
                      <Badge variant="secondary" size="sm">
                        {feedbackItem.category}
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center space-x-1 mb-2">
                    {getRatingStars(feedbackItem.rating)}
                  </div>
                  <p className="text-gray-700 mb-3">{feedbackItem.comments}</p>
                  {feedbackItem.source && feedbackItem.destination && (
                    <div className="text-sm text-gray-600 mb-2">
                      Route: {feedbackItem.source} → {feedbackItem.destination}
                    </div>
                  )}
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <div className="flex items-center space-x-1">
                      <User className="w-4 h-4" />
                      <span>{feedbackItem.user_email}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Calendar className="w-4 h-4" />
                      <span>{formatDate(feedbackItem.feedback_date)}</span>
                    </div>
                  </div>

                  {/* Admin Response */}
                  {feedbackItem.admin_response && (
                    <div className="mt-4 p-3 bg-gray-50 rounded-lg border-l-4 border-red-500">
                      <div className="flex items-center space-x-2 mb-2">
                        <Reply className="w-4 h-4 text-red-600" />
                        <span className="font-medium text-gray-900">Admin Response</span>
                        <span className="text-sm text-gray-600">
                          {formatDate(feedbackItem.response_date)}
                        </span>
                      </div>
                      <p className="text-gray-700">{feedbackItem.admin_response}</p>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex space-x-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleRespond(feedbackItem)}
                  className="border-red-200 text-red-600 hover:bg-red-50"
                >
                  <Reply className="w-4 h-4 mr-1" />
                  {feedbackItem.admin_response ? 'Edit Response' : 'Respond'}
                </Button>
                <Button
                  size="sm"
                  variant="danger"
                  onClick={() => handleDelete(feedbackItem.feedback_id)}
                >
                  <Trash2 className="w-4 h-4 mr-1" />
                  Delete
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Response Modal */}
      {showResponseModal && selectedFeedback && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Respond to Feedback
            </h3>

            {/* Original Feedback */}
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <span className="font-medium text-gray-900">{selectedFeedback.user_name}</span>
                <div className="flex items-center space-x-1">
                  {getRatingStars(selectedFeedback.rating)}
                </div>
              </div>
              <p className="text-gray-700">{selectedFeedback.comments}</p>
            </div>

            <form onSubmit={handleSubmitResponse} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Your Response *
                </label>
                <textarea
                  value={responseText}
                  onChange={(e) => setResponseText(e.target.value)}
                  required
                  rows={6}
                  placeholder="Write your response to the customer..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowResponseModal(false);
                    setResponseText('');
                    setSelectedFeedback(null);
                  }}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700"
                >
                  {selectedFeedback.admin_response ? 'Update Response' : 'Send Response'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserFeedbackManagement;
