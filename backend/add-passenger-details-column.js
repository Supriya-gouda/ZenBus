const mysql = require('mysql2/promise');
require('dotenv').config();

async function addPassengerDetailsColumn() {
  let connection;
  
  try {
    console.log('🔧 Adding passenger_details column to bookings table...');
    
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASS || '',
      database: process.env.DB_NAME || 'bus_reservation_system'
    });

    // Check if passenger_details column already exists
    const [columns] = await connection.query('DESCRIBE bookings');
    const columnNames = columns.map(col => col.Field);
    
    if (!columnNames.includes('passenger_details')) {
      console.log('➕ Adding passenger_details column...');
      await connection.query(`
        ALTER TABLE bookings 
        ADD COLUMN passenger_details JSON AFTER total_fare
      `);
      console.log('✅ passenger_details column added successfully');
    } else {
      console.log('✅ passenger_details column already exists');
    }

    // Add some sample passenger details to existing bookings
    const [existingBookings] = await connection.query(`
      SELECT booking_id, seat_numbers, total_seats 
      FROM bookings 
      WHERE passenger_details IS NULL
    `);

    if (existingBookings.length > 0) {
      console.log(`➕ Adding sample passenger details to ${existingBookings.length} existing bookings...`);
      
      for (const booking of existingBookings) {
        const seatNumbers = JSON.parse(booking.seat_numbers || '[]');
        const passengerDetails = [];
        
        // Create sample passenger details for each seat
        for (let i = 0; i < booking.total_seats; i++) {
          passengerDetails.push({
            name: `Passenger ${i + 1}`,
            age: 25 + (i * 5),
            gender: i % 2 === 0 ? 'Male' : 'Female',
            seatNumber: seatNumbers[i] || (i + 1)
          });
        }

        await connection.query(`
          UPDATE bookings 
          SET passenger_details = ? 
          WHERE booking_id = ?
        `, [JSON.stringify(passengerDetails), booking.booking_id]);
      }
      
      console.log('✅ Sample passenger details added to existing bookings');
    }

    console.log('🎉 Passenger details column setup completed!');
    
  } catch (error) {
    console.error('❌ Error adding passenger details column:', error);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// Run if called directly
if (require.main === module) {
  addPassengerDetailsColumn()
    .then(() => {
      console.log('✅ Passenger details column addition completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Passenger details column addition failed:', error);
      process.exit(1);
    });
}

module.exports = addPassengerDetailsColumn;
