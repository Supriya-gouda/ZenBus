import React, { useState, useEffect } from 'react';
import { MessageSquare, Star, Filter, Calendar, MapPin, User, TrendingUp, BarChart3 } from 'lucide-react';
import Card from '../../../../components/UI/Card';
import Button from '../../../../components/UI/Button';
import Badge from '../../../../components/UI/Badge';

const FeedbackManagement = () => {
  const [feedback, setFeedback] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    rating: 'all',
    route: 'all',
    dateRange: '30days'
  });

  useEffect(() => {
    fetchFeedback();
  }, []);

  const fetchFeedback = async () => {
    try {
      setLoading(true);
      // Mock data - replace with actual API call
      const mockFeedback = [
        {
          feedback_id: 1,
          user_name: 'Alice Johnson',
          user_email: 'alice@email.com',
          rating: 5,
          comments: 'Excellent service! The bus was clean and comfortable. Driver was very professional.',
          feedback_date: '2024-01-15T14:30:00',
          source: 'Mumbai',
          destination: 'Pune',
          journey_date: '2024-01-15',
          bus_number: 'BUS001',
          driver_name: 'John Doe'
        },
        {
          feedback_id: 2,
          user_name: 'Bob Smith',
          user_email: 'bob@email.com',
          rating: 4,
          comments: 'Good experience overall. Bus was on time but AC could be better.',
          feedback_date: '2024-01-14T16:45:00',
          source: 'Delhi',
          destination: 'Agra',
          journey_date: '2024-01-14',
          bus_number: 'BUS002',
          driver_name: 'Jane Smith'
        },
        {
          feedback_id: 3,
          user_name: 'Carol Davis',
          user_email: 'carol@email.com',
          rating: 2,
          comments: 'Bus was delayed by 2 hours. No proper communication about the delay.',
          feedback_date: '2024-01-13T10:20:00',
          source: 'Bangalore',
          destination: 'Chennai',
          journey_date: '2024-01-13',
          bus_number: 'BUS003',
          driver_name: 'Mike Johnson'
        },
        {
          feedback_id: 4,
          user_name: 'David Wilson',
          user_email: 'david@email.com',
          rating: 5,
          comments: 'Amazing journey! Everything was perfect from booking to arrival.',
          feedback_date: '2024-01-12T18:15:00',
          source: 'Mumbai',
          destination: 'Pune',
          journey_date: '2024-01-12',
          bus_number: 'BUS001',
          driver_name: 'John Doe'
        },
        {
          feedback_id: 5,
          user_name: 'Eva Brown',
          user_email: 'eva@email.com',
          rating: 3,
          comments: 'Average experience. Bus was okay but seats were not very comfortable.',
          feedback_date: '2024-01-11T12:30:00',
          source: 'Delhi',
          destination: 'Jaipur',
          journey_date: '2024-01-11',
          bus_number: 'BUS004',
          driver_name: 'Sarah Wilson'
        }
      ];
      setFeedback(mockFeedback);
    } catch (error) {
      console.error('Error fetching feedback:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderStars = (rating) => {
    return (
      <div className="flex space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${
              star <= rating
                ? 'text-yellow-400 fill-current'
                : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

  const getRatingColor = (rating) => {
    if (rating >= 4) return 'success';
    if (rating >= 3) return 'warning';
    return 'danger';
  };

  const getRatingLabel = (rating) => {
    if (rating >= 4) return 'Positive';
    if (rating >= 3) return 'Neutral';
    return 'Negative';
  };

  const getStats = () => {
    const total = feedback.length;
    const averageRating = feedback.reduce((sum, f) => sum + f.rating, 0) / total || 0;
    const positive = feedback.filter(f => f.rating >= 4).length;
    const negative = feedback.filter(f => f.rating <= 2).length;
    const neutral = feedback.filter(f => f.rating === 3).length;

    // Rating distribution
    const ratingDistribution = {
      5: feedback.filter(f => f.rating === 5).length,
      4: feedback.filter(f => f.rating === 4).length,
      3: feedback.filter(f => f.rating === 3).length,
      2: feedback.filter(f => f.rating === 2).length,
      1: feedback.filter(f => f.rating === 1).length
    };

    return { 
      total, 
      averageRating: averageRating.toFixed(1), 
      positive, 
      negative, 
      neutral,
      ratingDistribution 
    };
  };

  const filteredFeedback = feedback.filter(item => {
    const matchesRating = filters.rating === 'all' || 
      (filters.rating === 'positive' && item.rating >= 4) ||
      (filters.rating === 'neutral' && item.rating === 3) ||
      (filters.rating === 'negative' && item.rating <= 2);
    
    const matchesRoute = filters.route === 'all' || 
      `${item.source}-${item.destination}` === filters.route;
    
    return matchesRating && matchesRoute;
  });

  const stats = getStats();
  const uniqueRoutes = [...new Set(feedback.map(f => `${f.source}-${f.destination}`))];

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white p-6 rounded-lg shadow-sm">
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-1/3"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Feedback Management</h2>
          <p className="text-gray-600">Monitor and analyze customer feedback</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Feedback</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <MessageSquare className="w-8 h-8 text-blue-600" />
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Average Rating</p>
              <p className="text-2xl font-bold text-yellow-600">{stats.averageRating}/5.0</p>
            </div>
            <Star className="w-8 h-8 text-yellow-600" />
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Positive Reviews</p>
              <p className="text-2xl font-bold text-green-600">{stats.positive}</p>
            </div>
            <TrendingUp className="w-8 h-8 text-green-600" />
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Negative Reviews</p>
              <p className="text-2xl font-bold text-red-600">{stats.negative}</p>
            </div>
            <BarChart3 className="w-8 h-8 text-red-600" />
          </div>
        </Card>
      </div>

      {/* Rating Distribution */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Rating Distribution</h3>
        <div className="space-y-3">
          {[5, 4, 3, 2, 1].map((rating) => (
            <div key={rating} className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 w-20">
                <span className="text-sm font-medium">{rating}</span>
                <Star className="w-4 h-4 text-yellow-400 fill-current" />
              </div>
              <div className="flex-1 bg-gray-200 rounded-full h-2">
                <div
                  className="bg-yellow-400 h-2 rounded-full"
                  style={{
                    width: `${stats.total > 0 ? (stats.ratingDistribution[rating] / stats.total) * 100 : 0}%`
                  }}
                ></div>
              </div>
              <span className="text-sm text-gray-600 w-12">
                {stats.ratingDistribution[rating]}
              </span>
            </div>
          ))}
        </div>
      </Card>

      {/* Filters */}
      <Card className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Rating Filter</label>
            <select
              value={filters.rating}
              onChange={(e) => setFilters({ ...filters, rating: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            >
              <option value="all">All Ratings</option>
              <option value="positive">Positive (4-5 stars)</option>
              <option value="neutral">Neutral (3 stars)</option>
              <option value="negative">Negative (1-2 stars)</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Route</label>
            <select
              value={filters.route}
              onChange={(e) => setFilters({ ...filters, route: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            >
              <option value="all">All Routes</option>
              {uniqueRoutes.map((route) => (
                <option key={route} value={route}>
                  {route.replace('-', ' → ')}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Date Range</label>
            <select
              value={filters.dateRange}
              onChange={(e) => setFilters({ ...filters, dateRange: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            >
              <option value="7days">Last 7 days</option>
              <option value="30days">Last 30 days</option>
              <option value="90days">Last 90 days</option>
              <option value="all">All time</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Feedback List */}
      <div className="space-y-4">
        {filteredFeedback.map((item) => (
          <Card key={item.feedback_id} className="p-6 hover:shadow-lg transition-shadow duration-200">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <User className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-gray-900">{item.user_name}</h4>
                  <p className="text-sm text-gray-600">{item.user_email}</p>
                  <div className="flex items-center space-x-2 mt-1">
                    {renderStars(item.rating)}
                    <Badge variant={getRatingColor(item.rating)} size="sm">
                      {getRatingLabel(item.rating)}
                    </Badge>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">
                  {new Date(item.feedback_date).toLocaleDateString()}
                </p>
              </div>
            </div>

            <div className="mb-4">
              <p className="text-gray-700 leading-relaxed">{item.comments}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-4 border-t border-gray-200">
              <div>
                <p className="text-sm text-gray-500">Route</p>
                <p className="font-medium">
                  <MapPin className="w-4 h-4 inline mr-1" />
                  {item.source} → {item.destination}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Journey Date</p>
                <p className="font-medium">
                  <Calendar className="w-4 h-4 inline mr-1" />
                  {new Date(item.journey_date).toLocaleDateString()}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Bus</p>
                <p className="font-medium">{item.bus_number}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Driver</p>
                <p className="font-medium">{item.driver_name}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {filteredFeedback.length === 0 && (
        <Card className="p-12 text-center">
          <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No feedback found</h3>
          <p className="text-gray-600">
            No feedback matches your current filters. Try adjusting the filters to see more results.
          </p>
        </Card>
      )}
    </div>
  );
};

export default FeedbackManagement;
