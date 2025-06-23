import React, { useState, useEffect } from 'react';
import {
  Users,
  Bus,
  Calendar,
  Settings,
  BarChart3,
  UserCheck,
  CreditCard,
  MessageSquare,
  Wrench,
  MapPin,
  TrendingUp,
  AlertTriangle,
  Navigation
} from 'lucide-react';
import Card from '../../components/UI/Card';
import Button from '../../components/UI/Button';
import Badge from '../../components/UI/Badge';

// Import management components
import BookingScheduleManagement from './components/admin/BookingScheduleManagement';
import BusStopsManagement from './components/admin/BusStopsManagement';
import DriverManagement from './components/admin/DriverManagement';
import FeedbackManagement from './components/admin/FeedbackManagement';
import PassengerManagement from './components/admin/PassengerManagement';
import PaymentManagement from './components/admin/PaymentManagement';
import MaintenanceManagement from './components/admin/MaintenanceManagement';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [dashboardStats, setDashboardStats] = useState({
    totalUsers: 0,
    totalBuses: 0,
    totalBookings: 0,
    totalRevenue: 0,
    pendingMaintenance: 0,
    activeDrivers: 0
  });
  const [loading, setLoading] = useState(true);

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'booking-schedules', label: 'Booking Schedules', icon: Calendar },
    { id: 'bus-stops', label: 'Bus Stops & Drivers', icon: Navigation },
    { id: 'feedback', label: 'Feedback Management', icon: MessageSquare },
    { id: 'passengers', label: 'Passenger Management', icon: Users },
    { id: 'payments', label: 'Payments & Refunds', icon: CreditCard },
    { id: 'maintenance', label: 'Maintenance Management', icon: Wrench },
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      // Fetch various statistics from different endpoints
      // This would be implemented with actual API calls
      setDashboardStats({
        totalUsers: 150,
        totalBuses: 25,
        totalBookings: 1250,
        totalRevenue: 125000,
        pendingMaintenance: 3,
        activeDrivers: 18
      });
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Users</p>
              <p className="text-2xl font-bold text-gray-900">{dashboardStats.totalUsers}</p>
            </div>
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
              <Users className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Buses</p>
              <p className="text-2xl font-bold text-gray-900">{dashboardStats.totalBuses}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <Bus className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Bookings</p>
              <p className="text-2xl font-bold text-gray-900">{dashboardStats.totalBookings}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <Calendar className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900">₹{dashboardStats.totalRevenue.toLocaleString()}</p>
            </div>
            <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-emerald-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => setActiveTab('booking-schedules')}
            >
              <Calendar className="w-4 h-4 mr-2" />
              Manage Booking Schedules
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => setActiveTab('bus-stops')}
            >
              <Navigation className="w-4 h-4 mr-2" />
              Manage Bus Stops & Drivers
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => setActiveTab('maintenance')}
            >
              <Wrench className="w-4 h-4 mr-2" />
              Schedule Maintenance
            </Button>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Alerts & Notifications</h3>
          <div className="space-y-3">
            {dashboardStats.pendingMaintenance > 0 && (
              <div className="flex items-center p-3 bg-yellow-50 rounded-lg">
                <AlertTriangle className="w-5 h-5 text-yellow-600 mr-3" />
                <div>
                  <p className="text-sm font-medium text-yellow-800">
                    {dashboardStats.pendingMaintenance} buses need maintenance
                  </p>
                  <p className="text-xs text-yellow-600">Click to view details</p>
                </div>
              </div>
            )}
            <div className="flex items-center p-3 bg-green-50 rounded-lg">
              <UserCheck className="w-5 h-5 text-green-600 mr-3" />
              <div>
                <p className="text-sm font-medium text-green-800">
                  {dashboardStats.activeDrivers} drivers available
                </p>
                <p className="text-xs text-green-600">All drivers are active</p>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="bg-white p-6 rounded-lg shadow-sm">
                  <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                  <div className="h-8 bg-gray-200 rounded w-1/3"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600 mt-2">Manage your bus reservation system</p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex space-x-1 mb-8 bg-white p-1 rounded-lg shadow-sm overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-md font-medium transition-all duration-200 whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-red-500 text-white shadow-md'
                  : 'text-gray-600 hover:text-red-600 hover:bg-red-50'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="min-h-96">
          {activeTab === 'overview' && renderOverview()}
          {activeTab === 'booking-schedules' && <BookingScheduleManagement />}
          {activeTab === 'bus-stops' && <BusStopsManagement />}
          {activeTab === 'feedback' && <FeedbackManagement />}
          {activeTab === 'passengers' && <PassengerManagement />}
          {activeTab === 'payments' && <PaymentManagement />}
          {activeTab === 'maintenance' && <MaintenanceManagement />}
          {activeTab === 'settings' && (
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">System Settings</h3>
              <p className="text-gray-600">Settings panel coming soon...</p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
