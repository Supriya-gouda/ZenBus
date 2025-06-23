const db = require('../db/connection');

async function createBusesTable() {
  try {
    // Create buses table if it doesn't exist
    await db.execute(`
      CREATE TABLE IF NOT EXISTS buses (
        bus_id INT AUTO_INCREMENT PRIMARY KEY,
        bus_number VARCHAR(20) UNIQUE NOT NULL,
        bus_type VARCHAR(50) NOT NULL,
        total_seats INT NOT NULL,
        amenities TEXT NULL,
        status ENUM('Active', 'Maintenance', 'Inactive') DEFAULT 'Active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    console.log('Buses table created successfully!');
    
    // Check if table has any data
    const [buses] = await db.execute('SELECT COUNT(*) as count FROM buses');
    console.log('Current buses count:', buses[0].count);
    
    // Insert sample data if table is empty
    if (buses[0].count === 0) {
      await db.execute(`
        INSERT INTO buses (bus_number, bus_type, total_seats, amenities, status) VALUES
        ('BUS001', 'Deluxe', 40, 'AC, WiFi, USB Charging', 'Active'),
        ('BUS002', 'Luxury', 35, 'AC, WiFi, Reclining Seats, Entertainment', 'Active'),
        ('BUS003', 'Standard', 45, 'Fan, Basic Seating', 'Active'),
        ('BUS004', 'Sleeper', 30, 'AC, Sleeping Berths, WiFi', 'Active'),
        ('BUS005', 'Deluxe', 40, 'AC, WiFi, USB Charging', 'Maintenance')
      `);
      console.log('Sample bus data inserted!');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error creating buses table:', error);
    process.exit(1);
  }
}

createBusesTable();
