import React, { useState } from 'react';
import { Settings, Save, RefreshCw, Shield, Bell, Database, Mail } from 'lucide-react';
import Button from '../../../components/UI/Button';
import Card from '../../../components/UI/Card';

const SystemSettings = () => {
  const [settings, setSettings] = useState({
    // General Settings
    siteName: 'BusBook',
    siteDescription: 'Your trusted bus reservation platform',
    maintenanceMode: false,
    
    // Booking Settings
    maxAdvanceBookingDays: 30,
    cancellationDeadlineHours: 2,
    refundProcessingDays: 7,
    maxSeatsPerBooking: 6,
    
    // Payment Settings
    paymentGateway: 'stripe',
    currency: 'INR',
    taxRate: 18,
    
    // Notification Settings
    emailNotifications: true,
    smsNotifications: false,
    pushNotifications: true,
    
    // Security Settings
    sessionTimeout: 30,
    passwordMinLength: 8,
    twoFactorAuth: false,
    
    // System Settings
    backupFrequency: 'daily',
    logRetentionDays: 30,
    cacheTimeout: 3600
  });

  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('general');

  const handleSettingChange = (key, value) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      alert('Settings saved successfully!');
    } catch (error) {
      alert('Error saving settings');
    } finally {
      setSaving(false);
    }
  };

  const tabs = [
    { id: 'general', label: 'General', icon: Settings },
    { id: 'booking', label: 'Booking', icon: RefreshCw },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'system', label: 'System', icon: Database }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">System Settings</h2>
          <p className="text-gray-600">Configure application settings and preferences</p>
        </div>
        <Button
          onClick={handleSave}
          disabled={saving}
          className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700"
        >
          {saving ? (
            <>
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              Save Settings
            </>
          )}
        </Button>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                  activeTab === tab.id
                    ? 'border-red-500 text-red-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="space-y-6">
        {/* General Settings */}
        {activeTab === 'general' && (
          <Card>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">General Settings</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Site Name
                </label>
                <input
                  type="text"
                  value={settings.siteName}
                  onChange={(e) => handleSettingChange('siteName', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Site Description
                </label>
                <input
                  type="text"
                  value={settings.siteDescription}
                  onChange={(e) => handleSettingChange('siteDescription', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>
              <div className="md:col-span-2">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={settings.maintenanceMode}
                    onChange={(e) => handleSettingChange('maintenanceMode', e.target.checked)}
                    className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                  />
                  <span className="text-sm font-medium text-gray-700">Maintenance Mode</span>
                </label>
                <p className="text-sm text-gray-500 mt-1">
                  Enable to temporarily disable the site for maintenance
                </p>
              </div>
            </div>
          </Card>
        )}

        {/* Booking Settings */}
        {activeTab === 'booking' && (
          <Card>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Booking Settings</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Max Advance Booking Days
                </label>
                <input
                  type="number"
                  min="1"
                  max="365"
                  value={settings.maxAdvanceBookingDays}
                  onChange={(e) => handleSettingChange('maxAdvanceBookingDays', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cancellation Deadline (Hours)
                </label>
                <input
                  type="number"
                  min="1"
                  max="48"
                  value={settings.cancellationDeadlineHours}
                  onChange={(e) => handleSettingChange('cancellationDeadlineHours', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Refund Processing Days
                </label>
                <input
                  type="number"
                  min="1"
                  max="30"
                  value={settings.refundProcessingDays}
                  onChange={(e) => handleSettingChange('refundProcessingDays', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Max Seats Per Booking
                </label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={settings.maxSeatsPerBooking}
                  onChange={(e) => handleSettingChange('maxSeatsPerBooking', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>
            </div>
          </Card>
        )}

        {/* Notification Settings */}
        {activeTab === 'notifications' && (
          <Card>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Notification Settings</h3>
            <div className="space-y-4">
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={settings.emailNotifications}
                  onChange={(e) => handleSettingChange('emailNotifications', e.target.checked)}
                  className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                />
                <div>
                  <div className="text-sm font-medium text-gray-700">Email Notifications</div>
                  <div className="text-sm text-gray-500">Send booking confirmations and updates via email</div>
                </div>
              </label>
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={settings.smsNotifications}
                  onChange={(e) => handleSettingChange('smsNotifications', e.target.checked)}
                  className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                />
                <div>
                  <div className="text-sm font-medium text-gray-700">SMS Notifications</div>
                  <div className="text-sm text-gray-500">Send booking updates via SMS</div>
                </div>
              </label>
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={settings.pushNotifications}
                  onChange={(e) => handleSettingChange('pushNotifications', e.target.checked)}
                  className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                />
                <div>
                  <div className="text-sm font-medium text-gray-700">Push Notifications</div>
                  <div className="text-sm text-gray-500">Send real-time notifications to mobile apps</div>
                </div>
              </label>
            </div>
          </Card>
        )}

        {/* Security Settings */}
        {activeTab === 'security' && (
          <Card>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Security Settings</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Session Timeout (Minutes)
                </label>
                <input
                  type="number"
                  min="5"
                  max="120"
                  value={settings.sessionTimeout}
                  onChange={(e) => handleSettingChange('sessionTimeout', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password Min Length
                </label>
                <input
                  type="number"
                  min="6"
                  max="20"
                  value={settings.passwordMinLength}
                  onChange={(e) => handleSettingChange('passwordMinLength', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>
              <div className="md:col-span-2">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={settings.twoFactorAuth}
                    onChange={(e) => handleSettingChange('twoFactorAuth', e.target.checked)}
                    className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                  />
                  <span className="text-sm font-medium text-gray-700">Two-Factor Authentication</span>
                </label>
                <p className="text-sm text-gray-500 mt-1">
                  Require 2FA for admin accounts
                </p>
              </div>
            </div>
          </Card>
        )}

        {/* System Settings */}
        {activeTab === 'system' && (
          <Card>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">System Settings</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Backup Frequency
                </label>
                <select
                  value={settings.backupFrequency}
                  onChange={(e) => handleSettingChange('backupFrequency', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  <option value="hourly">Hourly</option>
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Log Retention (Days)
                </label>
                <input
                  type="number"
                  min="7"
                  max="365"
                  value={settings.logRetentionDays}
                  onChange={(e) => handleSettingChange('logRetentionDays', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cache Timeout (Seconds)
                </label>
                <input
                  type="number"
                  min="300"
                  max="86400"
                  value={settings.cacheTimeout}
                  onChange={(e) => handleSettingChange('cacheTimeout', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};

export default SystemSettings;
