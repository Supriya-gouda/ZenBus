import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Clock, AlertCircle, DollarSign, Calendar, User } from 'lucide-react';
import Card from '../../components/UI/Card';
import Button from '../../components/UI/Button';
import Badge from '../../components/UI/Badge';

const RefundManagement = () => {
  const [refunds, setRefunds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRefund, setSelectedRefund] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchRefunds();
  }, []);

  const fetchRefunds = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/refunds', {
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        setRefunds(data.refunds || []);
      } else {
        console.error('Failed to fetch refunds');
        // Add demo data for testing
        setRefunds([
          {
            refund_id: 1,
            booking_id: 'DEMO001',
            refund_amount: 1200.00,
            refund_status: 'Pending',
            refund_reason: 'User cancellation - 50% refund (less than 24 hours)',
            refund_date: '2025-01-09T10:30:00Z',
            processed_date: null,
            refund_transaction_id: null,
            user_name: 'John Doe',
            route: 'Boston → New York',
            journey_date: '2025-01-15'
          },
          {
            refund_id: 2,
            booking_id: 'DEMO002',
            refund_amount: 1800.00,
            refund_status: 'Processed',
            refund_reason: 'User cancellation - Full refund (more than 24 hours)',
            refund_date: '2025-01-08T14:20:00Z',
            processed_date: '2025-01-09T09:15:00Z',
            refund_transaction_id: 'TXN123456789',
            user_name: 'Jane Smith',
            route: 'Chicago → Detroit',
            journey_date: '2025-01-20'
          },
          {
            refund_id: 3,
            booking_id: 'DEMO003',
            refund_amount: 900.00,
            refund_status: 'Failed',
            refund_reason: 'User cancellation - 50% refund (less than 24 hours)',
            refund_date: '2025-01-07T16:45:00Z',
            processed_date: '2025-01-08T11:30:00Z',
            refund_transaction_id: null,
            user_name: 'Bob Johnson',
            route: 'Los Angeles → San Francisco',
            journey_date: '2025-01-12'
          }
        ]);
      }
    } catch (error) {
      console.error('Error fetching refunds:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateRefundStatus = async (refundId, status, transactionId = '') => {
    try {
      const response = await fetch(`/api/refunds/${refundId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ status, transactionId })
      });

      if (response.ok) {
        const data = await response.json();
        alert('Refund status updated successfully!');
        fetchRefunds(); // Refresh the list
        setShowModal(false);
      } else {
        const error = await response.json();
        alert('Failed to update refund status: ' + error.message);
      }
    } catch (error) {
      alert('Error updating refund status: ' + error.message);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Processed': return 'success';
      case 'Pending': return 'warning';
      case 'Failed': return 'danger';
      case 'Cancelled': return 'default';
      default: return 'default';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Processed': return <CheckCircle className="w-4 h-4" />;
      case 'Pending': return <Clock className="w-4 h-4" />;
      case 'Failed': return <XCircle className="w-4 h-4" />;
      case 'Cancelled': return <AlertCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const filteredRefunds = refunds.filter(refund => {
    if (filter === 'all') return true;
    return refund.refund_status.toLowerCase() === filter.toLowerCase();
  });

  const totalRefunds = refunds.length;
  const pendingRefunds = refunds.filter(r => r.refund_status === 'Pending').length;
  const processedRefunds = refunds.filter(r => r.refund_status === 'Processed').length;
  const totalRefundAmount = refunds
    .filter(r => r.refund_status === 'Processed')
    .reduce((sum, r) => sum + parseFloat(r.refund_amount), 0);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center min-h-96">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
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
          <h1 className="text-3xl font-bold text-gray-900">Refund Management</h1>
          <p className="text-gray-600 mt-2">Manage and process booking refunds</p>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="p-6">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-full">
                <DollarSign className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Refunds</p>
                <p className="text-2xl font-bold text-gray-900">{totalRefunds}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center">
              <div className="p-3 bg-yellow-100 rounded-full">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-gray-900">{pendingRefunds}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-full">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Processed</p>
                <p className="text-2xl font-bold text-gray-900">{processedRefunds}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center">
              <div className="p-3 bg-purple-100 rounded-full">
                <DollarSign className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Amount</p>
                <p className="text-2xl font-bold text-gray-900">₹{totalRefundAmount.toFixed(2)}</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Filters */}
        <Card className="p-6 mb-6">
          <div className="flex flex-wrap gap-2">
            <Button
              variant={filter === 'all' ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setFilter('all')}
            >
              All Refunds
            </Button>
            <Button
              variant={filter === 'pending' ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setFilter('pending')}
            >
              Pending
            </Button>
            <Button
              variant={filter === 'processed' ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setFilter('processed')}
            >
              Processed
            </Button>
            <Button
              variant={filter === 'failed' ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setFilter('failed')}
            >
              Failed
            </Button>
          </div>
        </Card>

        {/* Refunds List */}
        <Card>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Refund Details
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredRefunds.map((refund) => (
                  <tr key={refund.refund_id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          Booking #{refund.booking_id}
                        </div>
                        <div className="text-sm text-gray-500">{refund.route}</div>
                        <div className="text-xs text-gray-400">{refund.refund_reason}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <User className="w-4 h-4 text-gray-400 mr-2" />
                        <div className="text-sm text-gray-900">{refund.user_name}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        ₹{parseFloat(refund.refund_amount).toFixed(2)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge variant={getStatusColor(refund.refund_status)} className="flex items-center">
                        {getStatusIcon(refund.refund_status)}
                        <span className="ml-1">{refund.refund_status}</span>
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {new Date(refund.refund_date).toLocaleDateString()}
                      </div>
                      <div className="text-xs text-gray-500">
                        {new Date(refund.refund_date).toLocaleTimeString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedRefund(refund);
                          setShowModal(true);
                        }}
                      >
                        Manage
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Refund Management Modal */}
        {showModal && selectedRefund && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 max-h-screen overflow-y-auto">
              <h3 className="text-lg font-semibold mb-4">Manage Refund</h3>

              <div className="space-y-4 mb-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Booking ID</label>
                    <p className="text-sm text-gray-900">#{selectedRefund.booking_id}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Customer</label>
                    <p className="text-sm text-gray-900">{selectedRefund.user_name}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Route</label>
                    <p className="text-sm text-gray-900">{selectedRefund.route}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Journey Date</label>
                    <p className="text-sm text-gray-900">
                      {new Date(selectedRefund.journey_date).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Refund Amount</label>
                    <p className="text-lg font-semibold text-green-600">
                      ₹{parseFloat(selectedRefund.refund_amount).toFixed(2)}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Current Status</label>
                    <Badge variant={getStatusColor(selectedRefund.refund_status)}>
                      {selectedRefund.refund_status}
                    </Badge>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Refund Reason</label>
                  <p className="text-sm text-gray-900">{selectedRefund.refund_reason}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Refund Date</label>
                  <p className="text-sm text-gray-900">
                    {new Date(selectedRefund.refund_date).toLocaleString()}
                  </p>
                </div>

                {selectedRefund.processed_date && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Processed Date</label>
                    <p className="text-sm text-gray-900">
                      {new Date(selectedRefund.processed_date).toLocaleString()}
                    </p>
                  </div>
                )}

                {selectedRefund.refund_transaction_id && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Transaction ID</label>
                    <p className="text-sm text-gray-900">{selectedRefund.refund_transaction_id}</p>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3">
                {selectedRefund.refund_status === 'Pending' && (
                  <>
                    <Button
                      variant="success"
                      onClick={() => {
                        const transactionId = prompt('Enter transaction ID for processed refund:');
                        if (transactionId) {
                          updateRefundStatus(selectedRefund.refund_id, 'Processed', transactionId);
                        }
                      }}
                    >
                      Mark as Processed
                    </Button>
                    <Button
                      variant="danger"
                      onClick={() => {
                        if (window.confirm('Are you sure you want to mark this refund as failed?')) {
                          updateRefundStatus(selectedRefund.refund_id, 'Failed');
                        }
                      }}
                    >
                      Mark as Failed
                    </Button>
                  </>
                )}

                {selectedRefund.refund_status === 'Failed' && (
                  <Button
                    variant="warning"
                    onClick={() => {
                      if (window.confirm('Are you sure you want to retry this refund?')) {
                        updateRefundStatus(selectedRefund.refund_id, 'Pending');
                      }
                    }}
                  >
                    Retry Refund
                  </Button>
                )}

                <Button
                  variant="outline"
                  onClick={() => setShowModal(false)}
                >
                  Close
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RefundManagement;
