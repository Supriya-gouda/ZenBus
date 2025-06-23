import React, { useState, useEffect } from 'react';
import { CreditCard, RefreshCw, DollarSign, TrendingUp, CheckCircle, XCircle, Clock, Filter, Download } from 'lucide-react';
import Button from '../../../components/UI/Button';
import Card from '../../../components/UI/Card';
import Badge from '../../../components/UI/Badge';
import adminService from '../../../services/adminService';

const PaymentRefundManagement = () => {
  const [activeTab, setActiveTab] = useState('payments');
  const [payments, setPayments] = useState([]);
  const [refunds, setRefunds] = useState([]);
  const [filteredPayments, setFilteredPayments] = useState([]);
  const [filteredRefunds, setFilteredRefunds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statistics, setStatistics] = useState({});
  const [showRefundModal, setShowRefundModal] = useState(false);
  const [selectedRefund, setSelectedRefund] = useState(null);
  const [refundAction, setRefundAction] = useState('');
  const [refundNotes, setRefundNotes] = useState('');
  const [filters, setFilters] = useState({
    status: '',
    method: '',
    dateRange: '',
    amountRange: ''
  });

  useEffect(() => {
    if (activeTab === 'payments') {
      fetchPayments();
    } else {
      fetchRefunds();
    }
    fetchStatistics();
  }, [activeTab]);

  useEffect(() => {
    applyFilters();
  }, [payments, refunds, filters, activeTab]);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const result = await adminService.getAllPayments();
      if (result.success) {
        setPayments(result.payments);
      } else {
        // Use mock data
        setPayments([
          {
            payment_id: 1,
            booking_id: 101,
            user_name: 'John Doe',
            amount: 1200,
            payment_date: '2024-01-20T14:30:00Z',
            payment_method: 'Credit Card',
            transaction_id: 'TXN123456789',
            payment_status: 'Success',
            route: 'Mumbai → Pune'
          },
          {
            payment_id: 2,
            booking_id: 102,
            user_name: 'Jane Smith',
            amount: 800,
            payment_date: '2024-01-19T10:15:00Z',
            payment_method: 'UPI',
            transaction_id: 'UPI987654321',
            payment_status: 'Success',
            route: 'Delhi → Agra'
          },
          {
            payment_id: 3,
            booking_id: 103,
            user_name: 'Mike Johnson',
            amount: 1500,
            payment_date: '2024-01-18T16:45:00Z',
            payment_method: 'Net Banking',
            transaction_id: 'NB456789123',
            payment_status: 'Failed',
            route: 'Bangalore → Chennai'
          }
        ]);
      }
    } catch (error) {
      console.error('Error fetching payments:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRefunds = async () => {
    try {
      setLoading(true);
      const result = await adminService.getAllRefunds();
      if (result.success) {
        setRefunds(result.refunds);
      } else {
        // Use mock data
        setRefunds([
          {
            refund_id: 1,
            booking_id: 104,
            payment_id: 4,
            user_name: 'Alice Brown',
            refund_amount: 900,
            refund_reason: 'Bus breakdown',
            refund_status: 'Pending',
            refund_date: '2024-01-21T09:30:00Z',
            processed_date: null,
            refund_method: 'Original Payment Method',
            route: 'Pune → Mumbai'
          },
          {
            refund_id: 2,
            booking_id: 105,
            payment_id: 5,
            user_name: 'Bob Wilson',
            refund_amount: 600,
            refund_reason: 'Customer cancellation',
            refund_status: 'Processed',
            refund_date: '2024-01-20T11:20:00Z',
            processed_date: '2024-01-21T14:15:00Z',
            refund_method: 'Bank Transfer',
            route: 'Chennai → Bangalore'
          },
          {
            refund_id: 3,
            booking_id: 106,
            payment_id: 6,
            user_name: 'Carol Davis',
            refund_amount: 1100,
            refund_reason: 'Schedule change',
            refund_status: 'Failed',
            refund_date: '2024-01-19T13:45:00Z',
            processed_date: '2024-01-20T10:30:00Z',
            refund_method: 'Original Payment Method',
            route: 'Hyderabad → Vijayawada'
          }
        ]);
      }
    } catch (error) {
      console.error('Error fetching refunds:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStatistics = async () => {
    try {
      const result = await adminService.getPaymentStatistics();
      if (result.success) {
        setStatistics(result.statistics);
      } else {
        // Use mock statistics
        setStatistics({
          total_payments: 1250,
          total_revenue: 1875000,
          successful_payments: 1180,
          failed_payments: 70,
          pending_refunds: 15,
          processed_refunds: 45,
          total_refund_amount: 125000,
          success_rate: 94.4
        });
      }
    } catch (error) {
      console.error('Error fetching statistics:', error);
    }
  };

  const applyFilters = () => {
    if (activeTab === 'payments') {
      let filtered = [...payments];

      if (filters.status) {
        filtered = filtered.filter(payment => payment.payment_status === filters.status);
      }

      if (filters.method) {
        filtered = filtered.filter(payment => payment.payment_method === filters.method);
      }

      if (filters.dateRange) {
        const [startDate, endDate] = filters.dateRange.split(',');
        filtered = filtered.filter(payment => {
          const paymentDate = new Date(payment.payment_date).toISOString().split('T')[0];
          return paymentDate >= startDate && paymentDate <= endDate;
        });
      }

      setFilteredPayments(filtered);
    } else {
      let filtered = [...refunds];

      if (filters.status) {
        filtered = filtered.filter(refund => refund.refund_status === filters.status);
      }

      if (filters.dateRange) {
        const [startDate, endDate] = filters.dateRange.split(',');
        filtered = filtered.filter(refund => {
          const refundDate = new Date(refund.refund_date).toISOString().split('T')[0];
          return refundDate >= startDate && refundDate <= endDate;
        });
      }

      setFilteredRefunds(filtered);
    }
  };

  const handleRefundAction = (refund, action) => {
    setSelectedRefund(refund);
    setRefundAction(action);
    setRefundNotes('');
    setShowRefundModal(true);
  };

  const handleConfirmRefundAction = async () => {
    try {
      const result = await adminService.processRefund(selectedRefund.refund_id, {
        action: refundAction,
        notes: refundNotes
      });

      if (result.success) {
        await fetchRefunds();
        await fetchStatistics();
        setShowRefundModal(false);
        setSelectedRefund(null);
        setRefundAction('');
        setRefundNotes('');
      }
    } catch (error) {
      console.error('Error processing refund:', error);
    }
  };

  const getPaymentStatusColor = (status) => {
    switch (status) {
      case 'Success':
        return 'success';
      case 'Failed':
        return 'danger';
      case 'Pending':
        return 'warning';
      default:
        return 'secondary';
    }
  };

  const getRefundStatusColor = (status) => {
    switch (status) {
      case 'Processed':
        return 'success';
      case 'Failed':
        return 'danger';
      case 'Pending':
        return 'warning';
      case 'Cancelled':
        return 'secondary';
      default:
        return 'secondary';
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

  const formatCurrency = (amount) => {
    return `₹${amount.toLocaleString()}`;
  };

  const exportData = () => {
    const dataToExport = activeTab === 'payments' ? filteredPayments : filteredRefunds;
    const csvContent = "data:text/csv;charset=utf-8," + 
      [
        Object.keys(dataToExport[0] || {}).join(','),
        ...dataToExport.map(row => Object.values(row).join(','))
      ].join('\n');
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${activeTab}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
          <h2 className="text-2xl font-bold text-gray-900">Payment & Refund Management</h2>
          <p className="text-gray-600">Track payments, process refunds, and manage financial transactions</p>
        </div>
        <Button
          onClick={exportData}
          variant="outline"
          className="border-red-200 text-red-600 hover:bg-red-50"
        >
          <Download className="w-4 h-4 mr-2" />
          Export {activeTab === 'payments' ? 'Payments' : 'Refunds'}
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="text-center">
          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <DollarSign className="w-6 h-6 text-green-600" />
          </div>
          <div className="text-2xl font-bold text-gray-900">{formatCurrency(statistics.total_revenue || 0)}</div>
          <div className="text-sm text-gray-600">Total Revenue</div>
        </Card>

        <Card className="text-center">
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CreditCard className="w-6 h-6 text-blue-600" />
          </div>
          <div className="text-2xl font-bold text-gray-900">{statistics.total_payments || 0}</div>
          <div className="text-sm text-gray-600">Total Payments</div>
        </Card>

        <Card className="text-center">
          <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <RefreshCw className="w-6 h-6 text-yellow-600" />
          </div>
          <div className="text-2xl font-bold text-gray-900">{statistics.pending_refunds || 0}</div>
          <div className="text-sm text-gray-600">Pending Refunds</div>
        </Card>

        <Card className="text-center">
          <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <TrendingUp className="w-6 h-6 text-purple-600" />
          </div>
          <div className="text-2xl font-bold text-gray-900">{statistics.success_rate || 0}%</div>
          <div className="text-sm text-gray-600">Success Rate</div>
        </Card>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-white p-1 rounded-lg shadow-sm">
        <button
          onClick={() => setActiveTab('payments')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-md font-medium transition-all duration-200 ${
            activeTab === 'payments'
              ? 'bg-gradient-to-r from-red-500 to-red-600 text-white shadow-md'
              : 'text-gray-600 hover:text-red-600 hover:bg-red-50'
          }`}
        >
          <CreditCard className="w-4 h-4" />
          <span>Payments</span>
        </button>
        <button
          onClick={() => setActiveTab('refunds')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-md font-medium transition-all duration-200 ${
            activeTab === 'refunds'
              ? 'bg-gradient-to-r from-red-500 to-red-600 text-white shadow-md'
              : 'text-gray-600 hover:text-red-600 hover:bg-red-50'
          }`}
        >
          <RefreshCw className="w-4 h-4" />
          <span>Refunds</span>
        </button>
      </div>

      {/* Filters */}
      <Card>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              <option value="">All Status</option>
              {activeTab === 'payments' ? (
                <>
                  <option value="Success">Success</option>
                  <option value="Failed">Failed</option>
                  <option value="Pending">Pending</option>
                </>
              ) : (
                <>
                  <option value="Pending">Pending</option>
                  <option value="Processed">Processed</option>
                  <option value="Failed">Failed</option>
                  <option value="Cancelled">Cancelled</option>
                </>
              )}
            </select>
          </div>
          {activeTab === 'payments' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method</label>
              <select
                value={filters.method}
                onChange={(e) => setFilters({ ...filters, method: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                <option value="">All Methods</option>
                <option value="Credit Card">Credit Card</option>
                <option value="Debit Card">Debit Card</option>
                <option value="UPI">UPI</option>
                <option value="Net Banking">Net Banking</option>
                <option value="Wallet">Wallet</option>
              </select>
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date Range</label>
            <input
              type="date"
              value={filters.dateRange.split(',')[0] || ''}
              onChange={(e) => {
                const endDate = filters.dateRange.split(',')[1] || e.target.value;
                setFilters({ ...filters, dateRange: `${e.target.value},${endDate}` });
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>
          <div className="flex items-end">
            <Button
              onClick={() => setFilters({ status: '', method: '', dateRange: '', amountRange: '' })}
              variant="outline"
              className="w-full border-red-200 text-red-600 hover:bg-red-50"
            >
              Clear Filters
            </Button>
          </div>
        </div>
      </Card>

      {/* Content based on active tab */}
      {activeTab === 'payments' && (
        <div className="space-y-4">
          {filteredPayments.map((payment) => (
            <Card key={payment.payment_id} className="hover:shadow-lg transition-shadow duration-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-red-100 rounded-lg">
                    <CreditCard className="w-6 h-6 text-red-600" />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h3 className="font-semibold text-gray-900">
                        Payment #{payment.payment_id}
                      </h3>
                      <Badge variant={getPaymentStatusColor(payment.payment_status)} size="sm">
                        {payment.payment_status}
                      </Badge>
                    </div>
                    <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                      <span><strong>User:</strong> {payment.user_name}</span>
                      <span><strong>Amount:</strong> {formatCurrency(payment.amount)}</span>
                      <span><strong>Method:</strong> {payment.payment_method}</span>
                    </div>
                    <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                      <span><strong>Route:</strong> {payment.route}</span>
                      <span><strong>Date:</strong> {formatDate(payment.payment_date)}</span>
                      <span><strong>Transaction ID:</strong> {payment.transaction_id}</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-gray-900">
                    {formatCurrency(payment.amount)}
                  </div>
                  <div className="text-sm text-gray-600">
                    Booking #{payment.booking_id}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {activeTab === 'refunds' && (
        <div className="space-y-4">
          {filteredRefunds.map((refund) => (
            <Card key={refund.refund_id} className="hover:shadow-lg transition-shadow duration-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-red-100 rounded-lg">
                    <RefreshCw className="w-6 h-6 text-red-600" />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h3 className="font-semibold text-gray-900">
                        Refund #{refund.refund_id}
                      </h3>
                      <Badge variant={getRefundStatusColor(refund.refund_status)} size="sm">
                        {refund.refund_status}
                      </Badge>
                    </div>
                    <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                      <span><strong>User:</strong> {refund.user_name}</span>
                      <span><strong>Amount:</strong> {formatCurrency(refund.refund_amount)}</span>
                      <span><strong>Reason:</strong> {refund.refund_reason}</span>
                    </div>
                    <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                      <span><strong>Route:</strong> {refund.route}</span>
                      <span><strong>Requested:</strong> {formatDate(refund.refund_date)}</span>
                      {refund.processed_date && (
                        <span><strong>Processed:</strong> {formatDate(refund.processed_date)}</span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="text-right">
                    <div className="text-2xl font-bold text-gray-900">
                      {formatCurrency(refund.refund_amount)}
                    </div>
                    <div className="text-sm text-gray-600">
                      Booking #{refund.booking_id}
                    </div>
                  </div>
                  {refund.refund_status === 'Pending' && (
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        variant="success"
                        onClick={() => handleRefundAction(refund, 'approve')}
                      >
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="danger"
                        onClick={() => handleRefundAction(refund, 'reject')}
                      >
                        <XCircle className="w-4 h-4 mr-1" />
                        Reject
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Refund Action Modal */}
      {showRefundModal && selectedRefund && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {refundAction === 'approve' ? 'Approve' : 'Reject'} Refund
            </h3>
            <p className="text-gray-600 mb-4">
              Are you sure you want to {refundAction} the refund of {formatCurrency(selectedRefund.refund_amount)}
              for <strong>{selectedRefund.user_name}</strong>?
            </p>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notes {refundAction === 'reject' ? '(Required)' : '(Optional)'}
              </label>
              <textarea
                value={refundNotes}
                onChange={(e) => setRefundNotes(e.target.value)}
                required={refundAction === 'reject'}
                rows={3}
                placeholder={`Enter notes for ${refundAction}ing this refund...`}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>
            <div className="flex justify-end space-x-3">
              <Button
                variant="outline"
                onClick={() => {
                  setShowRefundModal(false);
                  setSelectedRefund(null);
                  setRefundAction('');
                  setRefundNotes('');
                }}
              >
                Cancel
              </Button>
              <Button
                variant={refundAction === 'approve' ? 'success' : 'danger'}
                onClick={handleConfirmRefundAction}
                disabled={refundAction === 'reject' && !refundNotes.trim()}
              >
                {refundAction === 'approve' ? 'Approve' : 'Reject'} Refund
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentRefundManagement;
