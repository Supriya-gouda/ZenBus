import React, { useState, useEffect } from 'react';
import { Users, Mail, Phone, Calendar, Search, Eye, Trash2, Ban, CheckCircle } from 'lucide-react';
import Button from '../../../components/UI/Button';
import Card from '../../../components/UI/Card';
import Badge from '../../../components/UI/Badge';
import adminService from '../../../services/adminService';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [showUserModal, setShowUserModal] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [users, searchTerm]);

  const fetchUsers = async () => {
    try {
      const result = await adminService.getAllUsers();
      if (result.success) {
        setUsers(result.users);
      } else {
        // Fallback to mock data if API fails
        const mockUsers = [
          {
            user_id: 1,
            full_name: 'John Doe',
            email: 'john@example.com',
            phone: '+1234567890',
            created_at: '2024-01-15T10:30:00Z',
            total_bookings: 5,
            total_spent: 2500
          },
          {
            user_id: 2,
            full_name: 'Jane Smith',
            email: 'jane@example.com',
            phone: '+1234567891',
            created_at: '2024-02-20T14:15:00Z',
            total_bookings: 3,
            total_spent: 1800
          },
          {
            user_id: 3,
            full_name: 'Mike Johnson',
            email: 'mike@example.com',
            phone: '+1234567892',
            created_at: '2024-03-10T09:45:00Z',
            total_bookings: 8,
            total_spent: 4200
          }
        ];
        setUsers(mockUsers);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      // Use mock data as fallback
      const mockUsers = [
        {
          user_id: 1,
          full_name: 'John Doe',
          email: 'john@example.com',
          phone: '+1234567890',
          created_at: '2024-01-15T10:30:00Z',
          total_bookings: 5,
          total_spent: 2500
        }
      ];
      setUsers(mockUsers);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...users];

    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(user => 
        user.full_name.toLowerCase().includes(searchLower) ||
        user.email.toLowerCase().includes(searchLower) ||
        user.phone.includes(searchTerm)
      );
    }

    setFilteredUsers(filtered);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const viewUserDetails = (user) => {
    setSelectedUser(user);
    setShowUserModal(true);
  };

  const handleDeleteUser = async (userId, userName) => {
    const confirmMessage = `⚠️ DANGER: Are you sure you want to permanently delete user "${userName}"?

This action will:
• Delete the user account permanently
• Delete ALL their bookings and booking history
• Delete ALL their feedback and reviews
• Remove ALL their payment records
• Remove ALL associated data

⚠️ THIS CANNOT BE UNDONE! ⚠️

Type "DELETE" to confirm:`;

    const userInput = prompt(confirmMessage);

    if (userInput === 'DELETE') {
      try {
        setLoading(true);
        const result = await adminService.deleteUser(userId);
        if (result.success) {
          alert(`✅ User Deletion Successful!\n\n${result.message}\n\nDeleted:\n• User account: ${result.userName || userName}\n• Bookings: ${result.deletedBookings || 0}\n• Feedback: ${result.deletedFeedback || 0}`);
          await fetchUsers(); // Refresh the user list
        } else {
          alert('❌ Failed to delete user: ' + result.error);
        }
      } catch (error) {
        alert('❌ Error deleting user: ' + error.message);
      } finally {
        setLoading(false);
      }
    } else if (userInput !== null) {
      alert('❌ Deletion cancelled. You must type "DELETE" exactly to confirm.');
    }
  };

  const handleBlockUser = async (userId, userName, currentStatus) => {
    const action = currentStatus === 'blocked' ? 'unblock' : 'block';
    if (window.confirm(`Are you sure you want to ${action} user "${userName}"?`)) {
      try {
        const result = await adminService.toggleUserStatus(userId, action);
        if (result.success) {
          alert(`✅ User "${userName}" ${action}ed successfully.`);
          await fetchUsers(); // Refresh the user list
        } else {
          alert(`❌ Failed to ${action} user: ` + result.error);
        }
      } catch (error) {
        alert(`❌ Error ${action}ing user: ` + error.message);
      }
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
          <h2 className="text-2xl font-bold text-gray-900">User Management</h2>
          <p className="text-gray-600">View and manage registered users</p>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="text-center">
          <div className="text-2xl font-bold text-gray-900">{users.length}</div>
          <div className="text-sm text-gray-600">Total Users</div>
        </Card>
        <Card className="text-center">
          <div className="text-2xl font-bold text-green-600">
            {users.filter(u => new Date(u.created_at) > new Date(Date.now() - 30*24*60*60*1000)).length}
          </div>
          <div className="text-sm text-gray-600">New This Month</div>
        </Card>
        <Card className="text-center">
          <div className="text-2xl font-bold text-blue-600">
            {users.reduce((sum, u) => sum + u.total_bookings, 0)}
          </div>
          <div className="text-sm text-gray-600">Total Bookings</div>
        </Card>
        <Card className="text-center">
          <div className="text-2xl font-bold text-red-600">
            ₹{users.reduce((sum, u) => sum + u.total_spent, 0).toLocaleString()}
          </div>
          <div className="text-sm text-gray-600">Total Revenue</div>
        </Card>
      </div>

      {/* Search */}
      <Card className="p-4">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search users by name, email, or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
          />
        </div>
      </Card>

      {/* Users List */}
      <div className="space-y-4">
        {filteredUsers.map((user) => (
          <Card key={user.user_id} className="hover:shadow-lg transition-shadow duration-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-red-100 rounded-lg">
                  <Users className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <h3 className="font-semibold text-gray-900">{user.full_name}</h3>
                    <Badge variant={user.status === 'blocked' ? 'danger' : 'success'} size="sm">
                      {user.status === 'blocked' ? 'Blocked' : 'Active'}
                    </Badge>
                  </div>
                  <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                    <div className="flex items-center space-x-1">
                      <Mail className="w-4 h-4" />
                      <span>{user.email}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Phone className="w-4 h-4" />
                      <span>{user.phone}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Calendar className="w-4 h-4" />
                      <span>Joined {formatDate(user.created_at)}</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-6">
                <div className="text-center">
                  <div className="text-lg font-semibold text-gray-900">{user.total_bookings}</div>
                  <div className="text-sm text-gray-600">Bookings</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-semibold text-green-600">₹{user.total_spent.toLocaleString()}</div>
                  <div className="text-sm text-gray-600">Total Spent</div>
                </div>
                <div className="flex space-x-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => viewUserDetails(user)}
                    className="border-blue-200 text-blue-600 hover:bg-blue-50"
                  >
                    <Eye className="w-4 h-4 mr-1" />
                    View
                  </Button>
                  <Button
                    size="sm"
                    variant={user.status === 'blocked' ? 'success' : 'warning'}
                    onClick={() => handleBlockUser(user.user_id, user.full_name, user.status)}
                    className={user.status === 'blocked' ?
                      'bg-green-600 hover:bg-green-700 text-white' :
                      'bg-yellow-600 hover:bg-yellow-700 text-white'
                    }
                  >
                    {user.status === 'blocked' ? (
                      <>
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Unblock
                      </>
                    ) : (
                      <>
                        <Ban className="w-4 h-4 mr-1" />
                        Block
                      </>
                    )}
                  </Button>
                  <Button
                    size="sm"
                    variant="danger"
                    onClick={() => handleDeleteUser(user.user_id, user.full_name)}
                    className="bg-red-600 hover:bg-red-700 text-white"
                  >
                    <Trash2 className="w-4 h-4 mr-1" />
                    Delete
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {filteredUsers.length === 0 && (
        <Card className="text-center py-12">
          <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No users found</h3>
          <p className="text-gray-600">No users match your search criteria.</p>
        </Card>
      )}

      {/* User Details Modal */}
      {showUserModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-gray-900">User Details</h3>
              <button
                onClick={() => setShowUserModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-6">
              {/* User Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name
                  </label>
                  <div className="text-gray-900">{selectedUser.full_name}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <div className="text-gray-900">{selectedUser.email}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone
                  </label>
                  <div className="text-gray-900">{selectedUser.phone}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Registration Date
                  </label>
                  <div className="text-gray-900">{formatDate(selectedUser.created_at)}</div>
                </div>
              </div>

              {/* Statistics */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{selectedUser.total_bookings}</div>
                  <div className="text-sm text-gray-600">Total Bookings</div>
                </Card>
                <Card className="text-center">
                  <div className="text-2xl font-bold text-green-600">₹{selectedUser.total_spent.toLocaleString()}</div>
                  <div className="text-sm text-gray-600">Total Spent</div>
                </Card>
              </div>

              {/* Recent Bookings */}
              <div>
                <h4 className="text-lg font-medium text-gray-900 mb-3">Recent Bookings</h4>
                <div className="text-sm text-gray-600">
                  Booking history would be displayed here...
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-6">
              <Button
                onClick={() => setShowUserModal(false)}
                variant="secondary"
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
