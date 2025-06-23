const db = require('../db/connection');

class Route {
  // Get all routes
  static async getAll() {
    try {
      const [routes] = await db.execute('SELECT * FROM routes');
      return routes;
    } catch (error) {
      throw error;
    }
  }
  
  // Get route by ID
  static async getById(routeId) {
    try {
      const [routes] = await db.execute('SELECT * FROM routes WHERE route_id = ?', [routeId]);
      
      if (routes.length === 0) {
        return null;
      }
      
      return routes[0];
    } catch (error) {
      throw error;
    }
  }
  
  // Create new route
  static async create(source, destination, distance, baseFare = 0) {
    try {
      const [result] = await db.execute(
        'INSERT INTO routes (source, destination, distance, base_fare) VALUES (?, ?, ?, ?)',
        [source, destination, distance, baseFare]
      );

      return { routeId: result.insertId, source, destination, distance, baseFare };
    } catch (error) {
      throw error;
    }
  }
  
  // Update route
  static async update(routeId, source, destination, distance, baseFare) {
    try {
      await db.execute(
        'UPDATE routes SET source = ?, destination = ?, distance = ?, base_fare = ? WHERE route_id = ?',
        [source, destination, distance, baseFare, routeId]
      );

      return { routeId, source, destination, distance, baseFare };
    } catch (error) {
      throw error;
    }
  }
  
  // Delete route
  static async delete(routeId) {
    try {
      await db.execute('DELETE FROM routes WHERE route_id = ?', [routeId]);
      return true;
    } catch (error) {
      throw error;
    }
  }
  
  // Get all unique sources
  static async getAllSources() {
    try {
      const [sources] = await db.execute('SELECT DISTINCT source FROM routes ORDER BY source');
      return sources.map(item => item.source);
    } catch (error) {
      throw error;
    }
  }
  
  // Get all destinations for a source
  static async getDestinationsForSource(source) {
    try {
      const [destinations] = await db.execute(
        'SELECT DISTINCT destination FROM routes WHERE source = ? ORDER BY destination',
        [source]
      );
      return destinations.map(item => item.destination);
    } catch (error) {
      throw error;
    }
  }
}

module.exports = Route;