/**
 * SALON PWA - Enhanced Book Appointment Page
 * Complete 5-step booking flow with Stripe and Promotions
 *
 * Flow: Stylist → Service → Date/Time → Promotion → Payment
 */

import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Card, Button, Input, Badge, Loader } from '../../components/ui';
import { StripePaymentForm, PromotionCodeInput } from '../../components/booking';
import StripeProvider from '../../providers/StripeProvider';
import * as servicesService from '../../services/services.service';
import * as stylistsService from '../../services/stylists.service';
import * as reservationsService from '../../services/reservations.service';
import { formatCurrency, formatDate } from '../../utils/formatters';

const BookAppointmentContent = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Step 1: Stylist
  const [stylists, setStylists] = useState([]);
  const [selectedStylist, setSelectedStylist] = useState(null);

  // Step 2: Services
  const [services, setServices] = useState([]);
  const [selectedService, setSelectedService] = useState(null);

  // Step 3: Date & Time
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [availableSlots, setAvailableSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);

  // Step 4: Promotion
  const [appliedPromotion, setAppliedPromotion] = useState(null);
  const [originalAmount, setOriginalAmount] = useState(0);
  const [finalAmount, setFinalAmount] = useState(0);

  // Step 5: Payment
  const [notes, setNotes] = useState('');

  const totalSteps = 5;

  useEffect(() => {
    loadStylists();
  }, []);

  /**
   * Load available stylists
   */
  const loadStylists = async () => {
    try {
      setIsLoading(true);
      const response = await stylistsService.getStylists();
      setStylists(response.data || response);
    } catch (error) {
      setError('Failed to load stylists');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Load services for selected stylist
   */
  const loadServices = async () => {
    try {
      setIsLoading(true);
      const response = await servicesService.getServices({
        stylist_id: selectedStylist?.id
      });
      setServices(response.data || response);
    } catch (error) {
      setError('Failed to load services');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Load available time slots
   */
  const loadAvailableSlots = async () => {
    if (!selectedDate || !selectedStylist || !selectedService) return;

    try {
      setLoadingSlots(true);
      const response = await reservationsService.checkAvailability(
        selectedStylist.id,
        selectedService.id,
        selectedDate
      );
      setAvailableSlots(response.available_slots || []);
    } catch (error) {
      console.error('Failed to load availability:', error);
      // Fallback to generated slots
      setAvailableSlots(generateTimeSlots());
    } finally {
      setLoadingSlots(false);
    }
  };

  /**
   * Generate time slots (fallback)
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
   * Calculate amounts
   */
  useEffect(() => {
    if (selectedService) {
      const amount = Math.round(selectedService.price * 100); // Convert to cents
      setOriginalAmount(amount);
      setFinalAmount(amount);
    }
  }, [selectedService]);

  /**
   * Handle stylist selection
   */
  const handleStylistSelect = (stylist) => {
    setSelectedStylist(stylist);
  };

  /**
   * Handle service selection
   */
  const handleServiceSelect = (service) => {
    setSelectedService(service);
  };

  /**
   * Handle date change
   */
  const handleDateChange = (date) => {
    setSelectedDate(date);
    setSelectedTime(''); // Reset time when date changes
  };

  /**
   * Handle promotion applied
   */
  const handlePromotionApplied = (promotionData) => {
    setAppliedPromotion(promotionData);
    setFinalAmount(promotionData.discountedAmount);
  };

  /**
   * Handle promotion removed
   */
  const handlePromotionRemoved = () => {
    setAppliedPromotion(null);
    setFinalAmount(originalAmount);
  };

  /**
   * Handle payment success
   */
  const handlePaymentSuccess = async (paymentMethod) => {
    try {
      setIsLoading(true);

      // Create reservation
      const reservationData = {
        stylist_id: selectedStylist.id,
        service_id: selectedService.id,
        scheduled_at: new Date(`${selectedDate}T${selectedTime}`).toISOString(),
        notes: notes,
        payment_method_id: paymentMethod.id,
        promotion_code: appliedPromotion?.code,
        amount: finalAmount,
      };

      const response = await reservationsService.createReservation(reservationData);

      // Navigate to success page
      navigate('/client/reservations', {
        state: {
          message: 'Appointment booked successfully!',
          reservationId: response.reservation?.id
        }
      });
    } catch (error) {
      setError(error.message || 'Failed to create reservation');
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Handle next step
   */
  const handleNext = () => {
    setError('');

    // Validation
    if (currentStep === 1 && !selectedStylist) {
      setError('Please select a stylist');
      return;
    }
    if (currentStep === 2 && !selectedService) {
      setError('Please select a service');
      return;
    }
    if (currentStep === 3 && (!selectedDate || !selectedTime)) {
      setError('Please select date and time');
      return;
    }

    // Load data for next step
    if (currentStep === 1) {
      loadServices();
    }
    if (currentStep === 2) {
      // Ready for date/time selection
    }

    setCurrentStep(prev => Math.min(prev + 1, totalSteps));
  };

  /**
   * Handle back step
   */
  const handleBack = () => {
    setError('');
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  /**
   * Load slots when date changes
   */
  useEffect(() => {
    if (selectedDate) {
      loadAvailableSlots();
    }
  }, [selectedDate]);

  /**
   * Render step content
   */
  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
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
                        <p className="text-gray-400 text-sm mb-2 line-clamp-2">
                          {stylist.bio || 'Professional stylist'}
                        </p>
                        <div className="flex items-center space-x-2">
                          <Badge variant="warning">
                            ⭐ {stylist.rating || 4.8}
                          </Badge>
                          <span className="text-gray-500 text-xs">
                            {stylist.experience_years || 5}+ years
                          </span>
                        </div>
                      </div>
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
            <h2 className="text-2xl font-bold text-white mb-6">Select Service</h2>
            <div className="mb-4 text-sm text-gray-400">
              Stylist: <span className="text-yellow-400 font-semibold">{selectedStylist?.name}</span>
            </div>
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
                      selectedService?.id === service.id
                        ? 'border-yellow-400 bg-yellow-400/10'
                        : 'hover:border-gray-600'
                    }`}
                    onClick={() => handleServiceSelect(service)}
                  >
                    <h3 className="text-white font-semibold mb-2">{service.name}</h3>
                    <p className="text-gray-400 text-sm mb-3 line-clamp-2">
                      {service.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400 text-sm">
                        {service.duration || 60} min
                      </span>
                      <span className="text-yellow-400 font-bold text-lg">
                        {formatCurrency(service.price)}
                      </span>
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
                  Available Times
                </label>
                {selectedDate ? (
                  loadingSlots ? (
                    <div className="flex justify-center py-8">
                      <Loader />
                    </div>
                  ) : (
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
                  )
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
            <h2 className="text-2xl font-bold text-white mb-6">Apply Promotion Code</h2>

            {/* Promotion Input */}
            <div className="mb-6">
              <PromotionCodeInput
                serviceId={selectedService?.id}
                branchId={selectedStylist?.branch_id}
                originalAmount={originalAmount}
                onApply={handlePromotionApplied}
                onRemove={handlePromotionRemoved}
              />
            </div>

            {/* Booking Summary */}
            <Card className="bg-gray-700/50">
              <h3 className="text-white font-semibold mb-4">Booking Summary</h3>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Stylist:</span>
                  <span className="text-white">{selectedStylist?.name}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Service:</span>
                  <span className="text-white">{selectedService?.name}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Date & Time:</span>
                  <span className="text-white">{selectedDate} at {selectedTime}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Duration:</span>
                  <span className="text-white">{selectedService?.duration || 60} min</span>
                </div>

                {appliedPromotion && (
                  <>
                    <div className="border-t border-gray-600 pt-3" />
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Subtotal:</span>
                      <span className="text-white">${(originalAmount / 100).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-green-400">Discount ({appliedPromotion.code}):</span>
                      <span className="text-green-400">
                        -${(appliedPromotion.savings / 100).toFixed(2)}
                      </span>
                    </div>
                  </>
                )}

                <div className="border-t border-gray-600 pt-3 flex justify-between font-semibold">
                  <span className="text-white">Total:</span>
                  <span className="text-yellow-400 text-lg">
                    ${(finalAmount / 100).toFixed(2)}
                  </span>
                </div>
              </div>
            </Card>

            {/* Optional Notes */}
            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Special Requests (Optional)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                placeholder="Any special requests or preferences?"
                className="w-full px-4 py-3 bg-gray-800 text-white border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent resize-none"
              />
            </div>
          </div>
        );

      case 5:
        return (
          <div>
            <h2 className="text-2xl font-bold text-white mb-6">Complete Payment</h2>

            {/* Payment Summary */}
            <Card className="bg-gray-700/50 mb-6">
              <div className="text-center mb-4">
                <p className="text-gray-400 text-sm mb-1">Total Amount</p>
                <p className="text-4xl font-bold text-yellow-400">
                  ${(finalAmount / 100).toFixed(2)}
                </p>
              </div>
              <div className="text-xs text-gray-400 space-y-1">
                <p>✓ {selectedService?.name} with {selectedStylist?.name}</p>
                <p>✓ {selectedDate} at {selectedTime}</p>
                {appliedPromotion && (
                  <p className="text-green-400">✓ Discount applied: {appliedPromotion.code}</p>
                )}
              </div>
            </Card>

            {/* Stripe Payment Form */}
            <StripePaymentForm
              amount={finalAmount}
              currency="usd"
              onSuccess={handlePaymentSuccess}
              onError={(err) => setError(err.message)}
              disabled={isLoading}
            />
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
            <span>Stylist</span>
            <span>Service</span>
            <span>Date/Time</span>
            <span>Promo</span>
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
            ← Back
          </Button>
          {currentStep < totalSteps && (
            <Button
              variant="primary"
              onClick={handleNext}
              disabled={isLoading}
            >
              Continue →
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

// Wrap with Stripe Provider
const BookAppointmentEnhanced = () => (
  <StripeProvider>
    <BookAppointmentContent />
  </StripeProvider>
);

export default BookAppointmentEnhanced;
