const db = require('../db/connection');

class Maintenance {
  // Get all maintenance records
  static async getAll() {
    try {
      const [records] = await db.execute(`
        SELECT m.*, b.bus_number, b.bus_type
        FROM maintenance m
        JOIN buses b ON m.bus_id = b.bus_id
        ORDER BY m.scheduled_date DESC
      `);
      
      return records;
    } catch (error) {
      throw error;
    }
  }
  
  // Get maintenance by ID
  static async getById(maintenanceId) {
    try {
      const [records] = await db.execute(`
        SELECT m.*, b.bus_number, b.bus_type
        FROM maintenance m
        JOIN buses b ON m.bus_id = b.bus_id
        WHERE m.maintenance_id = ?
      `, [maintenanceId]);
      
      if (records.length === 0) {
        return null;
      }
      
      return records[0];
    } catch (error) {
      throw error;
    }
  }
  
  // Create new maintenance record
  static async create(maintenanceData) {
    try {
      const { busId, maintenanceType, description, scheduledDate, cost, serviceProvider, priority } = maintenanceData;

      const [result] = await db.execute(
        `INSERT INTO maintenance
         (bus_id, maintenance_type, description, scheduled_date, cost, service_provider, priority, status)
         VALUES (?, ?, ?, ?, ?, ?, ?, 'Scheduled')`,
        [busId, maintenanceType, description, scheduledDate, cost, serviceProvider, priority]
      );

      // Update bus status to Maintenance
      await db.execute(
        'UPDATE buses SET status = ? WHERE bus_id = ?',
        ['Maintenance', busId]
      );

      return {
        maintenance_id: result.insertId,
        bus_id: busId,
        maintenance_type: maintenanceType,
        description,
        scheduled_date: scheduledDate,
        cost,
        service_provider: serviceProvider,
        priority,
        status: 'Scheduled'
      };
    } catch (error) {
      throw error;
    }
  }
  
  // Update maintenance record
  static async update(maintenanceId, updateData) {
    try {
      const connection = await db.getConnection();

      try {
        await connection.beginTransaction();

        // Get maintenance record
        const [records] = await connection.execute(
          'SELECT * FROM maintenance WHERE maintenance_id = ?',
          [maintenanceId]
        );

        if (records.length === 0) {
          throw new Error('Maintenance record not found');
        }

        const record = records[0];

        // Build dynamic update query
        const updateFields = [];
        const updateValues = [];

        if (updateData.maintenanceType) {
          updateFields.push('maintenance_type = ?');
          updateValues.push(updateData.maintenanceType);
        }
        if (updateData.description !== undefined) {
          updateFields.push('description = ?');
          updateValues.push(updateData.description);
        }
        if (updateData.scheduledDate) {
          updateFields.push('scheduled_date = ?');
          updateValues.push(updateData.scheduledDate);
        }
        if (updateData.completionDate !== undefined) {
          updateFields.push('completion_date = ?');
          updateValues.push(updateData.completionDate);
        }
        if (updateData.cost !== undefined) {
          updateFields.push('cost = ?');
          updateValues.push(updateData.cost);
        }
        if (updateData.serviceProvider !== undefined) {
          updateFields.push('service_provider = ?');
          updateValues.push(updateData.serviceProvider);
        }
        if (updateData.priority) {
          updateFields.push('priority = ?');
          updateValues.push(updateData.priority);
        }
        if (updateData.status) {
          updateFields.push('status = ?');
          updateValues.push(updateData.status);
        }

        if (updateFields.length > 0) {
          updateValues.push(maintenanceId);
          await connection.execute(
            `UPDATE maintenance SET ${updateFields.join(', ')} WHERE maintenance_id = ?`,
            updateValues
          );
        }

        // If status is Completed, update bus status to Active
        if (updateData.status === 'Completed') {
          await connection.execute(
            'UPDATE buses SET status = ? WHERE bus_id = ?',
            ['Active', record.bus_id]
          );
        } else if (updateData.status === 'In Progress' || updateData.status === 'Scheduled') {
          await connection.execute(
            'UPDATE buses SET status = ? WHERE bus_id = ?',
            ['Maintenance', record.bus_id]
          );
        }

        await connection.commit();

        // Get updated record
        const [updatedRecords] = await connection.execute(
          'SELECT * FROM maintenance WHERE maintenance_id = ?',
          [maintenanceId]
        );

        return updatedRecords[0];
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
  
  // Delete maintenance record
  static async delete(maintenanceId) {
    try {
      await db.execute('DELETE FROM maintenance WHERE maintenance_id = ?', [maintenanceId]);
      return true;
    } catch (error) {
      throw error;
    }
  }

  // Get maintenance statistics
  static async getStatistics() {
    try {
      const [stats] = await db.execute(`
        SELECT
          COUNT(*) as total_maintenance,
          COUNT(CASE WHEN status = 'Scheduled' THEN 1 END) as scheduled,
          COUNT(CASE WHEN status = 'In Progress' THEN 1 END) as in_progress,
          COUNT(CASE WHEN status = 'Completed' THEN 1 END) as completed,
          AVG(cost) as average_cost,
          SUM(cost) as total_cost
        FROM maintenance
      `);

      return stats[0];
    } catch (error) {
      throw error;
    }
  }

  // Get upcoming maintenance
  static async getUpcoming(days = 7) {
    try {
      const [maintenance] = await db.execute(`
        SELECT m.*, b.bus_number, b.bus_type
        FROM maintenance m
        JOIN buses b ON m.bus_id = b.bus_id
        WHERE m.status = 'Scheduled'
        AND m.scheduled_date BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL ? DAY)
        ORDER BY m.scheduled_date ASC
      `, [days]);

      return maintenance;
    } catch (error) {
      throw error;
    }
  }

  // Get overdue maintenance
  static async getOverdue() {
    try {
      const [maintenance] = await db.execute(`
        SELECT m.*, b.bus_number, b.bus_type
        FROM maintenance m
        JOIN buses b ON m.bus_id = b.bus_id
        WHERE m.status IN ('Scheduled', 'In Progress')
        AND m.scheduled_date < CURDATE()
        ORDER BY m.scheduled_date ASC
      `);

      return maintenance;
    } catch (error) {
      throw error;
    }
  }

  // Get buses under maintenance
  static async getBusesUnderMaintenance() {
    try {
      const [buses] = await db.execute(`
        SELECT DISTINCT b.*, m.maintenance_id, m.maintenance_type, m.scheduled_date, m.status as maintenance_status
        FROM buses b
        JOIN maintenance m ON b.bus_id = m.bus_id
        WHERE m.status IN ('Scheduled', 'In Progress')
        AND (m.scheduled_date <= CURDATE() OR m.status = 'In Progress')
        ORDER BY m.scheduled_date ASC
      `);

      return buses;
    } catch (error) {
      throw error;
    }
  }

  // Get maintenance by bus ID
  static async getByBusId(busId) {
    try {
      const [maintenance] = await db.execute(`
        SELECT m.*, b.bus_number, b.bus_type
        FROM maintenance m
        JOIN buses b ON m.bus_id = b.bus_id
        WHERE m.bus_id = ?
        ORDER BY m.scheduled_date DESC
      `, [busId]);

      return maintenance;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = Maintenance;