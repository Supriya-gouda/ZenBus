import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Eye, Bus, AlertCircle, CheckCircle } from 'lucide-react';
import Button from '../../../components/UI/Button';
import Card from '../../../components/UI/Card';
import Badge from '../../../components/UI/Badge';
import adminService from '../../../services/adminService';

const BusManagement = () => {
  const [buses, setBuses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingBus, setEditingBus] = useState(null);
  const [formData, setFormData] = useState({
    busNumber: '',
    busType: '',
    totalSeats: '',
    amenities: '',
    status: 'Active'
  });

  useEffect(() => {
    fetchBuses();
  }, []);

  const fetchBuses = async () => {
    try {
      const result = await adminService.getAllBuses();
      if (result.success) {
        setBuses(result.buses);
      }
    } catch (error) {
      console.error('Error fetching buses:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const busData = {
        ...formData,
        totalSeats: parseInt(formData.totalSeats)
      };

      let result;
      if (editingBus) {
        result = await adminService.updateBus(editingBus.bus_id, busData);
      } else {
        result = await adminService.createBus(busData);
      }

      if (result.success) {
        await fetchBuses();
        setShowModal(false);
        resetForm();
      }
    } catch (error) {
      console.error('Error saving bus:', error);
    }
  };

  const handleEdit = (bus) => {
    setEditingBus(bus);
    setFormData({
      busNumber: bus.bus_number,
      busType: bus.bus_type,
      totalSeats: bus.total_seats.toString(),
      amenities: bus.amenities || '',
      status: bus.status
    });
    setShowModal(true);
  };

  const handleDelete = async (busId) => {
    if (window.confirm('Are you sure you want to delete this bus?')) {
      try {
        const result = await adminService.deleteBus(busId);
        if (result.success) {
          await fetchBuses();
        }
      } catch (error) {
        console.error('Error deleting bus:', error);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      busNumber: '',
      busType: '',
      totalSeats: '',
      amenities: '',
      status: 'Active'
    });
    setEditingBus(null);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Active': return 'success';
      case 'Maintenance': return 'warning';
      case 'Inactive': return 'danger';
      default: return 'default';
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
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Bus Fleet Management</h2>
          <p className="text-gray-600">Manage your bus fleet and vehicle information</p>
        </div>
        <Button
          onClick={() => setShowModal(true)}
          className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add New Bus
        </Button>
      </div>

      {/* Bus Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {buses.map((bus) => (
          <Card key={bus.bus_id} className="hover:shadow-lg transition-shadow duration-200">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-red-100 rounded-lg">
                  <Bus className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{bus.bus_number}</h3>
                  <p className="text-sm text-gray-600">{bus.bus_type}</p>
                </div>
              </div>
              <Badge variant={getStatusColor(bus.status)} size="sm">
                {bus.status}
              </Badge>
            </div>

            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Total Seats:</span>
                <span className="font-medium">{bus.total_seats}</span>
              </div>
              {bus.amenities && (
                <div className="text-sm">
                  <span className="text-gray-600">Amenities:</span>
                  <p className="text-gray-800 mt-1">{bus.amenities}</p>
                </div>
              )}
            </div>

            <div className="flex space-x-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleEdit(bus)}
                className="flex-1"
              >
                <Edit className="w-4 h-4 mr-1" />
                Edit
              </Button>
              <Button
                size="sm"
                variant="danger"
                onClick={() => handleDelete(bus.bus_id)}
                className="flex-1"
              >
                <Trash2 className="w-4 h-4 mr-1" />
                Delete
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold mb-4">
              {editingBus ? 'Edit Bus' : 'Add New Bus'}
            </h3>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Bus Number
                </label>
                <input
                  type="text"
                  required
                  value={formData.busNumber}
                  onChange={(e) => setFormData({...formData, busNumber: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                  placeholder="e.g., BUS001"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Bus Type
                </label>
                <select
                  required
                  value={formData.busType}
                  onChange={(e) => setFormData({...formData, busType: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  <option value="">Select Type</option>
                  <option value="Standard">Standard</option>
                  <option value="Deluxe">Deluxe</option>
                  <option value="Luxury">Luxury</option>
                  <option value="Sleeper">Sleeper</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Total Seats
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  max="100"
                  value={formData.totalSeats}
                  onChange={(e) => setFormData({...formData, totalSeats: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                  placeholder="e.g., 40"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Amenities
                </label>
                <textarea
                  value={formData.amenities}
                  onChange={(e) => setFormData({...formData, amenities: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                  placeholder="e.g., AC, WiFi, USB Charging"
                  rows="3"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({...formData, status: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  <option value="Active">Active</option>
                  <option value="Maintenance">Maintenance</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>

              <div className="flex space-x-3 pt-4">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700"
                >
                  {editingBus ? 'Update' : 'Add'} Bus
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default BusManagement;
