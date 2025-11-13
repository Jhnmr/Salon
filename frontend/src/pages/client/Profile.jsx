import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Card, Button, Input, Badge, Modal } from '../../components/ui';
import { getEmailError, getPasswordError, getPasswordConfirmationError, getRequiredError } from '../../utils/validators';

/**
 * Client Profile Page
 * Manage client profile and account settings
 */
const ClientProfile = () => {
  const { user, updateProfile, changePassword, isLoading } = useAuth();

  const [activeTab, setActiveTab] = useState('personal');
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Personal Info
  const [personalData, setPersonalData] = useState({
    name: '',
    email: '',
    phone: '',
    avatar: '',
  });
  const [personalErrors, setPersonalErrors] = useState({});

  // Password Change
  const [passwordData, setPasswordData] = useState({
    current_password: '',
    new_password: '',
    new_password_confirmation: '',
  });
  const [passwordErrors, setPasswordErrors] = useState({});

  // Notification Preferences
  const [notifications, setNotifications] = useState({
    email_notifications: true,
    sms_notifications: false,
    push_notifications: true,
    promotional_emails: true,
  });

  useEffect(() => {
    if (user) {
      setPersonalData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        avatar: user.avatar || '',
      });
    }
  }, [user]);

  /**
   * Handle personal info change
   */
  const handlePersonalChange = (e) => {
    const { name, value } = e.target;
    setPersonalData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (personalErrors[name]) {
      setPersonalErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  /**
   * Validate personal info
   */
  const validatePersonalInfo = () => {
    const errors = {};

    const nameError = getRequiredError(personalData.name, 'Name');
    if (nameError) errors.name = nameError;

    const emailError = getEmailError(personalData.email);
    if (emailError) errors.email = emailError;

    setPersonalErrors(errors);
    return Object.keys(errors).length === 0;
  };

  /**
   * Save personal info
   */
  const handleSavePersonalInfo = async () => {
    if (!validatePersonalInfo()) return;

    try {
      await updateProfile(personalData);
      setIsEditing(false);
    } catch (error) {
      if (error.errors) {
        setPersonalErrors(error.errors);
      }
    }
  };

  /**
   * Handle password change
   */
  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (passwordErrors[name]) {
      setPasswordErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  /**
   * Validate password form
   */
  const validatePasswordForm = () => {
    const errors = {};

    if (!passwordData.current_password) {
      errors.current_password = 'Current password is required';
    }

    const newPasswordError = getPasswordError(passwordData.new_password);
    if (newPasswordError) errors.new_password = newPasswordError;

    const confirmError = getPasswordConfirmationError(
      passwordData.new_password,
      passwordData.new_password_confirmation
    );
    if (confirmError) errors.new_password_confirmation = confirmError;

    setPasswordErrors(errors);
    return Object.keys(errors).length === 0;
  };

  /**
   * Save password change
   */
  const handleSavePassword = async () => {
    if (!validatePasswordForm()) return;

    try {
      await changePassword(
        passwordData.current_password,
        passwordData.new_password,
        passwordData.new_password_confirmation
      );
      setPasswordData({
        current_password: '',
        new_password: '',
        new_password_confirmation: '',
      });
    } catch (error) {
      if (error.errors) {
        setPasswordErrors(error.errors);
      }
    }
  };

  /**
   * Handle notification toggle
   */
  const handleNotificationToggle = (key) => {
    setNotifications((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  /**
   * Save notification preferences
   */
  const handleSaveNotifications = async () => {
    try {
      await updateProfile({ notifications });
    } catch (error) {
      console.error('Failed to save notifications:', error);
    }
  };

  const tabs = [
    { id: 'personal', label: 'Personal Info', icon: '👤' },
    { id: 'security', label: 'Security', icon: '🔒' },
    { id: 'notifications', label: 'Notifications', icon: '🔔' },
    { id: 'stats', label: 'Statistics', icon: '📊' },
  ];

  /**
   * Render tab content
   */
  const renderTabContent = () => {
    switch (activeTab) {
      case 'personal':
        return (
          <div className="space-y-6">
            {/* Avatar */}
            <div className="flex items-center space-x-6">
              <img
                src={personalData.avatar || '/placeholder-avatar.png'}
                alt={personalData.name}
                className="w-24 h-24 rounded-full object-cover"
              />
              <div>
                <h3 className="text-white font-semibold mb-1">{personalData.name}</h3>
                <p className="text-gray-400 text-sm mb-2">{personalData.email}</p>
                <Button variant="secondary" size="sm" disabled>
                  Change Photo
                </Button>
              </div>
            </div>

            {/* Personal Info Form */}
            <div className="space-y-4">
              <Input
                type="text"
                name="name"
                label="Full Name"
                value={personalData.name}
                onChange={handlePersonalChange}
                error={personalErrors.name}
                disabled={!isEditing || isLoading}
                required
                fullWidth
              />

              <Input
                type="email"
                name="email"
                label="Email Address"
                value={personalData.email}
                onChange={handlePersonalChange}
                error={personalErrors.email}
                disabled={!isEditing || isLoading}
                required
                fullWidth
              />

              <Input
                type="tel"
                name="phone"
                label="Phone Number"
                value={personalData.phone}
                onChange={handlePersonalChange}
                error={personalErrors.phone}
                disabled={!isEditing || isLoading}
                fullWidth
              />
            </div>

            {/* Actions */}
            <div className="flex space-x-3">
              {!isEditing ? (
                <Button variant="primary" onClick={() => setIsEditing(true)}>
                  Edit Profile
                </Button>
              ) : (
                <>
                  <Button variant="primary" onClick={handleSavePersonalInfo} isLoading={isLoading}>
                    Save Changes
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={() => {
                      setIsEditing(false);
                      setPersonalErrors({});
                      if (user) {
                        setPersonalData({
                          name: user.name || '',
                          email: user.email || '',
                          phone: user.phone || '',
                          avatar: user.avatar || '',
                        });
                      }
                    }}
                    disabled={isLoading}
                  >
                    Cancel
                  </Button>
                </>
              )}
            </div>
          </div>
        );

      case 'security':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-white font-semibold mb-2">Change Password</h3>
              <p className="text-gray-400 text-sm">
                Update your password to keep your account secure
              </p>
            </div>

            <div className="space-y-4">
              <Input
                type="password"
                name="current_password"
                label="Current Password"
                value={passwordData.current_password}
                onChange={handlePasswordChange}
                error={passwordErrors.current_password}
                disabled={isLoading}
                required
                fullWidth
              />

              <Input
                type="password"
                name="new_password"
                label="New Password"
                value={passwordData.new_password}
                onChange={handlePasswordChange}
                error={passwordErrors.new_password}
                disabled={isLoading}
                required
                fullWidth
                helpText="At least 8 characters, one uppercase, one lowercase, one number"
              />

              <Input
                type="password"
                name="new_password_confirmation"
                label="Confirm New Password"
                value={passwordData.new_password_confirmation}
                onChange={handlePasswordChange}
                error={passwordErrors.new_password_confirmation}
                disabled={isLoading}
                required
                fullWidth
              />
            </div>

            <Button variant="primary" onClick={handleSavePassword} isLoading={isLoading}>
              Update Password
            </Button>

            {/* Danger Zone */}
            <div className="pt-6 border-t border-gray-700">
              <h3 className="text-white font-semibold mb-2">Danger Zone</h3>
              <Card className="bg-red-500/10 border-red-500/50">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-white font-medium mb-1">Delete Account</h4>
                    <p className="text-gray-400 text-sm">
                      Permanently delete your account and all data
                    </p>
                  </div>
                  <Button variant="danger" onClick={() => setShowDeleteModal(true)}>
                    Delete Account
                  </Button>
                </div>
              </Card>
            </div>
          </div>
        );

      case 'notifications':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-white font-semibold mb-2">Notification Preferences</h3>
              <p className="text-gray-400 text-sm">
                Choose how you want to be notified about appointments and updates
              </p>
            </div>

            <div className="space-y-4">
              {[
                {
                  key: 'email_notifications',
                  label: 'Email Notifications',
                  description: 'Receive email updates about your appointments',
                },
                {
                  key: 'sms_notifications',
                  label: 'SMS Notifications',
                  description: 'Get text messages for appointment reminders',
                },
                {
                  key: 'push_notifications',
                  label: 'Push Notifications',
                  description: 'Receive push notifications on your device',
                },
                {
                  key: 'promotional_emails',
                  label: 'Promotional Emails',
                  description: 'Get updates about special offers and promotions',
                },
              ].map((item) => (
                <Card key={item.key} className="bg-gray-700/50">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h4 className="text-white font-medium mb-1">{item.label}</h4>
                      <p className="text-gray-400 text-sm">{item.description}</p>
                    </div>
                    <button
                      onClick={() => handleNotificationToggle(item.key)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        notifications[item.key] ? 'bg-yellow-400' : 'bg-gray-600'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          notifications[item.key] ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                </Card>
              ))}
            </div>

            <Button variant="primary" onClick={handleSaveNotifications} isLoading={isLoading}>
              Save Preferences
            </Button>
          </div>
        );

      case 'stats':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-white font-semibold mb-2">Account Statistics</h3>
              <p className="text-gray-400 text-sm">
                Your activity and spending overview
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { label: 'Total Appointments', value: '12', icon: '📅' },
                { label: 'Completed', value: '10', icon: '✅' },
                { label: 'Upcoming', value: '2', icon: '⏰' },
                { label: 'Total Spent', value: '$845', icon: '💰' },
                { label: 'Favorite Stylist', value: 'Sarah Johnson', icon: '⭐' },
                { label: 'Member Since', value: 'Jan 2024', icon: '🎉' },
              ].map((stat) => (
                <Card key={stat.label} className="bg-gray-700/50">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-sm mb-1">{stat.label}</p>
                      <p className="text-white text-xl font-bold">{stat.value}</p>
                    </div>
                    <span className="text-3xl">{stat.icon}</span>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Profile Settings</h1>
          <p className="text-gray-400">Manage your account and preferences</p>
        </div>

        {/* Tabs */}
        <div className="flex space-x-2 mb-6 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-3 rounded-lg font-medium transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-yellow-400 text-gray-900'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <Card>{renderTabContent()}</Card>

        {/* Delete Account Modal */}
        <Modal
          isOpen={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          title="Delete Account"
        >
          <div className="space-y-4">
            <div className="bg-red-500/10 border border-red-500 rounded-lg p-4">
              <p className="text-red-400 font-semibold mb-2">⚠️ Warning</p>
              <p className="text-gray-300 text-sm">
                This action cannot be undone. All your data, including appointments and reviews,
                will be permanently deleted.
              </p>
            </div>
            <p className="text-gray-300">
              Are you absolutely sure you want to delete your account?
            </p>
            <div className="flex space-x-3">
              <Button variant="secondary" fullWidth onClick={() => setShowDeleteModal(false)}>
                Cancel
              </Button>
              <Button variant="danger" fullWidth>
                Yes, Delete My Account
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </div>
  );
};

export default ClientProfile;
