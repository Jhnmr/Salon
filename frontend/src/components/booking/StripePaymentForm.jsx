/**
 * SALON PWA - Stripe Payment Form Component
 * Handles secure payment processing via Stripe
 */

import { useState } from 'react';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { Button } from '../ui';

const CARD_ELEMENT_OPTIONS = {
  style: {
    base: {
      color: '#ffffff',
      fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      fontSmoothing: 'antialiased',
      fontSize: '16px',
      '::placeholder': {
        color: '#9CA3AF',
      },
    },
    invalid: {
      color: '#EF4444',
      iconColor: '#EF4444',
    },
  },
  hidePostalCode: false,
};

/**
 * StripePaymentForm Component
 * @param {Object} props
 * @param {number} props.amount - Amount to charge (in cents)
 * @param {string} props.currency - Currency code (default: 'usd')
 * @param {Function} props.onSuccess - Callback when payment succeeds
 * @param {Function} props.onError - Callback when payment fails
 * @param {boolean} props.disabled - Disable the form
 */
const StripePaymentForm = ({
  amount,
  currency = 'usd',
  onSuccess,
  onError,
  disabled = false
}) => {
  const stripe = useStripe();
  const elements = useElements();

  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Handle payment submission
   */
  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!stripe || !elements) {
      // Stripe.js has not yet loaded
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      // Get the CardElement
      const cardElement = elements.getElement(CardElement);

      // Create payment method
      const { error: stripeError, paymentMethod } = await stripe.createPaymentMethod({
        type: 'card',
        card: cardElement,
      });

      if (stripeError) {
        throw new Error(stripeError.message);
      }

      // Call success callback with payment method
      if (onSuccess) {
        await onSuccess(paymentMethod);
      }

    } catch (err) {
      setError(err.message || 'Payment failed. Please try again.');
      if (onError) {
        onError(err);
      }
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Amount Display */}
      <div className="bg-gray-700/50 rounded-lg p-4 border border-gray-600">
        <div className="flex justify-between items-center">
          <span className="text-gray-300 text-sm">Total Amount:</span>
          <span className="text-2xl font-bold text-yellow-400">
            ${(amount / 100).toFixed(2)}
          </span>
        </div>
      </div>

      {/* Card Element */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Card Information
        </label>
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 focus-within:ring-2 focus-within:ring-yellow-400 focus-within:border-transparent transition-all">
          <CardElement options={CARD_ELEMENT_OPTIONS} />
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-500/10 border border-red-500 text-red-500 rounded-lg p-4 text-sm">
          {error}
        </div>
      )}

      {/* Security Notice */}
      <div className="flex items-start space-x-2 text-xs text-gray-400">
        <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
        </svg>
        <p>
          Your payment information is encrypted and secure. We never store your card details.
          Powered by Stripe.
        </p>
      </div>

      {/* Submit Button */}
      <Button
        type="submit"
        variant="primary"
        fullWidth
        disabled={!stripe || isProcessing || disabled}
        isLoading={isProcessing}
      >
        {isProcessing ? 'Processing Payment...' : `Pay $${(amount / 100).toFixed(2)}`}
      </Button>
    </form>
  );
};

export default StripePaymentForm;
