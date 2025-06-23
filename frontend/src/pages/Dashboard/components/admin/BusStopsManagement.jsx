import React, { useState, useEffect } from 'react';
import { Navigation, MapPin, UserCheck, Plus, Edit, Trash2, Search, Phone, Award } from 'lucide-react';
import Card from '../../../../components/UI/Card';
import Button from '../../../../components/UI/Button';
import Badge from '../../../../components/UI/Badge';

const BusStopsManagement = () => {
  const [activeTab, setActiveTab] = useState('bus-stops');
  const [busStops, setBusStops] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [busStopForm, setBusStopForm] = useState({
    stop_name: '',
    city: '',
    state: '',
    address: '',
    latitude: '',
    longitude: '',
    facilities: ''
  });
  const [driverForm, setDriverForm] = useState({
    full_name: '',
    license_number: '',
    contact_number: '',
    experience_years: '',
    address: '',
    date_of_birth: '',
    emergency_contact: ''
  });

  useEffect(() => {
    fetchBusStops();
    fetchDrivers();
  }, []);

  const fetchBusStops = async () => {
    try {
      setLoading(true);
      // Mock data - replace with actual API call
      const mockBusStops = [
        {
          stop_id: 1,
          stop_name: 'Central Bus Station',
          city: 'Mumbai',
          state: 'Maharashtra',
          address: '123 Central Avenue, Mumbai',
          latitude: 19.0760,
          longitude: 72.8777,
          facilities: 'Waiting Area, Restrooms, Food Court, WiFi',
          status: 'Active'
        },
        {
          stop_id: 2,
          stop_name: 'Railway Station Bus Stop',
          city: 'Pune',
          state: 'Maharashtra',
          address: '456 Station Road, Pune',
          latitude: 18.5204,
          longitude: 73.8567,
          facilities: 'Waiting Area, Restrooms, Parking',
          status: 'Active'
        },
        {
          stop_id: 3,
          stop_name: 'Airport Bus Terminal',
          city: 'Delhi',
          state: 'Delhi',
          address: '789 Airport Road, Delhi',
          latitude: 28.7041,
          longitude: 77.1025,
          facilities: 'Waiting Area, Restrooms, Food Court, WiFi, ATM',
          status: 'Active'
        }
      ];
      setBusStops(mockBusStops);
    } catch (error) {
      console.error('Error fetching bus stops:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDrivers = async () => {
    try {
      // Mock data - replace with actual API call
      const mockDrivers = [
        {
          driver_id: 1,
          full_name: 'John Doe',
          license_number: 'DL001234567',
          contact_number: '+91-9876543210',
          experience_years: 8,
          address: '123 Main St, Mumbai',
          date_of_birth: '1985-05-15',
          emergency_contact: '+91-9876543211',
          total_assignments: 45,
          upcoming_assignments: 3,
          average_rating: 4.5,
          status: 'Active'
        },
        {
          driver_id: 2,
          full_name: 'Jane Smith',
          license_number: 'DL001234568',
          contact_number: '+91-9876543220',
          experience_years: 5,
          address: '456 Oak Ave, Delhi',
          date_of_birth: '1988-08-22',
          emergency_contact: '+91-9876543221',
          total_assignments: 32,
          upcoming_assignments: 2,
          average_rating: 4.7,
          status: 'Active'
        },
        {
          driver_id: 3,
          full_name: 'Mike Johnson',
          license_number: 'DL001234569',
          contact_number: '+91-9876543230',
          experience_years: 12,
          address: '789 Pine Rd, Bangalore',
          date_of_birth: '1980-12-10',
          emergency_contact: '+91-9876543231',
          total_assignments: 78,
          upcoming_assignments: 1,
          average_rating: 4.3,
          status: 'On Leave'
        }
      ];
      setDrivers(mockDrivers);
    } catch (error) {
      console.error('Error fetching drivers:', error);
    }
  };

  const handleBusStopSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingItem) {
        console.log('Updating bus stop:', busStopForm);
        // API call to update bus stop
      } else {
        console.log('Creating bus stop:', busStopForm);
        // API call to create bus stop
      }
      setShowModal(false);
      setEditingItem(null);
      resetBusStopForm();
      fetchBusStops();
    } catch (error) {
      console.error('Error saving bus stop:', error);
    }
  };

  const handleDriverSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingItem) {
        console.log('Updating driver:', driverForm);
        // API call to update driver
      } else {
        console.log('Creating driver:', driverForm);
        // API call to create driver
      }
      setShowModal(false);
      setEditingItem(null);
      resetDriverForm();
      fetchDrivers();
    } catch (error) {
      console.error('Error saving driver:', error);
    }
  };

  const handleEditBusStop = (busStop) => {
    setEditingItem(busStop);
    setBusStopForm({
      stop_name: busStop.stop_name,
      city: busStop.city,
      state: busStop.state,
      address: busStop.address,
      latitude: busStop.latitude,
      longitude: busStop.longitude,
      facilities: busStop.facilities
    });
    setShowModal(true);
  };

  const handleEditDriver = (driver) => {
    setEditingItem(driver);
    setDriverForm({
      full_name: driver.full_name,
      license_number: driver.license_number,
      contact_number: driver.contact_number,
      experience_years: driver.experience_years,
      address: driver.address,
      date_of_birth: driver.date_of_birth,
      emergency_contact: driver.emergency_contact
    });
    setShowModal(true);
  };

  const handleDeleteBusStop = async (stopId) => {
    if (window.confirm('Are you sure you want to delete this bus stop?')) {
      try {
        console.log('Deleting bus stop:', stopId);
        // API call to delete bus stop
        fetchBusStops();
      } catch (error) {
        console.error('Error deleting bus stop:', error);
      }
    }
  };

  const handleDeleteDriver = async (driverId) => {
    if (window.confirm('Are you sure you want to delete this driver?')) {
      try {
        console.log('Deleting driver:', driverId);
        // API call to delete driver
        fetchDrivers();
      } catch (error) {
        console.error('Error deleting driver:', error);
      }
    }
  };

  const resetBusStopForm = () => {
    setBusStopForm({
      stop_name: '',
      city: '',
      state: '',
      address: '',
      latitude: '',
      longitude: '',
      facilities: ''
    });
  };

  const resetDriverForm = () => {
    setDriverForm({
      full_name: '',
      license_number: '',
      contact_number: '',
      experience_years: '',
      address: '',
      date_of_birth: '',
      emergency_contact: ''
    });
  };

  const getExperienceLevel = (years) => {
    if (years < 2) return { label: 'Beginner', color: 'warning' };
    if (years < 5) return { label: 'Intermediate', color: 'primary' };
    if (years < 10) return { label: 'Experienced', color: 'success' };
    return { label: 'Expert', color: 'purple' };
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Active':
        return 'success';
      case 'On Leave':
        return 'warning';
      case 'Inactive':
        return 'danger';
      default:
        return 'secondary';
    }
  };

  const filteredBusStops = busStops.filter(stop =>
    stop.stop_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    stop.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
    stop.state.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredDrivers = drivers.filter(driver =>
    driver.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    driver.license_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    driver.contact_number.includes(searchTerm)
  );

  const getBusStopStats = () => {
    const total = busStops.length;
    const active = busStops.filter(s => s.status === 'Active').length;
    const cities = new Set(busStops.map(s => s.city)).size;
    const states = new Set(busStops.map(s => s.state)).size;

    return { total, active, cities, states };
  };

  const getDriverStats = () => {
    const total = drivers.length;
    const active = drivers.filter(d => d.status === 'Active').length;
    const onLeave = drivers.filter(d => d.status === 'On Leave').length;
    const avgExperience = drivers.reduce((sum, d) => sum + d.experience_years, 0) / total || 0;

    return { total, active, onLeave, avgExperience: avgExperience.toFixed(1) };
  };

  const busStopStats = getBusStopStats();
  const driverStats = getDriverStats();

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white p-6 rounded-lg shadow-sm">
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-1/3"></div>
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
          <h2 className="text-2xl font-bold text-gray-900">Bus Stops & Drivers Management</h2>
          <p className="text-gray-600">Manage bus stops and driver information</p>
        </div>
        <Button onClick={() => setShowModal(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add New {activeTab === 'bus-stops' ? 'Bus Stop' : 'Driver'}
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
        {[
          { id: 'bus-stops', label: 'Bus Stops', count: busStopStats.total },
          { id: 'drivers', label: 'Drivers', count: driverStats.total }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {tab.label} ({tab.count})
          </button>
        ))}
      </div>

      {/* Stats Cards */}
      {activeTab === 'bus-stops' && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Bus Stops</p>
                <p className="text-2xl font-bold text-gray-900">{busStopStats.total}</p>
              </div>
              <Navigation className="w-8 h-8 text-blue-600" />
            </div>
          </Card>
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Stops</p>
                <p className="text-2xl font-bold text-green-600">{busStopStats.active}</p>
              </div>
              <MapPin className="w-8 h-8 text-green-600" />
            </div>
          </Card>
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Cities Covered</p>
                <p className="text-2xl font-bold text-purple-600">{busStopStats.cities}</p>
              </div>
              <Navigation className="w-8 h-8 text-purple-600" />
            </div>
          </Card>
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">States Covered</p>
                <p className="text-2xl font-bold text-orange-600">{busStopStats.states}</p>
              </div>
              <MapPin className="w-8 h-8 text-orange-600" />
            </div>
          </Card>
        </div>
      )}

      {activeTab === 'drivers' && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Drivers</p>
                <p className="text-2xl font-bold text-gray-900">{driverStats.total}</p>
              </div>
              <UserCheck className="w-8 h-8 text-blue-600" />
            </div>
          </Card>
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Drivers</p>
                <p className="text-2xl font-bold text-green-600">{driverStats.active}</p>
              </div>
              <UserCheck className="w-8 h-8 text-green-600" />
            </div>
          </Card>
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">On Leave</p>
                <p className="text-2xl font-bold text-yellow-600">{driverStats.onLeave}</p>
              </div>
              <UserCheck className="w-8 h-8 text-yellow-600" />
            </div>
          </Card>
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Experience</p>
                <p className="text-2xl font-bold text-purple-600">{driverStats.avgExperience} years</p>
              </div>
              <Award className="w-8 h-8 text-purple-600" />
            </div>
          </Card>
        </div>
      )}

      {/* Search */}
      <Card className="p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder={`Search ${activeTab === 'bus-stops' ? 'bus stops' : 'drivers'}...`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
          />
        </div>
      </Card>

      {/* Content based on active tab */}
      {activeTab === 'bus-stops' && (
        <div className="space-y-4">
          {filteredBusStops.map((stop) => (
            <Card key={stop.stop_id} className="p-6 hover:shadow-lg transition-shadow duration-200">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <Navigation className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{stop.stop_name}</h3>
                    <p className="text-sm text-gray-600">{stop.city}, {stop.state}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant={getStatusColor(stop.status)}>
                    {stop.status}
                  </Badge>
                  <Button variant="ghost" size="sm" onClick={() => handleEditBusStop(stop)}>
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => handleDeleteBusStop(stop.stop_id)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Address</p>
                  <p className="font-medium">{stop.address}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Coordinates</p>
                  <p className="font-medium">{stop.latitude}, {stop.longitude}</p>
                </div>
              </div>

              <div className="mt-4">
                <p className="text-sm text-gray-500">Facilities</p>
                <p className="text-sm text-gray-700">{stop.facilities}</p>
              </div>
            </Card>
          ))}
        </div>
      )}

      {activeTab === 'drivers' && (
        <div className="space-y-4">
          {filteredDrivers.map((driver) => (
            <Card key={driver.driver_id} className="p-6 hover:shadow-lg transition-shadow duration-200">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <UserCheck className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{driver.full_name}</h3>
                    <p className="text-sm text-gray-600">License: {driver.license_number}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant={getStatusColor(driver.status)}>
                    {driver.status}
                  </Badge>
                  <Badge variant={getExperienceLevel(driver.experience_years).color}>
                    {getExperienceLevel(driver.experience_years).label}
                  </Badge>
                  <Button variant="ghost" size="sm" onClick={() => handleEditDriver(driver)}>
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => handleDeleteDriver(driver.driver_id)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Contact</p>
                  <p className="font-medium">{driver.contact_number}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Experience</p>
                  <p className="font-medium">{driver.experience_years} years</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Total Trips</p>
                  <p className="font-medium">{driver.total_assignments}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Rating</p>
                  <p className="font-medium">⭐ {driver.average_rating}/5.0</p>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Address</p>
                    <p className="text-sm">{driver.address}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Emergency Contact</p>
                    <p className="text-sm">{driver.emergency_contact}</p>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">
              {editingItem ? 'Edit' : 'Add New'} {activeTab === 'bus-stops' ? 'Bus Stop' : 'Driver'}
            </h3>

            {activeTab === 'bus-stops' ? (
              <form onSubmit={handleBusStopSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Stop Name</label>
                    <input
                      type="text"
                      value={busStopForm.stop_name}
                      onChange={(e) => setBusStopForm({ ...busStopForm, stop_name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
                    <input
                      type="text"
                      value={busStopForm.city}
                      onChange={(e) => setBusStopForm({ ...busStopForm, city: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">State</label>
                  <input
                    type="text"
                    value={busStopForm.state}
                    onChange={(e) => setBusStopForm({ ...busStopForm, state: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                  <textarea
                    value={busStopForm.address}
                    onChange={(e) => setBusStopForm({ ...busStopForm, address: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    rows={3}
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Latitude</label>
                    <input
                      type="number"
                      step="any"
                      value={busStopForm.latitude}
                      onChange={(e) => setBusStopForm({ ...busStopForm, latitude: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Longitude</label>
                    <input
                      type="number"
                      step="any"
                      value={busStopForm.longitude}
                      onChange={(e) => setBusStopForm({ ...busStopForm, longitude: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Facilities</label>
                  <textarea
                    value={busStopForm.facilities}
                    onChange={(e) => setBusStopForm({ ...busStopForm, facilities: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    rows={2}
                    placeholder="e.g., Waiting Area, Restrooms, Food Court, WiFi"
                  />
                </div>

                <div className="flex space-x-3 pt-4">
                  <Button type="submit" className="flex-1">
                    {editingItem ? 'Update' : 'Add'} Bus Stop
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => {
                      setShowModal(false);
                      setEditingItem(null);
                      resetBusStopForm();
                    }}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleDriverSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                    <input
                      type="text"
                      value={driverForm.full_name}
                      onChange={(e) => setDriverForm({ ...driverForm, full_name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">License Number</label>
                    <input
                      type="text"
                      value={driverForm.license_number}
                      onChange={(e) => setDriverForm({ ...driverForm, license_number: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Contact Number</label>
                    <input
                      type="tel"
                      value={driverForm.contact_number}
                      onChange={(e) => setDriverForm({ ...driverForm, contact_number: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Experience (Years)</label>
                    <input
                      type="number"
                      value={driverForm.experience_years}
                      onChange={(e) => setDriverForm({ ...driverForm, experience_years: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      min="0"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Date of Birth</label>
                    <input
                      type="date"
                      value={driverForm.date_of_birth}
                      onChange={(e) => setDriverForm({ ...driverForm, date_of_birth: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Emergency Contact</label>
                    <input
                      type="tel"
                      value={driverForm.emergency_contact}
                      onChange={(e) => setDriverForm({ ...driverForm, emergency_contact: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                  <textarea
                    value={driverForm.address}
                    onChange={(e) => setDriverForm({ ...driverForm, address: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    rows={3}
                    placeholder="Enter full address..."
                  />
                </div>

                <div className="flex space-x-3 pt-4">
                  <Button type="submit" className="flex-1">
                    {editingItem ? 'Update' : 'Add'} Driver
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => {
                      setShowModal(false);
                      setEditingItem(null);
                      resetDriverForm();
                    }}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default BusStopsManagement;