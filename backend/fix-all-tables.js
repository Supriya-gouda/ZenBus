const mysql = require('mysql2/promise');
require('dotenv').config();

async function fixAllTables() {
  let connection;
  
  try {
    console.log('🔧 Fixing all database tables...');
    
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASS || '',
      database: process.env.DB_NAME || 'bus_reservation_system'
    });

    // Fix bus_staff table
    console.log('🔧 Fixing bus_staff table...');
    const [staffColumns] = await connection.query('DESCRIBE bus_staff');
    const staffColumnNames = staffColumns.map(col => col.Field);
    
    const requiredStaffColumns = [
      { name: 'email', type: 'VARCHAR(100)' },
      { name: 'address', type: 'TEXT' },
      { name: 'date_of_joining', type: 'DATE' },
      { name: 'salary', type: 'DECIMAL(10,2)' },
      { name: 'status', type: 'ENUM("Active", "Inactive", "On Leave") DEFAULT "Active"' },
      { name: 'created_at', type: 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP' }
    ];

    for (const col of requiredStaffColumns) {
      if (!staffColumnNames.includes(col.name)) {
        console.log(`➕ Adding ${col.name} column to bus_staff table...`);
        await connection.query(`ALTER TABLE bus_staff ADD COLUMN ${col.name} ${col.type}`);
      }
    }

    // Fix drivers table
    console.log('🔧 Fixing drivers table...');
    const [driverColumns] = await connection.query('DESCRIBE drivers');
    const driverColumnNames = driverColumns.map(col => col.Field);
    
    const requiredDriverColumns = [
      { name: 'address', type: 'TEXT' },
      { name: 'date_of_birth', type: 'DATE' },
      { name: 'emergency_contact', type: 'VARCHAR(15)' },
      { name: 'status', type: 'ENUM("Active", "Inactive", "On Leave") DEFAULT "Active"' },
      { name: 'created_at', type: 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP' }
    ];

    for (const col of requiredDriverColumns) {
      if (!driverColumnNames.includes(col.name)) {
        console.log(`➕ Adding ${col.name} column to drivers table...`);
        await connection.query(`ALTER TABLE drivers ADD COLUMN ${col.name} ${col.type}`);
      }
    }

    // Fix maintenance table
    console.log('🔧 Fixing maintenance table...');
    const [maintenanceColumns] = await connection.query('DESCRIBE maintenance');
    const maintenanceColumnNames = maintenanceColumns.map(col => col.Field);
    
    const requiredMaintenanceColumns = [
      { name: 'completed_date', type: 'DATE' },
      { name: 'service_provider', type: 'VARCHAR(100)' },
      { name: 'priority', type: 'ENUM("Low", "Medium", "High", "Critical") DEFAULT "Medium"' },
      { name: 'status', type: 'ENUM("Scheduled", "In Progress", "Completed", "Cancelled") DEFAULT "Scheduled"' },
      { name: 'created_at', type: 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP' }
    ];

    for (const col of requiredMaintenanceColumns) {
      if (!maintenanceColumnNames.includes(col.name)) {
        console.log(`➕ Adding ${col.name} column to maintenance table...`);
        await connection.query(`ALTER TABLE maintenance ADD COLUMN ${col.name} ${col.type}`);
      }
    }

    // Add sample data
    console.log('📊 Adding sample data...');

    // Add sample drivers
    const [driverCount] = await connection.query('SELECT COUNT(*) as count FROM drivers');
    if (driverCount[0].count === 0) {
      console.log('➕ Adding sample drivers...');
      await connection.query(`
        INSERT INTO drivers (full_name, license_number, contact_number, experience_years, status) VALUES
        ('Rajesh Kumar', 'DL123456789', '9876543210', 5, 'Active'),
        ('Suresh Reddy', 'DL987654321', '9876543211', 8, 'Active'),
        ('Mahesh Singh', 'DL456789123', '9876543212', 3, 'Active')
      `);
      console.log('✅ Sample drivers added');
    }

    // Add sample bus staff
    const [staffCount] = await connection.query('SELECT COUNT(*) as count FROM bus_staff');
    if (staffCount[0].count === 0) {
      console.log('➕ Adding sample bus staff...');
      await connection.query(`
        INSERT INTO bus_staff (full_name, role, contact_number, email, salary, status) VALUES
        ('Ramesh Conductor', 'Conductor', '9876543213', 'ramesh@zenbus.com', 25000.00, 'Active'),
        ('Ganesh Cleaner', 'Cleaner', '9876543214', 'ganesh@zenbus.com', 18000.00, 'Active'),
        ('Prakash Mechanic', 'Mechanic', '9876543215', 'prakash@zenbus.com', 35000.00, 'Active')
      `);
      console.log('✅ Sample bus staff added');
    }

    // Add sample maintenance records
    const [maintenanceCount] = await connection.query('SELECT COUNT(*) as count FROM maintenance');
    if (maintenanceCount[0].count === 0) {
      console.log('➕ Adding sample maintenance records...');
      const today = new Date();
      const nextWeek = new Date(today);
      nextWeek.setDate(nextWeek.getDate() + 7);
      
      const formatDate = (date) => date.toISOString().split('T')[0];
      
      await connection.query(`
        INSERT INTO maintenance (bus_id, maintenance_type, description, scheduled_date, cost, service_provider, priority, status) VALUES
        (1, 'Routine', 'Regular maintenance check', ?, 5000.00, 'ZenBus Service Center', 'Medium', 'Scheduled'),
        (2, 'Repair', 'Engine oil change', ?, 2000.00, 'Local Garage', 'Low', 'Scheduled'),
        (3, 'Inspection', 'Safety inspection', ?, 1500.00, 'Government RTO', 'High', 'Scheduled')
      `, [formatDate(nextWeek), formatDate(today), formatDate(nextWeek)]);
      console.log('✅ Sample maintenance records added');
    }

    console.log('🎉 All tables fixed and sample data added!');
    
  } catch (error) {
    console.error('❌ Error fixing tables:', error);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// Run if called directly
if (require.main === module) {
  fixAllTables()
    .then(() => {
      console.log('✅ All fixes completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Fix failed:', error);
      process.exit(1);
    });
}

module.exports = fixAllTables;
