const mysql = require('mysql2/promise');
require('dotenv').config();

async function checkTables() {
  let connection;
  
  try {
    console.log('🔍 Checking database tables...');
    
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASS || '',
      database: process.env.DB_NAME || 'bus_reservation_system'
    });

    // Check existing tables
    const [tables] = await connection.query('SHOW TABLES');
    console.log('📊 Existing tables:');
    tables.forEach(table => {
      const tableName = Object.values(table)[0];
      console.log(`  - ${tableName}`);
    });

    const existingTables = tables.map(table => Object.values(table)[0]);

    // Check if drivers table exists
    if (!existingTables.includes('drivers')) {
      console.log('➕ Creating drivers table...');
      await connection.query(`
        CREATE TABLE drivers (
          driver_id INT AUTO_INCREMENT PRIMARY KEY,
          full_name VARCHAR(100) NOT NULL,
          license_number VARCHAR(50) UNIQUE NOT NULL,
          contact_number VARCHAR(15) NOT NULL,
          experience_years INT DEFAULT 0,
          address TEXT,
          date_of_birth DATE,
          emergency_contact VARCHAR(15),
          status ENUM('Active', 'Inactive', 'On Leave') DEFAULT 'Active',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
      console.log('✅ Drivers table created');
    }

    // Check if bus_staff table exists
    if (!existingTables.includes('bus_staff')) {
      console.log('➕ Creating bus_staff table...');
      await connection.query(`
        CREATE TABLE bus_staff (
          staff_id INT AUTO_INCREMENT PRIMARY KEY,
          full_name VARCHAR(100) NOT NULL,
          role ENUM('Conductor', 'Cleaner', 'Mechanic', 'Supervisor') NOT NULL,
          contact_number VARCHAR(15) NOT NULL,
          email VARCHAR(100),
          address TEXT,
          date_of_joining DATE,
          salary DECIMAL(10,2),
          status ENUM('Active', 'Inactive', 'On Leave') DEFAULT 'Active',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
      console.log('✅ Bus staff table created');
    }

    // Check if maintenance table exists
    if (!existingTables.includes('maintenance')) {
      console.log('➕ Creating maintenance table...');
      await connection.query(`
        CREATE TABLE maintenance (
          maintenance_id INT AUTO_INCREMENT PRIMARY KEY,
          bus_id INT NOT NULL,
          maintenance_type ENUM('Routine', 'Repair', 'Emergency', 'Inspection') NOT NULL,
          description TEXT,
          scheduled_date DATE NOT NULL,
          completed_date DATE,
          cost DECIMAL(10,2),
          service_provider VARCHAR(100),
          priority ENUM('Low', 'Medium', 'High', 'Critical') DEFAULT 'Medium',
          status ENUM('Scheduled', 'In Progress', 'Completed', 'Cancelled') DEFAULT 'Scheduled',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (bus_id) REFERENCES buses(bus_id)
        )
      `);
      console.log('✅ Maintenance table created');
    }

    // Update bus_schedules table to include driver_id if not exists
    const [scheduleColumns] = await connection.query('DESCRIBE bus_schedules');
    const scheduleColumnNames = scheduleColumns.map(col => col.Field);
    
    if (!scheduleColumnNames.includes('driver_id')) {
      console.log('➕ Adding driver_id to bus_schedules table...');
      await connection.query(`
        ALTER TABLE bus_schedules 
        ADD COLUMN driver_id INT,
        ADD FOREIGN KEY (driver_id) REFERENCES drivers(driver_id)
      `);
      console.log('✅ Driver_id added to bus_schedules table');
    }

    // Insert sample drivers if table is empty
    const [driverCount] = await connection.query('SELECT COUNT(*) as count FROM drivers');
    if (driverCount[0].count === 0) {
      console.log('➕ Adding sample drivers...');
      await connection.query(`
        INSERT INTO drivers (full_name, license_number, contact_number, experience_years, address, status) VALUES
        ('Rajesh Kumar', 'DL123456789', '9876543210', 5, '123 Main St, Bangalore', 'Active'),
        ('Suresh Reddy', 'DL987654321', '9876543211', 8, '456 Park Ave, Mumbai', 'Active'),
        ('Mahesh Singh', 'DL456789123', '9876543212', 3, '789 Lake View, Chennai', 'Active')
      `);
      console.log('✅ Sample drivers added');
    }

    // Insert sample bus staff if table is empty
    const [staffCount] = await connection.query('SELECT COUNT(*) as count FROM bus_staff');
    if (staffCount[0].count === 0) {
      console.log('➕ Adding sample bus staff...');
      await connection.query(`
        INSERT INTO bus_staff (full_name, role, contact_number, email, address, salary, status) VALUES
        ('Ramesh Conductor', 'Conductor', '9876543213', 'ramesh@zenbus.com', '321 Service St, Bangalore', 25000.00, 'Active'),
        ('Ganesh Cleaner', 'Cleaner', '9876543214', 'ganesh@zenbus.com', '654 Clean Ave, Mumbai', 18000.00, 'Active'),
        ('Prakash Mechanic', 'Mechanic', '9876543215', 'prakash@zenbus.com', '987 Repair Rd, Chennai', 35000.00, 'Active')
      `);
      console.log('✅ Sample bus staff added');
    }

    console.log('🎉 Database tables check completed!');
    
  } catch (error) {
    console.error('❌ Error checking tables:', error);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// Run if called directly
if (require.main === module) {
  checkTables()
    .then(() => {
      console.log('✅ Table check completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Table check failed:', error);
      process.exit(1);
    });
}

module.exports = checkTables;
