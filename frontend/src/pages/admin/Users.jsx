import { useState, useEffect } from 'react';
import { Card, Button, Input, Select, Badge, Table, Modal } from '../../components/ui';

/**
 * Admin Users Management Page
 */
const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [filters, setFilters] = useState({ role: '', status: '', search: '' });
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    loadUsers();
  }, [filters]);

  const loadUsers = async () => {
    // Mock data
    setUsers([
      { id: 1, name: 'John Doe', email: 'john@example.com', role: 'client', status: 'active', created_at: '2024-01-15' },
      { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'stylist', status: 'active', created_at: '2024-01-10' },
    ]);
  };

  const columns = [
    { key: 'name', label: 'Name' },
    { key: 'email', label: 'Email' },
    { key: 'role', label: 'Role', render: (val) => <Badge variant={val === 'admin' ? 'danger' : 'info'}>{val}</Badge> },
    { key: 'status', label: 'Status', render: (val) => <Badge variant={val === 'active' ? 'success' : 'default'}>{val}</Badge> },
    { key: 'created_at', label: 'Joined', render: (val) => new Date(val).toLocaleDateString() },
  ];

  return (
    <div className="min-h-screen bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">User Management</h1>
            <p className="text-gray-400">Manage clients, stylists, and administrators</p>
          </div>
          <Button variant="primary" onClick={() => setShowCreateModal(true)}>Create User</Button>
        </div>

        <Card className="mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              type="search"
              placeholder="Search users..."
              value={filters.search}
              onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
              fullWidth
            />
            <Select
              value={filters.role}
              onChange={(e) => setFilters(prev => ({ ...prev, role: e.target.value }))}
              options={[
                { value: '', label: 'All Roles' },
                { value: 'client', label: 'Clients' },
                { value: 'stylist', label: 'Stylists' },
                { value: 'admin', label: 'Admins' },
              ]}
            />
            <Select
              value={filters.status}
              onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
              options={[
                { value: '', label: 'All Status' },
                { value: 'active', label: 'Active' },
                { value: 'inactive', label: 'Inactive' },
              ]}
            />
          </div>
        </Card>

        <Card>
          <Table
            columns={columns}
            data={users}
            actions={(row) => (
              <div className="flex space-x-2">
                <Button variant="secondary" size="sm">Edit</Button>
                <Button variant="danger" size="sm">Delete</Button>
              </div>
            )}
          />
        </Card>

        <Modal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} title="Create New User">
          <div className="space-y-4">
            <Input label="Name" placeholder="Full name" required fullWidth />
            <Input label="Email" type="email" placeholder="email@example.com" required fullWidth />
            <Select label="Role" options={[
              { value: 'client', label: 'Client' },
              { value: 'stylist', label: 'Stylist' },
              { value: 'admin', label: 'Admin' },
            ]} />
            <Input label="Password" type="password" required fullWidth />
            <Button variant="primary" fullWidth>Create User</Button>
          </div>
        </Modal>
      </div>
    </div>
  );
};

export default AdminUsers;
