const db = require('../db/connection');

class Booking {
  // Create new booking
  static async create(userId, scheduleId, journeyDate, seatNumbers, totalSeats, totalFare, passengerDetails = null) {
    try {
      const connection = await db.getConnection();

      try {
        await connection.beginTransaction();

        // Check seat availability first
        const [scheduleCheck] = await connection.execute(
          'SELECT available_seats FROM bus_schedules WHERE schedule_id = ?',
          [scheduleId]
        );

        if (scheduleCheck.length === 0) {
          throw new Error('Bus schedule not found');
        }

        if (scheduleCheck[0].available_seats < totalSeats) {
          throw new Error('Insufficient seats available');
        }

        // Create booking
        const [bookingResult] = await connection.execute(
          `INSERT INTO bookings
           (user_id, schedule_id, journey_date, seat_numbers, total_seats, total_fare, passenger_details, booking_status)
           VALUES (?, ?, ?, ?, ?, ?, ?, 'Confirmed')`,
          [userId, scheduleId, journeyDate, JSON.stringify(seatNumbers), totalSeats, totalFare, JSON.stringify(passengerDetails)]
        );

        const bookingId = bookingResult.insertId;
        
        // Create mock payment
        await connection.execute(
          `INSERT INTO payments
           (user_id, booking_id, amount, payment_method, transaction_id, payment_status)
           VALUES (?, ?, ?, 'Credit Card', CONCAT('TXN', FLOOR(RAND() * 1000000000)), 'Success')`,
          [userId, bookingId, totalFare]
        );
        
        await connection.commit();
        
        return { bookingId, userId, scheduleId, journeyDate, seatNumbers, totalSeats, totalFare };
      } catch (error) {
        await connection.rollback();
        throw error;
      } finally {
        connection.release();
      }
    } catch (error) {
      throw error;
    }
  }
  
  // Get booking by ID
  static async getById(bookingId) {
    try {
      const [bookings] = await db.execute(`
        SELECT b.*, bs.departure_time, bs.arrival_time,
               r.source, r.destination,
               bu.bus_number, bu.bus_type,
               p.payment_status
        FROM bookings b
        JOIN bus_schedules bs ON b.schedule_id = bs.schedule_id
        JOIN buses bu ON bs.bus_id = bu.bus_id
        JOIN routes r ON bs.route_id = r.route_id
        LEFT JOIN payments p ON b.booking_id = p.booking_id
        WHERE b.booking_id = ?
      `, [bookingId]);

      if (bookings.length === 0) {
        return null;
      }

      return bookings[0];
    } catch (error) {
      throw error;
    }
  }
  
  // Get bookings by user ID
  static async getByUserId(userId) {
    try {
      console.log('Querying bookings for user ID:', userId); // Debug log

      // First, try the full JOIN query
      const [bookings] = await db.execute(`
        SELECT b.*,
               COALESCE(bs.departure_time, CONCAT(b.journey_date, ' 08:00:00')) as departure_time,
               COALESCE(bs.arrival_time, CONCAT(b.journey_date, ' 12:00:00')) as arrival_time,
               COALESCE(r.source, 'Unknown') as source,
               COALESCE(r.destination, 'Unknown') as destination,
               COALESCE(bu.bus_number, CONCAT('BUS', LPAD(b.schedule_id, 3, '0'))) as bus_number,
               COALESCE(bu.bus_type, 'Standard') as bus_type,
               COALESCE(p.payment_status, 'Success') as payment_status,
               b.passenger_details
        FROM bookings b
        LEFT JOIN bus_schedules bs ON b.schedule_id = bs.schedule_id
        LEFT JOIN buses bu ON bs.bus_id = bu.bus_id
        LEFT JOIN routes r ON bs.route_id = r.route_id
        LEFT JOIN payments p ON b.booking_id = p.booking_id
        WHERE b.user_id = ?
        ORDER BY b.journey_date DESC
      `, [userId]);

      console.log('Query returned', bookings.length, 'bookings'); // Debug log

      // If no bookings found with JOINs, try simple query
      if (bookings.length === 0) {
        console.log('No bookings found with JOINs, trying simple query'); // Debug log
        const [simpleBookings] = await db.execute(`
          SELECT b.*,
                 CONCAT(b.journey_date, ' 08:00:00') as departure_time,
                 CONCAT(b.journey_date, ' 12:00:00') as arrival_time,
                 'Mock Source' as source,
                 'Mock Destination' as destination,
                 CONCAT('BUS', LPAD(b.schedule_id, 3, '0')) as bus_number,
                 'Standard' as bus_type,
                 'Success' as payment_status,
                 b.passenger_details
          FROM bookings b
          WHERE b.user_id = ?
          ORDER BY b.journey_date DESC
        `, [userId]);

        console.log('Simple query returned', simpleBookings.length, 'bookings'); // Debug log
        return simpleBookings;
      }

      return bookings;
    } catch (error) {
      console.error('Error in getByUserId:', error); // Debug log
      throw error;
    }
  }
  
  // Get all bookings (admin)
  static async getAll() {
    try {
      const [bookings] = await db.execute(`
        SELECT b.*, u.full_name as user_name, u.email,
               bs.departure_time, bs.arrival_time,
               r.source, r.destination,
               bu.bus_number, bu.bus_type,
               p.payment_status,
               b.passenger_details
        FROM bookings b
        JOIN users u ON b.user_id = u.user_id
        JOIN bus_schedules bs ON b.schedule_id = bs.schedule_id
        JOIN buses bu ON bs.bus_id = bu.bus_id
        JOIN routes r ON bs.route_id = r.route_id
        LEFT JOIN payments p ON b.booking_id = p.booking_id
        ORDER BY b.journey_date DESC
      `);
      
      return bookings;
    } catch (error) {
      throw error;
    }
  }
  
  // Cancel booking
  static async cancel(bookingId, cancellationReason = 'User cancellation') {
    try {
      const connection = await db.getConnection();

      try {
        await connection.beginTransaction();

        // Get booking details
        const [bookings] = await connection.execute(
          'SELECT * FROM bookings WHERE booking_id = ?',
          [bookingId]
        );

        if (bookings.length === 0) {
          throw new Error('Booking not found');
        }

        const booking = bookings[0];

        // Check if booking is already cancelled
        if (booking.booking_status === 'Cancelled') {
          throw new Error('Booking is already cancelled');
        }

        // Restore seats to bus_schedules
        if (booking.seat_numbers && booking.schedule_id) {
          // Parse seat_numbers (may be JSON or CSV string)
          let seatCount = 0;
          try {
            const seats = JSON.parse(booking.seat_numbers);
            seatCount = Array.isArray(seats) ? seats.length : 0;
          } catch {
            // fallback: CSV string
            seatCount = booking.seat_numbers.split(',').length;
          }
          if (seatCount > 0) {
            await connection.execute(
              'UPDATE bus_schedules SET available_seats = available_seats + ? WHERE schedule_id = ?',
              [seatCount, booking.schedule_id]
            );
          }
        }

        // Update booking status with cancellation details
        await connection.execute(
          `UPDATE bookings
           SET booking_status = 'Cancelled',
               cancellation_date = CURRENT_TIMESTAMP,
               cancellation_reason = ?
           WHERE booking_id = ?`,
          [cancellationReason, bookingId]
        );

        await connection.commit();

        return {
          bookingId,
          cancellationDate: new Date(),
          cancellationReason
        };
      } catch (error) {
        await connection.rollback();
        throw error;
      } finally {
        connection.release();
      }
    } catch (error) {
      throw error;
    }
  }
  
  // Get bookings by date range (admin)
  static async getByDateRange(startDate, endDate) {
    try {
      const [bookings] = await db.execute(`
        SELECT b.*, u.full_name as user_name, u.email,
               bs.departure_time, bs.arrival_time,
               r.source, r.destination,
               bu.bus_number, bu.bus_type,
               p.payment_status
        FROM bookings b
        JOIN users u ON b.user_id = u.user_id
        JOIN bus_schedules bs ON b.schedule_id = bs.schedule_id
        JOIN buses bu ON bs.bus_id = bu.bus_id
        JOIN routes r ON bs.route_id = r.route_id
        LEFT JOIN payments p ON b.booking_id = p.booking_id
        WHERE b.journey_date BETWEEN ? AND ?
        ORDER BY b.journey_date
      `, [startDate, endDate]);

      return bookings;
    } catch (error) {
      throw error;
    }
  }


}

module.exports = Booking;