const db = require('../db/connection');

class BusStop {
  // Get all bus stops
  static async getAll(filters = {}) {
    try {
      let query = `
        SELECT bs.*, 
               COUNT(rs.route_stop_id) as route_count
        FROM bus_stops bs
        LEFT JOIN route_stops rs ON bs.stop_id = rs.stop_id
      `;
      let params = [];
      let conditions = [];

      if (filters.search) {
        conditions.push('(bs.stop_name LIKE ? OR bs.city LIKE ? OR bs.state LIKE ?)');
        params.push(`%${filters.search}%`, `%${filters.search}%`, `%${filters.search}%`);
      }

      if (filters.status) {
        conditions.push('bs.status = ?');
        params.push(filters.status);
      }

      if (filters.city) {
        conditions.push('bs.city = ?');
        params.push(filters.city);
      }

      if (conditions.length > 0) {
        query += ' WHERE ' + conditions.join(' AND ');
      }

      query += ' GROUP BY bs.stop_id ORDER BY bs.stop_name';

      const [stops] = await db.execute(query, params);
      return stops;
    } catch (error) {
      throw error;
    }
  }

  // Get bus stop by ID
  static async getById(stopId) {
    try {
      const [stops] = await db.execute(`
        SELECT bs.*, 
               COUNT(rs.route_stop_id) as route_count
        FROM bus_stops bs
        LEFT JOIN route_stops rs ON bs.stop_id = rs.stop_id
        WHERE bs.stop_id = ?
        GROUP BY bs.stop_id
      `, [stopId]);

      if (stops.length === 0) {
        return null;
      }

      return stops[0];
    } catch (error) {
      throw error;
    }
  }

  // Create new bus stop
  static async create(stopData) {
    try {
      const { stop_name, city, state, address, latitude, longitude, facilities } = stopData;
      
      const [result] = await db.execute(`
        INSERT INTO bus_stops (stop_name, city, state, address, latitude, longitude, facilities)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `, [stop_name, city, state, address, latitude, longitude, facilities]);

      return {
        stop_id: result.insertId,
        ...stopData,
        status: 'Active',
        created_at: new Date(),
        updated_at: new Date()
      };
    } catch (error) {
      throw error;
    }
  }

  // Update bus stop
  static async update(stopId, stopData) {
    try {
      const { stop_name, city, state, address, latitude, longitude, facilities, status } = stopData;
      
      await db.execute(`
        UPDATE bus_stops 
        SET stop_name = ?, city = ?, state = ?, address = ?, 
            latitude = ?, longitude = ?, facilities = ?, status = ?,
            updated_at = CURRENT_TIMESTAMP
        WHERE stop_id = ?
      `, [stop_name, city, state, address, latitude, longitude, facilities, status, stopId]);

      return { stop_id: stopId, ...stopData };
    } catch (error) {
      throw error;
    }
  }

  // Delete bus stop
  static async delete(stopId) {
    try {
      // Check if stop is used in any routes
      const [routeStops] = await db.execute(
        'SELECT COUNT(*) as count FROM route_stops WHERE stop_id = ?',
        [stopId]
      );

      if (routeStops[0].count > 0) {
        throw new Error('Cannot delete bus stop that is used in routes');
      }

      await db.execute('DELETE FROM bus_stops WHERE stop_id = ?', [stopId]);
      return true;
    } catch (error) {
      throw error;
    }
  }

  // Get all cities
  static async getAllCities() {
    try {
      const [cities] = await db.execute(`
        SELECT DISTINCT city 
        FROM bus_stops 
        WHERE status = 'Active' 
        ORDER BY city
      `);
      return cities.map(item => item.city);
    } catch (error) {
      throw error;
    }
  }

  // Get bus stops statistics
  static async getStatistics() {
    try {
      const [stats] = await db.execute(`
        SELECT 
          COUNT(*) as total_stops,
          COUNT(CASE WHEN status = 'Active' THEN 1 END) as active_stops,
          COUNT(CASE WHEN status = 'Inactive' THEN 1 END) as inactive_stops,
          COUNT(DISTINCT city) as total_cities,
          COUNT(DISTINCT state) as total_states
        FROM bus_stops
      `);

      return stats[0];
    } catch (error) {
      throw error;
    }
  }

  // Search bus stops
  static async search(searchTerm, limit = 20) {
    try {
      const [stops] = await db.execute(`
        SELECT * FROM bus_stops 
        WHERE (stop_name LIKE ? OR city LIKE ? OR state LIKE ?) 
        AND status = 'Active'
        ORDER BY stop_name 
        LIMIT ?
      `, [`%${searchTerm}%`, `%${searchTerm}%`, `%${searchTerm}%`, limit]);

      return stops;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = BusStop;
