import React, { useState, useEffect } from 'react';
import { UserCheck, Plus, Search, Edit, Trash2, Phone, Calendar, Award, MapPin } from 'lucide-react';
import Card from '../../../components/UI/Card';
import Button from '../../../components/UI/Button';
import Badge from '../../../components/UI/Badge';
import Modal from '../../../components/UI/Modal';
import adminService from '../../../services/adminService';

const DriverManagement = () => {
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingDriver, setEditingDriver] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    full_name: '',
    license_number: '',
    contact_number: '',
    experience_years: '',
    address: '',
    date_of_birth: '',
    emergency_contact: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchDrivers();
  }, []);

  const fetchDrivers = async () => {
    try {
      setLoading(true);
      const result = await adminService.getAllDrivers();
      if (result.success) {
        setDrivers(result.drivers);
      } else {
        // Use mock data as fallback
        setDrivers([
          {
            driver_id: 1,
            full_name: 'Rajesh Kumar',
            license_number: 'DL123456789',
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
            full_name: 'Amit Sharma',
            license_number: 'DL987654321',
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
            full_name: 'Suresh Patel',
            license_number: 'DL456789123',
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
        ]);
      }
    } catch (error) {
      console.error('Error fetching drivers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    setSuccess('');

    try {
      let result;
      if (editingDriver) {
        result = await adminService.updateDriver(editingDriver.driver_id, formData);
      } else {
        result = await adminService.createDriver(formData);
      }

      if (result.success) {
        setSuccess(editingDriver ? 'Driver updated successfully!' : 'Driver added successfully!');
        await fetchDrivers();
        setTimeout(() => {
          setShowModal(false);
          setEditingDriver(null);
          resetForm();
          setSuccess('');
        }, 1500);
      } else {
        setError(result.error || 'Failed to save driver');
      }
    } catch (error) {
      console.error('Error saving driver:', error);
      setError('An error occurred while saving driver');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (driver) => {
    setEditingDriver(driver);
    setFormData({
      full_name: driver.full_name,
      license_number: driver.license_number,
      contact_number: driver.contact_number,
      experience_years: driver.experience_years,
      address: driver.address || '',
      date_of_birth: driver.date_of_birth || '',
      emergency_contact: driver.emergency_contact || ''
    });
    setShowModal(true);
  };

  const handleDelete = async (driverId) => {
    if (window.confirm('Are you sure you want to delete this driver?')) {
      try {
        const result = await adminService.deleteDriver(driverId);
        if (result.success) {
          await fetchDrivers();
        }
      } catch (error) {
        console.error('Error deleting driver:', error);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      full_name: '',
      license_number: '',
      contact_number: '',
      experience_years: '',
      address: '',
      date_of_birth: '',
      emergency_contact: ''
    });
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

  const filteredDrivers = drivers.filter(driver =>
    driver.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    driver.license_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    driver.contact_number.includes(searchTerm)
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-red-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Driver Management</h2>
          <p className="text-gray-600">Manage drivers and their assignments</p>
        </div>
        <Button onClick={() => setShowModal(true)} className="bg-red-600 hover:bg-red-700">
          <Plus className="w-4 h-4 mr-2" />
          Add Driver
        </Button>
      </div>

      {/* Search */}
      <Card className="p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search drivers by name, license, or contact..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
          />
        </div>
      </Card>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-lg">
              <UserCheck className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Drivers</p>
              <p className="text-2xl font-bold text-gray-900">{drivers.length}</p>
            </div>
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-lg">
              <UserCheck className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active Drivers</p>
              <p className="text-2xl font-bold text-gray-900">
                {drivers.filter(d => d.status === 'Active').length}
              </p>
            </div>
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center">
            <div className="p-3 bg-yellow-100 rounded-lg">
              <Calendar className="w-6 h-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">On Leave</p>
              <p className="text-2xl font-bold text-gray-900">
                {drivers.filter(d => d.status === 'On Leave').length}
              </p>
            </div>
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center">
            <div className="p-3 bg-purple-100 rounded-lg">
              <Award className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Avg Rating</p>
              <p className="text-2xl font-bold text-gray-900">
                {drivers.length > 0 ? 
                  (drivers.reduce((sum, d) => sum + (d.average_rating || 0), 0) / drivers.length).toFixed(1) : 
                  '0.0'
                }
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Drivers List */}
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
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="flex items-center space-x-2">
                <Phone className="w-4 h-4 text-gray-400" />
                <span className="text-gray-600">Contact:</span>
                <span className="font-medium">{driver.contact_number}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Calendar className="w-4 h-4 text-gray-400" />
                <span className="text-gray-600">Experience:</span>
                <span className="font-medium">{driver.experience_years} years</span>
              </div>
              <div className="flex items-center space-x-2">
                <Award className="w-4 h-4 text-gray-400" />
                <span className="text-gray-600">Rating:</span>
                <span className="font-medium">{driver.average_rating || 'N/A'}</span>
              </div>
            </div>
            
            {driver.address && (
              <div className="mt-3 flex items-center space-x-2 text-sm">
                <MapPin className="w-4 h-4 text-gray-400" />
                <span className="text-gray-600">Address:</span>
                <span className="font-medium">{driver.address}</span>
              </div>
            )}
            
            <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Total Assignments:</span>
                <span className="ml-2 font-medium">{driver.total_assignments || 0}</span>
              </div>
              <div>
                <span className="text-gray-600">Upcoming:</span>
                <span className="ml-2 font-medium">{driver.upcoming_assignments || 0}</span>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Add/Edit Driver Modal */}
      {showModal && (
        <Modal
          isOpen={showModal}
          onClose={() => {
            setShowModal(false);
            setEditingDriver(null);
            resetForm();
          }}
          title={editingDriver ? 'Edit Driver' : 'Add New Driver'}
        >
          <div className="p-6">
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                {error}
              </div>
            )}
            {success && (
              <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
                {success}
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.full_name}
                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    License Number *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.license_number}
                    onChange={(e) => setFormData({ ...formData, license_number: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Contact Number *
                  </label>
                  <input
                    type="tel"
                    required
                    value={formData.contact_number}
                    onChange={(e) => setFormData({ ...formData, contact_number: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Experience (Years)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.experience_years}
                    onChange={(e) => setFormData({ ...formData, experience_years: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Address
                </label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date of Birth
                  </label>
                  <input
                    type="date"
                    value={formData.date_of_birth}
                    onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Emergency Contact
                  </label>
                  <input
                    type="tel"
                    value={formData.emergency_contact}
                    onChange={(e) => setFormData({ ...formData, emergency_contact: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="flex space-x-3 pt-4">
                <Button
                  type="submit"
                  className="flex-1 bg-red-600 hover:bg-red-700"
                  disabled={submitting}
                >
                  {submitting ? 'Saving...' : (editingDriver ? 'Update' : 'Add')} Driver
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => {
                    setShowModal(false);
                    setEditingDriver(null);
                    resetForm();
                  }}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default DriverManagement;
