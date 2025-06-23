-- Sample data for bus reservation system
USE bus_reservation_system;

-- Clear existing schedules first
DELETE FROM bus_schedules;

-- Insert sample buses if they don't exist
INSERT IGNORE INTO buses (bus_id, bus_number, bus_type, total_seats, amenities, status) VALUES
(1, 'BUS001', 'Luxury', 40, 'AC, WiFi, USB Charging, Reclining Seats', 'Active'),
(2, 'BUS002', 'Standard', 50, 'AC, USB Charging', 'Active'),
(3, 'BUS003', 'Sleeper', 30, 'AC, WiFi, USB Charging, Sleeper Berths', 'Active'),
(4, 'BUS004', 'Deluxe', 45, 'AC, WiFi, Entertainment System', 'Active'),
(5, 'BUS005', 'Standard', 50, 'AC, USB Charging', 'Active'),
(6, 'BUS006', 'Luxury', 42, 'AC, WiFi, USB Charging, Reclining Seats, Entertainment', 'Active'),
(7, 'BUS007', 'Semi-Sleeper', 35, 'AC, WiFi, USB Charging, Semi-Sleeper Berths', 'Active'),
(8, 'BUS008', 'Standard', 48, 'AC, USB Charging', 'Active'),
(9, 'BUS009', 'Deluxe', 40, 'AC, WiFi, Entertainment System, USB Charging', 'Active'),
(10, 'BUS010', 'Luxury', 38, 'AC, WiFi, USB Charging, Reclining Seats, Blankets', 'Active');

-- Insert sample routes if they don't exist
INSERT IGNORE INTO routes (route_id, source, destination, distance) VALUES
(1, 'Mumbai', 'Pune', 150.00),
(2, 'Delhi', 'Agra', 200.00),
(3, 'Bangalore', 'Chennai', 350.00),
(4, 'Kolkata', 'Bhubaneswar', 450.00),
(5, 'Hyderabad', 'Vijayawada', 275.00),
(6, 'Mumbai', 'Goa', 450.00),
(7, 'Delhi', 'Jaipur', 280.00),
(8, 'Chennai', 'Coimbatore', 500.00),
(9, 'Pune', 'Nashik', 210.00),
(10, 'Ahmedabad', 'Udaipur', 260.00);

-- Insert sample drivers if they don't exist
INSERT IGNORE INTO drivers (driver_id, full_name, license_number, contact_number, experience_years) VALUES
(1, 'Rajesh Kumar', 'DL123456789', '+91-9876543210', 8),
(2, 'Amit Sharma', 'DL987654321', '+91-9876543211', 5),
(3, 'Suresh Patel', 'DL456789123', '+91-9876543212', 12),
(4, 'Vikram Singh', 'DL789123456', '+91-9876543213', 6),
(5, 'Ravi Gupta', 'DL321654987', '+91-9876543214', 10),
(6, 'Manoj Verma', 'DL654321789', '+91-9876543215', 7),
(7, 'Deepak Joshi', 'DL147258369', '+91-9876543216', 9),
(8, 'Anil Yadav', 'DL369258147', '+91-9876543217', 4),
(9, 'Sanjay Mishra', 'DL258147369', '+91-9876543218', 11),
(10, 'Ramesh Tiwari', 'DL741852963', '+91-9876543219', 6);

-- Insert 10 realistic daily bus schedules (using current date as base)
INSERT IGNORE INTO bus_schedules (schedule_id, bus_id, route_id, driver_id, departure_time, arrival_time, fare, available_seats) VALUES
-- Schedule 1: Mumbai to Pune - Morning Luxury Service
(1, 1, 1, 1, CONCAT(CURDATE(), ' 06:00:00'), CONCAT(CURDATE(), ' 09:30:00'), 450.00, 40),
-- Schedule 2: Delhi to Agra - Standard Morning Service
(2, 2, 2, 2, CONCAT(CURDATE(), ' 07:00:00'), CONCAT(CURDATE(), ' 11:00:00'), 350.00, 50),
-- Schedule 3: Bangalore to Chennai - Overnight Sleeper
(3, 3, 3, 3, CONCAT(CURDATE(), ' 22:00:00'), CONCAT(DATE_ADD(CURDATE(), INTERVAL 1 DAY), ' 06:00:00'), 850.00, 30),
-- Schedule 4: Kolkata to Bhubaneswar - Deluxe Service
(4, 4, 4, 4, CONCAT(CURDATE(), ' 08:30:00'), CONCAT(CURDATE(), ' 16:00:00'), 650.00, 45),
-- Schedule 5: Hyderabad to Vijayawada - Standard Service
(5, 5, 5, 5, CONCAT(CURDATE(), ' 09:00:00'), CONCAT(CURDATE(), ' 13:30:00'), 400.00, 50),
-- Schedule 6: Mumbai to Goa - Luxury Long Distance
(6, 6, 6, 6, CONCAT(CURDATE(), ' 20:00:00'), CONCAT(DATE_ADD(CURDATE(), INTERVAL 1 DAY), ' 08:00:00'), 950.00, 42),
-- Schedule 7: Delhi to Jaipur - Semi-Sleeper
(7, 7, 7, 7, CONCAT(CURDATE(), ' 14:00:00'), CONCAT(CURDATE(), ' 19:30:00'), 500.00, 35),
-- Schedule 8: Chennai to Coimbatore - Standard Service
(8, 8, 8, 8, CONCAT(CURDATE(), ' 10:30:00'), CONCAT(CURDATE(), ' 19:00:00'), 750.00, 48),
-- Schedule 9: Pune to Nashik - Deluxe Service
(9, 9, 9, 9, CONCAT(CURDATE(), ' 15:00:00'), CONCAT(CURDATE(), ' 19:30:00'), 380.00, 40),
-- Schedule 10: Ahmedabad to Udaipur - Luxury Service
(10, 10, 10, 10, CONCAT(CURDATE(), ' 11:00:00'), CONCAT(CURDATE(), ' 16:30:00'), 550.00, 38);

-- Insert sample admin if not exists
INSERT IGNORE INTO admins (admin_id, username, password, full_name) VALUES
(1, 'admin', '$2b$10$rQnV0YL.Bh/jQj.DCYJ8.uRfBKrLIrMhkVl9N8hBDvNs7LaEUJKGa', 'System Administrator');
-- Password is 'admin123' (hashed)

-- Insert sample users if they don't exist
INSERT IGNORE INTO users (user_id, email, password, full_name, phone) VALUES
(1, 'user1@example.com', '$2b$10$rQnV0YL.Bh/jQj.DCYJ8.uRfBKrLIrMhkVl9N8hBDvNs7LaEUJKGa', 'John Doe', '1234567890'),
(2, 'user2@example.com', '$2b$10$rQnV0YL.Bh/jQj.DCYJ8.uRfBKrLIrMhkVl9N8hBDvNs7LaEUJKGa', 'Jane Smith', '2345678901'),
(3, 'test@test.com', '$2b$10$rQnV0YL.Bh/jQj.DCYJ8.uRfBKrLIrMhkVl9N8hBDvNs7LaEUJKGa', 'Test User', '3456789012');
-- Password is 'password123' (hashed)

-- Insert sample bookings if they don't exist
INSERT IGNORE INTO bookings (booking_id, user_id, schedule_id, journey_date, seat_numbers, total_seats, total_fare, booking_status) VALUES
(1, 1, 1, '2024-01-15', 'A1,A2', 2, 90.00, 'Confirmed'),
(2, 1, 3, '2024-01-20', 'B5,B6,B7', 3, 195.00, 'Confirmed'),
(3, 2, 2, '2024-01-15', 'C1', 1, 40.00, 'Confirmed'),
(4, 3, 4, '2024-01-25', 'D1,D2', 2, 170.00, 'Confirmed');

-- Insert sample payments if they don't exist
INSERT IGNORE INTO payments (payment_id, booking_id, amount, payment_method, transaction_id, payment_status) VALUES
(1, 1, 90.00, 'Credit Card', 'TXN123456789', 'Success'),
(2, 2, 195.00, 'PayPal', 'TXN987654321', 'Success'),
(3, 3, 40.00, 'Credit Card', 'TXN456789123', 'Success'),
(4, 4, 170.00, 'Debit Card', 'TXN789123456', 'Success');

-- Insert sample feedback if it doesn't exist
INSERT IGNORE INTO feedback (feedback_id, user_id, booking_id, rating, comments) VALUES
(1, 1, 1, 4, 'Great service, comfortable journey.'),
(2, 1, 2, 5, 'Excellent experience, very punctual.'),
(3, 2, 3, 3, 'Good service but could be improved.'),
(4, 3, 4, 5, 'Outstanding service, highly recommended!');

-- Insert sample passengers if they don't exist
INSERT IGNORE INTO passengers (passenger_id, user_id, full_name, age, gender, contact_number) VALUES
(1, 1, 'John Doe', 30, 'Male', '1234567890'),
(2, 1, 'Jane Doe', 28, 'Female', '1234567891'),
(3, 2, 'Jane Smith', 35, 'Female', '2345678901'),
(4, 3, 'Test User', 25, 'Other', '3456789012');
