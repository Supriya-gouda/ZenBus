-- Create database
CREATE DATABASE IF NOT EXISTS bus_reservation_system;
USE bus_reservation_system;

-- Users table
CREATE TABLE IF NOT EXISTS users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Admin table
CREATE TABLE IF NOT EXISTS admins (
    admin_id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Buses table
CREATE TABLE IF NOT EXISTS buses (
    bus_id INT AUTO_INCREMENT PRIMARY KEY,
    bus_number VARCHAR(20) UNIQUE NOT NULL,
    bus_type VARCHAR(50) NOT NULL,
    total_seats INT NOT NULL,
    amenities TEXT,
    status ENUM('Active', 'Inactive', 'Maintenance') DEFAULT 'Active'
);

-- Drivers table
CREATE TABLE IF NOT EXISTS drivers (
    driver_id INT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    license_number VARCHAR(50) UNIQUE NOT NULL,
    contact_number VARCHAR(20) NOT NULL,
    experience_years INT
);

-- Bus staff table
CREATE TABLE IF NOT EXISTS bus_staff (
    staff_id INT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    role VARCHAR(50) NOT NULL,
    contact_number VARCHAR(20) NOT NULL
);

-- Routes table
CREATE TABLE IF NOT EXISTS routes (
    route_id INT AUTO_INCREMENT PRIMARY KEY,
    source VARCHAR(100) NOT NULL,
    destination VARCHAR(100) NOT NULL,
    distance DECIMAL(10,2),
    UNIQUE KEY unique_route (source, destination)
);

-- Bus schedules table
CREATE TABLE IF NOT EXISTS bus_schedules (
    schedule_id INT AUTO_INCREMENT PRIMARY KEY,
    bus_id INT NOT NULL,
    route_id INT NOT NULL,
    driver_id INT,
    departure_time DATETIME NOT NULL,
    arrival_time DATETIME NOT NULL,
    fare DECIMAL(10,2) NOT NULL,
    available_seats INT NOT NULL,
    FOREIGN KEY (bus_id) REFERENCES buses(bus_id),
    FOREIGN KEY (route_id) REFERENCES routes(route_id),
    FOREIGN KEY (driver_id) REFERENCES drivers(driver_id)
);

-- Passengers table
CREATE TABLE IF NOT EXISTS passengers (
    passenger_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    full_name VARCHAR(100) NOT NULL,
    age INT,
    gender ENUM('Male', 'Female', 'Other'),
    contact_number VARCHAR(20),
    FOREIGN KEY (user_id) REFERENCES users(user_id)
);

-- Bookings table
CREATE TABLE IF NOT EXISTS bookings (
    booking_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    schedule_id INT NOT NULL,
    booking_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    journey_date DATE NOT NULL,
    seat_numbers VARCHAR(255) NOT NULL,
    total_seats INT NOT NULL,
    total_fare DECIMAL(10,2) NOT NULL,
    booking_status ENUM('Confirmed', 'Cancelled', 'Pending') DEFAULT 'Pending',
    cancellation_date TIMESTAMP NULL,
    cancellation_reason VARCHAR(255),
    refund_eligible BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (user_id) REFERENCES users(user_id),
    FOREIGN KEY (schedule_id) REFERENCES bus_schedules(schedule_id)
);

-- Payments table (mock)
CREATE TABLE IF NOT EXISTS payments (
    payment_id INT AUTO_INCREMENT PRIMARY KEY,
    booking_id INT NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    payment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    payment_method VARCHAR(50) NOT NULL,
    transaction_id VARCHAR(100),
    payment_status ENUM('Success', 'Failed', 'Pending') DEFAULT 'Pending',
    FOREIGN KEY (booking_id) REFERENCES bookings(booking_id)
);

-- Feedback table
CREATE TABLE IF NOT EXISTS feedback (
    feedback_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    booking_id INT,
    rating INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
    comments TEXT,
    feedback_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id),
    FOREIGN KEY (booking_id) REFERENCES bookings(booking_id)
);

-- Maintenance table
CREATE TABLE IF NOT EXISTS maintenance (
    maintenance_id INT AUTO_INCREMENT PRIMARY KEY,
    bus_id INT NOT NULL,
    maintenance_type VARCHAR(100) NOT NULL,
    description TEXT,
    scheduled_date DATE NOT NULL,
    completion_date DATE,
    status ENUM('Scheduled', 'In Progress', 'Completed') DEFAULT 'Scheduled',
    cost DECIMAL(10,2),
    FOREIGN KEY (bus_id) REFERENCES buses(bus_id)
);

-- Booking history table (for logging)
CREATE TABLE IF NOT EXISTS booking_history (
    history_id INT AUTO_INCREMENT PRIMARY KEY,
    booking_id INT NOT NULL,
    user_id INT NOT NULL,
    schedule_id INT NOT NULL,
    action VARCHAR(50) NOT NULL,
    action_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    details TEXT
);

-- Refunds table
CREATE TABLE IF NOT EXISTS refunds (
    refund_id INT AUTO_INCREMENT PRIMARY KEY,
    booking_id INT NOT NULL,
    payment_id INT NOT NULL,
    refund_amount DECIMAL(10,2) NOT NULL,
    refund_reason VARCHAR(255),
    refund_status ENUM('Pending', 'Processed', 'Failed', 'Cancelled') DEFAULT 'Pending',
    refund_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    processed_date TIMESTAMP NULL,
    refund_transaction_id VARCHAR(100),
    refund_method VARCHAR(50) DEFAULT 'Original Payment Method',
    FOREIGN KEY (booking_id) REFERENCES bookings(booking_id),
    FOREIGN KEY (payment_id) REFERENCES payments(payment_id)
);

-- Bus stops table
CREATE TABLE IF NOT EXISTS bus_stops (
    stop_id INT AUTO_INCREMENT PRIMARY KEY,
    stop_name VARCHAR(100) NOT NULL,
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    address TEXT,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    facilities TEXT,
    status ENUM('Active', 'Inactive') DEFAULT 'Active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Route stops table (for intermediate stops)
CREATE TABLE IF NOT EXISTS route_stops (
    route_stop_id INT AUTO_INCREMENT PRIMARY KEY,
    route_id INT NOT NULL,
    stop_id INT NOT NULL,
    stop_order INT NOT NULL,
    arrival_time TIME,
    departure_time TIME,
    distance_from_start DECIMAL(10,2),
    FOREIGN KEY (route_id) REFERENCES routes(route_id),
    FOREIGN KEY (stop_id) REFERENCES bus_stops(stop_id),
    UNIQUE KEY unique_route_stop (route_id, stop_id)
);

-- Driver schedules table
CREATE TABLE IF NOT EXISTS driver_schedules (
    driver_schedule_id INT AUTO_INCREMENT PRIMARY KEY,
    driver_id INT NOT NULL,
    schedule_id INT NOT NULL,
    assigned_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status ENUM('Assigned', 'Completed', 'Cancelled') DEFAULT 'Assigned',
    FOREIGN KEY (driver_id) REFERENCES drivers(driver_id),
    FOREIGN KEY (schedule_id) REFERENCES bus_schedules(schedule_id)
);

-- Maintenance reminders table
CREATE TABLE IF NOT EXISTS maintenance_reminders (
    reminder_id INT AUTO_INCREMENT PRIMARY KEY,
    bus_id INT NOT NULL,
    reminder_type ENUM('Mileage', 'Time', 'Usage') NOT NULL,
    reminder_value INT NOT NULL,
    current_value INT DEFAULT 0,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (bus_id) REFERENCES buses(bus_id)
);

-- TRIGGERS

-- Trigger to update available seats when a booking is confirmed
DELIMITER //
CREATE TRIGGER after_booking_insert
AFTER INSERT ON bookings
FOR EACH ROW
BEGIN
    -- Update available seats in bus_schedules
    UPDATE bus_schedules
    SET available_seats = available_seats - NEW.total_seats
    WHERE schedule_id = NEW.schedule_id;
    
    -- Log in booking history
    INSERT INTO booking_history (booking_id, user_id, schedule_id, action, details)
    VALUES (NEW.booking_id, NEW.user_id, NEW.schedule_id, 'CREATED', 
            CONCAT('Booking created with ', NEW.total_seats, ' seats'));
END //
DELIMITER ;

-- Trigger to update available seats when a booking is cancelled
DELIMITER //
CREATE TRIGGER after_booking_update
AFTER UPDATE ON bookings
FOR EACH ROW
BEGIN
    IF NEW.booking_status = 'Cancelled' AND OLD.booking_status != 'Cancelled' THEN
        -- Restore available seats in bus_schedules
        UPDATE bus_schedules
        SET available_seats = available_seats + NEW.total_seats
        WHERE schedule_id = NEW.schedule_id;
        
        -- Log in booking history
        INSERT INTO booking_history (booking_id, user_id, schedule_id, action, details)
        VALUES (NEW.booking_id, NEW.user_id, NEW.schedule_id, 'CANCELLED', 
                CONCAT('Booking cancelled, ', NEW.total_seats, ' seats released'));
    END IF;
END //
DELIMITER ;

-- Trigger to automatically create maintenance entry when bus status changes to 'Inactive'
DELIMITER //
CREATE TRIGGER after_bus_status_change
AFTER UPDATE ON buses
FOR EACH ROW
BEGIN
    IF NEW.status = 'Inactive' AND OLD.status != 'Inactive' THEN
        INSERT INTO maintenance (bus_id, maintenance_type, description, scheduled_date, status)
        VALUES (NEW.bus_id, 'Routine Check', 'Automatically scheduled due to status change',
                CURDATE(), 'Scheduled');
    END IF;
END //
DELIMITER ;

-- Trigger to automatically schedule maintenance after 50 bookings for a bus
DELIMITER //
CREATE TRIGGER check_maintenance_after_booking
AFTER INSERT ON bookings
FOR EACH ROW
BEGIN
    DECLARE booking_count INT DEFAULT 0;
    DECLARE bus_id_var INT DEFAULT 0;
    DECLARE last_maintenance_date DATE DEFAULT NULL;

    -- Get the bus_id from the schedule
    SELECT bs.bus_id INTO bus_id_var
    FROM bus_schedules bs
    WHERE bs.schedule_id = NEW.schedule_id;

    -- Count confirmed bookings for this bus since last maintenance
    SELECT COALESCE(MAX(completion_date), '2020-01-01') INTO last_maintenance_date
    FROM maintenance
    WHERE bus_id = bus_id_var AND status = 'Completed';

    -- Count bookings since last maintenance
    SELECT COUNT(*) INTO booking_count
    FROM bookings b
    JOIN bus_schedules bs ON b.schedule_id = bs.schedule_id
    WHERE bs.bus_id = bus_id_var
    AND b.booking_status = 'Confirmed'
    AND b.booking_date > last_maintenance_date;

    -- If 50 or more bookings, schedule maintenance
    IF booking_count >= 50 THEN
        INSERT INTO maintenance (bus_id, maintenance_type, description, scheduled_date, status)
        VALUES (bus_id_var, 'Scheduled Maintenance',
                CONCAT('Auto-scheduled after ', booking_count, ' bookings'),
                DATE_ADD(CURDATE(), INTERVAL 7 DAY), 'Scheduled');
    END IF;
END //
DELIMITER ;

-- STORED PROCEDURES

-- Procedure to check seat availability
DELIMITER //
CREATE PROCEDURE check_seat_availability(IN schedule_id_param INT, IN journey_date_param DATE)
BEGIN
    SELECT bs.schedule_id, b.bus_number, b.total_seats, bs.available_seats,
           r.source, r.destination, bs.departure_time, bs.arrival_time, bs.fare
    FROM bus_schedules bs
    JOIN buses b ON bs.bus_id = b.bus_id
    JOIN routes r ON bs.route_id = r.route_id
    WHERE bs.schedule_id = schedule_id_param
    AND DATE(bs.departure_time) = journey_date_param;
END //
DELIMITER ;

-- Procedure to generate booking report
DELIMITER //
CREATE PROCEDURE generate_booking_report(IN start_date DATE, IN end_date DATE)
BEGIN
    SELECT b.booking_id, u.full_name AS user_name, r.source, r.destination,
           bs.departure_time, b.journey_date, b.seat_numbers, b.total_fare,
           b.booking_status, p.payment_status
    FROM bookings b
    JOIN users u ON b.user_id = u.user_id
    JOIN bus_schedules bs ON b.schedule_id = bs.schedule_id
    JOIN routes r ON bs.route_id = r.route_id
    LEFT JOIN payments p ON b.booking_id = p.booking_id
    WHERE b.journey_date BETWEEN start_date AND end_date
    ORDER BY b.journey_date;
END //
DELIMITER ;