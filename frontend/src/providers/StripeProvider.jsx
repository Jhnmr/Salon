/**
 * SALON PWA - Stripe Provider
 * Wraps the application with Stripe Elements context
 */

import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';

// Load Stripe with publishable key from environment
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || 'pk_test_placeholder');

/**
 * StripeProvider Component
 * Provides Stripe context to child components
 */
const StripeProvider = ({ children }) => {
  const options = {
    // Stripe Elements appearance customization
    appearance: {
      theme: 'night',
      variables: {
        colorPrimary: '#FFD700', // Yellow accent
        colorBackground: '#1A1A1C', // Dark background
        colorText: '#ffffff',
        colorDanger: '#EF4444',
        fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        spacingUnit: '4px',
        borderRadius: '8px',
      },
      rules: {
        '.Label': {
          color: '#9CA3AF',
          fontSize: '14px',
          fontWeight: '500',
        },
        '.Input': {
          backgroundColor: '#2D2D30',
          border: '1px solid #374151',
          color: '#ffffff',
        },
        '.Input:focus': {
          border: '1px solid #FFD700',
          boxShadow: '0 0 0 2px rgba(255, 215, 0, 0.2)',
        },
        '.Input--invalid': {
          border: '1px solid #EF4444',
        },
      },
    },
  };

  return (
    <Elements stripe={stripePromise} options={options}>
      {children}
    </Elements>
  );
};

export default StripeProvider;
