import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useReservations } from '../../contexts/ReservationContext';
import { Card, Button, Badge, Modal, Input, Loader } from '../../components/ui';
import { formatDate, formatTime } from '../../utils/formatters';

/**
 * Stylist Schedule Page
 * Manage schedule, availability, and appointments
 */
const StylistSchedule = () => {
  const { user } = useAuth();
  const { reservations, fetchReservations, confirmReservation, completeReservation, isLoading } = useReservations();

  const [viewMode, setViewMode] = useState('week'); // 'week' or 'month'
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showAppointmentModal, setShowAppointmentModal] = useState(false);
  const [showBlockTimeModal, setShowBlockTimeModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);

  const [blockTimeData, setBlockTimeData] = useState({
    start_date: '',
    end_date: '',
    start_time: '',
    end_time: '',
    reason: '',
  });

  useEffect(() => {
    loadSchedule();
  }, [selectedDate]);

  /**
   * Load schedule for selected period
   */
  const loadSchedule = async () => {
    try {
      const startOfWeek = new Date(selectedDate);
      startOfWeek.setDate(selectedDate.getDate() - selectedDate.getDay());

      await fetchReservations({
        stylist_id: user?.id,
        start_date: startOfWeek.toISOString().split('T')[0],
      });
    } catch (error) {
      console.error('Failed to load schedule:', error);
    }
  };

  /**
   * Handle appointment click
   */
  const handleAppointmentClick = (appointment) => {
    setSelectedAppointment(appointment);
    setShowAppointmentModal(true);
  };

  /**
   * Confirm appointment
   */
  const handleConfirmAppointment = async () => {
    try {
      await confirmReservation(selectedAppointment.id);
      setShowAppointmentModal(false);
      loadSchedule();
    } catch (error) {
      console.error('Failed to confirm appointment:', error);
    }
  };

  /**
   * Complete appointment
   */
  const handleCompleteAppointment = async () => {
    try {
      await completeReservation(selectedAppointment.id);
      setShowAppointmentModal(false);
      loadSchedule();
    } catch (error) {
      console.error('Failed to complete appointment:', error);
    }
  };

  /**
   * Generate week days
   */
  const getWeekDays = () => {
    const days = [];
    const startOfWeek = new Date(selectedDate);
    startOfWeek.setDate(selectedDate.getDate() - selectedDate.getDay());

    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + i);
      days.push(day);
    }
    return days;
  };

  /**
   * Get appointments for specific day
   */
  const getAppointmentsForDay = (date) => {
    const dateStr = date.toISOString().split('T')[0];
    return reservations.filter(apt => apt.scheduled_at?.startsWith(dateStr));
  };

  const weekDays = getWeekDays();

  return (
    <div className="min-h-screen bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">My Schedule</h1>
            <p className="text-gray-400">Manage your appointments and availability</p>
          </div>
          <Button variant="primary" onClick={() => setShowBlockTimeModal(true)}>
            Block Time Off
          </Button>
        </div>

        {/* Calendar Controls */}
        <Card className="mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  const newDate = new Date(selectedDate);
                  newDate.setDate(selectedDate.getDate() - 7);
                  setSelectedDate(newDate);
                }}
              >
                Previous Week
              </Button>
              <h2 className="text-white font-semibold">
                {weekDays[0]?.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })} - {weekDays[6]?.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
              </h2>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  const newDate = new Date(selectedDate);
                  newDate.setDate(selectedDate.getDate() + 7);
                  setSelectedDate(newDate);
                }}
              >
                Next Week
              </Button>
            </div>

            <Button variant="ghost" size="sm" onClick={() => setSelectedDate(new Date())}>
              Today
            </Button>
          </div>
        </Card>

        {/* Week Calendar View */}
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader size="lg" />
          </div>
        ) : (
          <div className="grid grid-cols-7 gap-4">
            {weekDays.map((day) => {
              const appointments = getAppointmentsForDay(day);
              const isToday = day.toDateString() === new Date().toDateString();

              return (
                <div key={day.toISOString()}>
                  <Card className={`mb-2 ${isToday ? 'bg-yellow-400/10 border-yellow-400/50' : ''}`}>
                    <div className="text-center">
                      <p className="text-gray-400 text-xs mb-1">
                        {day.toLocaleDateString('en-US', { weekday: 'short' })}
                      </p>
                      <p className={`text-2xl font-bold ${isToday ? 'text-yellow-400' : 'text-white'}`}>
                        {day.getDate()}
                      </p>
                    </div>
                  </Card>

                  <div className="space-y-2">
                    {appointments.length > 0 ? (
                      appointments.map((apt) => (
                        <Card
                          key={apt.id}
                          className="cursor-pointer hover:border-yellow-400/50 transition-all p-3"
                          onClick={() => handleAppointmentClick(apt)}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <p className="text-white text-sm font-medium line-clamp-1">
                              {formatTime(apt.scheduled_at)}
                            </p>
                            <Badge variant={apt.status === 'confirmed' ? 'success' : 'warning'} className="text-xs">
                              {apt.status}
                            </Badge>
                          </div>
                          <p className="text-gray-400 text-xs line-clamp-1">
                            {apt.client?.name}
                          </p>
                          <p className="text-gray-500 text-xs line-clamp-1">
                            {apt.services?.map(s => s.name).join(', ')}
                          </p>
                        </Card>
                      ))
                    ) : (
                      <div className="text-center py-4">
                        <p className="text-gray-600 text-xs">No appointments</p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Appointment Details Modal */}
        <Modal
          isOpen={showAppointmentModal}
          onClose={() => {
            setShowAppointmentModal(false);
            setSelectedAppointment(null);
          }}
          title="Appointment Details"
        >
          {selectedAppointment && (
            <div className="space-y-4">
              {/* Client Info */}
              <div className="flex items-center space-x-4">
                <img
                  src={selectedAppointment.client?.avatar || '/placeholder-avatar.png'}
                  alt={selectedAppointment.client?.name}
                  className="w-16 h-16 rounded-full object-cover"
                />
                <div>
                  <h3 className="text-white font-semibold">{selectedAppointment.client?.name}</h3>
                  <p className="text-gray-400 text-sm">{selectedAppointment.client?.email}</p>
                  <p className="text-gray-400 text-sm">{selectedAppointment.client?.phone}</p>
                </div>
              </div>

              {/* Appointment Info */}
              <Card className="bg-gray-700/50">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Services:</span>
                    <span className="text-white">{selectedAppointment.services?.map(s => s.name).join(', ')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Date & Time:</span>
                    <span className="text-white">{formatDate(selectedAppointment.scheduled_at)} at {formatTime(selectedAppointment.scheduled_at)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Duration:</span>
                    <span className="text-white">{selectedAppointment.duration || 60} minutes</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Status:</span>
                    <Badge variant={selectedAppointment.status === 'confirmed' ? 'success' : 'warning'}>
                      {selectedAppointment.status}
                    </Badge>
                  </div>
                </div>
              </Card>

              {/* Notes */}
              {selectedAppointment.notes && (
                <div>
                  <p className="text-gray-400 text-sm mb-1">Client Notes:</p>
                  <Card className="bg-gray-700/50">
                    <p className="text-white text-sm">{selectedAppointment.notes}</p>
                  </Card>
                </div>
              )}

              {/* Actions */}
              <div className="flex space-x-2">
                {selectedAppointment.status === 'pending' && (
                  <Button variant="primary" fullWidth onClick={handleConfirmAppointment} isLoading={isLoading}>
                    Confirm Appointment
                  </Button>
                )}
                {selectedAppointment.status === 'confirmed' && (
                  <Button variant="success" fullWidth onClick={handleCompleteAppointment} isLoading={isLoading}>
                    Mark as Complete
                  </Button>
                )}
              </div>
            </div>
          )}
        </Modal>

        {/* Block Time Modal */}
        <Modal
          isOpen={showBlockTimeModal}
          onClose={() => setShowBlockTimeModal(false)}
          title="Block Time Off"
        >
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Input
                type="date"
                label="Start Date"
                value={blockTimeData.start_date}
                onChange={(e) => setBlockTimeData(prev => ({ ...prev, start_date: e.target.value }))}
                required
                fullWidth
              />
              <Input
                type="date"
                label="End Date"
                value={blockTimeData.end_date}
                onChange={(e) => setBlockTimeData(prev => ({ ...prev, end_date: e.target.value }))}
                required
                fullWidth
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Input
                type="time"
                label="Start Time"
                value={blockTimeData.start_time}
                onChange={(e) => setBlockTimeData(prev => ({ ...prev, start_time: e.target.value }))}
                fullWidth
              />
              <Input
                type="time"
                label="End Time"
                value={blockTimeData.end_time}
                onChange={(e) => setBlockTimeData(prev => ({ ...prev, end_time: e.target.value }))}
                fullWidth
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Reason (optional)
              </label>
              <textarea
                value={blockTimeData.reason}
                onChange={(e) => setBlockTimeData(prev => ({ ...prev, reason: e.target.value }))}
                rows={3}
                placeholder="Vacation, personal time, etc."
                className="w-full px-4 py-3 bg-gray-800 text-white border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent resize-none"
              />
            </div>

            <Button variant="primary" fullWidth>
              Block Time
            </Button>
          </div>
        </Modal>
      </div>
    </div>
  );
};

export default StylistSchedule;
