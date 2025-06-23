import React, { useState, useEffect } from 'react';
import { Users, Plus, Search, Edit, Trash2, Phone, Briefcase, User } from 'lucide-react';
import Card from '../../../components/UI/Card';
import Button from '../../../components/UI/Button';
import Badge from '../../../components/UI/Badge';
import Modal from '../../../components/UI/Modal';
import adminService from '../../../services/adminService';

const BusStaffManagement = () => {
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingStaff, setEditingStaff] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    full_name: '',
    role: '',
    contact_number: '',
    email: '',
    address: '',
    date_of_joining: '',
    salary: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const staffRoles = [
    'Conductor',
    'Cleaner',
    'Mechanic',
    'Supervisor',
    'Ticket Collector',
    'Security Guard',
    'Maintenance Staff'
  ];

  useEffect(() => {
    fetchStaff();
  }, []);

  const fetchStaff = async () => {
    try {
      setLoading(true);
      const result = await adminService.getAllBusStaff();
      if (result.success) {
        setStaff(result.staff);
      } else {
        // Use mock data as fallback
        setStaff([
          {
            staff_id: 1,
            full_name: 'Ramesh Yadav',
            role: 'Conductor',
            contact_number: '+91-9876543301',
            email: 'ramesh.yadav@buscompany.com',
            address: '123 Staff Colony, Mumbai',
            date_of_joining: '2022-01-15',
            salary: 25000,
            status: 'Active'
          },
          {
            staff_id: 2,
            full_name: 'Priya Sharma',
            role: 'Cleaner',
            contact_number: '+91-9876543302',
            email: 'priya.sharma@buscompany.com',
            address: '456 Worker Street, Delhi',
            date_of_joining: '2022-03-20',
            salary: 18000,
            status: 'Active'
          },
          {
            staff_id: 3,
            full_name: 'Vikash Kumar',
            role: 'Mechanic',
            contact_number: '+91-9876543303',
            email: 'vikash.kumar@buscompany.com',
            address: '789 Mechanic Lane, Bangalore',
            date_of_joining: '2021-11-10',
            salary: 35000,
            status: 'Active'
          },
          {
            staff_id: 4,
            full_name: 'Sunita Devi',
            role: 'Supervisor',
            contact_number: '+91-9876543304',
            email: 'sunita.devi@buscompany.com',
            address: '321 Admin Block, Chennai',
            date_of_joining: '2020-08-05',
            salary: 45000,
            status: 'On Leave'
          }
        ]);
      }
    } catch (error) {
      console.error('Error fetching staff:', error);
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
      if (editingStaff) {
        result = await adminService.updateBusStaff(editingStaff.staff_id, formData);
      } else {
        result = await adminService.createBusStaff(formData);
      }

      if (result.success) {
        setSuccess(editingStaff ? 'Staff member updated successfully!' : 'Staff member added successfully!');
        await fetchStaff();
        setTimeout(() => {
          setShowModal(false);
          setEditingStaff(null);
          resetForm();
          setSuccess('');
        }, 1500);
      } else {
        setError(result.error || 'Failed to save staff member');
      }
    } catch (error) {
      console.error('Error saving staff:', error);
      setError('An error occurred while saving staff member');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (staffMember) => {
    setEditingStaff(staffMember);
    setFormData({
      full_name: staffMember.full_name,
      role: staffMember.role,
      contact_number: staffMember.contact_number,
      email: staffMember.email || '',
      address: staffMember.address || '',
      date_of_joining: staffMember.date_of_joining || '',
      salary: staffMember.salary || ''
    });
    setShowModal(true);
  };

  const handleDelete = async (staffId) => {
    if (window.confirm('Are you sure you want to delete this staff member?')) {
      try {
        const result = await adminService.deleteBusStaff(staffId);
        if (result.success) {
          await fetchStaff();
        }
      } catch (error) {
        console.error('Error deleting staff:', error);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      full_name: '',
      role: '',
      contact_number: '',
      email: '',
      address: '',
      date_of_joining: '',
      salary: ''
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

  const getRoleColor = (role) => {
    switch (role) {
      case 'Supervisor':
        return 'primary';
      case 'Mechanic':
        return 'info';
      case 'Conductor':
        return 'success';
      default:
        return 'secondary';
    }
  };

  const filteredStaff = staff.filter(staffMember =>
    staffMember.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    staffMember.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
    staffMember.contact_number.includes(searchTerm)
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
          <h2 className="text-2xl font-bold text-gray-900">Bus Staff Management</h2>
          <p className="text-gray-600">Manage bus staff members and their roles</p>
        </div>
        <Button onClick={() => setShowModal(true)} className="bg-red-600 hover:bg-red-700">
          <Plus className="w-4 h-4 mr-2" />
          Add Staff Member
        </Button>
      </div>

      {/* Search */}
      <Card className="p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search staff by name, role, or contact..."
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
            <div className="p-3 bg-blue-100 rounded-lg">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Staff</p>
              <p className="text-2xl font-bold text-gray-900">{staff.length}</p>
            </div>
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-lg">
              <User className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active Staff</p>
              <p className="text-2xl font-bold text-gray-900">
                {staff.filter(s => s.status === 'Active').length}
              </p>
            </div>
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center">
            <div className="p-3 bg-yellow-100 rounded-lg">
              <Briefcase className="w-6 h-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">On Leave</p>
              <p className="text-2xl font-bold text-gray-900">
                {staff.filter(s => s.status === 'On Leave').length}
              </p>
            </div>
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center">
            <div className="p-3 bg-purple-100 rounded-lg">
              <Briefcase className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Roles</p>
              <p className="text-2xl font-bold text-gray-900">
                {[...new Set(staff.map(s => s.role))].length}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Staff List */}
      <div className="space-y-4">
        {filteredStaff.map((staffMember) => (
          <Card key={staffMember.staff_id} className="p-6 hover:shadow-lg transition-shadow duration-200">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{staffMember.full_name}</h3>
                  <div className="flex items-center space-x-2">
                    <Badge variant={getRoleColor(staffMember.role)}>
                      {staffMember.role}
                    </Badge>
                    <Badge variant={getStatusColor(staffMember.status)}>
                      {staffMember.status}
                    </Badge>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleEdit(staffMember)}
                  className="border-red-200 text-red-600 hover:bg-red-50"
                >
                  <Edit className="w-4 h-4 mr-1" />
                  Edit
                </Button>
                <Button
                  size="sm"
                  variant="danger"
                  onClick={() => handleDelete(staffMember.staff_id)}
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
                <span className="font-medium">{staffMember.contact_number}</span>
              </div>
              {staffMember.email && (
                <div className="flex items-center space-x-2">
                  <span className="text-gray-600">Email:</span>
                  <span className="font-medium">{staffMember.email}</span>
                </div>
              )}
              {staffMember.salary && (
                <div className="flex items-center space-x-2">
                  <span className="text-gray-600">Salary:</span>
                  <span className="font-medium">₹{staffMember.salary.toLocaleString()}</span>
                </div>
              )}
            </div>
            
            {staffMember.address && (
              <div className="mt-3 text-sm">
                <span className="text-gray-600">Address:</span>
                <span className="ml-2 font-medium">{staffMember.address}</span>
              </div>
            )}
            
            {staffMember.date_of_joining && (
              <div className="mt-2 text-sm">
                <span className="text-gray-600">Joined:</span>
                <span className="ml-2 font-medium">
                  {new Date(staffMember.date_of_joining).toLocaleDateString()}
                </span>
              </div>
            )}
          </Card>
        ))}
      </div>

      {/* Add/Edit Staff Modal */}
      {showModal && (
        <Modal
          isOpen={showModal}
          onClose={() => {
            setShowModal(false);
            setEditingStaff(null);
            resetForm();
          }}
          title={editingStaff ? 'Edit Staff Member' : 'Add New Staff Member'}
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
                    Role *
                  </label>
                  <select
                    required
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  >
                    <option value="">Select Role</option>
                    {staffRoles.map(role => (
                      <option key={role} value={role}>{role}</option>
                    ))}
                  </select>
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
                    Email
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
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
                    Date of Joining
                  </label>
                  <input
                    type="date"
                    value={formData.date_of_joining}
                    onChange={(e) => setFormData({ ...formData, date_of_joining: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Salary (₹)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.salary}
                    onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
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
                  {submitting ? 'Saving...' : (editingStaff ? 'Update' : 'Add')} Staff Member
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => {
                    setShowModal(false);
                    setEditingStaff(null);
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

export default BusStaffManagement;
