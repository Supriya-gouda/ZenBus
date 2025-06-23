import React, { useState, useEffect } from 'react';
import { Star, Edit, Trash2, MessageSquare, Calendar, MapPin, Plus, Reply } from 'lucide-react';
import Card from '../../../components/UI/Card';
import Button from '../../../components/UI/Button';
import Badge from '../../../components/UI/Badge';
import { feedbackService } from '../../../services/feedbackService';

const MyFeedback = () => {
  const [feedback, setFeedback] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingFeedback, setEditingFeedback] = useState(null);
  const [editForm, setEditForm] = useState({ rating: 5, comments: '' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchUserFeedback();
  }, []);

  const fetchUserFeedback = async () => {
    try {
      setLoading(true);
      const result = await feedbackService.getUserFeedback();
      if (result.success) {
        setFeedback(result.feedback);
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError('Failed to fetch feedback');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (feedbackItem) => {
    setEditingFeedback(feedbackItem.feedback_id);
    setEditForm({
      rating: feedbackItem.rating,
      comments: feedbackItem.comments || ''
    });
  };

  const handleCancelEdit = () => {
    setEditingFeedback(null);
    setEditForm({ rating: 5, comments: '' });
  };

  const handleUpdateFeedback = async (feedbackId) => {
    try {
      setSubmitting(true);
      setError('');
      const result = await feedbackService.updateFeedback(feedbackId, editForm);
      if (result.success) {
        await fetchUserFeedback();
        setEditingFeedback(null);
        setEditForm({ rating: 5, comments: '' });
        // Show success message briefly
        setError('');
        setTimeout(() => {
          // Success handled by refresh
        }, 1000);
      } else {
        setError(result.error || 'Failed to update feedback');
      }
    } catch (err) {
      setError('Failed to update feedback');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteFeedback = async (feedbackId) => {
    if (!window.confirm('Are you sure you want to delete this feedback?')) {
      return;
    }

    try {
      const result = await feedbackService.deleteFeedback(feedbackId);
      if (result.success) {
        await fetchUserFeedback();
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError('Failed to delete feedback');
    }
  };

  const renderStars = (rating, interactive = false, onChange = null) => {
    return (
      <div className="flex space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-5 h-5 ${
              star <= rating
                ? 'text-yellow-400 fill-current'
                : 'text-gray-300'
            } ${interactive ? 'cursor-pointer hover:text-yellow-400' : ''}`}
            onClick={interactive && onChange ? () => onChange(star) : undefined}
          />
        ))}
      </div>
    );
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
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
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">My Feedback</h2>
          <p className="text-gray-600">View and manage your submitted feedback</p>
        </div>
        <div className="text-sm text-gray-500">
          Total: {feedback.length} feedback{feedback.length !== 1 ? 's' : ''}
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800 text-sm">{error}</p>
        </div>
      )}

      {/* Feedback List */}
      {feedback.length === 0 ? (
        <Card className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <MessageSquare className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No feedback yet</h3>
          <p className="text-gray-600 mb-6">
            Share your experience by providing feedback on your completed journeys.
          </p>
        </Card>
      ) : (
        <div className="space-y-4">
          {feedback.map((item) => (
            <Card key={item.feedback_id} className="hover:shadow-lg transition-shadow duration-200">
              <div className="space-y-4">
                {/* Feedback Header */}
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-4 mb-2">
                      {editingFeedback === item.feedback_id ? (
                        renderStars(editForm.rating, true, (rating) =>
                          setEditForm({ ...editForm, rating })
                        )
                      ) : (
                        renderStars(item.rating)
                      )}
                      <Badge variant="secondary" size="sm">
                        {formatDate(item.feedback_date)}
                      </Badge>
                    </div>
                    
                    {item.source && item.destination && (
                      <div className="flex items-center text-sm text-gray-600 mb-2">
                        <MapPin className="w-4 h-4 mr-1" />
                        {item.source} → {item.destination}
                        {item.journey_date && (
                          <>
                            <Calendar className="w-4 h-4 ml-3 mr-1" />
                            {formatDate(item.journey_date)}
                          </>
                        )}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(item)}
                      disabled={editingFeedback === item.feedback_id}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteFeedback(item.feedback_id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {/* Feedback Content */}
                <div className="space-y-4">
                  {editingFeedback === item.feedback_id ? (
                    <div className="space-y-4">
                      <textarea
                        value={editForm.comments}
                        onChange={(e) => setEditForm({ ...editForm, comments: e.target.value })}
                        placeholder="Share your experience..."
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
                        rows={3}
                      />
                      <div className="flex items-center space-x-3">
                        <Button
                          onClick={() => handleUpdateFeedback(item.feedback_id)}
                          disabled={submitting}
                          size="sm"
                        >
                          {submitting ? 'Updating...' : 'Update'}
                        </Button>
                        <Button
                          variant="ghost"
                          onClick={handleCancelEdit}
                          disabled={submitting}
                          size="sm"
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <>
                      {/* User Feedback */}
                      {item.comments && (
                        <div className="bg-gray-50 rounded-lg p-4">
                          <h4 className="font-medium text-gray-900 mb-2">Your Feedback:</h4>
                          <p className="text-gray-700 text-sm leading-relaxed">
                            {item.comments}
                          </p>
                        </div>
                      )}

                      {/* Admin Response */}
                      {item.admin_response ? (
                        <div className="bg-blue-50 rounded-lg p-4 border-l-4 border-blue-400">
                          <div className="flex items-center space-x-2 mb-2">
                            <Reply className="w-4 h-4 text-blue-600" />
                            <h4 className="font-medium text-blue-900">Admin Response:</h4>
                            {item.response_date && (
                              <span className="text-xs text-blue-600">
                                {formatDate(item.response_date)}
                              </span>
                            )}
                          </div>
                          <p className="text-blue-800 text-sm leading-relaxed">{item.admin_response}</p>
                        </div>
                      ) : (
                        <div className="bg-yellow-50 rounded-lg p-4 border-l-4 border-yellow-400">
                          <div className="flex items-center space-x-2">
                            <MessageSquare className="w-4 h-4 text-yellow-600" />
                            <span className="text-sm text-yellow-800">
                              Waiting for admin response...
                            </span>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyFeedback;
