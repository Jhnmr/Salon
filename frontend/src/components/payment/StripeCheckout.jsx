import React, { useState, useEffect } from 'react';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import stripeService from '../../services/stripe.service';
import { Toast } from '../ui';
import Button from '../ui/Button';
import './StripeCheckout.css';

/**
 * Stripe Checkout Component
 * Handles payment processing with Stripe Elements
 */
const StripeCheckout = ({
  reservationId,
  amount,
  onPaymentSuccess,
  onPaymentError,
  stylistName,
  serviceName,
  appointmentDate
}) => {
  const stripe = useStripe();
  const elements = useElements();

  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [cardElementOptions] = useState({
    style: {
      base: {
        fontSize: '16px',
        color: '#424770',
        '::placeholder': {
          color: '#aab7c4',
        },
      },
      invalid: {
        color: '#fa755a',
      },
    },
  });

  const handleCardChange = (event) => {
    if (event.error) {
      setError(event.error.message);
    } else {
      setError(null);
    }
  };

  const handlePaymentSubmit = async (e) => {
    e.preventDefault();

    if (!stripe || !elements) {
      setError('Stripe has not loaded yet. Please try again.');
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      // Step 1: Create Payment Intent on backend
      const { clientSecret, paymentIntentId } =
        await stripeService.createPaymentIntent(reservationId);

      // Step 2: Create Payment Method from card element
      const { error: pmError, paymentMethod } =
        await stripe.createPaymentMethod({
          type: 'card',
          card: elements.getElement(CardElement),
        });

      if (pmError) {
        setError(pmError.message);
        setIsProcessing(false);
        return;
      }

      // Step 3: Confirm Payment Intent
      const { status: confirmStatus, error: confirmError, paymentIntent } =
        await stripe.confirmCardPayment(clientSecret, {
          payment_method: paymentMethod.id,
        });

      if (confirmError) {
        setError(confirmError.message);
        if (onPaymentError) {
          onPaymentError(confirmError.message);
        }
        setIsProcessing(false);
        return;
      }

      // Step 4: Check payment status
      if (paymentIntent.status === 'succeeded') {
        // Payment successful - confirm on backend to create payment record
        const confirmResponse =
          await stripeService.confirmPayment(
            paymentIntentId,
            paymentMethod.id,
            reservationId
          );

        setSuccess(true);
        if (onPaymentSuccess) {
          onPaymentSuccess(confirmResponse);
        }

        // Clear form
        elements.getElement(CardElement).clear();
      } else if (paymentIntent.status === 'requires_action') {
        // Requires additional action (3D Secure, etc.)
        setError('Please complete the additional authentication required by your bank.');
      } else {
        setError('Payment could not be processed. Please try again.');
      }
    } catch (err) {
      console.error('Payment error:', err);
      setError(err.message || 'An error occurred while processing payment');
      if (onPaymentError) {
        onPaymentError(err.message);
      }
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="stripe-checkout">
      <div className="payment-summary">
        <h3>Payment Summary</h3>
        <div className="summary-item">
          <span>Stylist:</span>
          <strong>{stylistName}</strong>
        </div>
        <div className="summary-item">
          <span>Service:</span>
          <strong>{serviceName}</strong>
        </div>
        <div className="summary-item">
          <span>Date & Time:</span>
          <strong>{new Date(appointmentDate).toLocaleString()}</strong>
        </div>
        <div className="summary-item total">
          <span>Total Amount:</span>
          <strong className="amount">${amount.toFixed(2)}</strong>
        </div>
      </div>

      <form onSubmit={handlePaymentSubmit} className="payment-form">
        <div className="form-group">
          <label htmlFor="card-element">Card Details</label>
          <div className="card-element-wrapper">
            <CardElement
              id="card-element"
              options={cardElementOptions}
              onChange={handleCardChange}
            />
          </div>
        </div>

        {error && (
          <div className="alert alert-error">
            <strong>Error:</strong> {error}
          </div>
        )}

        {success && (
          <div className="alert alert-success">
            <strong>Success!</strong> Your payment has been processed successfully.
          </div>
        )}

        <Button
          type="submit"
          disabled={!stripe || isProcessing || success}
          variant="primary"
          fullWidth
          className="pay-button"
        >
          {isProcessing ? 'Processing...' : `Pay $${amount.toFixed(2)}`}
        </Button>

        <p className="security-notice">
          🔒 Your payment information is secure. We use Stripe for secure payment processing.
        </p>
      </form>
    </div>
  );
};

export default StripeCheckout;
