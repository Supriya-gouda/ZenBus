import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, User, CreditCard, Check } from 'lucide-react';
import { useBooking } from '../../context/BookingContext';
import { useAuth } from '../../context/AuthContext';
import Card from '../../components/UI/Card';
import Button from '../../components/UI/Button';
import Input from '../../components/UI/Input';

const SeatSelection = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { createBooking } = useBooking();
  const { user } = useAuth();

  const { bus, searchData } = location.state || {};

  const [selectedSeats, setSelectedSeats] = useState([]);
  const [passengerDetails, setPassengerDetails] = useState([]);
  const [currentStep, setCurrentStep] = useState('seats'); // seats, passengers, payment
  const [loading, setLoading] = useState(false);

  // Generate seat layout (40 seats for this example)
  const generateSeatLayout = () => {
    const seats = [];
    const totalSeats = bus?.totalSeats || 40;
    const bookedSeats = Math.floor(totalSeats - (bus?.availableSeats || 28));
    const randomBookedSeats = [];

    // Generate random booked seats
    while (randomBookedSeats.length < bookedSeats) {
      const seatNum = Math.floor(Math.random() * totalSeats) + 1;
      if (!randomBookedSeats.includes(seatNum)) {
        randomBookedSeats.push(seatNum);
      }
    }

    for (let i = 1; i <= totalSeats; i++) {
      seats.push({
        number: i,
        isBooked: randomBookedSeats.includes(i),
        isSelected: false, // Will be updated dynamically
        isWindow: i % 4 === 1 || i % 4 === 0,
        price: bus?.fare || 1200
      });
    }
    return seats;
  };

  const [seats, setSeats] = useState(generateSeatLayout());

  // Update seat selection state when selectedSeats changes
  useEffect(() => {
    setSeats(prevSeats =>
      prevSeats.map(seat => ({
        ...seat,
        isSelected: selectedSeats.includes(seat.number)
      }))
    );
  }, [selectedSeats]);

  const handleSeatClick = (seatNumber) => {
    const seat = seats.find(s => s.number === seatNumber);
    if (seat.isBooked) return;

    if (selectedSeats.includes(seatNumber)) {
      setSelectedSeats(selectedSeats.filter(s => s !== seatNumber));
    } else if (selectedSeats.length < 6) { // Max 6 seats per booking
      setSelectedSeats([...selectedSeats, seatNumber]);
    }
  };

  const handlePassengerDetailsChange = (index, field, value) => {
    const updated = [...passengerDetails];
    if (!updated[index]) updated[index] = {};
    updated[index][field] = value;
    setPassengerDetails(updated);
  };

  const proceedToPassengers = () => {
    if (selectedSeats.length === 0) return;
    
    // Initialize passenger details array
    const details = selectedSeats.map(() => ({
      name: '',
      age: '',
      gender: 'male'
    }));
    setPassengerDetails(details);
    setCurrentStep('passengers');
  };

  const proceedToPayment = () => {
    const isValid = passengerDetails.every(p => p.name && p.age);
    if (!isValid) return;
    setCurrentStep('payment');
  };

  const handleBooking = async () => {
    if (!user) {
      alert('Please login to complete your booking');
      navigate('/login');
      return;
    }

    if (selectedSeats.length === 0) {
      alert('Please select at least one seat');
      return;
    }

    setLoading(true);

    const totalFare = selectedSeats.length * (bus?.fare || 1200);
    const serviceFee = Math.round(totalFare * 0.05);

    const bookingData = {
      userId: user.id,
      scheduleId: bus.schedule_id || bus.scheduleId || bus.id, // Use schedule_id from search results
      seats: selectedSeats,
      passengerDetails,
      totalFare: totalFare + serviceFee,
      journeyDate: searchData.date,
      source: searchData.source,
      destination: searchData.destination,
      busDetails: bus
    };

    console.log('SeatSelection - Selected seats:', selectedSeats);
    console.log('SeatSelection - Booking data:', bookingData);
    console.log('SeatSelection - Bus data:', bus);

    try {
      const booking = await createBooking(bookingData);
      navigate('/booking-confirmation', { state: { booking } });
    } catch (error) {
      console.error('Booking failed:', error);
      alert(`Booking failed: ${error.message}`);
    }

    setLoading(false);
  };

  if (!bus) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="text-center">
          <h2 className="text-xl font-semibold mb-4">No bus selected</h2>
          <Button onClick={() => navigate('/search')}>Back to Search</Button>
        </Card>
      </div>
    );
  }

  const totalFare = selectedSeats.length * bus.fare;
  const serviceFee = Math.round(totalFare * 0.05);
  const grandTotal = totalFare + serviceFee;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center mb-8">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/search')}
            className="mr-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Search
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {bus.operator} - {bus.busType}
            </h1>
            <p className="text-gray-600">
              {searchData.source} → {searchData.destination} | {new Date(searchData.date).toLocaleDateString()}
            </p>
          </div>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-8">
          <div className="flex items-center space-x-4">
            {['seats', 'passengers', 'payment'].map((step, index) => (
              <div key={step} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  currentStep === step 
                    ? 'bg-blue-500 text-white' 
                    : index < ['seats', 'passengers', 'payment'].indexOf(currentStep)
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-200 text-gray-600'
                }`}>
                  {index < ['seats', 'passengers', 'payment'].indexOf(currentStep) ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    index + 1
                  )}
                </div>
                <span className="ml-2 text-sm font-medium capitalize">{step}</span>
                {index < 2 && <div className="w-8 h-px bg-gray-300 ml-4"></div>}
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {currentStep === 'seats' && (
              <Card>
                <h2 className="text-xl font-semibold mb-6">Select Your Seats</h2>
                
                {/* Bus Seat Layout */}
                <div className="bg-gray-50 p-6 rounded-lg">
                  {/* Legend */}
                  <div className="flex items-center justify-between mb-6">
                    <div className="text-sm text-gray-600 font-medium">🚌 Bus Layout</div>
                    <div className="flex items-center space-x-4 text-xs">
                      <div className="flex items-center space-x-1">
                        <div className="w-4 h-4 bg-green-200 border border-green-300 rounded"></div>
                        <span>Available</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <div className="w-4 h-4 bg-blue-500 border border-blue-600 rounded"></div>
                        <span>Selected</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <div className="w-4 h-4 bg-gray-400 border border-gray-500 rounded"></div>
                        <span>Booked</span>
                      </div>
                    </div>
                  </div>

                  {/* Bus Structure */}
                  <div className="max-w-md mx-auto bg-white border-2 border-gray-300 rounded-lg p-4 shadow-lg">
                    {/* Driver Section */}
                    <div className="flex items-center justify-between mb-4 pb-2 border-b border-gray-200">
                      <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center">
                        <span className="text-white text-xs">🚗</span>
                      </div>
                      <div className="text-xs text-gray-500">Driver</div>
                      <div className="w-8 h-8"></div> {/* Spacer for balance */}
                    </div>

                    {/* Seat Rows */}
                    <div className="space-y-3">
                      {Array.from({ length: Math.ceil(seats.length / 4) }, (_, rowIndex) => {
                        const rowSeats = seats.slice(rowIndex * 4, (rowIndex + 1) * 4);
                        return (
                          <div key={rowIndex} className="flex items-center justify-between">
                            {/* Left side seats (2 seats) */}
                            <div className="flex space-x-2">
                              {rowSeats.slice(0, 2).map((seat) => (
                                <button
                                  key={seat.number}
                                  onClick={() => handleSeatClick(seat.number)}
                                  disabled={seat.isBooked}
                                  className={`
                                    w-10 h-10 rounded-lg border-2 text-xs font-bold transition-all duration-200 relative
                                    ${seat.isBooked
                                      ? 'bg-gray-400 border-gray-500 text-white cursor-not-allowed'
                                      : seat.isSelected
                                      ? 'bg-blue-500 border-blue-600 text-white shadow-lg transform scale-105'
                                      : 'bg-green-200 border-green-300 text-gray-700 hover:bg-green-300 hover:shadow-md'
                                    }
                                  `}
                                  title={`Seat ${seat.number} ${seat.isWindow ? '(Window)' : ''}`}
                                >
                                  {seat.number}
                                  {seat.isWindow && (
                                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-amber-400 rounded-full border border-amber-500"></div>
                                  )}
                                </button>
                              ))}
                            </div>

                            {/* Aisle */}
                            <div className="w-8 flex justify-center">
                              <div className="w-px h-8 bg-gray-300"></div>
                            </div>

                            {/* Right side seats (2 seats) */}
                            <div className="flex space-x-2">
                              {rowSeats.slice(2, 4).map((seat) => (
                                <button
                                  key={seat.number}
                                  onClick={() => handleSeatClick(seat.number)}
                                  disabled={seat.isBooked}
                                  className={`
                                    w-10 h-10 rounded-lg border-2 text-xs font-bold transition-all duration-200 relative
                                    ${seat.isBooked
                                      ? 'bg-gray-400 border-gray-500 text-white cursor-not-allowed'
                                      : seat.isSelected
                                      ? 'bg-blue-500 border-blue-600 text-white shadow-lg transform scale-105'
                                      : 'bg-green-200 border-green-300 text-gray-700 hover:bg-green-300 hover:shadow-md'
                                    }
                                  `}
                                  title={`Seat ${seat.number} ${seat.isWindow ? '(Window)' : ''}`}
                                >
                                  {seat.number}
                                  {seat.isWindow && (
                                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-amber-400 rounded-full border border-amber-500"></div>
                                  )}
                                </button>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Back of Bus */}
                    <div className="mt-4 pt-2 border-t border-gray-200 text-center">
                      <div className="text-xs text-gray-500">Back of Bus</div>
                    </div>
                  </div>

                  <div className="text-center mt-4 text-xs text-gray-600">
                    <div className="flex items-center justify-center space-x-4">
                      <div className="flex items-center space-x-1">
                        <div className="w-3 h-3 bg-amber-400 rounded-full border border-amber-500"></div>
                        <span>Window Seat</span>
                      </div>
                      <span>•</span>
                      <span>Max 6 seats per booking</span>
                    </div>
                  </div>
                </div>

                {selectedSeats.length > 0 && (
                  <div className="mt-6">
                    <Button onClick={proceedToPassengers} className="w-full">
                      Continue with {selectedSeats.length} seat{selectedSeats.length > 1 ? 's' : ''}
                    </Button>
                  </div>
                )}
              </Card>
            )}

            {currentStep === 'passengers' && (
              <Card>
                <h2 className="text-xl font-semibold mb-6">Passenger Details</h2>
                
                <div className="space-y-6">
                  {selectedSeats.map((seatNumber, index) => (
                    <div key={seatNumber} className="p-4 border border-gray-200 rounded-lg">
                      <h3 className="font-medium mb-4">Passenger {index + 1} - Seat {seatNumber}</h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Input
                          label="Full Name"
                          placeholder="Enter full name"
                          value={passengerDetails[index]?.name || ''}
                          onChange={(e) => handlePassengerDetailsChange(index, 'name', e.target.value)}
                          required
                        />
                        <Input
                          label="Age"
                          type="number"
                          placeholder="Age"
                          min="1"
                          max="120"
                          value={passengerDetails[index]?.age || ''}
                          onChange={(e) => handlePassengerDetailsChange(index, 'age', e.target.value)}
                          required
                        />
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Gender
                          </label>
                          <select
                            value={passengerDetails[index]?.gender || 'male'}
                            onChange={(e) => handlePassengerDetailsChange(index, 'gender', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="male">Male</option>
                            <option value="female">Female</option>
                            <option value="other">Other</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex space-x-4 mt-6">
                  <Button variant="secondary" onClick={() => setCurrentStep('seats')}>
                    Back to Seats
                  </Button>
                  <Button 
                    onClick={proceedToPayment}
                    disabled={!passengerDetails.every(p => p.name && p.age)}
                    className="flex-1"
                  >
                    Continue to Payment
                  </Button>
                </div>
              </Card>
            )}

            {currentStep === 'payment' && (
              <Card>
                <h2 className="text-xl font-semibold mb-6">Payment Details</h2>
                
                <div className="space-y-6">
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <h3 className="font-medium text-blue-900 mb-2">Mock Payment System</h3>
                    <p className="text-sm text-blue-700">
                      This is a demo payment system. Click "Complete Booking" to simulate a successful payment.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      label="Card Number"
                      placeholder="1234 5678 9012 3456"
                      value="1234 5678 9012 3456"
                      disabled
                    />
                    <Input
                      label="Cardholder Name"
                      placeholder="John Doe"
                      value="John Doe"
                      disabled
                    />
                    <Input
                      label="Expiry Date"
                      placeholder="12/25"
                      value="12/25"
                      disabled
                    />
                    <Input
                      label="CVV"
                      placeholder="123"
                      value="123"
                      disabled
                    />
                  </div>
                </div>

                <div className="flex space-x-4 mt-6">
                  <Button variant="secondary" onClick={() => setCurrentStep('passengers')}>
                    Back to Passengers
                  </Button>
                  <Button 
                    onClick={handleBooking}
                    loading={loading}
                    className="flex-1"
                  >
                    <CreditCard className="w-4 h-4 mr-2" />
                    Complete Booking
                  </Button>
                </div>
              </Card>
            )}
          </div>

          {/* Booking Summary */}
          <div>
            <Card className="sticky top-8">
              <h3 className="text-lg font-semibold mb-4">Booking Summary</h3>
              
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Route</span>
                  <span className="font-medium">{searchData.source} → {searchData.destination}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Date</span>
                  <span className="font-medium">{new Date(searchData.date).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Bus</span>
                  <span className="font-medium">{bus.operator}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Departure</span>
                  <span className="font-medium">{bus.departureTime}</span>
                </div>
                
                {selectedSeats.length > 0 && (
                  <>
                    <hr className="my-3" />
                    <div className="flex justify-between">
                      <span className="text-gray-600">Selected Seats</span>
                      <span className="font-medium">{selectedSeats.join(', ')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Base Fare ({selectedSeats.length} × ₹{bus.fare})</span>
                      <span className="font-medium">₹{totalFare}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Service Fee</span>
                      <span className="font-medium">₹{serviceFee}</span>
                    </div>
                    <hr className="my-3" />
                    <div className="flex justify-between text-lg font-semibold">
                      <span>Total Amount</span>
                      <span className="text-blue-600">₹{grandTotal}</span>
                    </div>
                  </>
                )}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SeatSelection;