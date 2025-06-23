const db = require('../db/connection');

class Bus {
  // Get all buses
  static async getAll() {
    try {
      const [buses] = await db.execute('SELECT * FROM buses');
      return buses;
    } catch (error) {
      throw error;
    }
  }
  
  // Get bus by ID
  static async getById(busId) {
    try {
      const [buses] = await db.execute('SELECT * FROM buses WHERE bus_id = ?', [busId]);
      
      if (buses.length === 0) {
        return null;
      }
      
      return buses[0];
    } catch (error) {
      throw error;
    }
  }
  
  // Create new bus
  static async create(busNumber, busType, capacity, amenities) {
    try {
      const [result] = await db.execute(
        'INSERT INTO buses (bus_number, bus_type, capacity, amenities) VALUES (?, ?, ?, ?)',
        [busNumber, busType, capacity, amenities]
      );

      return { busId: result.insertId, busNumber, busType, capacity, amenities };
    } catch (error) {
      throw error;
    }
  }
  
  // Update bus
  static async update(busId, busType, capacity, amenities, status) {
    try {
      await db.execute(
        'UPDATE buses SET bus_type = ?, capacity = ?, amenities = ?, status = ? WHERE bus_id = ?',
        [busType, capacity, amenities, status, busId]
      );

      return { busId, busType, capacity, amenities, status };
    } catch (error) {
      throw error;
    }
  }
  
  // Delete bus
  static async delete(busId) {
    try {
      await db.execute('DELETE FROM buses WHERE bus_id = ?', [busId]);
      return true;
    } catch (error) {
      throw error;
    }
  }
  
  // Search for available buses with improved algorithm (daily schedules)
  static async searchAvailable(source, destination, date) {
    try {
      const [buses] = await db.execute(`
        SELECT bs.schedule_id, b.bus_id, b.bus_number, b.bus_type, b.amenities,
               r.source, r.destination, r.distance,
               CONCAT(?, ' ', TIME(bs.departure_time)) as departure_time,
               CONCAT(?, ' ', TIME(bs.arrival_time)) as arrival_time,
               bs.fare, bs.available_seats,
               d.full_name as driver_name,
               CASE
                 WHEN b.status = 'Maintenance' THEN 0
                 ELSE 1
               END as is_available
        FROM bus_schedules bs
        JOIN buses b ON bs.bus_id = b.bus_id
        JOIN routes r ON bs.route_id = r.route_id
        LEFT JOIN drivers d ON bs.driver_id = d.driver_id
        WHERE r.source LIKE ? AND r.destination LIKE ?
        AND b.status IN ('Active')
        AND bs.available_seats > 0
        AND NOT EXISTS (
          SELECT 1 FROM maintenance m
          WHERE m.bus_id = b.bus_id
          AND m.status IN ('Scheduled', 'In Progress')
          AND ? BETWEEN m.scheduled_date AND COALESCE(m.completion_date, DATE_ADD(m.scheduled_date, INTERVAL 7 DAY))
        )
        ORDER BY TIME(bs.departure_time) ASC
      `, [date, date, `%${source}%`, `%${destination}%`, date]);

      // Transform the results to include proper datetime and make them available for any date
      const transformedBuses = buses.map(bus => ({
        ...bus,
        // Ensure the schedule is available for the requested date
        departure_time: `${date} ${bus.departure_time.split(' ')[1]}`,
        arrival_time: `${date} ${bus.arrival_time.split(' ')[1]}`,
        // Add additional properties for frontend compatibility
        id: bus.schedule_id,
        scheduleId: bus.schedule_id,
        operator: 'ZenBus',
        rating: 4.2,
        reviews: 156,
        duration: this.calculateDuration(bus.departure_time, bus.arrival_time),
        availableSeats: bus.available_seats,
        busNumber: bus.bus_number,
        busType: bus.bus_type,
        departureTime: bus.departure_time.split(' ')[1]?.substring(0, 5) || '00:00',
        arrivalTime: bus.arrival_time.split(' ')[1]?.substring(0, 5) || '00:00'
      }));

      return transformedBuses;
    } catch (error) {
      throw error;
    }
  }

  // Helper method to calculate duration
  static calculateDuration(departure, arrival) {
    try {
      const dep = new Date(departure);
      const arr = new Date(arrival);
      const diffMs = arr - dep;

      // Handle overnight journeys
      if (diffMs < 0) {
        const nextDay = new Date(arr);
        nextDay.setDate(nextDay.getDate() + 1);
        const newDiffMs = nextDay - dep;
        const hours = Math.floor(newDiffMs / (1000 * 60 * 60));
        const minutes = Math.floor((newDiffMs % (1000 * 60 * 60)) / (1000 * 60));
        return `${hours}h ${minutes}m`;
      }

      const hours = Math.floor(diffMs / (1000 * 60 * 60));
      const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
      return `${hours}h ${minutes}m`;
    } catch (error) {
      return '8h 0m'; // Default duration
    }
  }

  // Get all unique locations from routes
  static async getLocations() {
    try {
      const [locations] = await db.execute(`
        SELECT DISTINCT source as location FROM routes
        UNION
        SELECT DISTINCT destination as location FROM routes
        ORDER BY location ASC
      `);

      return locations.map(row => row.location);
    } catch (error) {
      throw error;
    }
  }

  // Search buses with flexible date range
  static async searchBusesFlexible(source, destination, startDate, endDate = null) {
    try {
      const dateCondition = endDate
        ? 'DATE(bs.departure_time) BETWEEN ? AND ?'
        : 'DATE(bs.departure_time) >= ?';

      const params = endDate
        ? [`%${source}%`, `%${destination}%`, startDate, endDate]
        : [`%${source}%`, `%${destination}%`, startDate];

      const [buses] = await db.execute(`
        SELECT bs.schedule_id, b.bus_id, b.bus_number, b.bus_type, b.amenities,
               r.source, r.destination, r.distance,
               bs.departure_time, bs.arrival_time, bs.fare, bs.available_seats,
               d.full_name as driver_name,
               DATE(bs.departure_time) as journey_date
        FROM bus_schedules bs
        JOIN buses b ON bs.bus_id = b.bus_id
        JOIN routes r ON bs.route_id = r.route_id
        LEFT JOIN drivers d ON bs.driver_id = d.driver_id
        WHERE r.source LIKE ? AND r.destination LIKE ?
        AND ${dateCondition}
        AND b.status = 'Active'
        AND bs.available_seats > 0
        AND NOT EXISTS (
          SELECT 1 FROM maintenance m
          WHERE m.bus_id = b.bus_id
          AND m.status IN ('Scheduled', 'In Progress')
          AND DATE(bs.departure_time) BETWEEN m.scheduled_date AND COALESCE(m.completion_date, DATE_ADD(m.scheduled_date, INTERVAL 7 DAY))
        )
        ORDER BY bs.departure_time ASC
      `, params);

      return buses;
    } catch (error) {
      throw error;
    }
  }

}

module.exports = Bus;