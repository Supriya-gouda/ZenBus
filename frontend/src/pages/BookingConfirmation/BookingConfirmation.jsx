import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, useSearchParams, useParams } from 'react-router-dom';
import { CheckCircle, Download, Share, Calendar, MapPin, Users, CreditCard, Printer } from 'lucide-react';
import Card from '../../components/UI/Card';
import Button from '../../components/UI/Button';
import Badge from '../../components/UI/Badge';
import { useBooking } from '../../context/BookingContext';
import { useAuth } from '../../context/AuthContext';

const BookingConfirmation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { bookingId: urlBookingId } = useParams();
  const { bookings } = useBooking();
  const { user } = useAuth();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  useEffect(() => {
    const loadBookingData = async () => {
      try {
        // First, try to get booking from navigation state (most common case after booking)
        if (location.state?.booking) {
          console.log('Loading booking from navigation state:', location.state.booking);
          setBooking(location.state.booking);
          setLoading(false);
          return;
        }

        // Try to get booking ID from URL params or route params
        const bookingId = urlBookingId || searchParams.get('id');
        if (bookingId && bookings.length > 0) {
          console.log('Looking for booking with ID:', bookingId);
          const foundBooking = bookings.find(b =>
            b.id === parseInt(bookingId) ||
            b.id === bookingId ||
            b.id.toString() === bookingId
          );
          if (foundBooking) {
            console.log('Found booking:', foundBooking);
            setBooking(foundBooking);
            setLoading(false);
            return;
          }
        }

        // If no booking found, set booking to null (will show "not found" message)
        console.log('No booking data found');
        setBooking(null);
      } catch (error) {
        console.error('Error loading booking data:', error);
        setBooking(null);
      } finally {
        setLoading(false);
      }
    };

    loadBookingData();
  }, [location.state, searchParams, bookings, urlBookingId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="text-center max-w-md">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold mb-4 text-gray-900">Booking Not Found</h2>
          <p className="text-gray-600 mb-6">
            We couldn't find your booking details. This page is accessed after completing a booking or from your booking history.
          </p>
          <div className="space-y-3">
            <Button onClick={() => navigate('/dashboard')} className="w-full">
              View My Bookings
            </Button>
            <Button variant="outline" onClick={() => navigate('/search')} className="w-full">
              Book a New Trip
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  const handleDownloadTicket = () => {
    try {
      // Create a downloadable PDF-like content
      const ticketContent = generateReceiptHTML(booking);
      const blob = new Blob([ticketContent], { type: 'text/html' });
      const url = window.URL.createObjectURL(blob);

      // Create download link
      const link = document.createElement('a');
      link.href = url;
      link.download = `BusBook_Ticket_${booking.id}_${new Date().toISOString().split('T')[0]}.html`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Clean up
      window.URL.revokeObjectURL(url);

      // Show success message
      alert('Ticket downloaded successfully! You can open the HTML file in any browser to view or print.');
    } catch (error) {
      console.error('Download error:', error);
      alert('Unable to download ticket. Please try printing instead.');
    }
  };

  const handlePrintReceipt = () => {
    try {
      // Create a new window for printing
      const printWindow = window.open('', '_blank', 'width=800,height=600');

      if (!printWindow) {
        alert('Please allow pop-ups to print the receipt');
        return;
      }

      const printContent = generateReceiptHTML(booking);

      printWindow.document.write(printContent);
      printWindow.document.close();

      // Wait for content to load before printing
      printWindow.onload = () => {
        printWindow.focus();
        printWindow.print();

        // Show success message
        setShowSuccessMessage(true);
        setTimeout(() => setShowSuccessMessage(false), 3000);

        // Close window after printing (with delay for print dialog)
        setTimeout(() => {
          printWindow.close();
        }, 1000);
      };
    } catch (error) {
      console.error('Print error:', error);
      alert('Unable to print receipt. Please try again.');
    }
  };

  const generateReceiptHTML = (booking) => {
    const currentDate = new Date();
    const bookingDate = new Date(booking.journeyDate);

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Bus Booking Receipt - ${booking.id}</title>
        <meta charset="UTF-8">
        <style>
          * { box-sizing: border-box; }
          body {
            font-family: 'Arial', sans-serif;
            margin: 0;
            padding: 20px;
            color: #333;
            line-height: 1.4;
            background: white;
          }
          .receipt-container { max-width: 800px; margin: 0 auto; }
          .header {
            text-align: center;
            border-bottom: 3px solid #2563eb;
            padding-bottom: 20px;
            margin-bottom: 30px;
          }
          .company-name {
            font-size: 28px;
            font-weight: bold;
            color: #2563eb;
            margin-bottom: 5px;
          }
          .receipt-title {
            font-size: 18px;
            color: #666;
            margin-top: 10px;
          }
          .booking-status {
            display: inline-block;
            background: #10b981;
            color: white;
            padding: 8px 16px;
            border-radius: 20px;
            font-weight: bold;
            margin-top: 10px;
          }
          .section { margin: 25px 0; }
          .section-title {
            font-size: 16px;
            font-weight: bold;
            color: #2563eb;
            margin-bottom: 15px;
            border-bottom: 1px solid #e5e7eb;
            padding-bottom: 5px;
          }
          .booking-info { margin: 20px 0; }
          .info-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 15px;
            margin-bottom: 20px;
          }
          .info-row {
            display: flex;
            justify-content: space-between;
            margin: 8px 0;
            padding: 5px 0;
          }
          .info-label {
            font-weight: bold;
            color: #374151;
            min-width: 140px;
          }
          .info-value {
            color: #111827;
            font-weight: 500;
          }
          .passenger-table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
            border: 2px solid #e5e7eb;
          }
          .passenger-table th, .passenger-table td {
            border: 1px solid #d1d5db;
            padding: 12px 8px;
            text-align: left;
          }
          .passenger-table th {
            background-color: #f9fafb;
            font-weight: bold;
            color: #374151;
          }
          .passenger-table tr:nth-child(even) { background-color: #f9fafb; }
          .total-section {
            border-top: 3px solid #2563eb;
            padding-top: 20px;
            margin-top: 30px;
            background: #f8fafc;
            padding: 20px;
            border-radius: 8px;
          }
          .total-row {
            display: flex;
            justify-content: space-between;
            margin: 10px 0;
            font-size: 16px;
          }
          .total-amount {
            font-size: 20px;
            font-weight: bold;
            color: #059669;
            border-top: 2px solid #059669;
            padding-top: 10px;
            margin-top: 15px;
          }
          .footer {
            margin-top: 40px;
            text-align: center;
            font-size: 12px;
            color: #6b7280;
            border-top: 1px solid #e5e7eb;
            padding-top: 20px;
          }
          .footer p { margin: 5px 0; }
          .important-notes {
            background: #fef3c7;
            border: 1px solid #f59e0b;
            border-radius: 8px;
            padding: 15px;
            margin: 20px 0;
          }
          .important-notes h4 {
            color: #92400e;
            margin: 0 0 10px 0;
            font-size: 14px;
          }
          .important-notes ul {
            margin: 0;
            padding-left: 20px;
            color: #92400e;
            font-size: 12px;
          }
          .qr-placeholder {
            width: 80px;
            height: 80px;
            border: 2px dashed #d1d5db;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 10px;
            color: #6b7280;
            margin: 0 auto;
          }
          @media print {
            body { margin: 0; padding: 15px; }
            .receipt-container { max-width: none; }
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="receipt-container">
          <div class="header">
            <div class="company-name">🚌 BusBook - Bus Reservation System</div>
            <div class="receipt-title">Booking Confirmation Receipt</div>
            <div class="booking-status">CONFIRMED</div>
          </div>

          <div class="section">
            <div class="section-title">📋 Booking Information</div>
            <div class="info-grid">
              <div class="info-row">
                <span class="info-label">Booking ID:</span>
                <span class="info-value">#${booking.id}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Booking Date:</span>
                <span class="info-value">${currentDate.toLocaleDateString()}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Status:</span>
                <span class="info-value" style="color: ${booking.status === 'confirmed' ? '#059669' : '#dc2626'}; font-weight: bold;">${booking.status?.toUpperCase()}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Payment Status:</span>
                <span class="info-value" style="color: #059669; font-weight: bold;">COMPLETED</span>
              </div>
            </div>
          </div>

          <div class="section">
            <div class="section-title">🗺️ Journey Details</div>
            <div class="info-grid">
              <div class="info-row">
                <span class="info-label">From:</span>
                <span class="info-value">${booking.source}</span>
              </div>
              <div class="info-row">
                <span class="info-label">To:</span>
                <span class="info-value">${booking.destination}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Journey Date:</span>
                <span class="info-value">${bookingDate.toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Departure Time:</span>
                <span class="info-value">${booking.busDetails?.departureTime || 'N/A'}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Arrival Time:</span>
                <span class="info-value">${booking.busDetails?.arrivalTime || 'N/A'}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Seat Numbers:</span>
                <span class="info-value">${booking.seats?.join(', ') || 'N/A'}</span>
              </div>
            </div>
          </div>

          <div class="section">
            <div class="section-title">🚌 Bus Information</div>
            <div class="info-grid">
              <div class="info-row">
                <span class="info-label">Bus Operator:</span>
                <span class="info-value">${booking.busDetails?.operator || 'N/A'}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Bus Number:</span>
                <span class="info-value">${booking.busDetails?.busNumber || 'N/A'}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Bus Type:</span>
                <span class="info-value">${booking.busDetails?.busType || 'N/A'}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Total Seats:</span>
                <span class="info-value">${booking.seats?.length || 0}</span>
              </div>
            </div>
          </div>

          ${booking.passengerDetails && booking.passengerDetails.length > 0 ? `
          <div class="section">
            <div class="section-title">👥 Passenger Details</div>
            <table class="passenger-table">
              <thead>
                <tr>
                  <th>Seat No.</th>
                  <th>Passenger Name</th>
                  <th>Age</th>
                  <th>Gender</th>
                </tr>
              </thead>
              <tbody>
                ${booking.passengerDetails.map((passenger, index) => `
                  <tr>
                    <td><strong>${booking.seats[index]}</strong></td>
                    <td>${passenger.name}</td>
                    <td>${passenger.age}</td>
                    <td style="text-transform: capitalize;">${passenger.gender}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
          ` : ''}

          <div class="section">
            <div class="section-title">💳 Payment Summary</div>
            <div class="total-section">
              <div class="total-row">
                <span>Base Fare (${booking.seats?.length || 0} seat${(booking.seats?.length || 0) > 1 ? 's' : ''}):</span>
                <span>₹${booking.totalFare - (booking.serviceFee || 0)}</span>
              </div>
              <div class="total-row">
                <span>Service Fee & Taxes:</span>
                <span>₹${booking.serviceFee || 0}</span>
              </div>
              <div class="total-row total-amount">
                <span>Total Amount Paid:</span>
                <span>₹${booking.totalFare}</span>
              </div>
              <div style="margin-top: 15px; font-size: 14px; color: #6b7280;">
                <div class="info-row">
                  <span>Payment Method:</span>
                  <span>Credit/Debit Card</span>
                </div>
                <div class="info-row">
                  <span>Transaction ID:</span>
                  <span>TXN${booking.id}${Math.random().toString(36).substr(2, 6).toUpperCase()}</span>
                </div>
                <div class="info-row">
                  <span>Payment Date:</span>
                  <span>${currentDate.toLocaleDateString()} ${currentDate.toLocaleTimeString()}</span>
                </div>
              </div>
            </div>
          </div>

          <div class="important-notes">
            <h4>⚠️ Important Travel Information</h4>
            <ul>
              <li>Please arrive at the boarding point at least 15 minutes before departure time</li>
              <li>Carry a valid government-issued photo ID along with this ticket</li>
              <li>Cancellation is allowed up to 2 hours before departure time</li>
              <li>Refund will be processed within 5-7 business days after cancellation</li>
              <li>Bus timings are subject to traffic and weather conditions</li>
              <li>Smoking, alcohol consumption, and loud music are strictly prohibited</li>
            </ul>
          </div>

          <div style="text-align: center; margin: 30px 0;">
            <div class="qr-placeholder">
              QR Code<br>
              (Scan for<br>
              verification)
            </div>
          </div>

          <div class="footer">
            <p><strong>Thank you for choosing BusBook!</strong></p>
            <p>🌐 www.busbook.com | 📧 support@busbook.com | 📞 +91-1234567890</p>
            <p>🕒 24/7 Customer Support Available</p>
            <p style="margin-top: 15px; font-size: 10px;">
              This is a computer-generated receipt. No signature required.<br>
              Receipt generated on: ${currentDate.toLocaleDateString()} at ${currentDate.toLocaleTimeString()}
            </p>
            <p style="font-size: 10px; color: #9ca3af;">
              BusBook Pvt. Ltd. | CIN: U63040DL2024PTC123456 | GST: 07AABCU9603R1ZX
            </p>
          </div>
        </div>
      </body>
      </html>
    `;
  };

  const handleShareBooking = async () => {
    const shareText = `🚌 Bus Booking Confirmed!

📋 Booking ID: #${booking.id}
🗺️ Route: ${booking.source} → ${booking.destination}
📅 Date: ${new Date(booking.journeyDate).toLocaleDateString()}
🕐 Departure: ${booking.busDetails?.departureTime || 'N/A'}
💺 Seats: ${booking.seats?.join(', ') || 'N/A'}
💰 Amount: ₹${booking.totalFare}

Booked via BusBook - Bus Reservation System`;

    try {
      if (navigator.share) {
        await navigator.share({
          title: 'Bus Booking Confirmation',
          text: shareText,
          url: window.location.href
        });
      } else {
        // Fallback: Copy to clipboard
        await navigator.clipboard.writeText(shareText);
        alert('Booking details copied to clipboard! You can now paste and share.');
      }
    } catch (error) {
      console.error('Share error:', error);
      // Final fallback
      alert('Sharing not supported. Please manually copy the booking details from the page.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Success Message */}
        {showSuccessMessage && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg animate-pulse">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CheckCircle className="h-5 w-5 text-green-400" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-green-800">
                  <strong>Receipt sent to printer!</strong> Your booking receipt is being printed.
                </p>
              </div>
            </div>
          </div>
        )}



        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Booking Confirmed!</h1>
          <p className="text-gray-600">Your bus ticket has been booked successfully</p>
        </div>

        {/* Booking Details */}
        <Card className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Booking Details</h2>
            <Badge variant="success" size="md">Confirmed</Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Journey Information */}
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900 flex items-center">
                <MapPin className="w-4 h-4 mr-2" />
                Journey Information
              </h3>
              
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Booking ID</span>
                  <span className="font-medium">#{booking.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Route</span>
                  <span className="font-medium">{booking.source} → {booking.destination}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Journey Date</span>
                  <span className="font-medium">{new Date(booking.journeyDate).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Departure Time</span>
                  <span className="font-medium">{booking.busDetails?.departureTime || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Arrival Time</span>
                  <span className="font-medium">{booking.busDetails?.arrivalTime || 'N/A'}</span>
                </div>
              </div>
            </div>

            {/* Bus & Passenger Information */}
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900 flex items-center">
                <Users className="w-4 h-4 mr-2" />
                Bus & Passenger Details
              </h3>
              
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Bus Operator</span>
                  <span className="font-medium">{booking.busDetails?.operator || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Bus Number</span>
                  <span className="font-medium">{booking.busDetails?.busNumber || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Bus Type</span>
                  <span className="font-medium">{booking.busDetails?.busType || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Seat Numbers</span>
                  <span className="font-medium">{booking.seats?.join(', ') || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Passengers</span>
                  <span className="font-medium">{booking.passengerDetails?.length || 0}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Passenger List */}
          <div className="mt-8">
            <h3 className="font-semibold text-gray-900 mb-4">Passenger List</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left">Seat</th>
                    <th className="px-4 py-2 text-left">Name</th>
                    <th className="px-4 py-2 text-left">Age</th>
                    <th className="px-4 py-2 text-left">Gender</th>
                  </tr>
                </thead>
                <tbody>
                  {booking.passengerDetails?.map((passenger, index) => (
                    <tr key={index} className="border-t">
                      <td className="px-4 py-2 font-medium">{booking.seats?.[index] || `Seat ${index + 1}`}</td>
                      <td className="px-4 py-2">{passenger.name}</td>
                      <td className="px-4 py-2">{passenger.age}</td>
                      <td className="px-4 py-2 capitalize">{passenger.gender}</td>
                    </tr>
                  )) || (
                    <tr>
                      <td colSpan="4" className="px-4 py-2 text-center text-gray-500">No passenger details available</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Payment Information */}
          <div className="mt-8 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
              <CreditCard className="w-4 h-4 mr-2" />
              Payment Summary
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Base Fare</span>
                <span className="font-medium">₹{(booking.totalFare || 0) - (booking.serviceFee || 0)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Service Fee</span>
                <span className="font-medium">₹{booking.serviceFee || 0}</span>
              </div>
              <div className="flex justify-between font-semibold text-lg">
                <span>Total Paid</span>
                <span className="text-green-600">₹{booking.totalFare}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Payment Status</span>
                <Badge variant="success" size="sm">Completed</Badge>
              </div>
            </div>
          </div>
        </Card>

        {/* Action Buttons */}
        <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center">Quick Actions</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Button
              onClick={handlePrintReceipt}
              className="flex items-center justify-center"
              variant="primary"
            >
              <Printer className="w-4 h-4 mr-2" />
              Print Receipt
            </Button>
            <Button
              variant="secondary"
              onClick={handleDownloadTicket}
              className="flex items-center justify-center"
            >
              <Download className="w-4 h-4 mr-2" />
              Download Ticket
            </Button>
            <Button
              variant="outline"
              onClick={handleShareBooking}
              className="flex items-center justify-center"
            >
              <Share className="w-4 h-4 mr-2" />
              Share Booking
            </Button>
            <Button
              variant="ghost"
              onClick={() => navigate('/dashboard')}
              className="flex items-center justify-center"
            >
              <Calendar className="w-4 h-4 mr-2" />
              My Bookings
            </Button>
          </div>

          {/* Additional Actions */}
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button
                variant="success"
                onClick={() => navigate('/search')}
                size="sm"
                className="flex items-center justify-center"
              >
                Book Another Trip
              </Button>
              <Button
                variant="outline"
                onClick={() => window.open('tel:+911234567890')}
                size="sm"
                className="flex items-center justify-center"
              >
                Contact Support
              </Button>
            </div>
          </div>
        </div>

        {/* Important Information */}
        <Card className="mt-8 bg-blue-50 border-blue-200">
          <h3 className="font-semibold text-blue-900 mb-3">Important Information</h3>
          <ul className="text-sm text-blue-800 space-y-2">
            <li>• Please arrive at the boarding point at least 15 minutes before departure</li>
            <li>• Carry a valid ID proof along with this ticket</li>
            <li>• Cancellation is allowed up to 2 hours before departure</li>
            <li>• For any assistance, contact our 24/7 customer support</li>
          </ul>
        </Card>
      </div>
    </div>
  );
};

export default BookingConfirmation;