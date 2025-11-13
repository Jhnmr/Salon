import { useState, useEffect } from 'react';
import { Card, Button, Input, Select, Badge, Table, Modal } from '../../components/ui';
import { formatCurrency } from '../../utils/formatters';

/**
 * Admin Services Management Page
 */
const AdminServices = () => {
  const [services, setServices] = useState([]);
  const [filters, setFilters] = useState({ category: '', status: '' });
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    loadServices();
  }, [filters]);

  const loadServices = async () => {
    setServices([
      { id: 1, name: "Women's Haircut", category: 'haircut', price: 50, duration: 60, status: 'active' },
      { id: 2, name: 'Hair Coloring', category: 'coloring', price: 130, duration: 120, status: 'active' },
    ]);
  };

  const columns = [
    { key: 'name', label: 'Service Name' },
    { key: 'category', label: 'Category', render: (val) => <Badge>{val}</Badge> },
    { key: 'price', label: 'Price', render: (val) => formatCurrency(val) },
    { key: 'duration', label: 'Duration', render: (val) => `${val} min` },
    { key: 'status', label: 'Status', render: (val) => <Badge variant={val === 'active' ? 'success' : 'default'}>{val}</Badge> },
  ];

  return (
    <div className="min-h-screen bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Services Management</h1>
            <p className="text-gray-400">Manage salon services and pricing</p>
          </div>
          <Button variant="primary" onClick={() => setShowCreateModal(true)}>Add Service</Button>
        </div>

        <Card className="mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select
              value={filters.category}
              onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
              options={[
                { value: '', label: 'All Categories' },
                { value: 'haircut', label: 'Haircut' },
                { value: 'coloring', label: 'Coloring' },
                { value: 'styling', label: 'Styling' },
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
            data={services}
            actions={(row) => (
              <div className="flex space-x-2">
                <Button variant="secondary" size="sm">Edit</Button>
                <Button variant="danger" size="sm">Delete</Button>
              </div>
            )}
          />
        </Card>

        <Modal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} title="Add New Service">
          <div className="space-y-4">
            <Input label="Service Name" placeholder="e.g., Women's Haircut" required fullWidth />
            <Select label="Category" options={[
              { value: 'haircut', label: 'Haircut' },
              { value: 'coloring', label: 'Coloring' },
              { value: 'styling', label: 'Styling' },
            ]} />
            <div className="grid grid-cols-2 gap-4">
              <Input label="Price" type="number" placeholder="50.00" required />
              <Input label="Duration (min)" type="number" placeholder="60" required />
            </div>
            <textarea
              placeholder="Service description..."
              rows={3}
              className="w-full px-4 py-3 bg-gray-800 text-white border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
            />
            <Button variant="primary" fullWidth>Add Service</Button>
          </div>
        </Modal>
      </div>
    </div>
  );
};

export default AdminServices;
