import React, { useState, useEffect } from 'react';
import { DollarSign, TrendingUp, Calendar, BarChart3, PieChart, Download } from 'lucide-react';
import Button from '../../../components/UI/Button';
import Card from '../../../components/UI/Card';
import adminService from '../../../services/adminService';

const RevenueAnalytics = () => {
  const [analytics, setAnalytics] = useState({
    totalRevenue: 0,
    monthlyRevenue: 0,
    dailyRevenue: 0,
    averageBookingValue: 0,
    topRoutes: [],
    monthlyTrends: [],
    revenueByBusType: []
  });
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('month');

  useEffect(() => {
    fetchAnalytics();
  }, [selectedPeriod]);

  const fetchAnalytics = async () => {
    try {
      // Mock analytics data since we don't have detailed analytics endpoints
      const mockAnalytics = {
        totalRevenue: 125000,
        monthlyRevenue: 45000,
        dailyRevenue: 1500,
        averageBookingValue: 850,
        topRoutes: [
          { route: 'Mumbai → Delhi', revenue: 25000, bookings: 45 },
          { route: 'Delhi → Bangalore', revenue: 18000, bookings: 32 },
          { route: 'Chennai → Hyderabad', revenue: 15000, bookings: 28 },
          { route: 'Pune → Mumbai', revenue: 12000, bookings: 35 },
          { route: 'Kolkata → Delhi', revenue: 10000, bookings: 20 }
        ],
        monthlyTrends: [
          { month: 'Jan', revenue: 35000 },
          { month: 'Feb', revenue: 42000 },
          { month: 'Mar', revenue: 38000 },
          { month: 'Apr', revenue: 45000 },
          { month: 'May', revenue: 52000 },
          { month: 'Jun', revenue: 48000 }
        ],
        revenueByBusType: [
          { type: 'Luxury', revenue: 45000, percentage: 36 },
          { type: 'Deluxe', revenue: 35000, percentage: 28 },
          { type: 'Standard', revenue: 30000, percentage: 24 },
          { type: 'Sleeper', revenue: 15000, percentage: 12 }
        ]
      };
      setAnalytics(mockAnalytics);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportReport = () => {
    const reportData = {
      period: selectedPeriod,
      generatedAt: new Date().toISOString(),
      summary: {
        totalRevenue: analytics.totalRevenue,
        monthlyRevenue: analytics.monthlyRevenue,
        dailyRevenue: analytics.dailyRevenue,
        averageBookingValue: analytics.averageBookingValue
      },
      topRoutes: analytics.topRoutes,
      revenueByBusType: analytics.revenueByBusType
    };

    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `revenue_report_${new Date().toISOString().split('T')[0]}.json`;
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
          <h2 className="text-2xl font-bold text-gray-900">Revenue Analytics</h2>
          <p className="text-gray-600">Track revenue performance and trends</p>
        </div>
        <div className="flex space-x-3">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            <option value="week">Last 7 Days</option>
            <option value="month">Last 30 Days</option>
            <option value="quarter">Last 3 Months</option>
            <option value="year">Last Year</option>
          </select>
          <Button
            onClick={exportReport}
            variant="outline"
            className="border-red-200 text-red-600 hover:bg-red-50"
          >
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Revenue Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="text-center">
          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <DollarSign className="w-6 h-6 text-green-600" />
          </div>
          <div className="text-2xl font-bold text-gray-900">₹{analytics.totalRevenue.toLocaleString()}</div>
          <div className="text-sm text-gray-600">Total Revenue</div>
        </Card>
        <Card className="text-center">
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Calendar className="w-6 h-6 text-blue-600" />
          </div>
          <div className="text-2xl font-bold text-gray-900">₹{analytics.monthlyRevenue.toLocaleString()}</div>
          <div className="text-sm text-gray-600">This Month</div>
        </Card>
        <Card className="text-center">
          <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <TrendingUp className="w-6 h-6 text-purple-600" />
          </div>
          <div className="text-2xl font-bold text-gray-900">₹{analytics.dailyRevenue.toLocaleString()}</div>
          <div className="text-sm text-gray-600">Today</div>
        </Card>
        <Card className="text-center">
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <BarChart3 className="w-6 h-6 text-red-600" />
          </div>
          <div className="text-2xl font-bold text-gray-900">₹{analytics.averageBookingValue.toLocaleString()}</div>
          <div className="text-sm text-gray-600">Avg. Booking Value</div>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Trends */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Monthly Revenue Trends</h3>
            <BarChart3 className="w-5 h-5 text-gray-400" />
          </div>
          <div className="space-y-3">
            {analytics.monthlyTrends.map((trend, index) => (
              <div key={trend.month} className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">{trend.month}</span>
                <div className="flex items-center space-x-3 flex-1 mx-4">
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-red-400 to-red-600 h-2 rounded-full"
                      style={{
                        width: `${(trend.revenue / Math.max(...analytics.monthlyTrends.map(t => t.revenue))) * 100}%`
                      }}
                    ></div>
                  </div>
                  <span className="text-sm font-semibold text-gray-900">
                    ₹{trend.revenue.toLocaleString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Revenue by Bus Type */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Revenue by Bus Type</h3>
            <PieChart className="w-5 h-5 text-gray-400" />
          </div>
          <div className="space-y-3">
            {analytics.revenueByBusType.map((type, index) => (
              <div key={type.type} className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">{type.type}</span>
                <div className="flex items-center space-x-3 flex-1 mx-4">
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${
                        index === 0 ? 'bg-gradient-to-r from-red-400 to-red-600' :
                        index === 1 ? 'bg-gradient-to-r from-blue-400 to-blue-600' :
                        index === 2 ? 'bg-gradient-to-r from-green-400 to-green-600' :
                        'bg-gradient-to-r from-purple-400 to-purple-600'
                      }`}
                      style={{ width: `${type.percentage}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-semibold text-gray-900">
                    ₹{type.revenue.toLocaleString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Top Routes */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Top Revenue Routes</h3>
          <TrendingUp className="w-5 h-5 text-gray-400" />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-medium text-gray-700">Route</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Bookings</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Revenue</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Avg. Fare</th>
              </tr>
            </thead>
            <tbody>
              {analytics.topRoutes.map((route, index) => (
                <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4 font-medium text-gray-900">{route.route}</td>
                  <td className="py-3 px-4 text-gray-600">{route.bookings}</td>
                  <td className="py-3 px-4 font-semibold text-green-600">
                    ₹{route.revenue.toLocaleString()}
                  </td>
                  <td className="py-3 px-4 text-gray-600">
                    ₹{Math.round(route.revenue / route.bookings).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default RevenueAnalytics;
