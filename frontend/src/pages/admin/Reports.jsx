import { useState } from 'react';
import { Card, Button, Input, Select } from '../../components/ui';
import { formatCurrency } from '../../utils/formatters';

/**
 * Admin Reports Page
 */
const AdminReports = () => {
  const [reportType, setReportType] = useState('revenue');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });

  const reportTypes = [
    { value: 'revenue', label: 'Revenue Report' },
    { value: 'appointments', label: 'Appointments Report' },
    { value: 'clients', label: 'Client Analytics' },
    { value: 'stylists', label: 'Stylist Performance' },
  ];

  return (
    <div className="min-h-screen bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Reports & Analytics</h1>
          <p className="text-gray-400">Generate and export business reports</p>
        </div>

        <Card className="mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Select
              label="Report Type"
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
              options={reportTypes}
            />
            <Input
              label="Start Date"
              type="date"
              value={dateRange.start}
              onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
              fullWidth
            />
            <Input
              label="End Date"
              type="date"
              value={dateRange.end}
              onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
              fullWidth
            />
          </div>
          <div className="flex space-x-3 mt-4">
            <Button variant="primary">Generate Report</Button>
            <Button variant="secondary">Export to PDF</Button>
            <Button variant="secondary">Export to Excel</Button>
          </div>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <Card>
            <h3 className="text-white font-semibold mb-4">Revenue Chart</h3>
            <div className="h-64 flex items-center justify-center bg-gray-700/30 rounded-lg">
              <div className="text-center text-gray-400">
                <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                </svg>
                <p>Line Chart Placeholder</p>
              </div>
            </div>
          </Card>

          <Card>
            <h3 className="text-white font-semibold mb-4">Service Distribution</h3>
            <div className="h-64 flex items-center justify-center bg-gray-700/30 rounded-lg">
              <div className="text-center text-gray-400">
                <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
                </svg>
                <p>Pie Chart Placeholder</p>
              </div>
            </div>
          </Card>
        </div>

        <Card>
          <h3 className="text-white font-semibold mb-4">Report Summary</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 bg-gray-700/50 rounded-lg">
              <p className="text-gray-400 text-sm mb-1">Total Revenue</p>
              <p className="text-2xl font-bold text-green-400">{formatCurrency(45230)}</p>
            </div>
            <div className="p-4 bg-gray-700/50 rounded-lg">
              <p className="text-gray-400 text-sm mb-1">Total Bookings</p>
              <p className="text-2xl font-bold text-blue-400">342</p>
            </div>
            <div className="p-4 bg-gray-700/50 rounded-lg">
              <p className="text-gray-400 text-sm mb-1">Active Clients</p>
              <p className="text-2xl font-bold text-yellow-400">156</p>
            </div>
            <div className="p-4 bg-gray-700/50 rounded-lg">
              <p className="text-gray-400 text-sm mb-1">Avg Rating</p>
              <p className="text-2xl font-bold text-purple-400">4.7 ★</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default AdminReports;
