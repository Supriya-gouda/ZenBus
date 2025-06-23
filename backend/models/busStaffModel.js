const db = require('../db/connection');

class BusStaff {
  // Get all bus staff
  static async getAll() {
    try {
      const [staff] = await db.execute(`
        SELECT * FROM bus_staff
        ORDER BY full_name ASC
      `);
      
      return staff;
    } catch (error) {
      throw error;
    }
  }

  // Get bus staff by ID
  static async getById(staffId) {
    try {
      const [staff] = await db.execute(`
        SELECT * FROM bus_staff
        WHERE staff_id = ?
      `, [staffId]);
      
      return staff.length > 0 ? staff[0] : null;
    } catch (error) {
      throw error;
    }
  }

  // Create new bus staff
  static async create(staffData) {
    try {
      const { full_name, role, contact_number, email, address, date_of_joining, salary } = staffData;
      
      const [result] = await db.execute(`
        INSERT INTO bus_staff (full_name, role, contact_number, email, address, date_of_joining, salary)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `, [full_name, role, contact_number, email || null, address || null, date_of_joining || null, salary || null]);
      
      return { staff_id: result.insertId, ...staffData };
    } catch (error) {
      throw error;
    }
  }

  // Update bus staff
  static async update(staffId, staffData) {
    try {
      const { full_name, role, contact_number, email, address, date_of_joining, salary } = staffData;
      
      await db.execute(`
        UPDATE bus_staff 
        SET full_name = ?, role = ?, contact_number = ?, email = ?, 
            address = ?, date_of_joining = ?, salary = ?
        WHERE staff_id = ?
      `, [full_name, role, contact_number, email, address, date_of_joining, salary, staffId]);
      
      return { staff_id: staffId, ...staffData };
    } catch (error) {
      throw error;
    }
  }

  // Delete bus staff
  static async delete(staffId) {
    try {
      const [result] = await db.execute(`
        DELETE FROM bus_staff WHERE staff_id = ?
      `, [staffId]);
      
      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }

  // Get staff by role
  static async getByRole(role) {
    try {
      const [staff] = await db.execute(`
        SELECT * FROM bus_staff
        WHERE role = ?
        ORDER BY full_name ASC
      `, [role]);
      
      return staff;
    } catch (error) {
      throw error;
    }
  }

  // Get staff statistics
  static async getStatistics() {
    try {
      const [stats] = await db.execute(`
        SELECT 
          COUNT(*) as total_staff,
          COUNT(CASE WHEN status = 'Active' THEN 1 END) as active_staff,
          COUNT(CASE WHEN status = 'On Leave' THEN 1 END) as on_leave_staff,
          COUNT(CASE WHEN status = 'Inactive' THEN 1 END) as inactive_staff,
          COUNT(DISTINCT role) as total_roles,
          AVG(salary) as average_salary
        FROM bus_staff
      `);
      
      return stats[0];
    } catch (error) {
      throw error;
    }
  }

  // Update staff status
  static async updateStatus(staffId, status) {
    try {
      await db.execute(`
        UPDATE bus_staff 
        SET status = ?
        WHERE staff_id = ?
      `, [status, staffId]);
      
      return true;
    } catch (error) {
      throw error;
    }
  }

  // Search staff
  static async search(searchTerm) {
    try {
      const [staff] = await db.execute(`
        SELECT * FROM bus_staff
        WHERE full_name LIKE ? OR role LIKE ? OR contact_number LIKE ?
        ORDER BY full_name ASC
      `, [`%${searchTerm}%`, `%${searchTerm}%`, `%${searchTerm}%`]);
      
      return staff;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = BusStaff;
