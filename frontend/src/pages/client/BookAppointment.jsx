import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useCart } from '../../contexts/CartContext';
import { useReservations } from '../../contexts/ReservationContext';
import { Card, Button, Input, Badge, Loader } from '../../components/ui';
import * as servicesService from '../../services/services.service';
import * as stylistsService from '../../services/stylists.service';
import { formatCurrency, formatDate } from '../../utils/formatters';

/**
 * Book Appointment Page
 * Multi-step booking flow for scheduling appointments
 */
const BookAppointment = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { cart, addService, setStylist, setDateTime, setNotes, clearCart, getTotalPrice, getTotalDuration } = useCart();
  const { createReservation } = useReservations();

  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Step 1: Services
  const [services, setServices] = useState([]);
  const [selectedServices, setSelectedServices] = useState([]);

  // Step 2: Stylists
  const [stylists, setStylists] = useState([]);
  const [selectedStylist, setSelectedStylist] = useState(null);

  // Step 3: Date & Time
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [availableSlots, setAvailableSlots] = useState([]);

  // Step 4: Notes
  const [appointmentNotes, setAppointmentNotes] = useState('');

  // Step 5: Payment (placeholder)
  const [paymentMethod, setPaymentMethod] = useState('card');

  const totalSteps = 5;

  useEffect(() => {
    // If service passed from navigation
    if (location.state?.service) {
      setSelectedServices([location.state.service]);
      addService(location.state.service);
    }
    loadServices();
  }, []);

  /**
   * Load available services
   */
  const loadServices = async () => {
    try {
      setIsLoading(true);
      const response = await servicesService.getServices();
      setServices(response.data || response);
    } catch (error) {
      console.error('Failed to load services:', error);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Load available stylists
   */
  const loadStylists = async () => {
    try {
      setIsLoading(true);
      const response = await stylistsService.getStylists();
      setStylists(response.data || response);
    } catch (error) {
      console.error('Failed to load stylists:', error);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Handle service selection
   */
  const handleServiceToggle = (service) => {
    const isSelected = selectedServices.find(s => s.id === service.id);
    if (isSelected) {
      setSelectedServices(prev => prev.filter(s => s.id !== service.id));
    } else {
      setSelectedServices(prev => [...prev, service]);
      addService(service);
    }
  };

  /**
   * Handle stylist selection
   */
  const handleStylistSelect = (stylist) => {
    setSelectedStylist(stylist);
    setStylist(stylist);
  };

  /**
   * Generate available time slots
   */
  const generateTimeSlots = () => {
    const slots = [];
    for (let hour = 9; hour < 18; hour++) {
      slots.push(`${hour.toString().padStart(2, '0')}:00`);
      slots.push(`${hour.toString().padStart(2, '0')}:30`);
    }
    return slots;
  };

  /**
   * Handle date selection
   */
  const handleDateChange = (date) => {
    setSelectedDate(date);
    setAvailableSlots(generateTimeSlots());
  };

  /**
   * Go to next step
   */
  const handleNext = () => {
    if (currentStep === 1 && selectedServices.length === 0) {
      setError('Please select at least one service');
      return;
    }
    if (currentStep === 2 && !selectedStylist) {
      setError('Please select a stylist');
      return;
    }
    if (currentStep === 3 && (!selectedDate || !selectedTime)) {
      setError('Please select date and time');
      return;
    }

    setError('');

    if (currentStep === 2) {
      // Moving to date/time step
      setAvailableSlots(generateTimeSlots());
    }

    if (currentStep < totalSteps) {
      setCurrentStep(prev => prev + 1);

      // Load data for next step
      if (currentStep === 1) loadStylists();
      if (currentStep === 3) {
        setDateTime(selectedDate, selectedTime);
        setNotes(appointmentNotes);
      }
    }
  };

  /**
   * Go to previous step
   */
  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
      setError('');
    }
  };

  /**
   * Complete booking
   */
  const handleCompleteBooking = async () => {
    try {
      setIsLoading(true);
      setError('');

      const reservationData = {
        stylist_id: selectedStylist.id,
        services: selectedServices.map(s => ({ service_id: s.id, quantity: 1 })),
        scheduled_at: new Date(`${selectedDate}T${selectedTime}`).toISOString(),
        notes: appointmentNotes,
      };

      await createReservation(reservationData);
      clearCart();
      navigate('/client/reservations', {
        state: { message: 'Appointment booked successfully!' }
      });
    } catch (error) {
      setError(error.message || 'Failed to book appointment');
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Render step content
   */
  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div>
            <h2 className="text-2xl font-bold text-white mb-6">Select Services</h2>
            {isLoading ? (
              <div className="flex justify-center py-12">
                <Loader size="lg" />
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {services.map((service) => (
                  <Card
                    key={service.id}
                    className={`cursor-pointer transition-all ${
                      selectedServices.find(s => s.id === service.id)
                        ? 'border-yellow-400 bg-yellow-400/10'
                        : 'hover:border-gray-600'
                    }`}
                    onClick={() => handleServiceToggle(service)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h3 className="text-white font-semibold mb-1">{service.name}</h3>
                        <p className="text-gray-400 text-sm mb-2 line-clamp-1">{service.description}</p>
                        <div className="flex items-center space-x-3 text-sm text-gray-400">
                          <span>{service.duration || 60} min</span>
                          <span className="text-yellow-400 font-semibold">{formatCurrency(service.price)}</span>
                        </div>
                      </div>
                      <input
                        type="checkbox"
                        checked={!!selectedServices.find(s => s.id === service.id)}
                        onChange={() => {}}
                        className="w-5 h-5 text-yellow-400 bg-gray-700 border-gray-600 rounded focus:ring-yellow-400"
                      />
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        );

      case 2:
        return (
          <div>
            <h2 className="text-2xl font-bold text-white mb-6">Choose Your Stylist</h2>
            {isLoading ? (
              <div className="flex justify-center py-12">
                <Loader size="lg" />
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {stylists.map((stylist) => (
                  <Card
                    key={stylist.id}
                    className={`cursor-pointer transition-all ${
                      selectedStylist?.id === stylist.id
                        ? 'border-yellow-400 bg-yellow-400/10'
                        : 'hover:border-gray-600'
                    }`}
                    onClick={() => handleStylistSelect(stylist)}
                  >
                    <div className="flex items-center space-x-4">
                      <img
                        src={stylist.avatar || '/placeholder-avatar.png'}
                        alt={stylist.name}
                        className="w-16 h-16 rounded-full object-cover"
                      />
                      <div className="flex-1">
                        <h3 className="text-white font-semibold mb-1">{stylist.name}</h3>
                        <p className="text-gray-400 text-sm mb-2 line-clamp-1">{stylist.bio || 'Professional stylist'}</p>
                        <div className="flex items-center space-x-2">
                          <Badge variant="warning">{stylist.rating || 4.8} ★</Badge>
                          <span className="text-gray-500 text-xs">{stylist.experience_years || 5}+ years</span>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        );

      case 3:
        return (
          <div>
            <h2 className="text-2xl font-bold text-white mb-6">Select Date & Time</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Date Picker */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Select Date
                </label>
                <Input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => handleDateChange(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  fullWidth
                />
              </div>

              {/* Time Slots */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Select Time
                </label>
                {selectedDate ? (
                  <div className="grid grid-cols-3 gap-2 max-h-64 overflow-y-auto">
                    {availableSlots.map((slot) => (
                      <button
                        key={slot}
                        onClick={() => setSelectedTime(slot)}
                        className={`py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                          selectedTime === slot
                            ? 'bg-yellow-400 text-gray-900'
                            : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        }`}
                      >
                        {slot}
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-400 text-sm">Please select a date first</p>
                )}
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div>
            <h2 className="text-2xl font-bold text-white mb-6">Add Notes (Optional)</h2>
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Special Requests or Preferences
              </label>
              <textarea
                value={appointmentNotes}
                onChange={(e) => setAppointmentNotes(e.target.value)}
                rows={4}
                placeholder="Any special requests or preferences?"
                className="w-full px-4 py-3 bg-gray-800 text-white border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent resize-none"
              />
            </div>

            {/* Review Summary */}
            <Card className="bg-gray-700/50">
              <h3 className="text-white font-semibold mb-4">Booking Summary</h3>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Services:</span>
                  <span className="text-white">{selectedServices.map(s => s.name).join(', ')}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Stylist:</span>
                  <span className="text-white">{selectedStylist?.name}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Date & Time:</span>
                  <span className="text-white">{selectedDate} at {selectedTime}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Duration:</span>
                  <span className="text-white">{getTotalDuration()} minutes</span>
                </div>
                <div className="border-t border-gray-600 pt-3 flex justify-between font-semibold">
                  <span className="text-white">Total:</span>
                  <span className="text-yellow-400 text-lg">{formatCurrency(getTotalPrice())}</span>
                </div>
              </div>
            </Card>
          </div>
        );

      case 5:
        return (
          <div>
            <h2 className="text-2xl font-bold text-white mb-6">Payment</h2>
            <Card className="bg-blue-500/10 border-blue-500/50 text-center py-12">
              <svg className="w-16 h-16 mx-auto mb-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
              <h3 className="text-xl font-semibold text-white mb-2">Stripe Payment Integration</h3>
              <p className="text-gray-400 mb-6">Payment processing will be integrated here</p>
              <Button variant="primary" onClick={handleCompleteBooking} isLoading={isLoading}>
                Complete Booking (Skip Payment)
              </Button>
            </Card>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            {[...Array(totalSteps)].map((_, index) => (
              <div key={index} className="flex items-center flex-1">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                    index + 1 === currentStep
                      ? 'bg-yellow-400 text-gray-900'
                      : index + 1 < currentStep
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-700 text-gray-400'
                  }`}
                >
                  {index + 1 < currentStep ? '✓' : index + 1}
                </div>
                {index < totalSteps - 1 && (
                  <div
                    className={`h-1 flex-1 mx-2 ${
                      index + 1 < currentStep ? 'bg-green-500' : 'bg-gray-700'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between text-xs text-gray-400">
            <span>Services</span>
            <span>Stylist</span>
            <span>Date/Time</span>
            <span>Review</span>
            <span>Payment</span>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-500/10 border border-red-500 text-red-500 rounded-lg p-4 text-sm">
            {error}
          </div>
        )}

        {/* Step Content */}
        <div className="mb-8">{renderStepContent()}</div>

        {/* Navigation Buttons */}
        <div className="flex justify-between">
          <Button
            variant="secondary"
            onClick={handleBack}
            disabled={currentStep === 1 || isLoading}
          >
            Back
          </Button>
          {currentStep < totalSteps ? (
            <Button
              variant="primary"
              onClick={handleNext}
              disabled={isLoading}
            >
              Continue
            </Button>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default BookAppointment;
