import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useReservations } from '../../contexts/ReservationContext';
import { Card, Button, Badge, Loader, Modal, Input } from '../../components/ui';
import { formatDate, formatCurrency } from '../../utils/formatters';

/**
 * Reservations Page
 * View and manage client's reservations
 */
const Reservations = () => {
  const { reservations, fetchReservations, cancelReservation, isLoading } = useReservations();

  const [activeTab, setActiveTab] = useState('upcoming');
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'grid'
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [selectedReservation, setSelectedReservation] = useState(null);
  const [cancelReason, setCancelReason] = useState('');

  const [filters, setFilters] = useState({
    search: '',
    start_date: '',
    end_date: '',
  });

  useEffect(() => {
    loadReservations();
  }, [activeTab, filters]);

  /**
   * Load reservations based on active tab
   */
  const loadReservations = async () => {
    const statusMap = {
      upcoming: ['confirmed', 'pending'],
      completed: ['completed'],
      cancelled: ['cancelled'],
    };

    try {
      await fetchReservations({
        status: statusMap[activeTab],
        ...filters,
      });
    } catch (error) {
      console.error('Failed to load reservations:', error);
    }
  };

  /**
   * Handle cancel reservation
   */
  const handleCancelClick = (reservation) => {
    setSelectedReservation(reservation);
    setShowCancelModal(true);
  };

  /**
   * Confirm cancellation
   */
  const handleConfirmCancel = async () => {
    try {
      await cancelReservation(selectedReservation.id, cancelReason);
      setShowCancelModal(false);
      setCancelReason('');
      setSelectedReservation(null);
      loadReservations();
    } catch (error) {
      console.error('Failed to cancel reservation:', error);
    }
  };

  /**
   * Check if reservation can be cancelled (24h before)
   */
  const canCancel = (reservation) => {
    const scheduledTime = new Date(reservation.scheduled_at);
    const now = new Date();
    const hoursDiff = (scheduledTime - now) / (1000 * 60 * 60);
    return hoursDiff > 24 && reservation.status !== 'cancelled';
  };

  /**
   * Render reservation card
   */
  const renderReservationCard = (reservation) => {
    const statusColors = {
      pending: 'warning',
      confirmed: 'success',
      completed: 'info',
      cancelled: 'danger',
    };

    return (
      <Card key={reservation.id} className="hover:border-yellow-400/50 transition-all">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          {/* Reservation Info */}
          <div className="flex items-start space-x-4 flex-1">
            <img
              src={reservation.stylist?.avatar || '/placeholder-avatar.png'}
              alt={reservation.stylist?.name}
              className="w-20 h-20 rounded-lg object-cover"
            />
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-2">
                <h3 className="text-white font-semibold text-lg">
                  {reservation.services?.map(s => s.name).join(', ') || 'Service'}
                </h3>
                <Badge variant={statusColors[reservation.status] || 'default'}>
                  {reservation.status}
                </Badge>
              </div>
              <p className="text-gray-400 text-sm mb-2">
                with {reservation.stylist?.name || 'Stylist'}
              </p>
              <div className="flex flex-wrap gap-3 text-sm text-gray-400">
                <span className="flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  {formatDate(reservation.scheduled_at)}
                </span>
                <span className="flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {reservation.duration || 60} min
                </span>
                <span className="text-yellow-400 font-semibold">
                  {formatCurrency(reservation.total_price || 0)}
                </span>
              </div>
              {reservation.branch && (
                <p className="text-gray-500 text-xs mt-2">
                  📍 {reservation.branch.name} - {reservation.branch.address}
                </p>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col space-y-2 md:ml-4">
            <Link to={`/client/reservations/${reservation.id}`}>
              <Button variant="secondary" size="sm" fullWidth>
                View Details
              </Button>
            </Link>
            {activeTab === 'upcoming' && canCancel(reservation) && (
              <Button
                variant="danger"
                size="sm"
                fullWidth
                onClick={() => handleCancelClick(reservation)}
              >
                Cancel
              </Button>
            )}
            {activeTab === 'completed' && (
              <>
                <Link to="/client/book-appointment">
                  <Button variant="primary" size="sm" fullWidth>
                    Rebook
                  </Button>
                </Link>
                {!reservation.review_id && (
                  <Button variant="secondary" size="sm" fullWidth>
                    Leave Review
                  </Button>
                )}
              </>
            )}
          </div>
        </div>
      </Card>
    );
  };

  const tabs = [
    { id: 'upcoming', label: 'Upcoming', count: 3 },
    { id: 'completed', label: 'Completed', count: 12 },
    { id: 'cancelled', label: 'Cancelled', count: 1 },
  ];

  return (
    <div className="min-h-screen bg-gray-900 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">My Appointments</h1>
          <p className="text-gray-400">Manage your past and upcoming appointments</p>
        </div>

        {/* Tabs */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex space-x-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-3 rounded-lg font-medium transition-all ${
                  activeTab === tab.id
                    ? 'bg-yellow-400 text-gray-900'
                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                }`}
              >
                {tab.label}
                {tab.count > 0 && (
                  <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
                    activeTab === tab.id ? 'bg-gray-900 text-yellow-400' : 'bg-gray-700'
                  }`}>
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center bg-gray-800 rounded-lg p-1">
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded transition-colors ${
                viewMode === 'list' ? 'bg-yellow-400 text-gray-900' : 'text-gray-400 hover:text-white'
              }`}
              aria-label="List view"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded transition-colors ${
                viewMode === 'grid' ? 'bg-yellow-400 text-gray-900' : 'text-gray-400 hover:text-white'
              }`}
              aria-label="Grid view"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M3 3h8v8H3V3zm10 0h8v8h-8V3zM3 13h8v8H3v-8zm10 0h8v8h-8v-8z" />
              </svg>
            </button>
          </div>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              type="search"
              placeholder="Search appointments..."
              value={filters.search}
              onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
              fullWidth
            />
            <Input
              type="date"
              placeholder="Start Date"
              value={filters.start_date}
              onChange={(e) => setFilters(prev => ({ ...prev, start_date: e.target.value }))}
              fullWidth
            />
            <Input
              type="date"
              placeholder="End Date"
              value={filters.end_date}
              onChange={(e) => setFilters(prev => ({ ...prev, end_date: e.target.value }))}
              fullWidth
            />
          </div>
        </Card>

        {/* Reservations List */}
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader size="lg" />
          </div>
        ) : reservations.length > 0 ? (
          <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 gap-6' : 'space-y-4'}>
            {reservations.map(renderReservationCard)}
          </div>
        ) : (
          <Card className="text-center py-12">
            <div className="text-gray-400">
              <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p className="text-lg mb-2">No {activeTab} appointments</p>
              <p className="text-sm mb-6">
                {activeTab === 'upcoming'
                  ? "You don't have any upcoming appointments"
                  : `No ${activeTab} appointments found`}
              </p>
              {activeTab === 'upcoming' && (
                <Link to="/client/book-appointment">
                  <Button variant="primary">
                    Book Appointment
                  </Button>
                </Link>
              )}
            </div>
          </Card>
        )}

        {/* Cancel Modal */}
        <Modal
          isOpen={showCancelModal}
          onClose={() => {
            setShowCancelModal(false);
            setCancelReason('');
            setSelectedReservation(null);
          }}
          title="Cancel Appointment"
        >
          <div className="space-y-4">
            <p className="text-gray-300">
              Are you sure you want to cancel this appointment?
            </p>
            {selectedReservation && (
              <Card className="bg-gray-700/50">
                <p className="text-white font-semibold mb-1">
                  {selectedReservation.services?.map(s => s.name).join(', ')}
                </p>
                <p className="text-gray-400 text-sm">
                  {formatDate(selectedReservation.scheduled_at)}
                </p>
              </Card>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Reason for cancellation (optional)
              </label>
              <textarea
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                rows={3}
                placeholder="Let us know why you're cancelling..."
                className="w-full px-4 py-3 bg-gray-800 text-white border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent resize-none"
              />
            </div>
            <div className="flex space-x-3">
              <Button
                variant="secondary"
                fullWidth
                onClick={() => {
                  setShowCancelModal(false);
                  setCancelReason('');
                  setSelectedReservation(null);
                }}
              >
                Keep Appointment
              </Button>
              <Button
                variant="danger"
                fullWidth
                onClick={handleConfirmCancel}
                isLoading={isLoading}
              >
                Cancel Appointment
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </div>
  );
};

export default Reservations;
