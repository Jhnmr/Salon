/**
 * SALON PWA - Stripe Payment Component
 * Handles payment processing with Stripe
 *
 * NOTE: Requires @stripe/react-stripe-js and @stripe/stripe-js packages
 * Install: npm install @stripe/react-stripe-js @stripe/stripe-js
 */

import { useState } from 'react';
import { Button } from './ui';

/**
 * StripePayment Component
 * Renders Stripe payment form for booking appointments
 *
 * @param {number} amount - Amount to charge in cents
 * @param {string} currency - Currency code (default: USD)
 * @param {Function} onSuccess - Callback when payment succeeds (paymentMethod) => void
 * @param {Function} onError - Callback when payment fails (error) => void
 */
const StripePayment = ({ amount, currency = 'USD', onSuccess, onError }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentError, setPaymentError] = useState(null);

  const stripePublicKey = import.meta.env.VITE_STRIPE_PUBLIC_KEY;

  // Check if Stripe is configured
  if (!stripePublicKey || stripePublicKey === 'pk_test_51xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx') {
    return (
      <div className="bg-gray-800 rounded-lg p-6 text-center">
        <svg className="w-16 h-16 text-gray-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
          />
        </svg>
        <h3 className="text-xl font-semibold text-white mb-2">Stripe Payment Integration</h3>
        <p className="text-gray-400 mb-4">
          To enable Stripe payments, you need to:
        </p>
        <ol className="text-left text-gray-300 space-y-2 mb-6 max-w-md mx-auto">
          <li className="flex items-start">
            <span className="text-yellow-400 mr-2">1.</span>
            <span>
              Get your Stripe API keys from{' '}
              <a
                href="https://dashboard.stripe.com/apikeys"
                target="_blank"
                rel="noopener noreferrer"
                className="text-yellow-400 hover:underline"
              >
                Stripe Dashboard
              </a>
            </span>
          </li>
          <li className="flex items-start">
            <span className="text-yellow-400 mr-2">2.</span>
            <span>
              Install: <code className="bg-gray-700 px-2 py-1 rounded text-sm">npm install @stripe/react-stripe-js @stripe/stripe-js</code>
            </span>
          </li>
          <li className="flex items-start">
            <span className="text-yellow-400 mr-2">3.</span>
            <span>
              Add to frontend/.env: <code className="bg-gray-700 px-2 py-1 rounded text-sm">VITE_STRIPE_PUBLIC_KEY=pk_...</code>
            </span>
          </li>
          <li className="flex items-start">
            <span className="text-yellow-400 mr-2">4.</span>
            <span>
              Add to backend/.env: <code className="bg-gray-700 px-2 py-1 rounded text-sm">STRIPE_SECRET_KEY=sk_...</code>
            </span>
          </li>
        </ol>

        <div className="bg-gray-700 p-4 rounded-lg">
          <p className="text-sm text-gray-300 mb-2">Payment Summary:</p>
          <div className="flex justify-between items-center">
            <span className="text-white">Amount:</span>
            <span className="text-yellow-400 text-xl font-bold">
              ${(amount / 100).toFixed(2)} {currency}
            </span>
          </div>
        </div>

        <div className="mt-6">
          <Button
            variant="primary"
            fullWidth
            onClick={() => {
              // Simulate payment for demo
              if (onSuccess) {
                onSuccess({
                  id: 'demo_pm_' + Date.now(),
                  type: 'card',
                  card: { last4: '4242' },
                });
              }
            }}
          >
            Simulate Payment (Demo Mode)
          </Button>
        </div>
      </div>
    );
  }

  // TODO: When @stripe/react-stripe-js is installed, replace the above with:
  /*
  import { loadStripe } from '@stripe/stripe-js';
  import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';

  const stripePromise = loadStripe(stripePublicKey);

  const CheckoutForm = () => {
    const stripe = useStripe();
    const elements = useElements();

    const handleSubmit = async (event) => {
      event.preventDefault();

      if (!stripe || !elements) {
        return;
      }

      setIsProcessing(true);
      setPaymentError(null);

      try {
        // Create payment method
        const { error, paymentMethod } = await stripe.createPaymentMethod({
          type: 'card',
          card: elements.getElement(CardElement),
        });

        if (error) {
          setPaymentError(error.message);
          if (onError) onError(error);
        } else {
          // Payment method created successfully
          if (onSuccess) onSuccess(paymentMethod);
        }
      } catch (error) {
        setPaymentError(error.message);
        if (onError) onError(error);
      } finally {
        setIsProcessing(false);
      }
    };

    return (
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="bg-gray-800 p-4 rounded-lg">
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Card Details
          </label>
          <CardElement
            options={{
              style: {
                base: {
                  fontSize: '16px',
                  color: '#ffffff',
                  '::placeholder': {
                    color: '#9ca3af',
                  },
                },
                invalid: {
                  color: '#ef4444',
                },
              },
            }}
            className="bg-gray-700 p-4 rounded-lg"
          />
        </div>

        {paymentError && (
          <div className="bg-red-900/20 border border-red-500 text-red-400 p-3 rounded-lg">
            {paymentError}
          </div>
        )}

        <div className="bg-gray-700 p-4 rounded-lg">
          <div className="flex justify-between items-center">
            <span className="text-gray-300">Total Amount:</span>
            <span className="text-yellow-400 text-2xl font-bold">
              ${(amount / 100).toFixed(2)} {currency}
            </span>
          </div>
        </div>

        <Button
          type="submit"
          variant="primary"
          fullWidth
          disabled={!stripe || isProcessing}
          isLoading={isProcessing}
        >
          {isProcessing ? 'Processing...' : `Pay $${(amount / 100).toFixed(2)}`}
        </Button>
      </form>
    );
  };

  return (
    <Elements stripe={stripePromise}>
      <CheckoutForm />
    </Elements>
  );
  */

  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <p className="text-gray-400">Stripe payment component placeholder</p>
      <div className="mt-4">
        <p className="text-white">Amount: ${(amount / 100).toFixed(2)} {currency}</p>
      </div>
    </div>
  );
};

export default StripePayment;
