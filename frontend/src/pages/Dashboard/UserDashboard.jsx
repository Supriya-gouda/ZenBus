import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, MapPin, Phone, Mail, Calendar, CreditCard, Star, Settings, Printer, Eye, X, MessageSquare } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useBooking } from '../../context/BookingContext';
import Card from '../../components/UI/Card';
import Button from '../../components/UI/Button';
import Badge from '../../components/UI/Badge';
import MyFeedback from './components/MyFeedback';

const UserDashboard = () => {
  const { user, updateProfile } = useAuth();
  const { getUserBookings, cancelBooking, submitFeedback, bookings } = useBooking();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [isEditing, setIsEditing] = useState(false);
  const [userBookings, setUserBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [feedbackData, setFeedbackData] = useState({ rating: 5, comments: '' });
  const [submittingFeedback, setSubmittingFeedback] = useState(false);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [profileData, setProfileData] = useState({
    name: user?.fullName || '',
    phone: user?.phone || '',
    email: user?.email || ''
  });

  // Memoize computed values to prevent unnecessary re-calculations
  const recentBookings = useMemo(() => userBookings.slice(0, 3), [userBookings]);
  // Only sum totalFare for bookings that are confirmed or booked
  const totalSpent = useMemo(() =>
    userBookings
      .filter(booking => booking.status === 'confirmed' || booking.status === 'booked')
      .reduce((sum, booking) => sum + (booking.totalFare || 0), 0),
    [userBookings]
  );

  // Memoize bookings length to prevent unnecessary re-renders
  const bookingsLength = useMemo(() => bookings.length, [bookings.length]);

  // Fetch user bookings on component mount
  useEffect(() => {
    const fetchBookings = async () => {
      if (user?.userId && !dataLoaded) {
        console.log('Dashboard: Starting to fetch bookings for user:', user.userId);
        setLoading(true);
        setError(null);
        try {
          const fetchedBookings = await getUserBookings(user.userId);
          console.log('Dashboard: Received bookings:', fetchedBookings);
          setUserBookings(fetchedBookings || []);
          setDataLoaded(true);
        } catch (err) {
          console.error('Dashboard: Error fetching bookings:', err);
          setError('Failed to load bookings');
          setUserBookings([]);
        }
        setLoading(false);
      }
    };

    fetchBookings();
  }, [user?.userId, dataLoaded, getUserBookings]);

  // Update bookings when context bookings change (for new bookings)
  useEffect(() => {
    if (dataLoaded && bookings.length > 0) {
      setUserBookings(bookings);
    }
  }, [bookingsLength, dataLoaded]);



  const handleProfileUpdate = useCallback(async (e) => {
    e.preventDefault();
    await updateProfile(profileData);
    setIsEditing(false);
  }, [updateProfile, profileData]);

  const getStatusColor = useCallback((status) => {
    switch (status) {
      case 'confirmed': return 'success';
      case 'pending': return 'warning';
      case 'cancelled': return 'danger';
      default: return 'default';
    }
  }, []);

  const handlePrintReceipt = (booking) => {
    // Create a new window for printing
    const printWindow = window.open('', '_blank');
    const printContent = generateReceiptHTML(booking);

    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    printWindow.close();
  };

  const generateReceiptHTML = (booking) => {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Bus Booking Receipt - ${booking.id}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; color: #333; }
          .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 20px; margin-bottom: 20px; }
          .company-name { font-size: 24px; font-weight: bold; color: #2563eb; }
          .receipt-title { font-size: 18px; margin-top: 10px; }
          .booking-info { margin: 20px 0; }
          .info-row { display: flex; justify-content: space-between; margin: 8px 0; }
          .info-label { font-weight: bold; }
          .passenger-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          .passenger-table th, .passenger-table td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          .passenger-table th { background-color: #f5f5f5; }
          .total-section { border-top: 2px solid #333; padding-top: 15px; margin-top: 20px; }
          .total-amount { font-size: 18px; font-weight: bold; color: #059669; }
          .footer { margin-top: 30px; text-align: center; font-size: 12px; color: #666; }
          @media print { body { margin: 0; } }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="company-name">BusBook - Bus Reservation System</div>
          <div class="receipt-title">Booking Confirmation Receipt</div>
        </div>

        <div class="booking-info">
          <div class="info-row">
            <span class="info-label">Booking ID:</span>
            <span>#${booking.id}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Route:</span>
            <span>${booking.source} → ${booking.destination}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Journey Date:</span>
            <span>${new Date(booking.journeyDate).toLocaleDateString()}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Bus Number:</span>
            <span>${booking.busDetails?.busNumber || 'N/A'}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Bus Type:</span>
            <span>${booking.busDetails?.busType || 'N/A'}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Departure Time:</span>
            <span>${booking.busDetails?.departureTime || 'N/A'}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Arrival Time:</span>
            <span>${booking.busDetails?.arrivalTime || 'N/A'}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Seat Numbers:</span>
            <span>${booking.seats?.join(', ') || 'N/A'}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Status:</span>
            <span style="color: ${booking.status === 'confirmed' ? '#059669' : '#dc2626'}; font-weight: bold;">${booking.status?.toUpperCase()}</span>
          </div>
          ${booking.status === 'cancelled' ? `
          <div style="margin-top: 15px; padding: 10px; background-color: #fee2e2; border: 1px solid #ef4444; border-radius: 5px; color: #b91c1c; text-align: center;">
            <p style="font-weight: bold; margin: 0;">THIS BOOKING HAS BEEN CANCELLED</p>
            <p style="margin: 5px 0 0 0; font-size: 14px;">This ticket is no longer valid for travel</p>
          </div>
          ` : ''}
        </div>

        ${booking.passengerDetails && booking.passengerDetails.length > 0 ? `
        <table class="passenger-table">
          <thead>
            <tr>
              <th>Seat</th>
              <th>Passenger Name</th>
              <th>Age</th>
              <th>Gender</th>
            </tr>
          </thead>
          <tbody>
            ${booking.passengerDetails.map((passenger, index) => `
              <tr>
                <td>${booking.seats?.[index] || 'N/A'}</td>
                <td>${passenger.name || 'N/A'}</td>
                <td>${passenger.age || 'N/A'}</td>
                <td>${passenger.gender || 'N/A'}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        ` : ''}

        <div class="total-section">
          <div class="info-row">
            <span class="info-label">Base Fare:</span>
            <span>₹${booking.totalFare - (booking.serviceFee || 0)}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Service Fee:</span>
            <span>₹${booking.serviceFee || 0}</span>
          </div>
          <div class="info-row total-amount">
            <span>Total Amount Paid:</span>
            <span>₹${booking.totalFare}</span>
          </div>
        </div>

        <div class="footer">
          <p>Thank you for choosing BusBook!</p>
          <p>For support, contact us at support@busbook.com | +91-1234567890</p>
          <p>Please arrive at the boarding point 15 minutes before departure time.</p>
          <p>Printed on: ${new Date().toLocaleString()}</p>
        </div>
      </body>
      </html>
    `;
  };

  const handleViewBookingDetails = useCallback((booking) => {
    navigate('/booking-confirmation', { state: { booking } });
  }, [navigate]);

  const handleCancelBooking = async (booking) => {
    // Calculate refund amount for display
    const calculateRefund = (totalFare, journeyDate) => {
      const serviceFee = 2.50;
      const baseFare = totalFare - serviceFee;
      const hoursUntilDeparture = (new Date(journeyDate) - new Date()) / (1000 * 60 * 60);

      if (hoursUntilDeparture < 2) {
        return { amount: 0, percentage: 0, reason: 'No refund (less than 2 hours)' };
      } else if (hoursUntilDeparture < 24) {
        return { amount: baseFare * 0.5, percentage: 50, reason: '50% refund (less than 24 hours)' };
      } else {
        return { amount: baseFare, percentage: 100, reason: 'Full refund (more than 24 hours)' };
      }
    };

    const refundInfo = calculateRefund(booking.totalFare, booking.journeyDate);

    const confirmMessage = `Are you sure you want to cancel this booking?

Booking Details:
• Route: ${booking.source} → ${booking.destination}
• Journey Date: ${new Date(booking.journeyDate).toLocaleDateString()}
• Seats: ${booking.seats?.join(', ') || 'N/A'}
• Total Fare: ₹${booking.totalFare}

Refund Information:
• Refund Amount: ₹${refundInfo.amount.toFixed(2)}
• Refund Percentage: ${refundInfo.percentage}%
• Reason: ${refundInfo.reason}

This action cannot be undone.`;

    if (window.confirm(confirmMessage)) {
      try {
        setLoading(true);
        const result = await cancelBooking(booking.id, 'User cancellation');

        if (result.success) {
          // Immediately update the UI to show the booking as cancelled
          setUserBookings(prevBookings => 
            prevBookings.map(b => 
              b.id === booking.id 
                ? { ...b, status: 'cancelled' } 
                : b
            )
          );
          
          // Show success message with refund details
          const successMessage = `Booking cancelled successfully!\n\n${result.message || 'Your booking has been cancelled and is no longer valid for travel.'}\n\n${result.refund ? `Refund Details:\n• Amount: ₹${result.refund.refundAmount}\n• Status: ${result.refund.status || 'Processing'}\n• Processing Time: 3-5 business days` : ''}`;
          alert(successMessage);

          // Also refresh bookings after cancellation to ensure data consistency
          const updatedBookings = await getUserBookings(user.userId);
          setUserBookings(updatedBookings || []);
        } else {
          alert('Failed to cancel booking:\n' + result.error);
        }
      } catch (error) {
        alert('Error cancelling booking:\n' + error.message);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleFeedbackSubmit = async (booking) => {
    setSelectedBooking(booking);
    setShowFeedbackModal(true);
  };

  const handleSubmitFeedback = async () => {
    try {
      setSubmittingFeedback(true);
      const result = await submitFeedback(selectedBooking.id, feedbackData.rating, feedbackData.comments);

      if (result.success) {
        alert('Feedback submitted successfully! Thank you for your review.');
        setShowFeedbackModal(false);
        setFeedbackData({ rating: 5, comments: '' });

        // Refresh bookings to update feedback status
        const updatedBookings = await getUserBookings(user.userId);
        setUserBookings(updatedBookings || []);
      } else {
        alert('Failed to submit feedback: ' + (result.error || 'Unknown error'));
      }
    } catch (error) {
      alert('Error submitting feedback: ' + error.message);
    } finally {
      setSubmittingFeedback(false);
    }
  };

  const canProvideFeedback = useCallback((booking) => {
    const journeyDate = new Date(booking.journeyDate);
    const currentDate = new Date();
    return journeyDate < currentDate && booking.status === 'confirmed' && !booking.feedbackSubmitted;
  }, []);

  const canCancelBooking = useCallback((booking) => {
    const journeyDate = new Date(booking.journeyDate);
    const currentDate = new Date();
    const hoursUntilDeparture = (journeyDate - currentDate) / (1000 * 60 * 60);
    return hoursUntilDeparture > 2 && booking.status === 'confirmed';
  }, []);

  const tabs = [
    { id: 'overview', label: 'Overview', icon: User },
    { id: 'bookings', label: 'My Bookings', icon: MapPin },
    { id: 'feedback', label: 'My Feedback', icon: MessageSquare },
    { id: 'profile', label: 'Profile', icon: Settings }
  ];

  if (loading && !dataLoaded) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Show skeleton header */}
          <div className="mb-8">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-2 animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded w-1/4 animate-pulse"></div>
          </div>

          {/* Show skeleton tabs */}
          <div className="flex space-x-1 mb-8 bg-white p-1 rounded-lg shadow-sm">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-10 bg-gray-200 rounded w-24 animate-pulse"></div>
            ))}
          </div>

          {/* Show skeleton content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="bg-white p-6 rounded-lg shadow-sm">
                    <div className="h-12 bg-gray-200 rounded-full w-12 mx-auto mb-4 animate-pulse"></div>
                    <div className="h-6 bg-gray-200 rounded w-16 mx-auto mb-2 animate-pulse"></div>
                    <div className="h-4 bg-gray-200 rounded w-20 mx-auto animate-pulse"></div>
                  </div>
                ))}
              </div>
            </div>
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <div className="h-20 bg-gray-200 rounded-full w-20 mx-auto mb-4 animate-pulse"></div>
                <div className="h-6 bg-gray-200 rounded w-32 mx-auto mb-2 animate-pulse"></div>
                <div className="h-4 bg-gray-200 rounded w-40 mx-auto animate-pulse"></div>
              </div>
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
          <h1 className="text-3xl font-bold text-gray-900">Welcome back, {user?.fullName}!</h1>
          <p className="text-gray-600 mt-2">Manage your bookings and profile</p>
          {error && (
            <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-yellow-800 text-sm">
                ⚠️ {error}. Showing demo data for testing purposes.
              </p>
            </div>
          )}
        </div>

        {/* Navigation Tabs */}
        <div className="flex space-x-1 mb-8 bg-white p-1 rounded-lg shadow-sm">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-md font-medium transition-all duration-200 ${
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
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Stats */}
            <div className="lg:col-span-2 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="text-center">
                  <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <MapPin className="w-6 h-6 text-red-600" />
                  </div>
                  <div className="text-2xl font-bold text-gray-900">{userBookings.length}</div>
                  <div className="text-sm text-gray-600">Total Bookings</div>
                </Card>

                <Card className="text-center">
                  <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CreditCard className="w-6 h-6 text-emerald-600" />
                  </div>
                  <div className="text-lg sm:text-xl font-bold text-gray-900 break-words">
                    ₹{totalSpent.toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-600">Total Spent</div>
                </Card>

                <Card className="text-center">
                  <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Star className="w-6 h-6 text-amber-600" />
                  </div>
                  <div className="text-2xl font-bold text-gray-900">4.5</div>
                  <div className="text-sm text-gray-600">Avg Rating</div>
                </Card>
              </div>

              {/* Recent Bookings */}
              <Card>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">Recent Bookings</h3>
                  <Button variant="ghost" size="sm" onClick={() => setActiveTab('bookings')}>
                    View All
                  </Button>
                </div>
                
                {recentBookings.length > 0 ? (
                  <div className="space-y-4">
                    {recentBookings.map((booking) => (
                      <div key={booking.id} className="p-4 border border-gray-200 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <div className="font-medium text-gray-900">
                            {booking.source} → {booking.destination}
                          </div>
                          <Badge variant={getStatusColor(booking.status)} className={booking.status === 'cancelled' ? 'animate-pulse' : ''}>
                            {booking.status === 'cancelled' ? 'CANCELLED' : booking.status.toUpperCase()}
                          </Badge>
                        </div>
                        <div className="text-sm text-gray-600 mb-3">
                          Journey Date: {new Date(booking.journeyDate).toLocaleDateString()}
                        </div>
                        <div className="text-sm text-gray-600 mb-3">
                          Seats: {booking.seats?.join(', ') || 'N/A'} | Fare: ₹{booking.totalFare}
                        </div>
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="xs"
                            onClick={() => handlePrintReceipt(booking)}
                            className="flex items-center"
                          >
                            <Printer className="w-3 h-3 mr-1" />
                            Print
                          </Button>
                          <Button
                            variant="ghost"
                            size="xs"
                            onClick={() => handleViewBookingDetails(booking)}
                            className="flex items-center"
                          >
                            <Eye className="w-3 h-3 mr-1" />
                            View
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    No bookings yet. Start your journey today!
                  </div>
                )}
              </Card>
            </div>

            {/* Profile Summary */}
            <div className="space-y-6">
              <Card>
                <div className="text-center mb-6">
                  <div className="w-20 h-20 bg-gradient-to-r from-red-500 to-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <User className="w-10 h-10 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900">{user?.fullName}</h3>
                  <p className="text-gray-600">{user?.email}</p>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <Mail className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-600">{user?.email}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Phone className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-600">{user?.phone}</span>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        )}

        {activeTab === 'bookings' && (
          <Card>
            <h3 className="text-lg font-semibold text-gray-900 mb-6">All Bookings</h3>
            
            {userBookings.length > 0 ? (
              <div className="space-y-4">
                {userBookings.map((booking) => (
                  <div key={booking.id} className={`p-6 border ${booking.status === 'cancelled' ? 'border-red-300 bg-red-50' : 'border-gray-200'} rounded-lg hover:shadow-md transition-shadow duration-200`}>
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h4 className="font-semibold text-gray-900 text-lg">
                          {booking.source} → {booking.destination}
                        </h4>
                        <p className="text-sm text-gray-600">Booking ID: #{booking.id}</p>
                      </div>
                      <Badge variant={getStatusColor(booking.status)} size="md" className={booking.status === 'cancelled' ? 'animate-pulse' : ''}>
                        {booking.status === 'cancelled' ? 'CANCELLED' : booking.status.toUpperCase()}
                      </Badge>
                    </div>
                    
                    {booking.status === 'cancelled' && (
                      <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
                        <p className="font-medium">This booking has been cancelled</p>
                        <p className="text-sm">Your booking was cancelled and is no longer valid for travel.</p>
                      </div>
                    )}
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                      <div>
                        <div className="text-sm text-gray-500">Journey Date</div>
                        <div className="font-medium">{new Date(booking.journeyDate).toLocaleDateString()}</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-500">Seats</div>
                        <div className="font-medium">{booking.seats?.join(', ') || 'N/A'}</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-500">Total Fare</div>
                        <div className="font-medium">₹{booking.totalFare}</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-500">Bus</div>
                        <div className="font-medium">{booking.busDetails?.busNumber}</div>
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePrintReceipt(booking)}
                        className="flex items-center"
                      >
                        <Printer className="w-4 h-4 mr-1" />
                        Print Receipt
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleViewBookingDetails(booking)}
                        className="flex items-center"
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        View Details
                      </Button>

                      {/* Always show feedback button for testing - remove condition temporarily */}
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handleFeedbackSubmit(booking)}
                        className="flex items-center"
                      >
                        <Star className="w-4 h-4 mr-1" />
                        Rate Trip
                      </Button>

                      {booking.feedbackSubmitted && (
                        <div className="flex items-center text-green-600 text-sm">
                          <Star className="w-4 h-4 mr-1 fill-current" />
                          Feedback Submitted
                        </div>
                      )}

                      {/* Always show cancel button for testing - remove condition temporarily */}
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => handleCancelBooking(booking)}
                        className="flex items-center"
                        disabled={booking.status === 'cancelled'}
                      >
                        <X className="w-4 h-4 mr-1" />
                        {booking.status === 'cancelled' ? 'Already Cancelled' : 'Cancel Booking'}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No bookings yet</h3>
                <p className="text-gray-600 mb-6">Start your journey by booking your first ticket</p>
                <Button onClick={() => setActiveTab('overview')}>
                  Search Buses
                </Button>
              </div>
            )}
          </Card>
        )}

        {activeTab === 'feedback' && (
          <MyFeedback />
        )}

        {activeTab === 'profile' && (
          <Card>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Profile Information</h3>
              <Button 
                variant="ghost" 
                onClick={() => setIsEditing(!isEditing)}
              >
                {isEditing ? 'Cancel' : 'Edit Profile'}
              </Button>
            </div>

            {isEditing ? (
              <form onSubmit={handleProfileUpdate} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={profileData.name}
                      onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      value={profileData.phone}
                      onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={profileData.email}
                    onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>
                <div className="flex space-x-4">
                  <Button type="submit">Save Changes</Button>
                  <Button variant="secondary" onClick={() => setIsEditing(false)}>
                    Cancel
                  </Button>
                </div>
              </form>
            ) : (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name
                    </label>
                    <p className="text-gray-900">{user?.fullName}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number
                    </label>
                    <p className="text-gray-900">{user?.phone}</p>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <p className="text-gray-900">{user?.email}</p>
                </div>
              </div>
            )}
          </Card>
        )}
      </div>

      {/* Feedback Modal */}
      {showFeedbackModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold mb-4">Rate Your Trip</h3>

            {selectedBooking && (
              <div className="mb-4 p-3 bg-gray-50 rounded">
                <p className="text-sm text-gray-600">
                  {selectedBooking.source} → {selectedBooking.destination}
                </p>
                <p className="text-sm text-gray-600">
                  {new Date(selectedBooking.journeyDate).toLocaleDateString()}
                </p>
              </div>
            )}

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Rating (1-5 stars)
              </label>
              <div className="flex space-x-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setFeedbackData({ ...feedbackData, rating: star })}
                    className={`text-2xl ${
                      star <= feedbackData.rating ? 'text-yellow-400' : 'text-gray-300'
                    }`}
                  >
                    ★
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Comments (optional)
              </label>
              <textarea
                value={feedbackData.comments}
                onChange={(e) => setFeedbackData({ ...feedbackData, comments: e.target.value })}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                rows="4"
                placeholder="Share your experience..."
              />
            </div>

            <div className="flex space-x-3">
              <Button
                variant="outline"
                onClick={() => {
                  setShowFeedbackModal(false);
                  setFeedbackData({ rating: 5, comments: '' });
                }}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmitFeedback}
                disabled={submittingFeedback}
                className="flex-1"
              >
                {submittingFeedback ? 'Submitting...' : 'Submit Feedback'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserDashboard;