import React, { useState, useEffect } from 'react';
import { Calendar, Clock, MapPin, Bus, User, Plus, Edit, Trash2, Search, Filter } from 'lucide-react';
import Card from '../../../../components/UI/Card';
import Button from '../../../../components/UI/Button';
import Badge from '../../../../components/UI/Badge';

const ScheduleManagement = () => {
  const [schedules, setSchedules] = useState([]);
  const [buses, setBuses] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState(null);
  const [filters, setFilters] = useState({
    source: '',
    destination: '',
    date: '',
    busId: ''
  });
  const [formData, setFormData] = useState({
    bus_id: '',
    route_id: '',
    driver_id: '',
    departure_time: '',
    arrival_time: '',
    fare: ''
  });

  useEffect(() => {
    fetchSchedules();
    fetchBuses();
    fetchRoutes();
    fetchDrivers();
  }, []);

  const fetchSchedules = async () => {
    try {
      setLoading(true);
      // Mock data - replace with actual API call
      const mockSchedules = [
        {
          schedule_id: 1,
          bus_number: 'BUS001',
          bus_type: 'AC Sleeper',
          source: 'Mumbai',
          destination: 'Pune',
          departure_time: '2024-01-15 08:00:00',
          arrival_time: '2024-01-15 12:00:00',
          fare: 500,
          available_seats: 35,
          total_seats: 40,
          driver_name: 'John Doe',
          total_bookings: 5
        },
        {
          schedule_id: 2,
          bus_number: 'BUS002',
          bus_type: 'Non-AC',
          source: 'Delhi',
          destination: 'Agra',
          departure_time: '2024-01-15 09:00:00',
          arrival_time: '2024-01-15 13:00:00',
          fare: 300,
          available_seats: 28,
          total_seats: 30,
          driver_name: 'Jane Smith',
          total_bookings: 2
        }
      ];
      setSchedules(mockSchedules);
    } catch (error) {
      console.error('Error fetching schedules:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchBuses = async () => {
    try {
      // Mock data - replace with actual API call
      setBuses([
        { bus_id: 1, bus_number: 'BUS001', bus_type: 'AC Sleeper', status: 'Active' },
        { bus_id: 2, bus_number: 'BUS002', bus_type: 'Non-AC', status: 'Active' }
      ]);
    } catch (error) {
      console.error('Error fetching buses:', error);
    }
  };

  const fetchRoutes = async () => {
    try {
      // Mock data - replace with actual API call
      setRoutes([
        { route_id: 1, source: 'Mumbai', destination: 'Pune', distance: 150 },
        { route_id: 2, source: 'Delhi', destination: 'Agra', distance: 200 }
      ]);
    } catch (error) {
      console.error('Error fetching routes:', error);
    }
  };

  const fetchDrivers = async () => {
    try {
      // Mock data - replace with actual API call
      setDrivers([
        { driver_id: 1, full_name: 'John Doe', license_number: 'DL001' },
        { driver_id: 2, full_name: 'Jane Smith', license_number: 'DL002' }
      ]);
    } catch (error) {
      console.error('Error fetching drivers:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingSchedule) {
        // Update schedule
        console.log('Updating schedule:', formData);
      } else {
        // Create new schedule
        console.log('Creating schedule:', formData);
      }
      setShowModal(false);
      setEditingSchedule(null);
      setFormData({
        bus_id: '',
        route_id: '',
        driver_id: '',
        departure_time: '',
        arrival_time: '',
        fare: ''
      });
      fetchSchedules();
    } catch (error) {
      console.error('Error saving schedule:', error);
    }
  };

  const handleEdit = (schedule) => {
    setEditingSchedule(schedule);
    setFormData({
      bus_id: schedule.bus_id || '',
      route_id: schedule.route_id || '',
      driver_id: schedule.driver_id || '',
      departure_time: schedule.departure_time || '',
      arrival_time: schedule.arrival_time || '',
      fare: schedule.fare || ''
    });
    setShowModal(true);
  };

  const handleDelete = async (scheduleId) => {
    if (window.confirm('Are you sure you want to delete this schedule?')) {
      try {
        console.log('Deleting schedule:', scheduleId);
        fetchSchedules();
      } catch (error) {
        console.error('Error deleting schedule:', error);
      }
    }
  };

  const formatDateTime = (dateTime) => {
    return new Date(dateTime).toLocaleString();
  };

  const getStatusColor = (availableSeats, totalSeats) => {
    const occupancy = ((totalSeats - availableSeats) / totalSeats) * 100;
    if (occupancy >= 90) return 'danger';
    if (occupancy >= 70) return 'warning';
    return 'success';
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white p-6 rounded-lg shadow-sm">
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/3"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Schedule Management</h2>
          <p className="text-gray-600">Manage bus schedules and assignments</p>
        </div>
        <Button onClick={() => setShowModal(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Schedule
        </Button>
      </div>

      {/* Filters */}
      <Card className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Source</label>
            <input
              type="text"
              value={filters.source}
              onChange={(e) => setFilters({ ...filters, source: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              placeholder="Enter source city"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Destination</label>
            <input
              type="text"
              value={filters.destination}
              onChange={(e) => setFilters({ ...filters, destination: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              placeholder="Enter destination city"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
            <input
              type="date"
              value={filters.date}
              onChange={(e) => setFilters({ ...filters, date: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Bus</label>
            <select
              value={filters.busId}
              onChange={(e) => setFilters({ ...filters, busId: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            >
              <option value="">All Buses</option>
              {buses.map((bus) => (
                <option key={bus.bus_id} value={bus.bus_id}>
                  {bus.bus_number} - {bus.bus_type}
                </option>
              ))}
            </select>
          </div>
        </div>
      </Card>

      {/* Schedules List */}
      <div className="space-y-4">
        {schedules.map((schedule) => (
          <Card key={schedule.schedule_id} className="p-6 hover:shadow-lg transition-shadow duration-200">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                  <Bus className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {schedule.bus_number} - {schedule.bus_type}
                  </h3>
                  <p className="text-sm text-gray-600">
                    <MapPin className="w-4 h-4 inline mr-1" />
                    {schedule.source} → {schedule.destination}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Badge variant={getStatusColor(schedule.available_seats, schedule.total_seats)}>
                  {schedule.available_seats}/{schedule.total_seats} seats
                </Badge>
                <Button variant="ghost" size="sm" onClick={() => handleEdit(schedule)}>
                  <Edit className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="sm" onClick={() => handleDelete(schedule.schedule_id)}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-gray-500">Departure</p>
                <p className="font-medium">{formatDateTime(schedule.departure_time)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Arrival</p>
                <p className="font-medium">{formatDateTime(schedule.arrival_time)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Fare</p>
                <p className="font-medium">₹{schedule.fare}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Driver</p>
                <p className="font-medium">{schedule.driver_name || 'Not assigned'}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold mb-4">
              {editingSchedule ? 'Edit Schedule' : 'Add New Schedule'}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Bus</label>
                <select
                  value={formData.bus_id}
                  onChange={(e) => setFormData({ ...formData, bus_id: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  required
                >
                  <option value="">Select Bus</option>
                  {buses.map((bus) => (
                    <option key={bus.bus_id} value={bus.bus_id}>
                      {bus.bus_number} - {bus.bus_type}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Route</label>
                <select
                  value={formData.route_id}
                  onChange={(e) => setFormData({ ...formData, route_id: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  required
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
                <label className="block text-sm font-medium text-gray-700 mb-2">Driver</label>
                <select
                  value={formData.driver_id}
                  onChange={(e) => setFormData({ ...formData, driver_id: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                >
                  <option value="">Select Driver</option>
                  {drivers.map((driver) => (
                    <option key={driver.driver_id} value={driver.driver_id}>
                      {driver.full_name} ({driver.license_number})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Departure Time</label>
                  <input
                    type="datetime-local"
                    value={formData.departure_time}
                    onChange={(e) => setFormData({ ...formData, departure_time: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Arrival Time</label>
                  <input
                    type="datetime-local"
                    value={formData.arrival_time}
                    onChange={(e) => setFormData({ ...formData, arrival_time: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Fare (₹)</label>
                <input
                  type="number"
                  value={formData.fare}
                  onChange={(e) => setFormData({ ...formData, fare: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  required
                  min="0"
                  step="0.01"
                />
              </div>

              <div className="flex space-x-3 pt-4">
                <Button type="submit" className="flex-1">
                  {editingSchedule ? 'Update' : 'Create'} Schedule
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => {
                    setShowModal(false);
                    setEditingSchedule(null);
                    setFormData({
                      bus_id: '',
                      route_id: '',
                      driver_id: '',
                      departure_time: '',
                      arrival_time: '',
                      fare: ''
                    });
                  }}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ScheduleManagement;
