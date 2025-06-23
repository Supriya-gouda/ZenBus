const mysql = require('mysql2/promise');
require('dotenv').config();

async function createDailySchedules() {
  let connection;
  
  try {
    console.log('🚌 Creating daily bus schedules for all dates...');
    
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASS || '',
      database: process.env.DB_NAME || 'bus_reservation_system'
    });

    // First, let's check existing schedules
    const [existingSchedules] = await connection.query('SELECT COUNT(*) as count FROM bus_schedules');
    console.log(`📊 Current schedules in database: ${existingSchedules[0].count}`);

    // Get all buses, routes, and drivers
    const [buses] = await connection.query('SELECT * FROM buses WHERE status = "Active"');
    const [routes] = await connection.query('SELECT * FROM routes');
    const [drivers] = await connection.query('SELECT * FROM drivers WHERE status = "Active"');

    console.log(`📋 Found ${buses.length} active buses, ${routes.length} routes, ${drivers.length} drivers`);

    if (buses.length === 0 || routes.length === 0) {
      console.log('❌ No buses or routes found. Please add buses and routes first.');
      return;
    }

    // Don't clear existing schedules to preserve bookings
    console.log('➕ Adding new schedules (keeping existing ones)...');

    // Define time slots for different routes
    const timeSlots = [
      { departure: '06:00:00', arrival: '14:00:00' },
      { departure: '08:00:00', arrival: '16:00:00' },
      { departure: '10:00:00', arrival: '18:00:00' },
      { departure: '12:00:00', arrival: '20:00:00' },
      { departure: '14:00:00', arrival: '22:00:00' },
      { departure: '16:00:00', arrival: '00:00:00' },
      { departure: '18:00:00', arrival: '02:00:00' },
      { departure: '20:00:00', arrival: '04:00:00' },
      { departure: '22:00:00', arrival: '06:00:00' }
    ];

    let scheduleCount = 0;
    let driverIndex = 0;

    // Create schedules for each bus and route combination
    for (const bus of buses) {
      for (const route of routes) {
        // Create 2-3 schedules per bus-route combination with different times
        const numSchedules = Math.min(3, timeSlots.length);
        
        for (let i = 0; i < numSchedules; i++) {
          const timeSlot = timeSlots[i % timeSlots.length];
          const driver = drivers[driverIndex % drivers.length];
          
          // Calculate fare based on distance (₹2 per km + base fare of ₹100)
          const baseFare = 100;
          const farePerKm = 2;
          const totalFare = baseFare + (route.distance * farePerKm);

          try {
            // Check if this schedule already exists
            const [existing] = await connection.query(`
              SELECT schedule_id FROM bus_schedules
              WHERE bus_id = ? AND route_id = ? AND departure_time = ?
            `, [bus.bus_id, route.route_id, timeSlot.departure]);

            if (existing.length === 0) {
              await connection.query(`
                INSERT INTO bus_schedules
                (bus_id, route_id, driver_id, departure_time, arrival_time, fare, available_seats)
                VALUES (?, ?, ?, ?, ?, ?, ?)
              `, [
                bus.bus_id,
                route.route_id,
                driver.driver_id,
                timeSlot.departure,
                timeSlot.arrival,
                totalFare,
                bus.capacity
              ]);

              scheduleCount++;
            }
            driverIndex++;
          } catch (error) {
            console.error(`❌ Error creating schedule for bus ${bus.bus_number} on route ${route.source}-${route.destination}:`, error.message);
          }
        }
      }
    }

    console.log(`✅ Created ${scheduleCount} daily schedules successfully!`);

    // Verify the schedules
    const [newSchedules] = await connection.query(`
      SELECT bs.*, b.bus_number, r.source, r.destination, d.full_name as driver_name
      FROM bus_schedules bs
      JOIN buses b ON bs.bus_id = b.bus_id
      JOIN routes r ON bs.route_id = r.route_id
      JOIN drivers d ON bs.driver_id = d.driver_id
      ORDER BY r.source, r.destination, bs.departure_time
      LIMIT 10
    `);

    console.log('\n📋 Sample schedules created:');
    newSchedules.forEach(schedule => {
      console.log(`  - ${schedule.bus_number}: ${schedule.source} → ${schedule.destination} at ${schedule.departure_time} (₹${schedule.fare})`);
    });

    console.log('\n🎉 Daily schedules setup completed!');
    console.log('ℹ️  These schedules will now be available for all dates when users search for buses.');
    
  } catch (error) {
    console.error('❌ Error creating daily schedules:', error);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// Run if called directly
if (require.main === module) {
  createDailySchedules()
    .then(() => {
      console.log('✅ Daily schedules creation completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Daily schedules creation failed:', error);
      process.exit(1);
    });
}

module.exports = createDailySchedules;
