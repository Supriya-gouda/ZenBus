const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function setupDatabase() {
  let connection;
  
  try {
    console.log('🔄 Setting up ZenBus database...');
    
    // Connect to MySQL without specifying database
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASS || '',
      multipleStatements: true
    });

    console.log('✅ Connected to MySQL server');

    // Create database if it doesn't exist
    const dbName = process.env.DB_NAME || 'bus_reservation_system';
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\``);
    console.log(`✅ Database "${dbName}" created/verified`);

    // Close connection and reconnect to the specific database
    await connection.end();

    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASS || '',
      database: dbName,
      multipleStatements: true
    });

    // Read and execute init.sql
    const initSqlPath = path.join(__dirname, 'db', 'init.sql');
    if (fs.existsSync(initSqlPath)) {
      const initSql = fs.readFileSync(initSqlPath, 'utf8');
      await connection.query(initSql);
      console.log('✅ Database schema created');
    } else {
      console.log('⚠️ init.sql not found, creating basic tables...');
      
      // Create basic tables if init.sql doesn't exist
      const basicSchema = `
        CREATE TABLE IF NOT EXISTS users (
          user_id INT AUTO_INCREMENT PRIMARY KEY,
          full_name VARCHAR(100) NOT NULL,
          email VARCHAR(100) UNIQUE NOT NULL,
          phone VARCHAR(15) NOT NULL,
          password VARCHAR(255) NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          status ENUM('Active', 'Blocked') DEFAULT 'Active'
        );

        CREATE TABLE IF NOT EXISTS admins (
          admin_id INT AUTO_INCREMENT PRIMARY KEY,
          username VARCHAR(50) UNIQUE NOT NULL,
          password VARCHAR(255) NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS buses (
          bus_id INT AUTO_INCREMENT PRIMARY KEY,
          bus_number VARCHAR(20) UNIQUE NOT NULL,
          bus_type ENUM('AC', 'Non-AC', 'Sleeper', 'Semi-Sleeper') NOT NULL,
          total_seats INT NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS routes (
          route_id INT AUTO_INCREMENT PRIMARY KEY,
          source VARCHAR(100) NOT NULL,
          destination VARCHAR(100) NOT NULL,
          distance_km INT NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

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
        );

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
        );

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
        );
      `;
      
      await connection.query(basicSchema);
      console.log('✅ Basic database schema created');
    }

    // Insert default admin if not exists
    const [adminExists] = await connection.execute(
      'SELECT COUNT(*) as count FROM admins WHERE username = ?',
      ['admin']
    );

    if (adminExists[0].count === 0) {
      const bcrypt = require('bcrypt');
      const hashedPassword = await bcrypt.hash('admin123', 10);
      
      await connection.execute(
        'INSERT INTO admins (username, password) VALUES (?, ?)',
        ['admin', hashedPassword]
      );
      console.log('✅ Default admin user created (admin/admin123)');
    } else {
      console.log('✅ Admin user already exists');
    }

    // Read and execute sample-data.sql if it exists
    const sampleDataPath = path.join(__dirname, 'db', 'sample-data.sql');
    if (fs.existsSync(sampleDataPath)) {
      const sampleData = fs.readFileSync(sampleDataPath, 'utf8');
      await connection.query(sampleData);
      console.log('✅ Sample data inserted');
    } else {
      console.log('⚠️ sample-data.sql not found, inserting basic sample data...');
      
      // Insert basic sample data
      const sampleDataQueries = `
        INSERT IGNORE INTO users (full_name, email, phone, password) VALUES
        ('John Doe', 'user1@example.com', '9876543210', '$2b$10$rQJ8vQZ9Z9Z9Z9Z9Z9Z9ZOZ9Z9Z9Z9Z9Z9Z9Z9Z9Z9Z9Z9Z9Z9Z9Z9Z'),
        ('Jane Smith', 'user2@example.com', '9876543211', '$2b$10$rQJ8vQZ9Z9Z9Z9Z9Z9Z9ZOZ9Z9Z9Z9Z9Z9Z9Z9Z9Z9Z9Z9Z9Z9Z9Z9Z9Z');

        INSERT IGNORE INTO buses (bus_number, bus_type, total_seats) VALUES
        ('KA01AB1234', 'AC', 40),
        ('KA02CD5678', 'Non-AC', 45),
        ('KA03EF9012', 'Sleeper', 30);

        INSERT IGNORE INTO routes (source, destination, distance_km) VALUES
        ('Bangalore', 'Mumbai', 850),
        ('Bangalore', 'Chennai', 350),
        ('Mumbai', 'Pune', 150);
      `;
      
      await connection.query(sampleDataQueries);
      console.log('✅ Basic sample data inserted');
    }

    console.log('🎉 Database setup completed successfully!');
    console.log('📊 ZenBus database is ready to use');
    
  } catch (error) {
    console.error('❌ Error setting up database:', error);
    throw error;
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// Run setup if called directly
if (require.main === module) {
  setupDatabase()
    .then(() => {
      console.log('✅ Setup completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Setup failed:', error);
      process.exit(1);
    });
}

module.exports = setupDatabase;
