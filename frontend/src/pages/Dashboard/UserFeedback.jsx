import React, { useState, useEffect } from 'react';
import { Star, MessageSquare, Calendar, MapPin, Reply } from 'lucide-react';
import Card from '../../components/UI/Card';
import Badge from '../../components/UI/Badge';
import { feedbackService } from '../../services/feedbackService';

const UserFeedback = () => {
  const [feedback, setFeedback] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserFeedback();
  }, []);

  const fetchUserFeedback = async () => {
    try {
      const result = await feedbackService.getUserFeedback();
      if (result.success) {
        setFeedback(result.feedback);
      }
    } catch (error) {
      console.error('Error fetching feedback:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, index) => (
      <Star
        key={index}
        className={`w-4 h-4 ${
          index < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
        }`}
      />
    ));
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
      <div>
        <h2 className="text-2xl font-bold text-gray-900">My Feedback</h2>
        <p className="text-gray-600">View your submitted feedback and admin responses</p>
      </div>

      {/* Feedback List */}
      {feedback.length === 0 ? (
        <Card className="text-center py-12">
          <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Feedback Yet</h3>
          <p className="text-gray-600">You haven't submitted any feedback yet. Complete a trip and share your experience!</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {feedback.map((item) => (
            <Card key={item.feedback_id} className="hover:shadow-lg transition-shadow duration-200">
              <div className="space-y-4">
                {/* Feedback Header */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="p-3 bg-red-100 rounded-lg">
                      <MessageSquare className="w-6 h-6 text-red-600" />
                    </div>
                    <div>
                      <div className="flex items-center space-x-2 mb-1">
                        <h3 className="font-semibold text-gray-900">
                          {item.source} → {item.destination}
                        </h3>
                        <Badge variant="secondary" size="sm">
                          Feedback #{item.feedback_id}
                        </Badge>
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <div className="flex items-center space-x-1">
                          <Calendar className="w-4 h-4" />
                          <span>{formatDate(item.feedback_date)}</span>
                        </div>
                        {item.journey_date && (
                          <div className="flex items-center space-x-1">
                            <MapPin className="w-4 h-4" />
                            <span>Journey: {new Date(item.journey_date).toLocaleDateString()}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-1">
                    {renderStars(item.rating)}
                    <span className="ml-2 text-sm font-medium text-gray-700">
                      {item.rating}/5
                    </span>
                  </div>
                </div>

                {/* User Feedback */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-2">Your Feedback:</h4>
                  <p className="text-gray-700">
                    {item.comments || 'No additional comments provided.'}
                  </p>
                </div>

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
                    <p className="text-blue-800">{item.admin_response}</p>
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
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default UserFeedback;
