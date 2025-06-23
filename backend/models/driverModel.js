const db = require('../db/connection');

class Driver {
  // Get all drivers
  static async getAll() {
    try {
      const [drivers] = await db.execute(`
        SELECT d.*, 
               COUNT(DISTINCT ds.schedule_id) as total_assignments,
               COUNT(DISTINCT CASE WHEN bs.departure_time >= NOW() THEN ds.schedule_id END) as upcoming_assignments
        FROM drivers d
        LEFT JOIN driver_schedules ds ON d.driver_id = ds.driver_id
        LEFT JOIN bus_schedules bs ON ds.schedule_id = bs.schedule_id
        GROUP BY d.driver_id
        ORDER BY d.full_name ASC
      `);
      
      return drivers;
    } catch (error) {
      throw error;
    }
  }

  // Get driver by ID
  static async getById(driverId) {
    try {
      const [drivers] = await db.execute(`
        SELECT d.*, 
               COUNT(DISTINCT ds.schedule_id) as total_assignments,
               COUNT(DISTINCT CASE WHEN bs.departure_time >= NOW() THEN ds.schedule_id END) as upcoming_assignments
        FROM drivers d
        LEFT JOIN driver_schedules ds ON d.driver_id = ds.driver_id
        LEFT JOIN bus_schedules bs ON ds.schedule_id = bs.schedule_id
        WHERE d.driver_id = ?
        GROUP BY d.driver_id
      `, [driverId]);
      
      return drivers.length > 0 ? drivers[0] : null;
    } catch (error) {
      throw error;
    }
  }

  // Create new driver
  static async create(driverData) {
    try {
      const { full_name, license_number, phone, experience_years, address, date_of_birth, emergency_contact } = driverData;

      const [result] = await db.execute(`
        INSERT INTO drivers (full_name, license_number, phone, experience_years, address, date_of_birth, emergency_contact)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `, [full_name, license_number, phone, experience_years || 0, address || null, date_of_birth || null, emergency_contact || null]);

      return { driver_id: result.insertId, ...driverData };
    } catch (error) {
      throw error;
    }
  }

  // Update driver
  static async update(driverId, driverData) {
    try {
      const { full_name, license_number, phone, experience_years, address, date_of_birth, emergency_contact } = driverData;

      await db.execute(`
        UPDATE drivers
        SET full_name = ?, license_number = ?, phone = ?, experience_years = ?,
            address = ?, date_of_birth = ?, emergency_contact = ?
        WHERE driver_id = ?
      `, [full_name, license_number, phone, experience_years, address, date_of_birth, emergency_contact, driverId]);

      return { driver_id: driverId, ...driverData };
    } catch (error) {
      throw error;
    }
  }

  // Delete driver
  static async delete(driverId) {
    try {
      // Check if driver has any upcoming assignments
      const [assignments] = await db.execute(`
        SELECT COUNT(*) as count
        FROM driver_schedules ds
        JOIN bus_schedules bs ON ds.schedule_id = bs.schedule_id
        WHERE ds.driver_id = ? AND bs.departure_time > NOW()
      `, [driverId]);
      
      if (assignments[0].count > 0) {
        throw new Error('Cannot delete driver with upcoming assignments');
      }
      
      await db.execute('DELETE FROM drivers WHERE driver_id = ?', [driverId]);
      return true;
    } catch (error) {
      throw error;
    }
  }

  // Get driver schedules
  static async getSchedules(driverId, startDate = null, endDate = null) {
    try {
      let query = `
        SELECT ds.*, bs.*, r.source, r.destination, b.bus_number, b.bus_type
        FROM driver_schedules ds
        JOIN bus_schedules bs ON ds.schedule_id = bs.schedule_id
        JOIN routes r ON bs.route_id = r.route_id
        JOIN buses b ON bs.bus_id = b.bus_id
        WHERE ds.driver_id = ?
      `;
      
      const params = [driverId];
      
      if (startDate && endDate) {
        query += ' AND DATE(bs.departure_time) BETWEEN ? AND ?';
        params.push(startDate, endDate);
      } else if (startDate) {
        query += ' AND DATE(bs.departure_time) >= ?';
        params.push(startDate);
      }
      
      query += ' ORDER BY bs.departure_time ASC';
      
      const [schedules] = await db.execute(query, params);
      return schedules;
    } catch (error) {
      throw error;
    }
  }

  // Assign driver to schedule
  static async assignToSchedule(driverId, scheduleId) {
    try {
      // Check if driver is already assigned to this schedule
      const [existing] = await db.execute(`
        SELECT * FROM driver_schedules 
        WHERE driver_id = ? AND schedule_id = ?
      `, [driverId, scheduleId]);
      
      if (existing.length > 0) {
        throw new Error('Driver is already assigned to this schedule');
      }
      
      // Check if driver has conflicting schedules
      const [conflicts] = await db.execute(`
        SELECT COUNT(*) as count
        FROM driver_schedules ds
        JOIN bus_schedules bs1 ON ds.schedule_id = bs1.schedule_id
        JOIN bus_schedules bs2 ON bs2.schedule_id = ?
        WHERE ds.driver_id = ?
        AND (
          (bs1.departure_time <= bs2.arrival_time AND bs1.arrival_time >= bs2.departure_time)
        )
      `, [scheduleId, driverId]);
      
      if (conflicts[0].count > 0) {
        throw new Error('Driver has conflicting schedule');
      }
      
      const [result] = await db.execute(`
        INSERT INTO driver_schedules (driver_id, schedule_id, status)
        VALUES (?, ?, 'Assigned')
      `, [driverId, scheduleId]);
      
      // Update the bus_schedules table with driver assignment
      await db.execute(`
        UPDATE bus_schedules SET driver_id = ? WHERE schedule_id = ?
      `, [driverId, scheduleId]);
      
      return { driver_schedule_id: result.insertId, driver_id: driverId, schedule_id: scheduleId };
    } catch (error) {
      throw error;
    }
  }

  // Remove driver from schedule
  static async removeFromSchedule(driverId, scheduleId) {
    try {
      await db.execute(`
        DELETE FROM driver_schedules 
        WHERE driver_id = ? AND schedule_id = ?
      `, [driverId, scheduleId]);
      
      // Remove driver assignment from bus_schedules
      await db.execute(`
        UPDATE bus_schedules SET driver_id = NULL WHERE schedule_id = ?
      `, [scheduleId]);
      
      return true;
    } catch (error) {
      throw error;
    }
  }

  // Get available drivers for a specific time slot
  static async getAvailableDrivers(departureTime, arrivalTime) {
    try {
      const [drivers] = await db.execute(`
        SELECT d.*
        FROM drivers d
        WHERE d.driver_id NOT IN (
          SELECT DISTINCT ds.driver_id
          FROM driver_schedules ds
          JOIN bus_schedules bs ON ds.schedule_id = bs.schedule_id
          WHERE ds.status = 'Assigned'
          AND (
            (bs.departure_time <= ? AND bs.arrival_time >= ?) OR
            (bs.departure_time <= ? AND bs.arrival_time >= ?)
          )
        )
        ORDER BY d.full_name ASC
      `, [arrivalTime, departureTime, arrivalTime, arrivalTime]);
      
      return drivers;
    } catch (error) {
      throw error;
    }
  }

  // Get driver statistics
  static async getStatistics() {
    try {
      const [stats] = await db.execute(`
        SELECT 
          COUNT(*) as total_drivers,
          AVG(experience_years) as average_experience,
          COUNT(CASE WHEN experience_years >= 5 THEN 1 END) as experienced_drivers,
          COUNT(CASE WHEN experience_years < 2 THEN 1 END) as new_drivers
        FROM drivers
      `);
      
      return stats[0];
    } catch (error) {
      throw error;
    }
  }

  // Get driver performance metrics
  static async getPerformanceMetrics(driverId, startDate, endDate) {
    try {
      const [metrics] = await db.execute(`
        SELECT 
          COUNT(DISTINCT ds.schedule_id) as total_trips,
          COUNT(DISTINCT CASE WHEN ds.status = 'Completed' THEN ds.schedule_id END) as completed_trips,
          AVG(f.rating) as average_rating,
          COUNT(f.feedback_id) as total_feedback
        FROM driver_schedules ds
        JOIN bus_schedules bs ON ds.schedule_id = bs.schedule_id
        LEFT JOIN bookings b ON bs.schedule_id = b.schedule_id
        LEFT JOIN feedback f ON b.booking_id = f.booking_id
        WHERE ds.driver_id = ?
        AND DATE(bs.departure_time) BETWEEN ? AND ?
      `, [driverId, startDate, endDate]);
      
      return metrics[0];
    } catch (error) {
      throw error;
    }
  }
}

module.exports = Driver;
