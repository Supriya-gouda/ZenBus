const db = require('../db/connection');

async function createBusStaffTable() {
  try {
    // Create bus_staff table if it doesn't exist
    await db.execute(`
      CREATE TABLE IF NOT EXISTS bus_staff (
        staff_id INT AUTO_INCREMENT PRIMARY KEY,
        full_name VARCHAR(100) NOT NULL,
        role VARCHAR(50) NOT NULL,
        contact_number VARCHAR(20) NOT NULL,
        email VARCHAR(100) NULL,
        address TEXT NULL,
        date_of_joining DATE NULL,
        salary DECIMAL(10,2) NULL,
        status ENUM('Active', 'On Leave', 'Inactive') DEFAULT 'Active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    console.log('Bus staff table created successfully!');
    
    // Check if table has any data
    const [staff] = await db.execute('SELECT COUNT(*) as count FROM bus_staff');
    console.log('Current bus staff count:', staff[0].count);
    
    process.exit(0);
  } catch (error) {
    console.error('Error creating bus staff table:', error);
    process.exit(1);
  }
}

createBusStaffTable();
