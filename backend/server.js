require('dotenv').config();
const express = require('express');
const cors = require('cors');
const session = require('express-session');
const path = require('path');

// Import routes
const userRoutes = require('./routes/userRoutes');
const adminRoutes = require('./routes/adminRoutes');
const busRoutes = require('./routes/busRoutes');
const routeRoutes = require('./routes/routeRoutes');
const scheduleRoutes = require('./routes/scheduleRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const refundRoutes = require('./routes/refundRoutes');
const feedbackRoutes = require('./routes/feedbackRoutes');
const maintenanceRoutes = require('./routes/maintenanceRoutes');
const driverRoutes = require('./routes/driverRoutes');
const passengerRoutes = require('./routes/passengerRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const busStopRoutes = require('./routes/busStopRoutes');
const busStaffRoutes = require('./routes/busStaffRoutes');

// Database connection
const db = require('./db/connection');

const app = express();
const PORT = process.env.PORT || 8080;

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000', 'http://localhost:3001', 'http://127.0.0.1:3001', 'http://localhost:5173', 'http://127.0.0.1:5173', 'http://localhost:5500', 'http://127.0.0.1:5500', 'null'], // Allow common development origins
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET || 'default_secret_key',
  resave: false,
  saveUninitialized: false,
  name: 'sessionId', // Custom session name
  cookie: {
    secure: false, // Set to true in production with HTTPS
    httpOnly: false, // Allow JavaScript access for debugging (set to true in production)
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    sameSite: 'lax' // CSRF protection
  }
}));

// Debug middleware to log session info
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path} - Session ID: ${req.sessionID}, User ID: ${req.session?.userId}`);
  next();
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Global error handler:', err);
  res.status(500).json({ message: 'Internal server error', error: err.message });
});

// Routes
app.use('/api/users', userRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/buses', busRoutes);
app.use('/api/routes', routeRoutes);
app.use('/api/schedules', scheduleRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/refunds', refundRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/maintenance', maintenanceRoutes);
app.use('/api/drivers', driverRoutes);
app.use('/api/passengers', passengerRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/bus-stops', busStopRoutes);
app.use('/api/bus-staff', busStaffRoutes);

// Test route
app.get('/api/test', (req, res) => {
  res.json({ message: 'API is working!' });
});

// Handle 404 errors
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Test database connection
db.testConnection()
  .then(connected => {
    if (connected) {
      // Start server
      app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
      });
    } else {
      console.error('Failed to connect to database. Server not started.');
    }
  })
  .catch(err => {
    console.error('Error testing database connection:', err);
  });