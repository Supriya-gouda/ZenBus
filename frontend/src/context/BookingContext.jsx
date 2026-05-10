import React, { createContext, useContext, useState } from 'react';
import { BookingStatus, PaymentStatus } from '../types';
import { busService } from '../services/busService.js';
import { bookingService } from '../services/bookingService.js';

const BookingContext = createContext();

export const useBooking = () => {
  const context = useContext(BookingContext);
  if (!context) {
    throw new Error('useBooking must be used within a BookingProvider');
  }
  return context;
};

export const BookingProvider = ({ children }) => {
  const [bookings, setBookings] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [currentBooking, setCurrentBooking] = useState(null);

  const normalizeSearchResult = (schedule) => {
    const amenitiesValue = schedule.amenities;
    const amenities = Array.isArray(amenitiesValue)
      ? amenitiesValue
      : typeof amenitiesValue === 'string'
        ? amenitiesValue.split(',').map(item => item.trim()).filter(Boolean)
        : [];

    const departureTimeValue = schedule.departure_time || schedule.departureTime;
    const arrivalTimeValue = schedule.arrival_time || schedule.arrivalTime;

    return {
      id: schedule.schedule_id || schedule.scheduleId || schedule.id,
      scheduleId: schedule.schedule_id || schedule.scheduleId || schedule.id,
      busNumber: schedule.bus_number || schedule.busNumber || 'N/A',
      busType: schedule.bus_type || schedule.busType || 'N/A',
      operator: schedule.operator || 'Bus Operator',
      route: schedule.route || `${schedule.source || 'Unknown'} → ${schedule.destination || 'Unknown'}`,
      departureTime: departureTimeValue
        ? new Date(departureTimeValue).toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
          })
        : 'N/A',
      arrivalTime: arrivalTimeValue
        ? new Date(arrivalTimeValue).toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
          })
        : 'N/A',
      duration: schedule.duration || calculateDuration(departureTimeValue, arrivalTimeValue),
      fare: Number(schedule.fare || 0),
      availableSeats: schedule.available_seats ?? schedule.availableSeats ?? 0,
      totalSeats: schedule.total_seats ?? schedule.totalSeats ?? 0,
      amenities,
      rating: schedule.rating ?? 4.0,
      reviews: schedule.reviews ?? 50,
      source: schedule.source || '',
      destination: schedule.destination || ''
    };
  };

  const searchBuses = async (searchData) => {
    try {
      const result = await busService.searchBuses(searchData);

      if (result.success && result.buses && result.buses.length > 0) {
        const transformedResults = result.buses.map(normalizeSearchResult);

        setSearchResults(transformedResults);
        return transformedResults;
      } else {
        setSearchResults([]);
        return [];
      }
    } catch (error) {
      console.error('Search buses error:', error);
      setSearchResults([]);
      return [];
    }
  };

  // Helper function to calculate duration
  const calculateDuration = (departure, arrival) => {
    const dep = new Date(departure);
    const arr = new Date(arrival);
    const diffMs = arr - dep;
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  const createBooking = async (bookingData) => {
    try {
      // Use seats from bookingData instead of context selectedSeats
      const seats = bookingData.seats || [];

      if (!seats || seats.length === 0) {
        throw new Error('No seats selected');
      }

      const result = await bookingService.createBooking({
        scheduleId: bookingData.scheduleId,
        seatNumbers: seats.join(','),
        totalSeats: seats.length,
        totalFare: bookingData.totalFare,
        journeyDate: bookingData.journeyDate,
        passengerDetails: bookingData.passengerDetails
      });

      if (result.success) {
        const booking = {
          ...result.booking,
          seats: seats,
          serviceFee: Math.round(bookingData.totalFare * 0.05),
          status: BookingStatus.CONFIRMED,
          paymentStatus: PaymentStatus.COMPLETED,
          source: bookingData.source,
          destination: bookingData.destination,
          busDetails: bookingData.busDetails,
          passengerDetails: bookingData.passengerDetails
        };

        setBookings(prev => [...prev, booking]);
        setCurrentBooking(booking);
        setSelectedSeats([]);

        return booking;
      } else {
        throw new Error(result.error || 'Booking failed');
      }
    } catch (error) {
      console.error('Create booking error:', error);
      throw error;
    }
  };

  const cancelBooking = async (bookingId, reason = '') => {
    try {
      const result = await bookingService.cancelBooking(bookingId, reason);

      if (result.success) {
        // Immediately update the booking status in the local state
        setBookings(prevBookings => 
          prevBookings.map(booking => 
            booking.id === bookingId 
              ? { ...booking, status: BookingStatus.CANCELLED } 
              : booking
          )
        );
        
        // Also fetch the latest bookings from the backend to ensure data consistency
        const userId = JSON.parse(localStorage.getItem('user'))?.userId;
        if (userId) {
          const updatedBookings = await getUserBookings(userId);
          setBookings(updatedBookings);
        }
        return { success: true, refundAmount: result.refund?.amount || 0 };
      } else {
        return { success: false, error: result.error };
      }
    } catch (error) {
      console.error('Cancel booking error:', error);
      return { success: false, error: 'Failed to cancel booking' };
    }
  };

  const getUserBookings = async (userId) => {
    try {
      console.log('Fetching bookings for user:', userId);
      const bookings = await bookingService.getUserBookings(userId);
      console.log('Raw bookings from API:', bookings);

      // Transform backend data to frontend format
      const transformedBookings = bookings.map(booking => ({
        id: booking.booking_id,
        source: booking.source,
        destination: booking.destination,
        journeyDate: booking.journey_date,
        seats: booking.seat_numbers ? booking.seat_numbers.split(',') : [],
        totalFare: booking.total_fare,
        serviceFee: Math.round(booking.total_fare * 0.05),
        status: booking.status || 'confirmed',
        paymentStatus: booking.payment_status || 'completed',
        busDetails: {
          busNumber: booking.bus_number,
          busType: booking.bus_type,
          departureTime: booking.departure_time ? new Date(booking.departure_time).toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
          }) : 'N/A',
          arrivalTime: booking.arrival_time ? new Date(booking.arrival_time).toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
          }) : 'N/A',
          operator: 'Bus Operator'
        },
        passengerDetails: booking.passenger_details ?
          (typeof booking.passenger_details === 'string' ?
            JSON.parse(booking.passenger_details) :
            booking.passenger_details) : [],
        feedbackSubmitted: booking.feedback_submitted || false
      }));

      console.log('Transformed bookings:', transformedBookings);
      setBookings(transformedBookings);
      return transformedBookings;
    } catch (error) {
      console.error('Get user bookings error:', error);
      return [];
    }
  };

  // Refetch only bookings with status 'booked' or 'confirmed' for the user dashboard
  const refetchActiveBookings = async (userId) => {
    try {
      const allBookings = await bookingService.getUserBookings(userId);
      const activeBookings = allBookings.filter(
        booking => booking.status === 'booked' || booking.status === 'confirmed'
      );
      setBookings(activeBookings);
      return activeBookings;
    } catch (error) {
      console.error('Error refetching active bookings:', error);
      setBookings([]);
      return [];
    }
  };

  const submitFeedback = async (bookingId, rating, comments) => {
    try {
      const result = await bookingService.submitFeedback(bookingId, rating, comments);
      return result;
    } catch (error) {
      console.error('Error submitting feedback:', error);
      return { success: false, error: error.message };
    }
  };

  const getRefundDetails = async (bookingId) => {
    try {
      const refund = await bookingService.getRefundDetails(bookingId);
      return refund;
    } catch (error) {
      console.error('Error getting refund details:', error);
      return null;
    }
  };

  const value = {
    bookings,
    searchResults,
    selectedSeats,
    currentBooking,
    setSelectedSeats,
    searchBuses,
    createBooking,
    cancelBooking,
    getUserBookings,
    refetchActiveBookings,
    submitFeedback,
    getRefundDetails
  };

  return (
    <BookingContext.Provider value={value}>
      {children}
    </BookingContext.Provider>
  );
};