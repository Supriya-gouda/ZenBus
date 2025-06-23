import React, { useState, useEffect } from 'react';
import {
  Users,
  Bus,
  MapPin,
  Calendar,
  DollarSign,
  Star,
  TrendingUp,
  Settings,
  BarChart3,
  Shield,
  LogOut,
  ChevronDown,
  Menu
} from 'lucide-react';
import Card from '../../components/UI/Card';
import Button from '../../components/UI/Button';
import Badge from '../../components/UI/Badge';
import { useAuth } from '../../context/AuthContext';
import adminService from '../../services/adminService';

// Import admin components
import BusManagement from './components/BusManagement';
import RouteManagement from './components/RouteManagement';
import BookingManagement from './components/BookingManagement';
import RevenueAnalytics from './components/RevenueAnalytics';
import SystemSettings from './components/SystemSettings';
import BusScheduleManagement from './components/BusScheduleManagement';
import DriverManagement from './components/DriverManagement';
import BusStaffManagement from './components/BusStaffManagement';
import UserFeedbackManagement from './components/UserFeedbackManagement';
import PassengerManagement from './components/PassengerManagement';
import PaymentRefundManagement from './components/PaymentRefundManagement';
import BusMaintenanceManagement from './components/BusMaintenanceManagement';

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalBuses: 0,
    totalRoutes: 0,
    totalBookings: 0,
    totalRevenue: 0,
    averageRating: 0
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownOpen && !event.target.closest('.dropdown-container')) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [dropdownOpen]);

  const fetchDashboardStats = async () => {
    try {
      setError(null);
      const result = await adminService.getDashboardStats();
      if (result.success && result.stats) {
        // Ensure all stats have default values
        setStats({
          totalUsers: result.stats.totalUsers || 0,
          totalBuses: result.stats.totalBuses || 0,
          totalRoutes: result.stats.totalRoutes || 0,
          totalBookings: result.stats.totalBookings || 0,
          totalRevenue: result.stats.totalRevenue || 0,
          averageRating: result.stats.averageRating || 0
        });
      } else {
        // Use mock data if API fails
        setStats({
          totalUsers: 1250,
          totalBuses: 45,
          totalRoutes: 28,
          totalBookings: 156,
          totalRevenue: 125000,
          averageRating: 4.5
        });
      }
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      setError('Failed to load dashboard statistics');
      // Use mock data as fallback
      setStats({
        totalUsers: 1250,
        totalBuses: 45,
        totalRoutes: 28,
        totalBookings: 156,
        totalRevenue: 125000,
        averageRating: 4.5
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
  };

  // Helper function to safely format numbers
  const formatNumber = (value) => {
    if (value === null || value === undefined || isNaN(value)) {
      return '0';
    }
    return Number(value).toLocaleString();
  };



  const tabs = [
    { id: 'overview', label: 'Overview', icon: TrendingUp },
    { id: 'schedules', label: 'Bus Schedules', icon: Calendar },
    { id: 'drivers', label: 'Driver Management', icon: MapPin },
    { id: 'bus-staffs', label: 'Bus Staffs', icon: Users },
    { id: 'feedback', label: 'User Feedback', icon: Star },
    { id: 'passengers', label: 'Users', icon: Users },
    { id: 'payments', label: 'Payments & Refunds', icon: DollarSign },
    { id: 'maintenance', label: 'Bus Maintenance', icon: Settings },
    { id: 'bookings', label: 'Bookings', icon: Calendar },
    { id: 'buses', label: 'Bus Management', icon: Bus },
    { id: 'routes', label: 'Routes', icon: MapPin },
    { id: 'analytics', label: 'Revenue Analytics', icon: BarChart3 }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-red-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-red-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-gradient-to-r from-red-500 to-red-600 rounded-lg">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
                <p className="text-gray-600 mt-1">Manage your bus reservation system</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-600">
                Welcome back, {user?.fullName || 'Admin'}
              </div>
              <Button
                onClick={handleLogout}
                variant="outline"
                size="sm"
                className="border-red-200 text-red-600 hover:bg-red-50"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>

        {/* Navigation Dropdown */}
        <div className="mb-8">
          <div className="relative dropdown-container">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center justify-between w-full md:w-auto min-w-[300px] px-6 py-3 bg-white rounded-lg shadow-sm border border-gray-200 hover:border-red-300 transition-colors duration-200"
            >
              <div className="flex items-center space-x-3">
                {(() => {
                  const activeTabData = tabs.find(tab => tab.id === activeTab);
                  const IconComponent = activeTabData?.icon;
                  return IconComponent ? <IconComponent className="w-5 h-5 text-red-600" /> : null;
                })()}
                <span className="font-medium text-gray-900">
                  {tabs.find(tab => tab.id === activeTab)?.label || 'Select Section'}
                </span>
              </div>
              <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {dropdownOpen && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-lg border border-gray-200 z-50 max-h-96 overflow-y-auto">
                <div className="py-2">
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => {
                        setActiveTab(tab.id);
                        setDropdownOpen(false);
                      }}
                      className={`flex items-center space-x-3 w-full px-4 py-3 text-left hover:bg-red-50 transition-colors duration-200 ${
                        activeTab === tab.id
                          ? 'bg-red-50 text-red-600 border-r-2 border-red-600'
                          : 'text-gray-700 hover:text-red-600'
                      }`}
                    >
                      <tab.icon className="w-4 h-4" />
                      <span className="font-medium">{tab.label}</span>
                      {activeTab === tab.id && (
                        <div className="ml-auto w-2 h-2 bg-red-600 rounded-full"></div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Error Display */}
            {error && (
              <Card className="bg-red-50 border-red-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3 text-red-700">
                    <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs">!</span>
                    </div>
                    <span>{error}</span>
                  </div>
                  <Button
                    onClick={fetchDashboardStats}
                    size="sm"
                    variant="outline"
                    className="border-red-300 text-red-600 hover:bg-red-100"
                  >
                    Retry
                  </Button>
                </div>
              </Card>
            )}

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card className="text-center">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="w-6 h-6 text-red-600" />
                </div>
                <div className="text-2xl font-bold text-gray-900">{formatNumber(stats.totalUsers)}</div>
                <div className="text-sm text-gray-600">Total Users</div>
              </Card>

              <Card className="text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Bus className="w-6 h-6 text-blue-600" />
                </div>
                <div className="text-2xl font-bold text-gray-900">{formatNumber(stats.totalBuses)}</div>
                <div className="text-sm text-gray-600">Total Buses</div>
              </Card>

              <Card className="text-center">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MapPin className="w-6 h-6 text-purple-600" />
                </div>
                <div className="text-2xl font-bold text-gray-900">{formatNumber(stats.totalRoutes)}</div>
                <div className="text-sm text-gray-600">Active Routes</div>
              </Card>

              <Card className="text-center">
                <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Calendar className="w-6 h-6 text-amber-600" />
                </div>
                <div className="text-2xl font-bold text-gray-900">{formatNumber(stats.totalBookings)}</div>
                <div className="text-sm text-gray-600">Total Bookings</div>
              </Card>

              <Card className="text-center">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <DollarSign className="w-6 h-6 text-green-600" />
                </div>
                <div className="text-xl font-bold text-gray-900">₹{formatNumber(stats.totalRevenue)}</div>
                <div className="text-sm text-gray-600">Total Revenue</div>
              </Card>

              <Card className="text-center">
                <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Star className="w-6 h-6 text-yellow-600" />
                </div>
                <div className="text-2xl font-bold text-gray-900">{stats.averageRating || '0.0'}</div>
                <div className="text-sm text-gray-600">Average Rating</div>
              </Card>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="text-center hover:shadow-lg transition-shadow duration-200 cursor-pointer" onClick={() => setActiveTab('buses')}>
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Bus className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Bus Management</h3>
                <p className="text-sm text-gray-600">Add, edit, and manage buses</p>
              </Card>

              <Card className="text-center hover:shadow-lg transition-shadow duration-200 cursor-pointer" onClick={() => setActiveTab('routes')}>
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MapPin className="w-6 h-6 text-purple-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Manage Routes</h3>
                <p className="text-sm text-gray-600">Configure bus routes</p>
              </Card>

              <Card className="text-center hover:shadow-lg transition-shadow duration-200 cursor-pointer" onClick={() => setActiveTab('bookings')}>
                <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Calendar className="w-6 h-6 text-amber-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">View Bookings</h3>
                <p className="text-sm text-gray-600">Monitor reservations</p>
              </Card>

              <Card className="text-center hover:shadow-lg transition-shadow duration-200 cursor-pointer" onClick={() => setActiveTab('analytics')}>
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <BarChart3 className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">View Analytics</h3>
                <p className="text-sm text-gray-600">Revenue and insights</p>
              </Card>
            </div>
          </div>
        )}

        {activeTab === 'schedules' && <BusScheduleManagement />}

        {activeTab === 'drivers' && <DriverManagement />}

        {activeTab === 'bus-staffs' && <BusStaffManagement />}

        {activeTab === 'feedback' && <UserFeedbackManagement />}

        {activeTab === 'passengers' && <PassengerManagement />}

        {activeTab === 'payments' && <PaymentRefundManagement />}

        {activeTab === 'maintenance' && <BusMaintenanceManagement />}

        {activeTab === 'bookings' && <BookingManagement />}

        {activeTab === 'buses' && <BusManagement />}

        {activeTab === 'routes' && <RouteManagement />}

        {activeTab === 'analytics' && <RevenueAnalytics />}
      </div>
    </div>
  );
};

export default AdminDashboard;