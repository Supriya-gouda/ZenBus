import React, { useState, useEffect } from 'react';
import { Wrench, Calendar, DollarSign, AlertTriangle, CheckCircle, Clock, Plus, Edit, Trash2, Search, Filter } from 'lucide-react';
import Button from '../../../components/UI/Button';
import Card from '../../../components/UI/Card';
import Badge from '../../../components/UI/Badge';
import adminService from '../../../services/adminService';

const BusMaintenanceManagement = () => {
  const [maintenanceRecords, setMaintenanceRecords] = useState([]);
  const [filteredRecords, setFilteredRecords] = useState([]);
  const [buses, setBuses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [statistics, setStatistics] = useState({});
  const [filters, setFilters] = useState({
    status: '',
    busId: '',
    maintenanceType: '',
    dateRange: ''
  });
  const [formData, setFormData] = useState({
    busId: '',
    maintenanceType: '',
    description: '',
    scheduledDate: '',
    completionDate: '',
    cost: '',
    serviceProvider: '',
    priority: 'Medium'
  });

  useEffect(() => {
    fetchMaintenanceRecords();
    fetchBuses();
    fetchStatistics();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [maintenanceRecords, filters]);

  const fetchMaintenanceRecords = async () => {
    try {
      const result = await adminService.getAllMaintenance();
      if (result.success) {
        setMaintenanceRecords(result.maintenance || []);
      } else {
        console.error('Failed to fetch maintenance records:', result.error);
        setMaintenanceRecords([]);
      }
    } catch (error) {
      console.error('Error fetching maintenance records:', error);
      setMaintenanceRecords([]);
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

  const fetchStatistics = async () => {
    try {
      const result = await adminService.getMaintenanceStatistics();
      if (result.success) {
        setStatistics(result.statistics);
      } else {
        console.error('Failed to fetch maintenance statistics:', result.error);
        setStatistics({
          total_maintenance: 0,
          scheduled: 0,
          in_progress: 0,
          completed: 0,
          overdue: 0,
          total_cost: 0,
          average_cost: 0,
          buses_under_maintenance: 0
        });
      }
    } catch (error) {
      console.error('Error fetching statistics:', error);
      setStatistics({
        total_maintenance: 0,
        scheduled: 0,
        in_progress: 0,
        completed: 0,
        overdue: 0,
        total_cost: 0,
        average_cost: 0,
        buses_under_maintenance: 0
      });
    }
  };

  const applyFilters = () => {
    let filtered = [...maintenanceRecords];

    if (filters.status) {
      filtered = filtered.filter(record => record.status === filters.status);
    }

    if (filters.busId) {
      filtered = filtered.filter(record => record.bus_id === parseInt(filters.busId));
    }

    if (filters.maintenanceType) {
      filtered = filtered.filter(record => 
        record.maintenance_type.toLowerCase().includes(filters.maintenanceType.toLowerCase())
      );
    }

    if (filters.dateRange) {
      const [startDate, endDate] = filters.dateRange.split(',');
      filtered = filtered.filter(record => {
        const scheduledDate = record.scheduled_date;
        return scheduledDate >= startDate && scheduledDate <= endDate;
      });
    }

    setFilteredRecords(filtered);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const maintenanceData = {
        ...formData,
        busId: parseInt(formData.busId),
        cost: formData.cost ? parseFloat(formData.cost) : null
      };

      let result;
      if (editingRecord) {
        result = await adminService.updateMaintenance(editingRecord.maintenance_id, maintenanceData);
      } else {
        result = await adminService.createMaintenance(maintenanceData);
      }

      if (result.success) {
        await fetchMaintenanceRecords();
        await fetchStatistics();
        setShowModal(false);
        resetForm();
      }
    } catch (error) {
      console.error('Error saving maintenance record:', error);
    }
  };

  const handleEdit = (record) => {
    setEditingRecord(record);
    setFormData({
      busId: record.bus_id.toString(),
      maintenanceType: record.maintenance_type,
      description: record.description || '',
      scheduledDate: record.scheduled_date,
      completionDate: record.completion_date || '',
      cost: record.cost ? record.cost.toString() : '',
      serviceProvider: record.service_provider || '',
      priority: record.priority || 'Medium'
    });
    setShowModal(true);
  };

  const handleDelete = async (maintenanceId) => {
    if (window.confirm('Are you sure you want to delete this maintenance record?')) {
      try {
        const result = await adminService.deleteMaintenance(maintenanceId);
        if (result.success) {
          await fetchMaintenanceRecords();
          await fetchStatistics();
        }
      } catch (error) {
        console.error('Error deleting maintenance record:', error);
      }
    }
  };

  const handleMarkComplete = async (maintenanceId) => {
    try {
      const result = await adminService.updateMaintenance(maintenanceId, {
        status: 'Completed',
        completionDate: new Date().toISOString().split('T')[0]
      });

      if (result.success) {
        await fetchMaintenanceRecords();
        await fetchStatistics();
      }
    } catch (error) {
      console.error('Error marking maintenance as complete:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      busId: '',
      maintenanceType: '',
      description: '',
      scheduledDate: '',
      completionDate: '',
      cost: '',
      serviceProvider: '',
      priority: 'Medium'
    });
    setEditingRecord(null);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Completed':
        return 'success';
      case 'In Progress':
        return 'warning';
      case 'Scheduled':
        return 'secondary';
      case 'Overdue':
        return 'danger';
      default:
        return 'secondary';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'High':
        return 'danger';
      case 'Medium':
        return 'warning';
      case 'Low':
        return 'success';
      default:
        return 'secondary';
    }
  };

  const isOverdue = (scheduledDate, status) => {
    if (status === 'Completed') return false;
    const today = new Date();
    const scheduled = new Date(scheduledDate);
    return scheduled < today;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not set';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount) => {
    if (!amount) return 'Not specified';
    return `₹${amount.toLocaleString()}`;
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
          <h2 className="text-2xl font-bold text-gray-900">Bus Maintenance Management</h2>
          <p className="text-gray-600">Track maintenance schedules, costs, and exclude maintenance buses from bookings</p>
        </div>
        <Button
          onClick={() => setShowModal(true)}
          className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Schedule Maintenance
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="text-center">
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Wrench className="w-6 h-6 text-blue-600" />
          </div>
          <div className="text-2xl font-bold text-gray-900">{statistics.total_maintenance || 0}</div>
          <div className="text-sm text-gray-600">Total Maintenance</div>
        </Card>

        <Card className="text-center">
          <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Clock className="w-6 h-6 text-yellow-600" />
          </div>
          <div className="text-2xl font-bold text-gray-900">{statistics.in_progress || 0}</div>
          <div className="text-sm text-gray-600">In Progress</div>
        </Card>

        <Card className="text-center">
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-6 h-6 text-red-600" />
          </div>
          <div className="text-2xl font-bold text-gray-900">{statistics.overdue || 0}</div>
          <div className="text-sm text-gray-600">Overdue</div>
        </Card>

        <Card className="text-center">
          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <DollarSign className="w-6 h-6 text-green-600" />
          </div>
          <div className="text-2xl font-bold text-gray-900">₹{(statistics.total_cost || 0).toLocaleString()}</div>
          <div className="text-sm text-gray-600">Total Cost</div>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              <option value="">All Status</option>
              <option value="Scheduled">Scheduled</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
              <option value="Overdue">Overdue</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Bus</label>
            <select
              value={filters.busId}
              onChange={(e) => setFilters({ ...filters, busId: e.target.value })}
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
            <label className="block text-sm font-medium text-gray-700 mb-1">Maintenance Type</label>
            <input
              type="text"
              placeholder="Search maintenance type..."
              value={filters.maintenanceType}
              onChange={(e) => setFilters({ ...filters, maintenanceType: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date Range</label>
            <input
              type="date"
              value={filters.dateRange.split(',')[0] || ''}
              onChange={(e) => {
                const endDate = filters.dateRange.split(',')[1] || e.target.value;
                setFilters({ ...filters, dateRange: `${e.target.value},${endDate}` });
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>
          <div className="flex items-end">
            <Button
              onClick={() => setFilters({ status: '', busId: '', maintenanceType: '', dateRange: '' })}
              variant="outline"
              className="w-full border-red-200 text-red-600 hover:bg-red-50"
            >
              Clear Filters
            </Button>
          </div>
        </div>
      </Card>

      {/* Maintenance Records List */}
      <div className="space-y-4">
        {filteredRecords.map((record) => (
          <Card key={record.maintenance_id} className="hover:shadow-lg transition-shadow duration-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-red-100 rounded-lg">
                  <Wrench className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <h3 className="font-semibold text-gray-900">
                      {record.maintenance_type}
                    </h3>
                    <Badge
                      variant={isOverdue(record.scheduled_date, record.status) ? 'danger' : getStatusColor(record.status)}
                      size="sm"
                    >
                      {isOverdue(record.scheduled_date, record.status) ? 'Overdue' : record.status}
                    </Badge>
                    <Badge variant={getPriorityColor(record.priority)} size="sm">
                      {record.priority} Priority
                    </Badge>
                  </div>
                  <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                    <span><strong>Bus:</strong> {record.bus_number}</span>
                    <span><strong>Scheduled:</strong> {formatDate(record.scheduled_date)}</span>
                    {record.completion_date && (
                      <span><strong>Completed:</strong> {formatDate(record.completion_date)}</span>
                    )}
                  </div>
                  <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                    <span><strong>Cost:</strong> {formatCurrency(record.cost)}</span>
                    {record.service_provider && (
                      <span><strong>Provider:</strong> {record.service_provider}</span>
                    )}
                  </div>
                  {record.description && (
                    <p className="text-sm text-gray-700 mt-2">{record.description}</p>
                  )}
                </div>
              </div>
              <div className="flex space-x-2">
                {record.status !== 'Completed' && (
                  <Button
                    size="sm"
                    variant="success"
                    onClick={() => handleMarkComplete(record.maintenance_id)}
                  >
                    <CheckCircle className="w-4 h-4 mr-1" />
                    Mark Complete
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleEdit(record)}
                  className="border-red-200 text-red-600 hover:bg-red-50"
                >
                  <Edit className="w-4 h-4 mr-1" />
                  Edit
                </Button>
                <Button
                  size="sm"
                  variant="danger"
                  onClick={() => handleDelete(record.maintenance_id)}
                >
                  <Trash2 className="w-4 h-4 mr-1" />
                  Delete
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Add/Edit Maintenance Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {editingRecord ? 'Edit Maintenance Record' : 'Schedule New Maintenance'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Bus *</label>
                  <select
                    value={formData.busId}
                    onChange={(e) => setFormData({ ...formData, busId: e.target.value })}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                  >
                    <option value="">Select Bus</option>
                    {buses.map((bus) => (
                      <option key={bus.bus_id} value={bus.bus_id}>
                        {bus.bus_number} ({bus.bus_type})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Maintenance Type *</label>
                  <select
                    value={formData.maintenanceType}
                    onChange={(e) => setFormData({ ...formData, maintenanceType: e.target.value })}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                  >
                    <option value="">Select Type</option>
                    <option value="Engine Service">Engine Service</option>
                    <option value="Brake Inspection">Brake Inspection</option>
                    <option value="AC Repair">AC Repair</option>
                    <option value="Tire Replacement">Tire Replacement</option>
                    <option value="Body Work">Body Work</option>
                    <option value="Electrical">Electrical</option>
                    <option value="Routine Check">Routine Check</option>
                    <option value="Emergency Repair">Emergency Repair</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Scheduled Date *</label>
                  <input
                    type="date"
                    value={formData.scheduledDate}
                    onChange={(e) => setFormData({ ...formData, scheduledDate: e.target.value })}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Estimated Cost (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.cost}
                    onChange={(e) => setFormData({ ...formData, cost: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Service Provider</label>
                  <input
                    type="text"
                    value={formData.serviceProvider}
                    onChange={(e) => setFormData({ ...formData, serviceProvider: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>
                {editingRecord && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Completion Date</label>
                    <input
                      type="date"
                      value={formData.completionDate}
                      onChange={(e) => setFormData({ ...formData, completionDate: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                  </div>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  placeholder="Describe the maintenance work to be performed..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                />
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
                  {editingRecord ? 'Update Maintenance' : 'Schedule Maintenance'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default BusMaintenanceManagement;
