import React, { useState, useEffect } from 'react';
import { CreditCard, DollarSign, RefreshCw, AlertCircle, CheckCircle, Clock, TrendingUp, Filter } from 'lucide-react';
import Card from '../../../../components/UI/Card';
import Button from '../../../../components/UI/Button';
import Badge from '../../../../components/UI/Badge';

const PaymentManagement = () => {
  const [payments, setPayments] = useState([]);
  const [refunds, setRefunds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('payments');
  const [filters, setFilters] = useState({
    status: 'all',
    method: 'all',
    dateRange: '7days'
  });

  useEffect(() => {
    fetchPayments();
    fetchRefunds();
  }, []);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      // Mock data - replace with actual API call
      const mockPayments = [
        {
          payment_id: 1,
          booking_id: 'BK001',
          user_name: 'Alice Johnson',
          user_email: 'alice@email.com',
          amount: 500,
          payment_method: 'Credit Card',
          payment_status: 'Success',
          payment_date: '2024-01-15T10:30:00',
          transaction_id: 'TXN001234567',
          source: 'Mumbai',
          destination: 'Pune'
        },
        {
          payment_id: 2,
          booking_id: 'BK002',
          user_name: 'Bob Smith',
          user_email: 'bob@email.com',
          amount: 300,
          payment_method: 'UPI',
          payment_status: 'Success',
          payment_date: '2024-01-14T15:45:00',
          transaction_id: 'TXN001234568',
          source: 'Delhi',
          destination: 'Agra'
        },
        {
          payment_id: 3,
          booking_id: 'BK003',
          user_name: 'Carol Davis',
          user_email: 'carol@email.com',
          amount: 750,
          payment_method: 'Debit Card',
          payment_status: 'Failed',
          payment_date: '2024-01-13T09:15:00',
          transaction_id: 'TXN001234569',
          source: 'Bangalore',
          destination: 'Chennai'
        }
      ];
      setPayments(mockPayments);
    } catch (error) {
      console.error('Error fetching payments:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRefunds = async () => {
    try {
      // Mock data - replace with actual API call
      const mockRefunds = [
        {
          refund_id: 1,
          booking_id: 'BK004',
          user_name: 'David Wilson',
          user_email: 'david@email.com',
          refund_amount: 450,
          refund_reason: 'Trip cancelled by user',
          refund_status: 'Pending',
          refund_date: '2024-01-12T14:20:00',
          payment_method: 'Credit Card',
          source: 'Mumbai',
          destination: 'Pune'
        },
        {
          refund_id: 2,
          booking_id: 'BK005',
          user_name: 'Eva Brown',
          user_email: 'eva@email.com',
          refund_amount: 280,
          refund_reason: 'Bus breakdown',
          refund_status: 'Processed',
          refund_date: '2024-01-10T11:30:00',
          processed_date: '2024-01-11T16:45:00',
          payment_method: 'UPI',
          source: 'Delhi',
          destination: 'Jaipur'
        }
      ];
      setRefunds(mockRefunds);
    } catch (error) {
      console.error('Error fetching refunds:', error);
    }
  };

  const handleProcessRefund = async (refundId) => {
    if (window.confirm('Are you sure you want to process this refund?')) {
      try {
        console.log('Processing refund:', refundId);
        fetchRefunds();
      } catch (error) {
        console.error('Error processing refund:', error);
      }
    }
  };

  const getPaymentStatusIcon = (status) => {
    switch (status) {
      case 'Success':
        return <CheckCircle className="w-4 h-4" />;
      case 'Failed':
        return <AlertCircle className="w-4 h-4" />;
      case 'Pending':
        return <Clock className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Success':
      case 'Processed':
        return 'success';
      case 'Failed':
        return 'danger';
      case 'Pending':
        return 'warning';
      default:
        return 'secondary';
    }
  };

  const getPaymentStats = () => {
    const totalPayments = payments.length;
    const successfulPayments = payments.filter(p => p.payment_status === 'Success').length;
    const failedPayments = payments.filter(p => p.payment_status === 'Failed').length;
    const totalRevenue = payments
      .filter(p => p.payment_status === 'Success')
      .reduce((sum, p) => sum + p.amount, 0);

    return { totalPayments, successfulPayments, failedPayments, totalRevenue };
  };

  const getRefundStats = () => {
    const totalRefunds = refunds.length;
    const pendingRefunds = refunds.filter(r => r.refund_status === 'Pending').length;
    const processedRefunds = refunds.filter(r => r.refund_status === 'Processed').length;
    const totalRefundAmount = refunds.reduce((sum, r) => sum + r.refund_amount, 0);

    return { totalRefunds, pendingRefunds, processedRefunds, totalRefundAmount };
  };

  const paymentStats = getPaymentStats();
  const refundStats = getRefundStats();

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
          <h2 className="text-2xl font-bold text-gray-900">Payment & Refund Management</h2>
          <p className="text-gray-600">Monitor transactions and process refunds</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Revenue</p>
              <p className="text-2xl font-bold text-green-600">₹{paymentStats.totalRevenue.toLocaleString()}</p>
            </div>
            <TrendingUp className="w-8 h-8 text-green-600" />
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Successful Payments</p>
              <p className="text-2xl font-bold text-blue-600">{paymentStats.successfulPayments}</p>
            </div>
            <CheckCircle className="w-8 h-8 text-blue-600" />
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Failed Payments</p>
              <p className="text-2xl font-bold text-red-600">{paymentStats.failedPayments}</p>
            </div>
            <AlertCircle className="w-8 h-8 text-red-600" />
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pending Refunds</p>
              <p className="text-2xl font-bold text-yellow-600">{refundStats.pendingRefunds}</p>
            </div>
            <RefreshCw className="w-8 h-8 text-yellow-600" />
          </div>
        </Card>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
        {[
          { id: 'payments', label: 'Payments', count: paymentStats.totalPayments },
          { id: 'refunds', label: 'Refunds', count: refundStats.totalRefunds }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {tab.label} ({tab.count})
          </button>
        ))}
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="success">Success</option>
              <option value="failed">Failed</option>
              <option value="pending">Pending</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Payment Method</label>
            <select
              value={filters.method}
              onChange={(e) => setFilters({ ...filters, method: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            >
              <option value="all">All Methods</option>
              <option value="credit_card">Credit Card</option>
              <option value="debit_card">Debit Card</option>
              <option value="upi">UPI</option>
              <option value="net_banking">Net Banking</option>
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
              <option value="custom">Custom Range</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Content based on active tab */}
      {activeTab === 'payments' && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Payment Transactions</h3>
          {payments.map((payment) => (
            <Card key={payment.payment_id} className="p-6 hover:shadow-lg transition-shadow duration-200">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <CreditCard className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900">
                      {payment.user_name} - ₹{payment.amount}
                    </h4>
                    <p className="text-sm text-gray-600">
                      {payment.source} → {payment.destination}
                    </p>
                  </div>
                </div>
                <Badge variant={getStatusColor(payment.payment_status)}>
                  {getPaymentStatusIcon(payment.payment_status)}
                  <span className="ml-1">{payment.payment_status}</span>
                </Badge>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Booking ID</p>
                  <p className="font-medium">{payment.booking_id}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Payment Method</p>
                  <p className="font-medium">{payment.payment_method}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Transaction ID</p>
                  <p className="font-medium text-xs">{payment.transaction_id}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Date & Time</p>
                  <p className="font-medium">{new Date(payment.payment_date).toLocaleString()}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {activeTab === 'refunds' && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Refund Requests</h3>
          {refunds.map((refund) => (
            <Card key={refund.refund_id} className="p-6 hover:shadow-lg transition-shadow duration-200">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                    <RefreshCw className="w-6 h-6 text-orange-600" />
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900">
                      {refund.user_name} - ₹{refund.refund_amount}
                    </h4>
                    <p className="text-sm text-gray-600">{refund.refund_reason}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant={getStatusColor(refund.refund_status)}>
                    {refund.refund_status}
                  </Badge>
                  {refund.refund_status === 'Pending' && (
                    <Button
                      size="sm"
                      onClick={() => handleProcessRefund(refund.refund_id)}
                    >
                      Process
                    </Button>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Booking ID</p>
                  <p className="font-medium">{refund.booking_id}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Route</p>
                  <p className="font-medium">{refund.source} → {refund.destination}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Refund Date</p>
                  <p className="font-medium">{new Date(refund.refund_date).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Payment Method</p>
                  <p className="font-medium">{refund.payment_method}</p>
                </div>
              </div>

              {refund.processed_date && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <p className="text-sm text-green-600">
                    Processed on {new Date(refund.processed_date).toLocaleString()}
                  </p>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default PaymentManagement;
