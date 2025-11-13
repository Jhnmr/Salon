import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Elements } from '@stripe/react-stripe-js';
import stripeService from '../../services/stripe.service';
import StripeCheckout from '../../components/payment/StripeCheckout';
import { Toast, Loader } from '../../components/ui';
import reservationsService from '../../services/reservations.service';
import { useAuth } from '../../contexts/AuthContext';
import './Checkout.css';

/**
 * Checkout Page
 * Wraps Stripe Elements provider and displays payment form
 */
const Checkout = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();

  const [stripePromise, setStripePromise] = useState(null);
  const [reservation, setReservation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [paymentProcessing, setPaymentProcessing] = useState(false);

  const reservationId = searchParams.get('reservation_id');

  // Initialize Stripe and fetch reservation details
  useEffect(() => {
    const initialize = async () => {
      try {
        setLoading(true);

        // Initialize Stripe
        const stripe = await stripeService.initializeStripe();
        setStripePromise(stripe);

        // Fetch reservation details
        if (reservationId) {
          const reservationData = await reservationsService.getReservation(
            reservationId
          );
          if (!reservationData) {
            setError('Reservation not found');
            return;
          }
          setReservation(reservationData);
        }
      } catch (err) {
        console.error('Initialization error:', err);
        setError(err.message || 'Failed to initialize checkout');
      } finally {
        setLoading(false);
      }
    };

    if (!user) {
      navigate('/auth/login');
      return;
    }

    if (!reservationId) {
      setError('Invalid reservation ID');
      return;
    }

    initialize();
  }, [reservationId, user, navigate]);

  const handlePaymentSuccess = async (paymentData) => {
    setPaymentProcessing(true);
    try {
      // Show success toast
      Toast.showSuccess('Payment processed successfully!');

      // Redirect to reservation confirmation
      setTimeout(() => {
        navigate(`/client/reservations/${paymentData.reservation_id}`, {
          state: { success: true, paymentId: paymentData.payment_id },
        });
      }, 1000);
    } catch (err) {
      Toast.showError('Failed to redirect after payment');
    } finally {
      setPaymentProcessing(false);
    }
  };

  const handlePaymentError = (errorMessage) => {
    Toast.showError(`Payment failed: ${errorMessage}`);
    setPaymentProcessing(false);
  };

  if (loading) {
    return (
      <div className="checkout-container">
        <Loader />
      </div>
    );
  }

  if (error) {
    return (
      <div className="checkout-container">
        <div className="error-card">
          <h2>Checkout Error</h2>
          <p>{error}</p>
          <button
            className="btn-secondary"
            onClick={() => navigate('/client/dashboard')}
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (!reservation) {
    return (
      <div className="checkout-container">
        <div className="error-card">
          <h2>Reservation Not Found</h2>
          <p>The reservation you are trying to pay for could not be found.</p>
          <button
            className="btn-secondary"
            onClick={() => navigate('/client/dashboard')}
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="checkout-page">
      <div className="checkout-header">
        <h1>Secure Payment</h1>
        <p>Complete your booking by entering your payment information</p>
      </div>

      <div className="checkout-container">
        {stripePromise && (
          <Elements stripe={stripePromise}>
            <StripeCheckout
              reservationId={Number(reservationId)}
              amount={reservation.total_price || 0}
              stylistName={reservation.stylist?.user?.name || 'Professional'}
              serviceName={reservation.service?.name || 'Service'}
              appointmentDate={reservation.scheduled_at}
              onPaymentSuccess={handlePaymentSuccess}
              onPaymentError={handlePaymentError}
            />
          </Elements>
        )}
      </div>

      <div className="checkout-footer">
        <button
          className="btn-link"
          onClick={() => navigate(-1)}
          disabled={paymentProcessing}
        >
          ← Back to Booking
        </button>
      </div>
    </div>
  );
};

export default Checkout;
