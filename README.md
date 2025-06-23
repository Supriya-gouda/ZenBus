# 🧘 ZenBus - Bus Reservation System

[![MIT License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![Node.js](https://img.shields.io/badge/Node.js-16%2B-brightgreen)](https://nodejs.org/)
[![MySQL](https://img.shields.io/badge/MySQL-8.0%2B-blue)](https://www.mysql.com/)
[![React](https://img.shields.io/badge/React-18-blue)](https://react.dev/)

---

A comprehensive, full-stack bus booking and management system built with modern web technologies. ZenBus provides a complete solution for bus operators to manage their fleet, routes, bookings, and customer feedback while offering users an intuitive and peaceful booking experience.

![ZenBus - Bus Reservation System](https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80)

---

## 📑 Table of Contents
- [Features Overview](#-features-overview)
- [Demo](#-demo)
- [Technology Stack](#️-technology-stack)
- [Quick Start](#-quick-start)
- [Default Credentials](#-default-credentials)
- [Project Structure](#-project-structure)
- [Key Features Implemented](#-key-features-implemented)
- [API Endpoints](#-api-endpoints)
- [Database Schema](#️-database-schema)
- [Deployment Guide](#-deployment-guide)
- [Testing Checklist](#-testing-checklist)
- [Contributing](#-contributing)
- [License](#-license)
- [Support & Troubleshooting](#-support--troubleshooting)
- [Contact](#-contact)

---

## 🎬 Demo

> **Live Demo:** _Coming Soon!_
> 
> **Screenshots:**
> ![Landing Page Screenshot](https://via.placeholder.com/800x400?text=Landing+Page)
> ![Admin Dashboard Screenshot](https://via.placeholder.com/800x400?text=Admin+Dashboard)

---

## �� Features Overview

### 👥 **User Features**
- **🔍 Bus Search & Booking**: Search buses by route and date with real-time availability
- **🪑 Interactive Seat Selection**: Realistic bus layout with window seat indicators and aisle separation
- **💳 Secure Payment Processing**: Multiple payment options with booking confirmation
- **📱 Responsive Design**: Optimized for desktop, tablet, and mobile devices
- **📋 Booking Management**: View, cancel, and manage bookings with refund processing
- **⭐ Feedback System**: Rate trips and provide feedback with bidirectional admin responses
- **👤 User Dashboard**: Comprehensive overview of bookings, spending, and travel history
- **🎨 Modern UI**: Beautiful landing page with professional bus travel imagery

### 🔧 **Admin Features**
- **📊 Comprehensive Dashboard**: Real-time statistics with dropdown navigation menu
- **🚌 Bus Management**: Complete CRUD operations for bus fleet (formerly Fleet Management)
- **🗺️ Route Management**: Configure and manage bus routes with pricing
- **📅 Schedule Management**: Daily schedule management with 7-day operations
- **👨‍✈️ Driver Management**: Full driver profile management with experience tracking
- **👥 Staff Management**: Bus staff (conductors, cleaners) management with role assignments
- **👤 User Management**: User accounts with view, block/unblock, and deletion capabilities
- **💰 Payment & Refund Management**: Financial transaction oversight and processing
- **🔧 Maintenance Management**: Bus maintenance tracking and scheduling
- **💬 Feedback Management**: Customer feedback with admin response system
- **📈 Revenue Analytics**: Detailed financial reporting and business insights

## 🛠️ Technology Stack

### **Frontend**
- **React 18** - Modern UI library with hooks and context
- **Vite** - Fast build tool and development server
- **Tailwind CSS** - Utility-first CSS framework for responsive design
- **Lucide React** - Beautiful and consistent icon library
- **React Router** - Client-side routing and navigation

### **Backend**
- **Node.js** - JavaScript runtime environment
- **Express.js** - Fast and minimalist web framework
- **MySQL2** - Database driver with connection pooling
- **Express Session** - Session-based authentication
- **CORS** - Cross-origin resource sharing
- **Bcrypt** - Secure password hashing

### **Database**
- **MySQL** - Relational database management system
- **Connection Pooling** - Optimized database connections
- **Transaction Support** - ACID compliance for data integrity
- **Normalized Design** - Efficient 3NF database structure

## 🚀 Quick Start

### Prerequisites
- **Node.js** (v16 or higher)
- **MySQL** (v8.0 or higher)
- **npm** or **yarn**

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Bus-Reservation-System
   ```

2. **Install Backend Dependencies**
   ```bash
   cd backend
   npm install
   ```

3. **Install Frontend Dependencies**
   ```bash
   cd ../frontend
   npm install
   ```

4. **Database Setup**
   ```bash
   # Create MySQL database
   mysql -u root -p
   CREATE DATABASE bus_booking_system;
   
   # Import database schema
   mysql -u root -p bus_booking_system < backend/db/init.sql
   
   # Import sample data
   mysql -u root -p bus_booking_system < backend/db/sample-data.sql
   ```

5. **Environment Configuration**
   - Copy `.env.example` to `.env` in the backend directory and update values as needed.
   ```bash
   cp backend/.env.example backend/.env
   ```
   Example variables:
   ```env
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=your_password
   DB_NAME=bus_booking_system
   PORT=8080
   SESSION_SECRET=your_session_secret
   ```

6. **Start the Application**
   ```bash
   # Start Backend (Terminal 1)
   cd backend
   npm start
   
   # Start Frontend (Terminal 2)
   cd frontend
   npm run dev
   ```

7. **Access the Application**
   - **User Interface**: http://localhost:5173 (or your Vite dev port)
   - **Admin Dashboard**: http://localhost:5173/admin-login
   - **Backend API**: http://localhost:8080

## 🔐 Default Credentials

### Admin Access
- **Username**: `admin`
- **Password**: `admin123`
- **Features**: Full system management access

### Sample User Accounts
- **Email**: `user1@example.com` / **Password**: `password123`
- **Email**: `user2@example.com` / **Password**: `password123`

## 📁 Project Structure

```
zenbus/
├── frontend/                 # React frontend application
│   ├── src/
│   │   ├── components/       # Reusable UI components
│   │   │   └── UI/          # Button, Card, Input, etc.
│   │   ├── pages/           # Page components
│   │   │   ├── Admin/       # Admin dashboard pages
│   │   │   ├── Auth/        # Login/Register pages
│   │   │   ├── Dashboard/   # User dashboard
│   │   │   └── SeatSelection/ # Seat booking interface
│   │   ├── context/         # React context providers
│   │   ├── services/        # API service functions
│   │   └── App.jsx          # Main application component
│   ├── public/              # Static assets
│   └── package.json         # Frontend dependencies
│
├── backend/                 # Node.js backend application
│   ├── controllers/         # Request handlers
│   ├── models/             # Database models
│   ├── routes/             # API route definitions
│   ├── middleware/         # Authentication middleware
│   ├── db/                 # Database configuration
│   │   ├── init.sql        # Database schema
│   │   ├── sample-data.sql # Sample data
│   │   └── connection.js   # Database connection
│   ├── scripts/            # Utility scripts
│   └── server.js           # Main server file
│
└── README.md               # Project documentation
```

## 🎯 Key Features Implemented

### **Enhanced User Experience**
- ✅ **Professional Landing Page**: Hero section with bus travel imagery
- ✅ **Realistic Seat Selection**: Bus layout with driver section, aisle, and window indicators
- ✅ **Responsive Design**: Works seamlessly on all devices
- ✅ **Intuitive Navigation**: Clean and modern interface design

### **Advanced Admin Management**
- ✅ **Dropdown Navigation**: Modern dropdown menu replacing horizontal tabs
- ✅ **Bus Management**: Renamed from "Fleet Management" for clarity
- ✅ **User Deletion**: Cascading delete with all associated bookings and feedback
- ✅ **Block/Unblock Users**: User account status management
- ✅ **Feedback Responses**: Bidirectional communication with users

### **Robust Backend Architecture**
- ✅ **Session Management**: Secure user authentication
- ✅ **Database Transactions**: ACID compliance for data integrity
- ✅ **Error Handling**: Comprehensive error management
- ✅ **API Security**: Protected routes and input validation

## 🔧 API Endpoints

### **Authentication**
- `POST /api/users/register` - User registration
- `POST /api/users/login` - User login
- `POST /api/admin/login` - Admin login
- `POST /api/users/logout` - User logout

### **Booking System**
- `GET /api/buses/search` - Search available buses
- `POST /api/bookings` - Create new booking
- `GET /api/bookings/user` - Get user bookings
- `PUT /api/bookings/:id/cancel` - Cancel booking

### **Admin Management**
- `GET /api/admin/dashboard-stats` - Dashboard statistics
- `GET /api/drivers` - Driver management
- `GET /api/bus-staff` - Staff management
- `DELETE /api/admin/users/:id` - Delete user with cascade
- `PATCH /api/admin/users/:id/status` - Block/unblock user

### **Feedback System**
- `GET /api/feedback/user` - Get user feedback
- `PUT /api/feedback/:id` - Update feedback
- `PUT /api/feedback/:id/respond` - Admin response

## 🗄️ Database Schema

### **Core Tables**
- **users** - User accounts with status management
- **admins** - Administrator accounts
- **buses** - Bus fleet with capacity and type
- **routes** - Source-destination route definitions
- **bus_schedules** - Daily schedules with pricing
- **bookings** - Ticket reservations with passenger details
- **feedback** - Customer reviews with admin responses
- **drivers** - Driver profiles and assignments
- **bus_staff** - Staff management (conductors, cleaners)

### **Advanced Features**
- **Cascading Deletes**: User deletion removes all associated data
- **Transaction Safety**: All operations use database transactions
- **Data Integrity**: Foreign key constraints and validation
- **Audit Trail**: Complete booking and feedback history

## 🚀 Deployment Guide

### **Production Setup**
1. **Environment Variables**
   ```env
   NODE_ENV=production
   PORT=8080
   DB_HOST=your-production-host
   DB_USER=your-db-user
   DB_PASSWORD=your-secure-password
   SESSION_SECRET=your-strong-session-secret
   ```

2. **Database Optimization**
   - Enable MySQL query caching
   - Configure connection pooling
   - Set up automated backups

3. **Security Enhancements**
   - Use HTTPS certificates
   - Implement rate limiting
   - Configure CORS properly
   - Enable security headers

## 🧪 Testing Checklist

### **User Features**
- [ ] User registration and login
- [ ] Bus search with filters
- [ ] Seat selection interface
- [ ] Booking confirmation
- [ ] Payment processing
- [ ] Booking cancellation
- [ ] Feedback submission

### **Admin Features**
- [ ] Admin dashboard access
- [ ] Bus management CRUD
- [ ] Driver management
- [ ] Staff management
- [ ] User management (view/block/delete)
- [ ] Feedback management
- [ ] Revenue analytics

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support & Troubleshooting

### **Common Issues**
- **Database Connection**: Verify MySQL credentials and service status
- **Port Conflicts**: Change PORT in environment variables
- **CORS Errors**: Check backend CORS configuration

### **Performance Tips**
- Use connection pooling for database
- Implement caching for frequently accessed data
- Optimize images and assets
- Enable gzip compression

## 📬 Contact

For questions, suggestions, or support, please contact:
- **Email:** [your.email@example.com](mailto:your.email@example.com)
- **GitHub Issues:** [Open an issue](../../issues)

---

**🧘 ZenBus - Built with modern web technologies for peaceful and efficient bus travel management**

**⭐ Star this repository if you found it helpful!**
