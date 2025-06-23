import React, { useState, useEffect } from 'react';
import { Wrench, Calendar, AlertTriangle, CheckCircle, Clock, Plus, Edit, Trash2, Bus } from 'lucide-react';
import Card from '../../../../components/UI/Card';
import Button from '../../../../components/UI/Button';
import Badge from '../../../../components/UI/Badge';

const MaintenanceManagement = () => {
  const [maintenanceRecords, setMaintenanceRecords] = useState([]);
  const [buses, setBuses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [activeTab, setActiveTab] = useState('all');
  const [formData, setFormData] = useState({
    bus_id: '',
    maintenance_type: '',
    description: '',
    scheduled_date: '',
    cost: ''
  });

  const maintenanceTypes = [
    'Routine Check',
    'Engine Service',
    'Brake Service',
    'Tire Replacement',
    'AC Service',
    'Body Repair',
    'Electrical Work',
    'Emergency Repair'
  ];

  useEffect(() => {
    fetchMaintenanceRecords();
    fetchBuses();
  }, []);

  const fetchMaintenanceRecords = async () => {
    try {
      setLoading(true);
      // Mock data - replace with actual API call
      const mockRecords = [
        {
          maintenance_id: 1,
          bus_id: 1,
          bus_number: 'BUS001',
          bus_type: 'AC Sleeper',
          maintenance_type: 'Engine Service',
          description: 'Regular engine maintenance and oil change',
          scheduled_date: '2024-01-20',
          completion_date: null,
          status: 'Scheduled',
          cost: 5000
        },
        {
          maintenance_id: 2,
          bus_id: 2,
          bus_number: 'BUS002',
          bus_type: 'Non-AC',
          maintenance_type: 'Brake Service',
          description: 'Brake pad replacement and brake fluid change',
          scheduled_date: '2024-01-18',
          completion_date: '2024-01-18',
          status: 'Completed',
          cost: 3000
        },
        {
          maintenance_id: 3,
          bus_id: 1,
          bus_number: 'BUS001',
          bus_type: 'AC Sleeper',
          maintenance_type: 'AC Service',
          description: 'AC system cleaning and gas refill',
          scheduled_date: '2024-01-15',
          completion_date: null,
          status: 'In Progress',
          cost: 2500
        }
      ];
      setMaintenanceRecords(mockRecords);
    } catch (error) {
      console.error('Error fetching maintenance records:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchBuses = async () => {
    try {
      // Mock data - replace with actual API call
      setBuses([
        { bus_id: 1, bus_number: 'BUS001', bus_type: 'AC Sleeper', status: 'Active' },
        { bus_id: 2, bus_number: 'BUS002', bus_type: 'Non-AC', status: 'Active' },
        { bus_id: 3, bus_number: 'BUS003', bus_type: 'AC Seater', status: 'Maintenance' }
      ]);
    } catch (error) {
      console.error('Error fetching buses:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingRecord) {
        console.log('Updating maintenance record:', formData);
      } else {
        console.log('Creating maintenance record:', formData);
      }
      setShowModal(false);
      setEditingRecord(null);
      setFormData({
        bus_id: '',
        maintenance_type: '',
        description: '',
        scheduled_date: '',
        cost: ''
      });
      fetchMaintenanceRecords();
    } catch (error) {
      console.error('Error saving maintenance record:', error);
    }
  };

  const handleEdit = (record) => {
    setEditingRecord(record);
    setFormData({
      bus_id: record.bus_id,
      maintenance_type: record.maintenance_type,
      description: record.description,
      scheduled_date: record.scheduled_date,
      cost: record.cost
    });
    setShowModal(true);
  };

  const handleDelete = async (recordId) => {
    if (window.confirm('Are you sure you want to delete this maintenance record?')) {
      try {
        console.log('Deleting maintenance record:', recordId);
        fetchMaintenanceRecords();
      } catch (error) {
        console.error('Error deleting maintenance record:', error);
      }
    }
  };

  const handleStatusUpdate = async (recordId, newStatus) => {
    try {
      console.log('Updating status:', recordId, newStatus);
      fetchMaintenanceRecords();
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Scheduled':
        return <Clock className="w-4 h-4" />;
      case 'In Progress':
        return <Wrench className="w-4 h-4" />;
      case 'Completed':
        return <CheckCircle className="w-4 h-4" />;
      default:
        return <AlertTriangle className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Scheduled':
        return 'warning';
      case 'In Progress':
        return 'primary';
      case 'Completed':
        return 'success';
      default:
        return 'danger';
    }
  };

  const filteredRecords = maintenanceRecords.filter(record => {
    if (activeTab === 'all') return true;
    if (activeTab === 'scheduled') return record.status === 'Scheduled';
    if (activeTab === 'progress') return record.status === 'In Progress';
    if (activeTab === 'completed') return record.status === 'Completed';
    if (activeTab === 'overdue') {
      return record.status === 'Scheduled' && new Date(record.scheduled_date) < new Date();
    }
    return true;
  });

  const getStats = () => {
    const total = maintenanceRecords.length;
    const scheduled = maintenanceRecords.filter(r => r.status === 'Scheduled').length;
    const inProgress = maintenanceRecords.filter(r => r.status === 'In Progress').length;
    const completed = maintenanceRecords.filter(r => r.status === 'Completed').length;
    const overdue = maintenanceRecords.filter(r => 
      r.status === 'Scheduled' && new Date(r.scheduled_date) < new Date()
    ).length;

    return { total, scheduled, inProgress, completed, overdue };
  };

  const stats = getStats();

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
          <h2 className="text-2xl font-bold text-gray-900">Maintenance Management</h2>
          <p className="text-gray-600">Track and manage bus maintenance schedules</p>
        </div>
        <Button onClick={() => setShowModal(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Schedule Maintenance
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card className="p-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            <p className="text-sm text-gray-600">Total Records</p>
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-yellow-600">{stats.scheduled}</p>
            <p className="text-sm text-gray-600">Scheduled</p>
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-600">{stats.inProgress}</p>
            <p className="text-sm text-gray-600">In Progress</p>
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
            <p className="text-sm text-gray-600">Completed</p>
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-red-600">{stats.overdue}</p>
            <p className="text-sm text-gray-600">Overdue</p>
          </div>
        </Card>
      </div>

      {/* Filter Tabs */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
        {[
          { id: 'all', label: 'All', count: stats.total },
          { id: 'scheduled', label: 'Scheduled', count: stats.scheduled },
          { id: 'progress', label: 'In Progress', count: stats.inProgress },
          { id: 'completed', label: 'Completed', count: stats.completed },
          { id: 'overdue', label: 'Overdue', count: stats.overdue }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {tab.label} ({tab.count})
          </button>
        ))}
      </div>

      {/* Maintenance Records */}
      <div className="space-y-4">
        {filteredRecords.map((record) => (
          <Card key={record.maintenance_id} className="p-6 hover:shadow-lg transition-shadow duration-200">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                  <Wrench className="w-6 h-6 text-orange-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {record.bus_number} - {record.maintenance_type}
                  </h3>
                  <p className="text-sm text-gray-600">{record.description}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Badge variant={getStatusColor(record.status)}>
                  {getStatusIcon(record.status)}
                  <span className="ml-1">{record.status}</span>
                </Badge>
                <Button variant="ghost" size="sm" onClick={() => handleEdit(record)}>
                  <Edit className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="sm" onClick={() => handleDelete(record.maintenance_id)}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-gray-500">Bus</p>
                <p className="font-medium">{record.bus_number} ({record.bus_type})</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Scheduled Date</p>
                <p className="font-medium">{new Date(record.scheduled_date).toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Cost</p>
                <p className="font-medium">₹{record.cost?.toLocaleString() || 'TBD'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Actions</p>
                <div className="flex space-x-2">
                  {record.status === 'Scheduled' && (
                    <Button
                      size="xs"
                      onClick={() => handleStatusUpdate(record.maintenance_id, 'In Progress')}
                    >
                      Start
                    </Button>
                  )}
                  {record.status === 'In Progress' && (
                    <Button
                      size="xs"
                      variant="success"
                      onClick={() => handleStatusUpdate(record.maintenance_id, 'Completed')}
                    >
                      Complete
                    </Button>
                  )}
                </div>
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
              {editingRecord ? 'Edit Maintenance Record' : 'Schedule New Maintenance'}
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
                <label className="block text-sm font-medium text-gray-700 mb-2">Maintenance Type</label>
                <select
                  value={formData.maintenance_type}
                  onChange={(e) => setFormData({ ...formData, maintenance_type: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  required
                >
                  <option value="">Select Type</option>
                  {maintenanceTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  rows={3}
                  placeholder="Describe the maintenance work..."
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Scheduled Date</label>
                <input
                  type="date"
                  value={formData.scheduled_date}
                  onChange={(e) => setFormData({ ...formData, scheduled_date: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Estimated Cost (₹)</label>
                <input
                  type="number"
                  value={formData.cost}
                  onChange={(e) => setFormData({ ...formData, cost: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  min="0"
                  step="0.01"
                />
              </div>

              <div className="flex space-x-3 pt-4">
                <Button type="submit" className="flex-1">
                  {editingRecord ? 'Update' : 'Schedule'} Maintenance
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => {
                    setShowModal(false);
                    setEditingRecord(null);
                    setFormData({
                      bus_id: '',
                      maintenance_type: '',
                      description: '',
                      scheduled_date: '',
                      cost: ''
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

export default MaintenanceManagement;
