import React, { useState, useEffect } from 'react';
import { Calendar, Clock, MapPin, Bus, DollarSign, Plus, Edit, Trash2, Search, Filter, AlertTriangle } from 'lucide-react';
import Button from '../../../components/UI/Button';
import Card from '../../../components/UI/Card';
import Badge from '../../../components/UI/Badge';
import adminService from '../../../services/adminService';

const BusScheduleManagement = () => {
  const [schedules, setSchedules] = useState([]);
  const [filteredSchedules, setFilteredSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState(null);
  const [buses, setBuses] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [conflicts, setConflicts] = useState([]);
  const [filters, setFilters] = useState({
    route: '',
    bus: '',
    driver: '',
    dateRange: '',
    status: ''
  });
  const [formData, setFormData] = useState({
    busId: '',
    routeId: '',
    driverId: '',
    departureTime: '',
    arrivalTime: '',
    fare: '',
    availableSeats: '',
    dateRange: {
      startDate: '',
      endDate: ''
    }
  });

  useEffect(() => {
    fetchSchedules();
    fetchBuses();
    fetchRoutes();
    fetchDrivers();
    checkScheduleConflicts();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [schedules, filters]);

  const fetchSchedules = async () => {
    try {
      const result = await adminService.getAllSchedules();
      if (result.success) {
        setSchedules(result.schedules);
      }
    } catch (error) {
      console.error('Error fetching schedules:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchBuses = async () => {
    try {
      const result = await adminService.getAllBuses();
      if (result.success) {
        setBuses(result.buses);
      }
    } catch (error) {
      console.error('Error fetching buses:', error);
    }
  };

  const fetchRoutes = async () => {
    try {
      const result = await adminService.getAllRoutes();
      if (result.success) {
        setRoutes(result.routes);
      }
    } catch (error) {
      console.error('Error fetching routes:', error);
    }
  };

  const fetchDrivers = async () => {
    try {
      const result = await adminService.getAllDrivers();
      if (result.success) {
        setDrivers(result.drivers);
      }
    } catch (error) {
      console.error('Error fetching drivers:', error);
    }
  };

  const checkScheduleConflicts = async () => {
    try {
      const result = await adminService.getScheduleConflicts();
      if (result.success) {
        setConflicts(result.conflicts);
      }
    } catch (error) {
      console.error('Error checking conflicts:', error);
    }
  };

  const applyFilters = () => {
    let filtered = [...schedules];

    if (filters.route) {
      filtered = filtered.filter(schedule => 
        schedule.route_id === parseInt(filters.route)
      );
    }

    if (filters.bus) {
      filtered = filtered.filter(schedule => 
        schedule.bus_id === parseInt(filters.bus)
      );
    }

    if (filters.driver) {
      filtered = filtered.filter(schedule => 
        schedule.driver_id === parseInt(filters.driver)
      );
    }

    if (filters.status) {
      filtered = filtered.filter(schedule => {
        const now = new Date();
        const departureTime = new Date(schedule.departure_time);
        
        switch (filters.status) {
          case 'upcoming':
            return departureTime > now;
          case 'completed':
            return departureTime < now;
          case 'available':
            return schedule.available_seats > 0;
          case 'full':
            return schedule.available_seats === 0;
          default:
            return true;
        }
      });
    }

    setFilteredSchedules(filtered);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const scheduleData = {
        ...formData,
        fare: parseFloat(formData.fare),
        availableSeats: parseInt(formData.availableSeats),
        busId: parseInt(formData.busId),
        routeId: parseInt(formData.routeId),
        driverId: formData.driverId ? parseInt(formData.driverId) : null
      };

      let result;
      if (editingSchedule) {
        result = await adminService.updateSchedule(editingSchedule.schedule_id, scheduleData);
      } else {
        result = await adminService.createSchedule(scheduleData);
      }

      if (result.success) {
        await fetchSchedules();
        await checkScheduleConflicts();
        setShowModal(false);
        resetForm();
      }
    } catch (error) {
      console.error('Error saving schedule:', error);
    }
  };

  const handleEdit = (schedule) => {
    setEditingSchedule(schedule);
    setFormData({
      busId: schedule.bus_id.toString(),
      routeId: schedule.route_id.toString(),
      driverId: schedule.driver_id ? schedule.driver_id.toString() : '',
      departureTime: schedule.departure_time.slice(0, 16),
      arrivalTime: schedule.arrival_time.slice(0, 16),
      fare: schedule.fare.toString(),
      availableSeats: schedule.available_seats.toString(),
      dateRange: {
        startDate: '',
        endDate: ''
      }
    });
    setShowModal(true);
  };

  const handleDelete = async (scheduleId) => {
    if (window.confirm('Are you sure you want to delete this schedule?')) {
      try {
        const result = await adminService.deleteSchedule(scheduleId);
        if (result.success) {
          await fetchSchedules();
          await checkScheduleConflicts();
        }
      } catch (error) {
        console.error('Error deleting schedule:', error);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      busId: '',
      routeId: '',
      driverId: '',
      departureTime: '',
      arrivalTime: '',
      fare: '',
      availableSeats: '',
      dateRange: {
        startDate: '',
        endDate: ''
      }
    });
    setEditingSchedule(null);
  };

  const getStatusBadge = (schedule) => {
    const now = new Date();
    const departureTime = new Date(schedule.departure_time);
    
    if (departureTime < now) {
      return <Badge variant="secondary" size="sm">Completed</Badge>;
    } else if (schedule.available_seats === 0) {
      return <Badge variant="danger" size="sm">Full</Badge>;
    } else if (schedule.available_seats < 5) {
      return <Badge variant="warning" size="sm">Few Seats</Badge>;
    } else {
      return <Badge variant="success" size="sm">Available</Badge>;
    }
  };

  const formatDateTime = (dateTime) => {
    return new Date(dateTime).toLocaleString();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Bus Schedule Management</h2>
          <p className="text-gray-600">Create, view, edit, and delete booking schedules for all buses</p>
        </div>
        <Button
          onClick={() => setShowModal(true)}
          className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add New Schedule
        </Button>
      </div>

      {/* Conflicts Alert */}
      {conflicts.length > 0 && (
        <Card className="bg-red-50 border-red-200">
          <div className="flex items-center space-x-3 text-red-700">
            <AlertTriangle className="w-5 h-5" />
            <div>
              <h3 className="font-semibold">Schedule Conflicts Detected</h3>
              <p className="text-sm">{conflicts.length} schedule conflicts found. Please review and resolve.</p>
            </div>
          </div>
        </Card>
      )}

      {/* Filters */}
      <Card>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Route</label>
            <select
              value={filters.route}
              onChange={(e) => setFilters({ ...filters, route: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              <option value="">All Routes</option>
              {routes.map((route) => (
                <option key={route.route_id} value={route.route_id}>
                  {route.source} → {route.destination}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Bus</label>
            <select
              value={filters.bus}
              onChange={(e) => setFilters({ ...filters, bus: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              <option value="">All Buses</option>
              {buses.map((bus) => (
                <option key={bus.bus_id} value={bus.bus_id}>
                  {bus.bus_number} ({bus.bus_type})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Driver</label>
            <select
              value={filters.driver}
              onChange={(e) => setFilters({ ...filters, driver: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              <option value="">All Drivers</option>
              {drivers.map((driver) => (
                <option key={driver.driver_id} value={driver.driver_id}>
                  {driver.full_name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              <option value="">All Status</option>
              <option value="upcoming">Upcoming</option>
              <option value="completed">Completed</option>
              <option value="available">Available</option>
              <option value="full">Full</option>
            </select>
          </div>
          <div className="flex items-end">
            <Button
              onClick={() => setFilters({ route: '', bus: '', driver: '', dateRange: '', status: '' })}
              variant="outline"
              className="w-full border-red-200 text-red-600 hover:bg-red-50"
            >
              Clear Filters
            </Button>
          </div>
        </div>
      </Card>

      {/* Schedules List */}
      <div className="space-y-4">
        {filteredSchedules.map((schedule) => (
          <Card key={schedule.schedule_id} className="hover:shadow-lg transition-shadow duration-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-red-100 rounded-lg">
                  <Calendar className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <h3 className="font-semibold text-gray-900">
                      {schedule.source} → {schedule.destination}
                    </h3>
                    {getStatusBadge(schedule)}
                  </div>
                  <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                    <div className="flex items-center space-x-1">
                      <Bus className="w-4 h-4" />
                      <span>{schedule.bus_number}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Clock className="w-4 h-4" />
                      <span>{formatDateTime(schedule.departure_time)}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <DollarSign className="w-4 h-4" />
                      <span>₹{schedule.fare}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <span>{schedule.available_seats} seats available</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex space-x-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleEdit(schedule)}
                  className="border-red-200 text-red-600 hover:bg-red-50"
                >
                  <Edit className="w-4 h-4 mr-1" />
                  Edit
                </Button>
                <Button
                  size="sm"
                  variant="danger"
                  onClick={() => handleDelete(schedule.schedule_id)}
                >
                  <Trash2 className="w-4 h-4 mr-1" />
                  Delete
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Add/Edit Schedule Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {editingSchedule ? 'Edit Schedule' : 'Add New Schedule'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Route *</label>
                  <select
                    value={formData.routeId}
                    onChange={(e) => setFormData({ ...formData, routeId: e.target.value })}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                  >
                    <option value="">Select Route</option>
                    {routes.map((route) => (
                      <option key={route.route_id} value={route.route_id}>
                        {route.source} → {route.destination}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Bus *</label>
                  <select
                    value={formData.busId}
                    onChange={(e) => setFormData({ ...formData, busId: e.target.value })}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                  >
                    <option value="">Select Bus</option>
                    {buses.filter(bus => bus.status === 'Active').map((bus) => (
                      <option key={bus.bus_id} value={bus.bus_id}>
                        {bus.bus_number} ({bus.bus_type}) - {bus.total_seats} seats
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Driver</label>
                  <select
                    value={formData.driverId}
                    onChange={(e) => setFormData({ ...formData, driverId: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                  >
                    <option value="">Select Driver (Optional)</option>
                    {drivers.map((driver) => (
                      <option key={driver.driver_id} value={driver.driver_id}>
                        {driver.full_name} - {driver.license_number}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Fare (₹) *</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.fare}
                    onChange={(e) => setFormData({ ...formData, fare: e.target.value })}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Departure Time *</label>
                  <input
                    type="datetime-local"
                    value={formData.departureTime}
                    onChange={(e) => setFormData({ ...formData, departureTime: e.target.value })}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Arrival Time *</label>
                  <input
                    type="datetime-local"
                    value={formData.arrivalTime}
                    onChange={(e) => setFormData({ ...formData, arrivalTime: e.target.value })}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700"
                >
                  {editingSchedule ? 'Update Schedule' : 'Create Schedule'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default BusScheduleManagement;
