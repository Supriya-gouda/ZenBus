import React, { useState, useEffect } from 'react';
import { Users, Mail, Phone, Calendar, Search, Eye, Ban, CheckCircle, History, DollarSign } from 'lucide-react';
import Button from '../../../components/UI/Button';
import Card from '../../../components/UI/Card';
import Badge from '../../../components/UI/Badge';
import adminService from '../../../services/adminService';

const PassengerManagement = () => {
  const [passengers, setPassengers] = useState([]);
  const [filteredPassengers, setFilteredPassengers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPassenger, setSelectedPassenger] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showBlockModal, setShowBlockModal] = useState(false);
  const [blockReason, setBlockReason] = useState('');
  const [passengerBookings, setPassengerBookings] = useState([]);
  const [filters, setFilters] = useState({
    status: '',
    sortBy: 'name'
  });

  useEffect(() => {
    fetchPassengers();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [passengers, searchTerm, filters]);

  const fetchPassengers = async () => {
    try {
      const result = await adminService.getAllPassengers();
      if (result.success) {
        setPassengers(result.passengers);
      } else {
        // Use mock data as fallback
        setPassengers([
          {
            user_id: 1,
            full_name: 'John Doe',
            email: 'john@example.com',
            phone: '+91-9876543210',
            created_at: '2024-01-15T10:30:00Z',
            account_status: 'Active',
            total_bookings: 12,
            total_spent: 15600,
            last_booking: '2024-01-20T14:30:00Z',
            average_rating: 4.5,
            blocked_reason: null
          },
          {
            user_id: 2,
            full_name: 'Jane Smith',
            email: 'jane@example.com',
            phone: '+91-9876543211',
            created_at: '2024-01-10T08:15:00Z',
            account_status: 'Active',
            total_bookings: 8,
            total_spent: 9800,
            last_booking: '2024-01-18T11:45:00Z',
            average_rating: 4.2,
            blocked_reason: null
          },
          {
            user_id: 3,
            full_name: 'Mike Johnson',
            email: 'mike@example.com',
            phone: '+91-9876543212',
            created_at: '2024-01-05T16:20:00Z',
            account_status: 'Blocked',
            total_bookings: 3,
            total_spent: 2400,
            last_booking: '2024-01-12T09:30:00Z',
            average_rating: 2.1,
            blocked_reason: 'Multiple booking cancellations'
          }
        ]);
      }
    } catch (error) {
      console.error('Error fetching passengers:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPassengerBookings = async (passengerId) => {
    try {
      const result = await adminService.getPassengerBookingHistory(passengerId);
      if (result.success) {
        setPassengerBookings(result.bookings);
      } else {
        // Use mock data
        setPassengerBookings([
          {
            booking_id: 1,
            journey_date: '2024-01-20',
            source: 'Mumbai',
            destination: 'Pune',
            total_fare: 800,
            booking_status: 'Confirmed',
            seat_numbers: 'A1, A2'
          },
          {
            booking_id: 2,
            journey_date: '2024-01-15',
            source: 'Delhi',
            destination: 'Agra',
            total_fare: 600,
            booking_status: 'Completed',
            seat_numbers: 'B3'
          }
        ]);
      }
    } catch (error) {
      console.error('Error fetching passenger bookings:', error);
    }
  };

  const applyFilters = () => {
    let filtered = [...passengers];

    // Search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(passenger => 
        passenger.full_name.toLowerCase().includes(searchLower) ||
        passenger.email.toLowerCase().includes(searchLower) ||
        passenger.phone.includes(searchTerm)
      );
    }

    // Status filter
    if (filters.status) {
      filtered = filtered.filter(passenger => passenger.account_status === filters.status);
    }

    // Sort
    filtered.sort((a, b) => {
      switch (filters.sortBy) {
        case 'name':
          return a.full_name.localeCompare(b.full_name);
        case 'bookings':
          return b.total_bookings - a.total_bookings;
        case 'spent':
          return b.total_spent - a.total_spent;
        case 'recent':
          return new Date(b.created_at) - new Date(a.created_at);
        default:
          return 0;
      }
    });

    setFilteredPassengers(filtered);
  };

  const handleViewDetails = async (passenger) => {
    setSelectedPassenger(passenger);
    await fetchPassengerBookings(passenger.user_id);
    setShowDetailsModal(true);
  };

  const handleBlockPassenger = (passenger) => {
    setSelectedPassenger(passenger);
    setBlockReason('');
    setShowBlockModal(true);
  };

  const handleConfirmBlock = async () => {
    try {
      const result = await adminService.blockPassenger(selectedPassenger.user_id, {
        reason: blockReason
      });

      if (result.success) {
        await fetchPassengers();
        setShowBlockModal(false);
        setBlockReason('');
        setSelectedPassenger(null);
      }
    } catch (error) {
      console.error('Error blocking passenger:', error);
    }
  };

  const handleUnblockPassenger = async (passengerId) => {
    if (window.confirm('Are you sure you want to unblock this passenger?')) {
      try {
        const result = await adminService.unblockPassenger(passengerId);
        if (result.success) {
          await fetchPassengers();
        }
      } catch (error) {
        console.error('Error unblocking passenger:', error);
      }
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Active':
        return 'success';
      case 'Blocked':
        return 'danger';
      case 'Suspended':
        return 'warning';
      default:
        return 'secondary';
    }
  };

  const getBookingStatusColor = (status) => {
    switch (status) {
      case 'Confirmed':
        return 'success';
      case 'Completed':
        return 'secondary';
      case 'Cancelled':
        return 'danger';
      default:
        return 'warning';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount) => {
    return `₹${amount.toLocaleString()}`;
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
          <h2 className="text-2xl font-bold text-gray-900">Users</h2>
          <p className="text-gray-600">View, edit, and manage all registered users</p>
        </div>
      </div>

      {/* Search and Filters */}
      <Card>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Search Passengers</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search by name, email, or phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              <option value="">All Status</option>
              <option value="Active">Active</option>
              <option value="Blocked">Blocked</option>
              <option value="Suspended">Suspended</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Sort By</label>
            <select
              value={filters.sortBy}
              onChange={(e) => setFilters({ ...filters, sortBy: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              <option value="name">Name</option>
              <option value="bookings">Total Bookings</option>
              <option value="spent">Total Spent</option>
              <option value="recent">Recently Joined</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Passengers List */}
      <div className="space-y-4">
        {filteredPassengers.map((passenger) => (
          <Card key={passenger.user_id} className="hover:shadow-lg transition-shadow duration-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-red-100 rounded-lg">
                  <Users className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <h3 className="font-semibold text-gray-900">{passenger.full_name}</h3>
                    <Badge variant={getStatusColor(passenger.account_status)} size="sm">
                      {passenger.account_status}
                    </Badge>
                  </div>
                  <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                    <div className="flex items-center space-x-1">
                      <Mail className="w-4 h-4" />
                      <span>{passenger.email}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Phone className="w-4 h-4" />
                      <span>{passenger.phone}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Calendar className="w-4 h-4" />
                      <span>Joined {formatDate(passenger.created_at)}</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4 text-sm text-gray-600 mt-2">
                    <div className="flex items-center space-x-1">
                      <History className="w-4 h-4" />
                      <span>{passenger.total_bookings} bookings</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <DollarSign className="w-4 h-4" />
                      <span>{formatCurrency(passenger.total_spent)} spent</span>
                    </div>
                    {passenger.average_rating && (
                      <div className="flex items-center space-x-1">
                        <span>⭐ {passenger.average_rating} rating</span>
                      </div>
                    )}
                  </div>
                  {passenger.blocked_reason && (
                    <div className="mt-2 text-sm text-red-600">
                      <strong>Blocked:</strong> {passenger.blocked_reason}
                    </div>
                  )}
                </div>
              </div>
              <div className="flex space-x-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleViewDetails(passenger)}
                  className="border-red-200 text-red-600 hover:bg-red-50"
                >
                  <Eye className="w-4 h-4 mr-1" />
                  View Details
                </Button>
                {passenger.account_status === 'Active' ? (
                  <Button
                    size="sm"
                    variant="danger"
                    onClick={() => handleBlockPassenger(passenger)}
                  >
                    <Ban className="w-4 h-4 mr-1" />
                    Block
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    variant="success"
                    onClick={() => handleUnblockPassenger(passenger.user_id)}
                  >
                    <CheckCircle className="w-4 h-4 mr-1" />
                    Unblock
                  </Button>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Passenger Details Modal */}
      {showDetailsModal && selectedPassenger && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Passenger Details - {selectedPassenger.full_name}
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {/* Personal Information */}
              <Card>
                <h4 className="font-semibold text-gray-900 mb-3">Personal Information</h4>
                <div className="space-y-2 text-sm">
                  <div><strong>Name:</strong> {selectedPassenger.full_name}</div>
                  <div><strong>Email:</strong> {selectedPassenger.email}</div>
                  <div><strong>Phone:</strong> {selectedPassenger.phone}</div>
                  <div><strong>Status:</strong>
                    <Badge variant={getStatusColor(selectedPassenger.account_status)} size="sm" className="ml-2">
                      {selectedPassenger.account_status}
                    </Badge>
                  </div>
                  <div><strong>Joined:</strong> {formatDate(selectedPassenger.created_at)}</div>
                  {selectedPassenger.blocked_reason && (
                    <div><strong>Block Reason:</strong> {selectedPassenger.blocked_reason}</div>
                  )}
                </div>
              </Card>

              {/* Booking Statistics */}
              <Card>
                <h4 className="font-semibold text-gray-900 mb-3">Booking Statistics</h4>
                <div className="space-y-2 text-sm">
                  <div><strong>Total Bookings:</strong> {selectedPassenger.total_bookings}</div>
                  <div><strong>Total Spent:</strong> {formatCurrency(selectedPassenger.total_spent)}</div>
                  <div><strong>Average Rating:</strong> {selectedPassenger.average_rating || 'N/A'}</div>
                  <div><strong>Last Booking:</strong> {selectedPassenger.last_booking ? formatDate(selectedPassenger.last_booking) : 'N/A'}</div>
                </div>
              </Card>
            </div>

            {/* Booking History */}
            <Card>
              <h4 className="font-semibold text-gray-900 mb-3">Recent Booking History</h4>
              <div className="space-y-3">
                {passengerBookings.map((booking) => (
                  <div key={booking.booking_id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <div className="font-medium">
                        {booking.source} → {booking.destination}
                      </div>
                      <div className="text-sm text-gray-600">
                        {formatDate(booking.journey_date)} • Seats: {booking.seat_numbers}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">{formatCurrency(booking.total_fare)}</div>
                      <Badge variant={getBookingStatusColor(booking.booking_status)} size="sm">
                        {booking.booking_status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            <div className="flex justify-end space-x-3 pt-4">
              <Button
                variant="outline"
                onClick={() => {
                  setShowDetailsModal(false);
                  setSelectedPassenger(null);
                  setPassengerBookings([]);
                }}
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Block Passenger Modal */}
      {showBlockModal && selectedPassenger && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Block Passenger
            </h3>
            <p className="text-gray-600 mb-4">
              Are you sure you want to block <strong>{selectedPassenger.full_name}</strong>?
            </p>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Reason for blocking *
              </label>
              <textarea
                value={blockReason}
                onChange={(e) => setBlockReason(e.target.value)}
                required
                rows={3}
                placeholder="Enter the reason for blocking this passenger..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>
            <div className="flex justify-end space-x-3">
              <Button
                variant="outline"
                onClick={() => {
                  setShowBlockModal(false);
                  setBlockReason('');
                  setSelectedPassenger(null);
                }}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                onClick={handleConfirmBlock}
                disabled={!blockReason.trim()}
              >
                Block Passenger
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PassengerManagement;
