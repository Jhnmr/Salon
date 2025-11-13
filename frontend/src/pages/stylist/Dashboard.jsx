import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useReservations } from '../../contexts/ReservationContext';
import { Card, Button, Badge, Loader } from '../../components/ui';
import { formatDate, formatCurrency, formatTime } from '../../utils/formatters';

/**
 * Stylist Dashboard Page
 * Main dashboard for stylists with today's appointments and earnings
 */
const StylistDashboard = () => {
  const { user } = useAuth();
  const { reservations, fetchReservations, isLoading } = useReservations();

  const [stats, setStats] = useState({
    todayAppointments: 0,
    weeklyEarnings: 0,
    averageRating: 0,
    totalReviews: 0,
  });

  useEffect(() => {
    loadDashboardData();
  }, []);

  /**
   * Load dashboard data
   */
  const loadDashboardData = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      await fetchReservations({
        stylist_id: user?.id,
        start_date: today,
        status: ['confirmed', 'pending'],
      });

      // Mock stats - would come from API
      setStats({
        todayAppointments: 5,
        weeklyEarnings: 1250.0,
        averageRating: 4.8,
        totalReviews: 127,
      });
    } catch (error) {
      console.error('Failed to load dashboard:', error);
    }
  };

  const todayAppointments = reservations.slice(0, 5);

  return (
    <div className="min-h-screen bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            Good {new Date().getHours() < 12 ? 'Morning' : 'Afternoon'}, {user?.name?.split(' ')[0] || 'there'}!
          </h1>
          <p className="text-gray-400">Here's what's happening today</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-yellow-400/20 to-yellow-600/20 border-yellow-400/30">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm mb-1">Today's Appointments</p>
                <p className="text-3xl font-bold text-yellow-400">{stats.todayAppointments}</p>
              </div>
              <div className="w-12 h-12 bg-yellow-400/20 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
          </Card>

          <Card className="bg-gradient-to-br from-green-400/20 to-green-600/20 border-green-400/30">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm mb-1">Weekly Earnings</p>
                <p className="text-3xl font-bold text-green-400">{formatCurrency(stats.weeklyEarnings)}</p>
              </div>
              <div className="w-12 h-12 bg-green-400/20 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </Card>

          <Card className="bg-gradient-to-br from-purple-400/20 to-purple-600/20 border-purple-400/30">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm mb-1">Average Rating</p>
                <div className="flex items-center">
                  <p className="text-3xl font-bold text-purple-400 mr-2">{stats.averageRating}</p>
                  <span className="text-yellow-400 text-xl">★</span>
                </div>
              </div>
              <div className="w-12 h-12 bg-purple-400/20 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-purple-400" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              </div>
            </div>
          </Card>

          <Card className="bg-gradient-to-br from-blue-400/20 to-blue-600/20 border-blue-400/30">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm mb-1">Total Reviews</p>
                <p className="text-3xl font-bold text-blue-400">{stats.totalReviews}</p>
              </div>
              <div className="w-12 h-12 bg-blue-400/20 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                </svg>
              </div>
            </div>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-white mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link to="/stylist/schedule">
              <Card className="hover:bg-gray-700/50 transition-all cursor-pointer group">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-yellow-400/20 rounded-lg flex items-center justify-center mr-4 group-hover:bg-yellow-400/30 transition-colors">
                    <svg className="w-6 h-6 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-white font-semibold">Manage Schedule</h3>
                    <p className="text-gray-400 text-sm">Set your availability</p>
                  </div>
                </div>
              </Card>
            </Link>

            <Link to="/stylist/portfolio">
              <Card className="hover:bg-gray-700/50 transition-all cursor-pointer group">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-purple-400/20 rounded-lg flex items-center justify-center mr-4 group-hover:bg-purple-400/30 transition-colors">
                    <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-white font-semibold">Create Post</h3>
                    <p className="text-gray-400 text-sm">Share your work</p>
                  </div>
                </div>
              </Card>
            </Link>

            <Link to="/stylist/earnings">
              <Card className="hover:bg-gray-700/50 transition-all cursor-pointer group">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-green-400/20 rounded-lg flex items-center justify-center mr-4 group-hover:bg-green-400/30 transition-colors">
                    <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-white font-semibold">View Earnings</h3>
                    <p className="text-gray-400 text-sm">Track your income</p>
                  </div>
                </div>
              </Card>
            </Link>
          </div>
        </div>

        {/* Today's Appointments */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-white">Today's Appointments</h2>
            <Link to="/stylist/schedule">
              <Button variant="ghost" size="sm">
                View All
              </Button>
            </Link>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader size="lg" />
            </div>
          ) : todayAppointments.length > 0 ? (
            <div className="space-y-4">
              {todayAppointments.map((appointment) => (
                <Card key={appointment.id} className="hover:border-yellow-400/50 transition-colors">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                    <div className="flex items-start space-x-4 mb-4 md:mb-0">
                      <img
                        src={appointment.client?.avatar || '/placeholder-avatar.png'}
                        alt={appointment.client?.name}
                        className="w-16 h-16 rounded-lg object-cover"
                      />
                      <div>
                        <h3 className="text-white font-semibold mb-1">
                          {appointment.client?.name || 'Client'}
                        </h3>
                        <p className="text-gray-400 text-sm mb-1">
                          {appointment.services?.map(s => s.name).join(', ') || 'Service'}
                        </p>
                        <div className="flex items-center space-x-3 text-sm">
                          <span className="text-gray-400 flex items-center">
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {formatTime(appointment.scheduled_at)}
                          </span>
                          <span className="text-gray-400">
                            {appointment.duration || 60} min
                          </span>
                          <Badge variant={appointment.status === 'confirmed' ? 'success' : 'warning'}>
                            {appointment.status}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {appointment.status === 'pending' && (
                        <Button variant="primary" size="sm">
                          Confirm
                        </Button>
                      )}
                      <Button variant="secondary" size="sm">
                        View Details
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="text-center py-12">
              <div className="text-gray-400">
                <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p className="text-lg">No appointments today</p>
                <p className="text-sm mt-2">Enjoy your day off!</p>
              </div>
            </Card>
          )}
        </div>

        {/* Recent Reviews */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-white">Recent Reviews</h2>
            <Button variant="ghost" size="sm">
              View All
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Placeholder reviews */}
            <Card className="bg-gray-700/50">
              <div className="flex items-start space-x-3">
                <img
                  src="/placeholder-avatar.png"
                  alt="Client"
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="text-white font-medium">Sarah Wilson</h4>
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <svg key={i} className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                  </div>
                  <p className="text-gray-400 text-sm">
                    Amazing work! My hair has never looked better. Highly recommend!
                  </p>
                  <p className="text-gray-500 text-xs mt-2">2 days ago</p>
                </div>
              </div>
            </Card>

            <Card className="bg-gray-700/50">
              <p className="text-gray-400 text-sm text-center py-8">
                More reviews will appear here
              </p>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StylistDashboard;
