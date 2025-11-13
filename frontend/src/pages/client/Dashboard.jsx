import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useReservations } from '../../contexts/ReservationContext';
import { Card, Button, Badge, Loader } from '../../components/ui';
import { formatDate, formatCurrency } from '../../utils/formatters';

/**
 * Client Dashboard Page
 * Main dashboard for clients with upcoming reservations and quick actions
 */
const ClientDashboard = () => {
  const { user } = useAuth();
  const { fetchReservations, reservations, isLoading } = useReservations();

  const [stats, setStats] = useState({
    totalAppointments: 0,
    totalSpent: 0,
    upcomingCount: 0,
  });

  useEffect(() => {
    loadDashboardData();
  }, []);

  /**
   * Load dashboard data
   */
  const loadDashboardData = async () => {
    try {
      await fetchReservations({ status: 'confirmed', limit: 3 });
      // In a real app, fetch stats from API
      setStats({
        totalAppointments: 12,
        totalSpent: 845.0,
        upcomingCount: 3,
      });
    } catch (error) {
      console.error('Failed to load dashboard:', error);
    }
  };

  const upcomingReservations = reservations.slice(0, 3);

  return (
    <div className="min-h-screen bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            Welcome back, {user?.name?.split(' ')[0] || 'there'}!
          </h1>
          <p className="text-gray-400">Here's what's happening with your appointments</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-yellow-400/20 to-yellow-600/20 border-yellow-400/30">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm mb-1">Upcoming</p>
                <p className="text-3xl font-bold text-yellow-400">{stats.upcomingCount}</p>
              </div>
              <div className="w-12 h-12 bg-yellow-400/20 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
          </Card>

          <Card className="bg-gradient-to-br from-blue-400/20 to-blue-600/20 border-blue-400/30">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm mb-1">Total Visits</p>
                <p className="text-3xl font-bold text-blue-400">{stats.totalAppointments}</p>
              </div>
              <div className="w-12 h-12 bg-blue-400/20 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
            </div>
          </Card>

          <Card className="bg-gradient-to-br from-green-400/20 to-green-600/20 border-green-400/30">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm mb-1">Total Spent</p>
                <p className="text-3xl font-bold text-green-400">{formatCurrency(stats.totalSpent)}</p>
              </div>
              <div className="w-12 h-12 bg-green-400/20 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-white mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link to="/client/book-appointment">
              <Card className="hover:bg-gray-700/50 transition-all cursor-pointer group">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-yellow-400/20 rounded-lg flex items-center justify-center mr-4 group-hover:bg-yellow-400/30 transition-colors">
                    <svg className="w-6 h-6 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-white font-semibold">Book New Appointment</h3>
                    <p className="text-gray-400 text-sm">Schedule your next visit</p>
                  </div>
                </div>
              </Card>
            </Link>

            <Link to="/client/reservations">
              <Card className="hover:bg-gray-700/50 transition-all cursor-pointer group">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-blue-400/20 rounded-lg flex items-center justify-center mr-4 group-hover:bg-blue-400/30 transition-colors">
                    <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-white font-semibold">View History</h3>
                    <p className="text-gray-400 text-sm">See all your appointments</p>
                  </div>
                </div>
              </Card>
            </Link>
          </div>
        </div>

        {/* Upcoming Reservations */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-white">Upcoming Appointments</h2>
            <Link to="/client/reservations">
              <Button variant="ghost" size="sm">
                View All
              </Button>
            </Link>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader size="lg" />
            </div>
          ) : upcomingReservations.length > 0 ? (
            <div className="space-y-4">
              {upcomingReservations.map((reservation) => (
                <Card key={reservation.id} className="hover:border-yellow-400/50 transition-colors">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                    <div className="flex items-start space-x-4 mb-4 md:mb-0">
                      <img
                        src={reservation.stylist?.avatar || '/placeholder-avatar.png'}
                        alt={reservation.stylist?.name}
                        className="w-16 h-16 rounded-lg object-cover"
                      />
                      <div>
                        <h3 className="text-white font-semibold mb-1">
                          {reservation.services?.map(s => s.name).join(', ') || 'Service'}
                        </h3>
                        <p className="text-gray-400 text-sm mb-1">
                          with {reservation.stylist?.name || 'Stylist'}
                        </p>
                        <div className="flex items-center space-x-3 text-sm">
                          <span className="text-gray-400 flex items-center">
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            {formatDate(reservation.scheduled_at)}
                          </span>
                          <Badge variant={reservation.status === 'confirmed' ? 'success' : 'warning'}>
                            {reservation.status}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Link to={`/client/reservations/${reservation.id}`}>
                        <Button variant="secondary" size="sm">
                          View Details
                        </Button>
                      </Link>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p className="text-lg">No upcoming appointments</p>
                <p className="text-sm mt-2">Book your first appointment to get started</p>
              </div>
              <Link to="/client/book-appointment">
                <Button variant="primary">
                  Book Now
                </Button>
              </Link>
            </Card>
          )}
        </div>

        {/* Favorite Stylists */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-white mb-4">Your Favorite Stylists</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Placeholder - would be populated from API */}
            <Card className="text-center py-8">
              <p className="text-gray-400 text-sm">Book appointments to see your favorites here</p>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientDashboard;
