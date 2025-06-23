const db = require('../db/connection');

class Schedule {
  // Get all schedules
  static async getAll() {
    try {
      const [schedules] = await db.execute(`
        SELECT bs.*, b.bus_number, b.bus_type, 
               r.source, r.destination, r.distance,
               d.full_name as driver_name
        FROM bus_schedules bs
        JOIN buses b ON bs.bus_id = b.bus_id
        JOIN routes r ON bs.route_id = r.route_id
        LEFT JOIN drivers d ON bs.driver_id = d.driver_id
        ORDER BY bs.departure_time
      `);
      
      return schedules;
    } catch (error) {
      throw error;
    }
  }
  
  // Get schedule by ID
  static async getById(scheduleId) {
    try {
      const [schedules] = await db.execute(`
        SELECT bs.*, b.bus_number, b.bus_type, b.amenities,
               r.source, r.destination, r.distance,
               d.full_name as driver_name
        FROM bus_schedules bs
        JOIN buses b ON bs.bus_id = b.bus_id
        JOIN routes r ON bs.route_id = r.route_id
        LEFT JOIN drivers d ON bs.driver_id = d.driver_id
        WHERE bs.schedule_id = ?
      `, [scheduleId]);

      if (schedules.length === 0) {
        return null;
      }

      return schedules[0];
    } catch (error) {
      throw error;
    }
  }

  // Search schedules by source, destination, and date
  static async search(source, destination, journeyDate) {
    try {
      const [schedules] = await db.execute(`
        SELECT bs.*, b.bus_number, b.bus_type, b.total_seats, b.amenities,
               r.source, r.destination, r.distance,
               d.full_name as driver_name
        FROM bus_schedules bs
        JOIN buses b ON bs.bus_id = b.bus_id
        JOIN routes r ON bs.route_id = r.route_id
        LEFT JOIN drivers d ON bs.driver_id = d.driver_id
        WHERE r.source = ?
        AND r.destination = ?
        AND DATE(bs.departure_time) = ?
        AND bs.available_seats > 0
        AND b.status = 'Active'
        ORDER BY bs.departure_time
      `, [source, destination, journeyDate]);

      return schedules;
    } catch (error) {
      throw error;
    }
  }
  
  // Create new schedule
  static async create(busId, routeId, driverId, departureTime, arrivalTime, fare) {
    try {
      // Get capacity from bus
      const [buses] = await db.execute('SELECT capacity FROM buses WHERE bus_id = ?', [busId]);

      if (buses.length === 0) {
        throw new Error('Bus not found');
      }

      const totalSeats = buses[0].capacity;

      const [result] = await db.execute(
        `INSERT INTO bus_schedules
         (bus_id, route_id, driver_id, departure_time, arrival_time, fare, available_seats)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [busId, routeId, driverId, departureTime, arrivalTime, fare, totalSeats]
      );

      return {
        scheduleId: result.insertId,
        busId,
        routeId,
        driverId,
        departureTime,
        arrivalTime,
        fare,
        availableSeats: totalSeats
      };
    } catch (error) {
      throw error;
    }
  }
  
  // Update schedule
  static async update(scheduleId, busId, routeId, driverId, departureTime, arrivalTime, fare) {
    try {
      await db.execute(
        `UPDATE bus_schedules 
         SET bus_id = ?, route_id = ?, driver_id = ?, 
             departure_time = ?, arrival_time = ?, fare = ?
         WHERE schedule_id = ?`,
        [busId, routeId, driverId, departureTime, arrivalTime, fare, scheduleId]
      );
      
      return { 
        scheduleId, 
        busId, 
        routeId, 
        driverId, 
        departureTime, 
        arrivalTime, 
        fare 
      };
    } catch (error) {
      throw error;
    }
  }
  
  // Delete schedule
  static async delete(scheduleId) {
    try {
      // Check if there are any confirmed bookings
      const [bookings] = await db.execute(`
        SELECT COUNT(*) as count FROM bookings
        WHERE schedule_id = ? AND booking_status = 'Confirmed'
      `, [scheduleId]);

      if (bookings[0].count > 0) {
        throw new Error('Cannot delete schedule with confirmed bookings');
      }

      await db.execute('DELETE FROM bus_schedules WHERE schedule_id = ?', [scheduleId]);
      return true;
    } catch (error) {
      throw error;
    }
  }

  // Get schedules with filters
  static async getAllWithFilters(filters = {}) {
    try {
      let query = `
        SELECT bs.*, b.bus_number, b.bus_type, b.total_seats,
               r.source, r.destination, r.distance,
               d.full_name as driver_name, d.contact_number as driver_contact,
               COUNT(bk.booking_id) as total_bookings,
               SUM(bk.total_seats) as booked_seats
        FROM bus_schedules bs
        JOIN buses b ON bs.bus_id = b.bus_id
        JOIN routes r ON bs.route_id = r.route_id
        LEFT JOIN drivers d ON bs.driver_id = d.driver_id
        LEFT JOIN bookings bk ON bs.schedule_id = bk.schedule_id AND bk.booking_status = 'Confirmed'
      `;

      const conditions = [];
      const params = [];

      if (filters.source) {
        conditions.push('r.source LIKE ?');
        params.push(`%${filters.source}%`);
      }

      if (filters.destination) {
        conditions.push('r.destination LIKE ?');
        params.push(`%${filters.destination}%`);
      }

      if (filters.date) {
        conditions.push('DATE(bs.departure_time) = ?');
        params.push(filters.date);
      }

      if (filters.bus_id) {
        conditions.push('bs.bus_id = ?');
        params.push(filters.bus_id);
      }

      if (conditions.length > 0) {
        query += ' WHERE ' + conditions.join(' AND ');
      }

      query += `
        GROUP BY bs.schedule_id
        ORDER BY bs.departure_time ASC
      `;

      const [schedules] = await db.execute(query, params);
      return schedules;
    } catch (error) {
      throw error;
    }
  }

  // Check for schedule conflicts
  static async checkScheduleConflicts(busId, departureTime, arrivalTime, excludeScheduleId = null) {
    try {
      let query = `
        SELECT bs.*, r.source, r.destination
        FROM bus_schedules bs
        JOIN routes r ON bs.route_id = r.route_id
        WHERE bs.bus_id = ?
        AND (
          (bs.departure_time <= ? AND bs.arrival_time >= ?) OR
          (bs.departure_time <= ? AND bs.arrival_time >= ?) OR
          (bs.departure_time >= ? AND bs.arrival_time <= ?)
        )
      `;

      const params = [busId, arrivalTime, departureTime, arrivalTime, arrivalTime, departureTime, arrivalTime];

      if (excludeScheduleId) {
        query += ' AND bs.schedule_id != ?';
        params.push(excludeScheduleId);
      }

      const [conflicts] = await db.execute(query, params);
      return conflicts;
    } catch (error) {
      throw error;
    }
  }

  // Get upcoming schedules
  static async getUpcoming(days = 7) {
    try {
      const [schedules] = await db.execute(`
        SELECT bs.*, b.bus_number, b.bus_type,
               r.source, r.destination,
               d.full_name as driver_name,
               COUNT(bk.booking_id) as total_bookings,
               (b.total_seats - bs.available_seats) as booked_seats
        FROM bus_schedules bs
        JOIN buses b ON bs.bus_id = b.bus_id
        JOIN routes r ON bs.route_id = r.route_id
        LEFT JOIN drivers d ON bs.driver_id = d.driver_id
        LEFT JOIN bookings bk ON bs.schedule_id = bk.schedule_id AND bk.booking_status = 'Confirmed'
        WHERE bs.departure_time BETWEEN NOW() AND DATE_ADD(NOW(), INTERVAL ? DAY)
        GROUP BY bs.schedule_id
        ORDER BY bs.departure_time ASC
      `, [days]);

      return schedules;
    } catch (error) {
      throw error;
    }
  }

  // Get schedule statistics
  static async getStatistics() {
    try {
      const [stats] = await db.execute(`
        SELECT
          COUNT(*) as total_schedules,
          COUNT(CASE WHEN bs.departure_time > NOW() THEN 1 END) as upcoming_schedules,
          COUNT(CASE WHEN bs.departure_time < NOW() THEN 1 END) as completed_schedules,
          AVG(bs.fare) as average_fare,
          AVG(bs.available_seats / b.total_seats * 100) as average_availability
        FROM bus_schedules bs
        JOIN buses b ON bs.bus_id = b.bus_id
      `);

      return stats[0];
    } catch (error) {
      throw error;
    }
  }

  // Get schedules without drivers
  static async getUnassignedSchedules() {
    try {
      const [schedules] = await db.execute(`
        SELECT bs.*, b.bus_number, b.bus_type,
               r.source, r.destination
        FROM bus_schedules bs
        JOIN buses b ON bs.bus_id = b.bus_id
        JOIN routes r ON bs.route_id = r.route_id
        WHERE bs.driver_id IS NULL
        AND bs.departure_time > NOW()
        ORDER BY bs.departure_time ASC
      `);

      return schedules;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = Schedule;