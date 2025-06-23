import React, { useState, useEffect } from 'react';
import { Users, Search, Mail, Phone, Calendar, CreditCard, MapPin, TrendingUp, Eye, Edit, UserX } from 'lucide-react';
import Card from '../../../../components/UI/Card';
import Button from '../../../../components/UI/Button';
import Badge from '../../../../components/UI/Badge';

const PassengerManagement = () => {
  const [passengers, setPassengers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPassenger, setSelectedPassenger] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [filters, setFilters] = useState({
    status: 'all',
    sortBy: 'recent'
  });

  useEffect(() => {
    fetchPassengers();
  }, []);

  const fetchPassengers = async () => {
    try {
      setLoading(true);
      // Mock data - replace with actual API call
      const mockPassengers = [
        {
          user_id: 1,
          full_name: 'Alice Johnson',
          email: 'alice.johnson@email.com',
          phone: '+91-9876543210',
          created_at: '2023-06-15',
          total_bookings: 12,
          confirmed_bookings: 10,
          cancelled_bookings: 2,
          total_spent: 15000,
          last_booking_date: '2024-01-10',
          average_rating: 4.5,
          status: 'Active'
        },
        {
          user_id: 2,
          full_name: 'Bob Smith',
          email: 'bob.smith@email.com',
          phone: '+91-9876543220',
          created_at: '2023-08-22',
          total_bookings: 8,
          confirmed_bookings: 7,
          cancelled_bookings: 1,
          total_spent: 9500,
          last_booking_date: '2024-01-08',
          average_rating: 4.2,
          status: 'Active'
        },
        {
          user_id: 3,
          full_name: 'Carol Davis',
          email: 'carol.davis@email.com',
          phone: '+91-9876543230',
          created_at: '2023-03-10',
          total_bookings: 25,
          confirmed_bookings: 23,
          cancelled_bookings: 2,
          total_spent: 32000,
          last_booking_date: '2023-12-20',
          average_rating: 4.8,
          status: 'Inactive'
        }
      ];
      setPassengers(mockPassengers);
    } catch (error) {
      console.error('Error fetching passengers:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPassengerDetails = async (passengerId) => {
    try {
      // Mock detailed data - replace with actual API call
      const mockDetails = {
        user_id: passengerId,
        bookingHistory: [
          {
            booking_id: 1,
            source: 'Mumbai',
            destination: 'Pune',
            journey_date: '2024-01-10',
            fare: 500,
            status: 'Completed',
            rating: 5
          },
          {
            booking_id: 2,
            source: 'Pune',
            destination: 'Mumbai',
            journey_date: '2024-01-05',
            fare: 500,
            status: 'Completed',
            rating: 4
          }
        ],
        preferences: [
          { route: 'Mumbai → Pune', frequency: 8, avg_fare: 500 },
          { route: 'Delhi → Agra', frequency: 3, avg_fare: 300 }
        ]
      };
      setSelectedPassenger({ ...passengers.find(p => p.user_id === passengerId), ...mockDetails });
      setShowDetailsModal(true);
    } catch (error) {
      console.error('Error fetching passenger details:', error);
    }
  };

  const handleDeactivatePassenger = async (passengerId) => {
    if (window.confirm('Are you sure you want to deactivate this passenger account?')) {
      try {
        console.log('Deactivating passenger:', passengerId);
        fetchPassengers();
      } catch (error) {
        console.error('Error deactivating passenger:', error);
      }
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Active':
        return 'success';
      case 'Inactive':
        return 'warning';
      case 'Suspended':
        return 'danger';
      default:
        return 'secondary';
    }
  };

  const getCustomerTier = (totalSpent) => {
    if (totalSpent >= 50000) return { label: 'Platinum', color: 'purple' };
    if (totalSpent >= 25000) return { label: 'Gold', color: 'yellow' };
    if (totalSpent >= 10000) return { label: 'Silver', color: 'gray' };
    return { label: 'Bronze', color: 'orange' };
  };

  const filteredPassengers = passengers.filter(passenger => {
    const matchesSearch = passenger.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         passenger.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         passenger.phone.includes(searchTerm);
    
    const matchesStatus = filters.status === 'all' || passenger.status.toLowerCase() === filters.status;
    
    return matchesSearch && matchesStatus;
  });

  const sortedPassengers = [...filteredPassengers].sort((a, b) => {
    switch (filters.sortBy) {
      case 'name':
        return a.full_name.localeCompare(b.full_name);
      case 'spending':
        return b.total_spent - a.total_spent;
      case 'bookings':
        return b.total_bookings - a.total_bookings;
      case 'recent':
      default:
        return new Date(b.last_booking_date) - new Date(a.last_booking_date);
    }
  });

  const getStats = () => {
    const total = passengers.length;
    const active = passengers.filter(p => p.status === 'Active').length;
    const totalRevenue = passengers.reduce((sum, p) => sum + p.total_spent, 0);
    const avgSpending = totalRevenue / total || 0;

    return { total, active, totalRevenue, avgSpending };
  };

  const stats = getStats();

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
          <h2 className="text-2xl font-bold text-gray-900">Passenger Management</h2>
          <p className="text-gray-600">Monitor and manage passenger accounts</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Passengers</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <Users className="w-8 h-8 text-blue-600" />
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Users</p>
              <p className="text-2xl font-bold text-green-600">{stats.active}</p>
            </div>
            <Users className="w-8 h-8 text-green-600" />
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Revenue</p>
              <p className="text-2xl font-bold text-purple-600">₹{stats.totalRevenue.toLocaleString()}</p>
            </div>
            <CreditCard className="w-8 h-8 text-purple-600" />
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Avg Spending</p>
              <p className="text-2xl font-bold text-orange-600">₹{Math.round(stats.avgSpending).toLocaleString()}</p>
            </div>
            <TrendingUp className="w-8 h-8 text-orange-600" />
          </div>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search passengers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            />
          </div>
          <div>
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="suspended">Suspended</option>
            </select>
          </div>
          <div>
            <select
              value={filters.sortBy}
              onChange={(e) => setFilters({ ...filters, sortBy: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            >
              <option value="recent">Recent Activity</option>
              <option value="name">Name</option>
              <option value="spending">Total Spending</option>
              <option value="bookings">Total Bookings</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Passengers List */}
      <div className="space-y-4">
        {sortedPassengers.map((passenger) => (
          <Card key={passenger.user_id} className="p-6 hover:shadow-lg transition-shadow duration-200">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{passenger.full_name}</h3>
                  <p className="text-sm text-gray-600">{passenger.email}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Badge variant={getStatusColor(passenger.status)}>
                  {passenger.status}
                </Badge>
                <Badge variant={getCustomerTier(passenger.total_spent).color}>
                  {getCustomerTier(passenger.total_spent).label}
                </Badge>
                <Button variant="ghost" size="sm" onClick={() => fetchPassengerDetails(passenger.user_id)}>
                  <Eye className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="sm" onClick={() => handleDeactivatePassenger(passenger.user_id)}>
                  <UserX className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div>
                <p className="text-sm text-gray-500">Phone</p>
                <p className="font-medium">{passenger.phone}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Bookings</p>
                <p className="font-medium">{passenger.total_bookings}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Spent</p>
                <p className="font-medium">₹{passenger.total_spent.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Last Booking</p>
                <p className="font-medium">{new Date(passenger.last_booking_date).toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Rating</p>
                <p className="font-medium">⭐ {passenger.average_rating}/5.0</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Passenger Details Modal */}
      {showDetailsModal && selectedPassenger && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold">Passenger Details</h3>
              <Button variant="ghost" onClick={() => setShowDetailsModal(false)}>
                ×
              </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Basic Info */}
              <Card className="p-4">
                <h4 className="font-semibold mb-3">Basic Information</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Name:</span>
                    <span className="font-medium">{selectedPassenger.full_name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Email:</span>
                    <span className="font-medium">{selectedPassenger.email}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Phone:</span>
                    <span className="font-medium">{selectedPassenger.phone}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Member Since:</span>
                    <span className="font-medium">{new Date(selectedPassenger.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
              </Card>

              {/* Booking Stats */}
              <Card className="p-4">
                <h4 className="font-semibold mb-3">Booking Statistics</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Bookings:</span>
                    <span className="font-medium">{selectedPassenger.total_bookings}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Confirmed:</span>
                    <span className="font-medium text-green-600">{selectedPassenger.confirmed_bookings}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Cancelled:</span>
                    <span className="font-medium text-red-600">{selectedPassenger.cancelled_bookings}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Spent:</span>
                    <span className="font-medium">₹{selectedPassenger.total_spent.toLocaleString()}</span>
                  </div>
                </div>
              </Card>
            </div>

            {/* Recent Bookings */}
            <Card className="p-4 mt-6">
              <h4 className="font-semibold mb-3">Recent Bookings</h4>
              <div className="space-y-3">
                {selectedPassenger.bookingHistory?.map((booking) => (
                  <div key={booking.booking_id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium">{booking.source} → {booking.destination}</p>
                      <p className="text-sm text-gray-600">{new Date(booking.journey_date).toLocaleDateString()}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">₹{booking.fare}</p>
                      <div className="flex items-center space-x-2">
                        <Badge variant={booking.status === 'Completed' ? 'success' : 'warning'}>
                          {booking.status}
                        </Badge>
                        <span className="text-sm">⭐ {booking.rating}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Travel Preferences */}
            <Card className="p-4 mt-6">
              <h4 className="font-semibold mb-3">Travel Preferences</h4>
              <div className="space-y-2">
                {selectedPassenger.preferences?.map((pref, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <span>{pref.route}</span>
                    <div className="text-right">
                      <span className="text-sm text-gray-600">{pref.frequency} trips</span>
                      <span className="ml-2 font-medium">₹{pref.avg_fare} avg</span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
};

export default PassengerManagement;
