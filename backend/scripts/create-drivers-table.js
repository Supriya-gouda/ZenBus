const db = require('../db/connection');

async function createDriversTable() {
  try {
    // Create drivers table if it doesn't exist
    await db.execute(`
      CREATE TABLE IF NOT EXISTS drivers (
        driver_id INT AUTO_INCREMENT PRIMARY KEY,
        full_name VARCHAR(100) NOT NULL,
        license_number VARCHAR(50) UNIQUE NOT NULL,
        contact_number VARCHAR(20) NOT NULL,
        experience_years INT DEFAULT 0,
        address TEXT NULL,
        date_of_birth DATE NULL,
        emergency_contact VARCHAR(20) NULL,
        status ENUM('Active', 'On Leave', 'Inactive') DEFAULT 'Active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    console.log('Drivers table created successfully!');
    
    // Check if table has any data
    const [drivers] = await db.execute('SELECT COUNT(*) as count FROM drivers');
    console.log('Current drivers count:', drivers[0].count);
    
    process.exit(0);
  } catch (error) {
    console.error('Error creating drivers table:', error);
    process.exit(1);
  }
}

createDriversTable();
