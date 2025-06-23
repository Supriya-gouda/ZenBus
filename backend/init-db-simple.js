const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');
require('dotenv').config();

async function initDatabase() {
  let connection;
  
  try {
    console.log('🔄 Initializing ZenBus database...');
    
    // Connect to MySQL server
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASS || ''
    });

    console.log('✅ Connected to MySQL server');

    // Create database
    const dbName = process.env.DB_NAME || 'bus_reservation_system';
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\``);
    console.log(`✅ Database "${dbName}" created/verified`);

    // Switch to the database
    await connection.query(`USE \`${dbName}\``);

    // Create users table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS users (
        user_id INT AUTO_INCREMENT PRIMARY KEY,
        full_name VARCHAR(100) NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        phone VARCHAR(15) NOT NULL,
        password VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        status ENUM('Active', 'Blocked') DEFAULT 'Active'
      )
    `);

    // Create admins table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS admins (
        admin_id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create buses table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS buses (
        bus_id INT AUTO_INCREMENT PRIMARY KEY,
        bus_number VARCHAR(20) UNIQUE NOT NULL,
        bus_type ENUM('AC', 'Non-AC', 'Sleeper', 'Semi-Sleeper') NOT NULL,
        total_seats INT NOT NULL,
        status ENUM('Active', 'Maintenance', 'Inactive') DEFAULT 'Active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create routes table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS routes (
        route_id INT AUTO_INCREMENT PRIMARY KEY,
        source VARCHAR(100) NOT NULL,
        destination VARCHAR(100) NOT NULL,
        distance_km INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create bus_schedules table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS bus_schedules (
        schedule_id INT AUTO_INCREMENT PRIMARY KEY,
        bus_id INT NOT NULL,
        route_id INT NOT NULL,
        departure_time TIME NOT NULL,
        arrival_time TIME NOT NULL,
        fare DECIMAL(10,2) NOT NULL,
        available_seats INT NOT NULL,
        schedule_date DATE NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (bus_id) REFERENCES buses(bus_id),
        FOREIGN KEY (route_id) REFERENCES routes(route_id)
      )
    `);

    // Create bookings table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS bookings (
        booking_id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        schedule_id INT NOT NULL,
        passenger_name VARCHAR(100) NOT NULL,
        passenger_age INT NOT NULL,
        passenger_gender ENUM('Male', 'Female', 'Other') NOT NULL,
        seat_numbers JSON NOT NULL,
        total_amount DECIMAL(10,2) NOT NULL,
        booking_status ENUM('Confirmed', 'Cancelled') DEFAULT 'Confirmed',
        booking_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(user_id),
        FOREIGN KEY (schedule_id) REFERENCES bus_schedules(schedule_id)
      )
    `);

    // Create feedback table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS feedback (
        feedback_id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        booking_id INT,
        rating INT CHECK (rating >= 1 AND rating <= 5),
        comment TEXT,
        admin_response TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(user_id),
        FOREIGN KEY (booking_id) REFERENCES bookings(booking_id)
      )
    `);

    console.log('✅ Database tables created');

    // Create default admin user
    const [adminExists] = await connection.query(
      'SELECT COUNT(*) as count FROM admins WHERE username = ?',
      ['admin']
    );

    if (adminExists[0].count === 0) {
      const hashedPassword = await bcrypt.hash('admin123', 10);
      await connection.query(
        'INSERT INTO admins (username, password) VALUES (?, ?)',
        ['admin', hashedPassword]
      );
      console.log('✅ Default admin user created (admin/admin123)');
    } else {
      console.log('✅ Admin user already exists');
    }

    // Create sample users with hashed passwords
    const [userCount] = await connection.query('SELECT COUNT(*) as count FROM users');
    if (userCount[0].count === 0) {
      const hashedPassword = await bcrypt.hash('password123', 10);
      
      await connection.query(`
        INSERT INTO users (full_name, email, phone, password) VALUES
        ('John Doe', 'user1@example.com', '9876543210', ?),
        ('Jane Smith', 'user2@example.com', '9876543211', ?)
      `, [hashedPassword, hashedPassword]);
      
      console.log('✅ Sample users created');
    }

    // Create sample buses
    const [busCount] = await connection.query('SELECT COUNT(*) as count FROM buses');
    if (busCount[0].count === 0) {
      await connection.query(`
        INSERT INTO buses (bus_number, bus_type, total_seats) VALUES
        ('KA01AB1234', 'AC', 40),
        ('KA02CD5678', 'Non-AC', 45),
        ('KA03EF9012', 'Sleeper', 30)
      `);
      console.log('✅ Sample buses created');
    }

    // Create sample routes
    const [routeCount] = await connection.query('SELECT COUNT(*) as count FROM routes');
    if (routeCount[0].count === 0) {
      await connection.query(`
        INSERT INTO routes (source, destination, distance_km) VALUES
        ('Bangalore', 'Mumbai', 850),
        ('Bangalore', 'Chennai', 350),
        ('Mumbai', 'Pune', 150),
        ('Delhi', 'Jaipur', 280),
        ('Hyderabad', 'Bangalore', 570)
      `);
      console.log('✅ Sample routes created');
    }

    // Create sample schedules for today and next few days
    const [scheduleCount] = await connection.query('SELECT COUNT(*) as count FROM bus_schedules');
    if (scheduleCount[0].count === 0) {
      const today = new Date();
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      const formatDate = (date) => date.toISOString().split('T')[0];
      
      await connection.query(`
        INSERT INTO bus_schedules (bus_id, route_id, departure_time, arrival_time, fare, available_seats, schedule_date) VALUES
        (1, 1, '08:00:00', '20:00:00', 1200.00, 40, ?),
        (2, 2, '09:30:00', '15:30:00', 800.00, 45, ?),
        (3, 3, '22:00:00', '06:00:00', 600.00, 30, ?),
        (1, 2, '10:00:00', '16:00:00', 850.00, 40, ?),
        (2, 1, '14:00:00', '02:00:00', 1150.00, 45, ?)
      `, [formatDate(today), formatDate(today), formatDate(today), formatDate(tomorrow), formatDate(tomorrow)]);
      
      console.log('✅ Sample schedules created');
    }

    console.log('🎉 ZenBus database initialization completed successfully!');
    
  } catch (error) {
    console.error('❌ Error initializing database:', error);
    throw error;
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// Run if called directly
if (require.main === module) {
  initDatabase()
    .then(() => {
      console.log('✅ Database ready for ZenBus!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Database initialization failed:', error);
      process.exit(1);
    });
}

module.exports = initDatabase;
