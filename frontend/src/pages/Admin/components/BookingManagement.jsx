import React, { useState, useEffect } from 'react';
import { Calendar, User, Bus, MapPin, DollarSign, Filter, Download } from 'lucide-react';
import Button from '../../../components/UI/Button';
import Card from '../../../components/UI/Card';
import Badge from '../../../components/UI/Badge';
import adminService from '../../../services/adminService';

const BookingManagement = () => {
  const [bookings, setBookings] = useState([]);
  const [filteredBookings, setFilteredBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: '',
    dateRange: '',
    searchTerm: ''
  });

  useEffect(() => {
    fetchBookings();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [bookings, filters]);

  const fetchBookings = async () => {
    try {
      const result = await adminService.getAllBookings();
      if (result.success) {
        setBookings(result.bookings);
      }
    } catch (error) {
      console.error('Error fetching bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...bookings];

    // Status filter
    if (filters.status) {
      filtered = filtered.filter(booking => booking.status === filters.status);
    }

    // Search filter
    if (filters.searchTerm) {
      const searchLower = filters.searchTerm.toLowerCase();
      filtered = filtered.filter(booking => 
        booking.booking_id.toString().includes(searchLower) ||
        booking.passenger_name.toLowerCase().includes(searchLower) ||
        booking.passenger_email.toLowerCase().includes(searchLower)
      );
    }

    // Date range filter
    if (filters.dateRange) {
      const today = new Date();
      let startDate;
      
      switch (filters.dateRange) {
        case 'today':
          startDate = new Date(today.setHours(0, 0, 0, 0));
          break;
        case 'week':
          startDate = new Date(today.setDate(today.getDate() - 7));
          break;
        case 'month':
          startDate = new Date(today.setMonth(today.getMonth() - 1));
          break;
        default:
          startDate = null;
      }

      if (startDate) {
        filtered = filtered.filter(booking => 
          new Date(booking.booking_date) >= startDate
        );
      }
    }

    setFilteredBookings(filtered);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed': return 'success';
      case 'pending': return 'warning';
      case 'cancelled': return 'danger';
      default: return 'default';
    }
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

  const calculateTotalRevenue = () => {
    return filteredBookings
      .filter(booking => booking.status === 'confirmed')
      .reduce((total, booking) => total + parseFloat(booking.total_fare), 0);
  };

  const exportBookings = () => {
    const csvContent = [
      ['Booking ID', 'Passenger Name', 'Email', 'Phone', 'Bus Number', 'Route', 'Date', 'Seats', 'Fare', 'Status'],
      ...filteredBookings.map(booking => [
        booking.booking_id,
        booking.passenger_name,
        booking.passenger_email,
        booking.passenger_phone,
        booking.bus_number,
        `${booking.source} → ${booking.destination}`,
        formatDate(booking.departure_time),
        booking.selected_seats,
        booking.total_fare,
        booking.status
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bookings_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
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
          <h2 className="text-2xl font-bold text-gray-900">Booking Management</h2>
          <p className="text-gray-600">Monitor and manage all customer bookings</p>
        </div>
        <Button
          onClick={exportBookings}
          variant="outline"
          className="border-red-200 text-red-600 hover:bg-red-50"
        >
          <Download className="w-4 h-4 mr-2" />
          Export CSV
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="text-center">
          <div className="text-2xl font-bold text-gray-900">{filteredBookings.length}</div>
          <div className="text-sm text-gray-600">Total Bookings</div>
        </Card>
        <Card className="text-center">
          <div className="text-2xl font-bold text-green-600">
            {filteredBookings.filter(b => b.status === 'confirmed').length}
          </div>
          <div className="text-sm text-gray-600">Confirmed</div>
        </Card>
        <Card className="text-center">
          <div className="text-2xl font-bold text-yellow-600">
            {filteredBookings.filter(b => b.status === 'pending').length}
          </div>
          <div className="text-sm text-gray-600">Pending</div>
        </Card>
        <Card className="text-center">
          <div className="text-2xl font-bold text-red-600">
            ₹{calculateTotalRevenue().toLocaleString()}
          </div>
          <div className="text-sm text-gray-600">Total Revenue</div>
        </Card>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Search
            </label>
            <input
              type="text"
              placeholder="Search by ID, name, or email..."
              value={filters.searchTerm}
              onChange={(e) => setFilters({...filters, searchTerm: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              value={filters.status}
              onChange={(e) => setFilters({...filters, status: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              <option value="">All Status</option>
              <option value="confirmed">Confirmed</option>
              <option value="pending">Pending</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date Range
            </label>
            <select
              value={filters.dateRange}
              onChange={(e) => setFilters({...filters, dateRange: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              <option value="">All Time</option>
              <option value="today">Today</option>
              <option value="week">Last 7 Days</option>
              <option value="month">Last 30 Days</option>
            </select>
          </div>
          <div className="flex items-end">
            <Button
              onClick={() => setFilters({ status: '', dateRange: '', searchTerm: '' })}
              variant="outline"
              className="w-full"
            >
              Clear Filters
            </Button>
          </div>
        </div>
      </Card>

      {/* Bookings List */}
      <div className="space-y-4">
        {filteredBookings.map((booking) => (
          <Card key={booking.booking_id} className="hover:shadow-lg transition-shadow duration-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-red-100 rounded-lg">
                  <Calendar className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <h3 className="font-semibold text-gray-900">
                      Booking #{booking.booking_id}
                    </h3>
                    <Badge variant={getStatusColor(booking.status)} size="sm">
                      {booking.status}
                    </Badge>
                  </div>
                  <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                    <div className="flex items-center space-x-1">
                      <User className="w-4 h-4" />
                      <span>{booking.passenger_name}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Bus className="w-4 h-4" />
                      <span>{booking.bus_number}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <MapPin className="w-4 h-4" />
                      <span>{booking.source} → {booking.destination}</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="flex items-center space-x-1 text-lg font-semibold text-gray-900">
                  <DollarSign className="w-5 h-5" />
                  <span>₹{booking.total_fare}</span>
                </div>
                <div className="text-sm text-gray-600">
                  {formatDate(booking.departure_time)}
                </div>
                <div className="text-sm text-gray-600">
                  Seats: {booking.selected_seats}
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {filteredBookings.length === 0 && (
        <Card className="text-center py-12">
          <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No bookings found</h3>
          <p className="text-gray-600">No bookings match your current filters.</p>
        </Card>
      )}
    </div>
  );
};

export default BookingManagement;
