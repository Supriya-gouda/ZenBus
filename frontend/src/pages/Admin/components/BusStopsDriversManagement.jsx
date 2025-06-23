import React, { useState, useEffect } from 'react';
import { Navigation, MapPin, UserCheck, Plus, Edit, Trash2, Search, Phone, Award, Users } from 'lucide-react';
import Card from '../../../components/UI/Card';
import Button from '../../../components/UI/Button';
import Badge from '../../../components/UI/Badge';
import adminService from '../../../services/adminService';

const BusStopsDriversManagement = () => {
  const [activeTab, setActiveTab] = useState('bus-stops');
  const [busStops, setBusStops] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [filteredBusStops, setFilteredBusStops] = useState([]);
  const [filteredDrivers, setFilteredDrivers] = useState([]);
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
    if (activeTab === 'bus-stops') {
      fetchBusStops();
    } else {
      fetchDrivers();
    }
  }, [activeTab]);

  useEffect(() => {
    applyFilters();
  }, [busStops, drivers, searchTerm, activeTab]);

  const fetchBusStops = async () => {
    try {
      setLoading(true);
      const result = await adminService.getAllBusStops();
      if (result.success) {
        setBusStops(result.stops);
      }
    } catch (error) {
      console.error('Error fetching bus stops:', error);
      // Use mock data as fallback
      setBusStops([
        {
          stop_id: 1,
          stop_name: 'Central Bus Station',
          city: 'Mumbai',
          state: 'Maharashtra',
          address: '123 Central Avenue, Mumbai',
          latitude: 19.0760,
          longitude: 72.8777,
          facilities: 'Waiting Area, Restrooms, Food Court, WiFi',
          status: 'Active',
          route_count: 5
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
          status: 'Active',
          route_count: 3
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const fetchDrivers = async () => {
    try {
      setLoading(true);
      const result = await adminService.getAllDrivers();
      if (result.success) {
        setDrivers(result.drivers);
      }
    } catch (error) {
      console.error('Error fetching drivers:', error);
      // Use mock data as fallback
      setDrivers([
        {
          driver_id: 1,
          full_name: 'Rajesh Kumar',
          license_number: 'DL123456789',
          contact_number: '+91-9876543210',
          experience_years: 8,
          address: '123 Driver Colony, Mumbai',
          date_of_birth: '1985-05-15',
          emergency_contact: '+91-9876543211',
          total_trips: 245,
          rating: 4.8
        },
        {
          driver_id: 2,
          full_name: 'Suresh Patel',
          license_number: 'DL987654321',
          contact_number: '+91-9876543220',
          experience_years: 12,
          address: '456 Transport Nagar, Pune',
          date_of_birth: '1980-08-22',
          emergency_contact: '+91-9876543221',
          total_trips: 389,
          rating: 4.9
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    if (activeTab === 'bus-stops') {
      let filtered = [...busStops];
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        filtered = filtered.filter(stop => 
          stop.stop_name.toLowerCase().includes(searchLower) ||
          stop.city.toLowerCase().includes(searchLower) ||
          stop.state.toLowerCase().includes(searchLower)
        );
      }
      setFilteredBusStops(filtered);
    } else {
      let filtered = [...drivers];
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        filtered = filtered.filter(driver => 
          driver.full_name.toLowerCase().includes(searchLower) ||
          driver.license_number.toLowerCase().includes(searchLower) ||
          driver.contact_number.includes(searchTerm)
        );
      }
      setFilteredDrivers(filtered);
    }
  };

  const handleBusStopSubmit = async (e) => {
    e.preventDefault();
    try {
      let result;
      if (editingItem) {
        result = await adminService.updateBusStop(editingItem.stop_id, busStopForm);
      } else {
        result = await adminService.createBusStop(busStopForm);
      }

      if (result.success) {
        await fetchBusStops();
        setShowModal(false);
        resetBusStopForm();
      }
    } catch (error) {
      console.error('Error saving bus stop:', error);
    }
  };

  const handleDriverSubmit = async (e) => {
    e.preventDefault();
    try {
      const driverData = {
        ...driverForm,
        experience_years: parseInt(driverForm.experience_years)
      };

      let result;
      if (editingItem) {
        result = await adminService.updateDriver(editingItem.driver_id, driverData);
      } else {
        result = await adminService.createDriver(driverData);
      }

      if (result.success) {
        await fetchDrivers();
        setShowModal(false);
        resetDriverForm();
      }
    } catch (error) {
      console.error('Error saving driver:', error);
    }
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    if (activeTab === 'bus-stops') {
      setBusStopForm({
        stop_name: item.stop_name,
        city: item.city,
        state: item.state,
        address: item.address || '',
        latitude: item.latitude ? item.latitude.toString() : '',
        longitude: item.longitude ? item.longitude.toString() : '',
        facilities: item.facilities || ''
      });
    } else {
      setDriverForm({
        full_name: item.full_name,
        license_number: item.license_number,
        contact_number: item.contact_number,
        experience_years: item.experience_years ? item.experience_years.toString() : '',
        address: item.address || '',
        date_of_birth: item.date_of_birth || '',
        emergency_contact: item.emergency_contact || ''
      });
    }
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    const itemType = activeTab === 'bus-stops' ? 'bus stop' : 'driver';
    if (window.confirm(`Are you sure you want to delete this ${itemType}?`)) {
      try {
        let result;
        if (activeTab === 'bus-stops') {
          result = await adminService.deleteBusStop(id);
        } else {
          result = await adminService.deleteDriver(id);
        }

        if (result.success) {
          if (activeTab === 'bus-stops') {
            await fetchBusStops();
          } else {
            await fetchDrivers();
          }
        }
      } catch (error) {
        console.error(`Error deleting ${itemType}:`, error);
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
    setEditingItem(null);
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
    setEditingItem(null);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Active':
        return 'success';
      case 'Inactive':
        return 'secondary';
      default:
        return 'secondary';
    }
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
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Bus Stops & Drivers Management</h2>
          <p className="text-gray-600">Manage bus stops and driver information</p>
        </div>
        <Button 
          onClick={() => setShowModal(true)}
          className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add New {activeTab === 'bus-stops' ? 'Bus Stop' : 'Driver'}
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-white p-1 rounded-lg shadow-sm">
        <button
          onClick={() => setActiveTab('bus-stops')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-md font-medium transition-all duration-200 ${
            activeTab === 'bus-stops'
              ? 'bg-gradient-to-r from-red-500 to-red-600 text-white shadow-md'
              : 'text-gray-600 hover:text-red-600 hover:bg-red-50'
          }`}
        >
          <Navigation className="w-4 h-4" />
          <span>Bus Stops</span>
        </button>
        <button
          onClick={() => setActiveTab('drivers')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-md font-medium transition-all duration-200 ${
            activeTab === 'drivers'
              ? 'bg-gradient-to-r from-red-500 to-red-600 text-white shadow-md'
              : 'text-gray-600 hover:text-red-600 hover:bg-red-50'
          }`}
        >
          <UserCheck className="w-4 h-4" />
          <span>Drivers</span>
        </button>
      </div>

      {/* Search */}
      <Card>
        <div className="flex items-center space-x-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder={`Search ${activeTab === 'bus-stops' ? 'bus stops' : 'drivers'}...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>
        </div>
      </Card>

      {/* Content based on active tab */}
      {activeTab === 'bus-stops' && (
        <div className="space-y-4">
          {filteredBusStops.map((stop) => (
            <Card key={stop.stop_id} className="p-6 hover:shadow-lg transition-shadow duration-200">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                    <Navigation className="w-6 h-6 text-red-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{stop.stop_name}</h3>
                    <p className="text-sm text-gray-600">{stop.city}, {stop.state}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Badge variant={getStatusColor(stop.status)} size="sm">
                    {stop.status}
                  </Badge>
                  <div className="flex space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEdit(stop)}
                      className="border-red-200 text-red-600 hover:bg-red-50"
                    >
                      <Edit className="w-4 h-4 mr-1" />
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="danger"
                      onClick={() => handleDelete(stop.stop_id)}
                    >
                      <Trash2 className="w-4 h-4 mr-1" />
                      Delete
                    </Button>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium text-gray-700">Address:</span>
                  <p className="text-gray-600">{stop.address || 'Not specified'}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Routes:</span>
                  <p className="text-gray-600">{stop.route_count} routes</p>
                </div>
                {stop.facilities && (
                  <div className="md:col-span-2">
                    <span className="font-medium text-gray-700">Facilities:</span>
                    <p className="text-gray-600">{stop.facilities}</p>
                  </div>
                )}
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
                  <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                    <UserCheck className="w-6 h-6 text-red-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{driver.full_name}</h3>
                    <p className="text-sm text-gray-600">License: {driver.license_number}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  {driver.rating && (
                    <div className="flex items-center space-x-1">
                      <Award className="w-4 h-4 text-yellow-500" />
                      <span className="text-sm font-medium">{driver.rating}</span>
                    </div>
                  )}
                  <div className="flex space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEdit(driver)}
                      className="border-red-200 text-red-600 hover:bg-red-50"
                    >
                      <Edit className="w-4 h-4 mr-1" />
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="danger"
                      onClick={() => handleDelete(driver.driver_id)}
                    >
                      <Trash2 className="w-4 h-4 mr-1" />
                      Delete
                    </Button>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="font-medium text-gray-700">Contact:</span>
                  <p className="text-gray-600 flex items-center">
                    <Phone className="w-4 h-4 mr-1" />
                    {driver.contact_number}
                  </p>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Experience:</span>
                  <p className="text-gray-600">{driver.experience_years} years</p>
                </div>
                {driver.total_trips && (
                  <div>
                    <span className="font-medium text-gray-700">Total Trips:</span>
                    <p className="text-gray-600">{driver.total_trips}</p>
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {editingItem ? 'Edit' : 'Add New'} {activeTab === 'bus-stops' ? 'Bus Stop' : 'Driver'}
            </h3>

            {activeTab === 'bus-stops' ? (
              <form onSubmit={handleBusStopSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Stop Name *</label>
                    <input
                      type="text"
                      value={busStopForm.stop_name}
                      onChange={(e) => setBusStopForm({ ...busStopForm, stop_name: e.target.value })}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">City *</label>
                    <input
                      type="text"
                      value={busStopForm.city}
                      onChange={(e) => setBusStopForm({ ...busStopForm, city: e.target.value })}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">State *</label>
                    <input
                      type="text"
                      value={busStopForm.state}
                      onChange={(e) => setBusStopForm({ ...busStopForm, state: e.target.value })}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Latitude</label>
                    <input
                      type="number"
                      step="any"
                      value={busStopForm.latitude}
                      onChange={(e) => setBusStopForm({ ...busStopForm, latitude: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Longitude</label>
                    <input
                      type="number"
                      step="any"
                      value={busStopForm.longitude}
                      onChange={(e) => setBusStopForm({ ...busStopForm, longitude: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                  <textarea
                    value={busStopForm.address}
                    onChange={(e) => setBusStopForm({ ...busStopForm, address: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Facilities</label>
                  <textarea
                    value={busStopForm.facilities}
                    onChange={(e) => setBusStopForm({ ...busStopForm, facilities: e.target.value })}
                    rows={3}
                    placeholder="e.g., Waiting Area, Restrooms, Food Court, WiFi"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>
                <div className="flex justify-end space-x-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowModal(false);
                      resetBusStopForm();
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700"
                  >
                    {editingItem ? 'Update' : 'Create'} Bus Stop
                  </Button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleDriverSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                    <input
                      type="text"
                      value={driverForm.full_name}
                      onChange={(e) => setDriverForm({ ...driverForm, full_name: e.target.value })}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">License Number *</label>
                    <input
                      type="text"
                      value={driverForm.license_number}
                      onChange={(e) => setDriverForm({ ...driverForm, license_number: e.target.value })}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Contact Number *</label>
                    <input
                      type="tel"
                      value={driverForm.contact_number}
                      onChange={(e) => setDriverForm({ ...driverForm, contact_number: e.target.value })}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Experience (Years)</label>
                    <input
                      type="number"
                      value={driverForm.experience_years}
                      onChange={(e) => setDriverForm({ ...driverForm, experience_years: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
                    <input
                      type="date"
                      value={driverForm.date_of_birth}
                      onChange={(e) => setDriverForm({ ...driverForm, date_of_birth: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Emergency Contact</label>
                    <input
                      type="tel"
                      value={driverForm.emergency_contact}
                      onChange={(e) => setDriverForm({ ...driverForm, emergency_contact: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                  <textarea
                    value={driverForm.address}
                    onChange={(e) => setDriverForm({ ...driverForm, address: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>
                <div className="flex justify-end space-x-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowModal(false);
                      resetDriverForm();
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700"
                  >
                    {editingItem ? 'Update' : 'Create'} Driver
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

export default BusStopsDriversManagement;
