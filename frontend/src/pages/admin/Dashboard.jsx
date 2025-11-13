import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, Badge, Button } from '../../components/ui';
import { formatCurrency, formatDate } from '../../utils/formatters';

/**
 * Admin Dashboard Page
 * Main dashboard for administrators with KPIs and analytics
 */
const AdminDashboard = () => {
  const [stats, setStats] = useState({
    revenue: 45230.50,
    appointments: 342,
    newClients: 28,
    avgRating: 4.7,
  });

  const [recentActivity, setRecentActivity] = useState([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  /**
   * Load dashboard data
   */
  const loadDashboardData = async () => {
    // Mock data - would come from API
    setRecentActivity([
      { id: 1, type: 'appointment', message: 'New appointment booked', time: '5 min ago' },
      { id: 2, type: 'user', message: 'New user registered', time: '15 min ago' },
      { id: 3, type: 'review', message: 'New review submitted', time: '1 hour ago' },
    ]);
  };

  const topServices = [
    { name: 'Women\'s Haircut', bookings: 85, revenue: 4250 },
    { name: 'Hair Coloring', bookings: 62, revenue: 8060 },
    { name: 'Men\'s Haircut', bookings: 78, revenue: 3120 },
    { name: 'Hair Styling', bookings: 45, revenue: 2250 },
  ];

  const topStylists = [
    { name: 'Sarah Johnson', rating: 4.9, bookings: 45, revenue: 5400 },
    { name: 'Mike Chen', rating: 4.8, bookings: 38, revenue: 4560 },
    { name: 'Emily Davis', rating: 4.7, bookings: 35, revenue: 4200 },
  ];

  return (
    <div className="min-h-screen bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Admin Dashboard</h1>
          <p className="text-gray-400">Monitor and manage your salon business</p>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-green-400/20 to-green-600/20 border-green-400/30">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-300 text-sm mb-1">Total Revenue</p>
                <p className="text-3xl font-bold text-green-400">{formatCurrency(stats.revenue)}</p>
                <p className="text-green-300 text-xs mt-2">↑ 12% from last month</p>
              </div>
              <div className="w-12 h-12 bg-green-400/20 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </Card>

          <Card className="bg-gradient-to-br from-blue-400/20 to-blue-600/20 border-blue-400/30">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-300 text-sm mb-1">Appointments</p>
                <p className="text-3xl font-bold text-blue-400">{stats.appointments}</p>
                <p className="text-blue-300 text-xs mt-2">This month</p>
              </div>
              <div className="w-12 h-12 bg-blue-400/20 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
          </Card>

          <Card className="bg-gradient-to-br from-yellow-400/20 to-yellow-600/20 border-yellow-400/30">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-300 text-sm mb-1">New Clients</p>
                <p className="text-3xl font-bold text-yellow-400">{stats.newClients}</p>
                <p className="text-yellow-300 text-xs mt-2">This month</p>
              </div>
              <div className="w-12 h-12 bg-yellow-400/20 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
            </div>
          </Card>

          <Card className="bg-gradient-to-br from-purple-400/20 to-purple-600/20 border-purple-400/30">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-300 text-sm mb-1">Avg Rating</p>
                <div className="flex items-center">
                  <p className="text-3xl font-bold text-purple-400 mr-2">{stats.avgRating}</p>
                  <span className="text-yellow-400 text-xl">★</span>
                </div>
                <p className="text-purple-300 text-xs mt-2">Platform-wide</p>
              </div>
              <div className="w-12 h-12 bg-purple-400/20 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-purple-400" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              </div>
            </div>
          </Card>
        </div>

        {/* Revenue Chart Placeholder */}
        <Card className="mb-8">
          <h2 className="text-xl font-bold text-white mb-4">Revenue Overview (Last 12 Months)</h2>
          <div className="h-80 flex items-center justify-center bg-gray-700/30 rounded-lg">
            <div className="text-center text-gray-400">
              <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <p className="text-lg">Revenue Chart</p>
              <p className="text-sm mt-2">Chart.js or Recharts integration coming soon</p>
            </div>
          </div>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Top Services */}
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white">Top Services</h2>
              <Link to="/admin/services">
                <Button variant="ghost" size="sm">View All</Button>
              </Link>
            </div>
            <div className="space-y-3">
              {topServices.map((service, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg">
                  <div className="flex-1">
                    <p className="text-white font-medium">{service.name}</p>
                    <p className="text-gray-400 text-sm">{service.bookings} bookings</p>
                  </div>
                  <p className="text-yellow-400 font-semibold">{formatCurrency(service.revenue)}</p>
                </div>
              ))}
            </div>
          </Card>

          {/* Top Stylists */}
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white">Top Stylists</h2>
              <Link to="/admin/users">
                <Button variant="ghost" size="sm">View All</Button>
              </Link>
            </div>
            <div className="space-y-3">
              {topStylists.map((stylist, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <p className="text-white font-medium">{stylist.name}</p>
                      <Badge variant="warning">{stylist.rating} ★</Badge>
                    </div>
                    <p className="text-gray-400 text-sm">{stylist.bookings} appointments</p>
                  </div>
                  <p className="text-green-400 font-semibold">{formatCurrency(stylist.revenue)}</p>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card>
          <h2 className="text-xl font-bold text-white mb-4">Recent Activity</h2>
          <div className="space-y-3">
            {recentActivity.map((activity) => (
              <div key={activity.id} className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg hover:bg-gray-700 transition-colors">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                  <p className="text-white">{activity.message}</p>
                </div>
                <p className="text-gray-400 text-sm">{activity.time}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
