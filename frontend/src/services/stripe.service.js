import api from './api';
import { loadStripe } from '@stripe/js';

/**
 * Stripe Payment Service
 * Handles all Stripe-related API calls and utilities
 */
class StripeService {
  constructor() {
    this.stripePromise = null;
    this.publishableKey = null;
  }

  /**
   * Initialize Stripe with publishable key
   * @returns {Promise<Stripe>}
   */
  async initializeStripe() {
    if (this.stripePromise) {
      return this.stripePromise;
    }

    try {
      // Fetch publishable key from backend
      const response = await api.get('/payments/stripe/public-key');
      this.publishableKey = response.data.data.publishable_key;

      if (!this.publishableKey) {
        throw new Error('Failed to fetch Stripe publishable key');
      }

      // Load Stripe
      this.stripePromise = loadStripe(this.publishableKey);
      return this.stripePromise;
    } catch (error) {
      console.error('Error initializing Stripe:', error);
      throw error;
    }
  }

  /**
   * Create a Payment Intent for a reservation
   * @param {number} reservationId - Reservation ID
   * @returns {Promise<{clientSecret: string, paymentIntentId: string, amount: number}>}
   */
  async createPaymentIntent(reservationId) {
    try {
      const response = await api.post('/payments/stripe/create-intent', {
        reservation_id: reservationId,
      });

      if (response.data.status !== 'success') {
        throw new Error(response.data.message || 'Failed to create payment intent');
      }

      return response.data.data;
    } catch (error) {
      console.error('Error creating payment intent:', error);
      throw error;
    }
  }

  /**
   * Confirm a payment with payment method
   * @param {string} paymentIntentId - Payment Intent ID
   * @param {string} paymentMethodId - Payment Method ID
   * @param {number} reservationId - Reservation ID
   * @returns {Promise<{paymentId: number, status: string}>}
   */
  async confirmPayment(paymentIntentId, paymentMethodId, reservationId) {
    try {
      const response = await api.post('/payments/stripe/confirm', {
        payment_intent_id: paymentIntentId,
        payment_method_id: paymentMethodId,
        reservation_id: reservationId,
      });

      if (response.data.status !== 'success') {
        if (response.data.status === 'requires_action') {
          // Handle 3D Secure or other actions
          return {
            status: 'requires_action',
            clientSecret: response.data.data.client_secret,
          };
        }
        throw new Error(response.data.message || 'Payment failed');
      }

      return response.data.data;
    } catch (error) {
      console.error('Error confirming payment:', error);
      throw error;
    }
  }

  /**
   * Confirm payment with Stripe (handles 3D Secure, etc.)
   * @param {Stripe} stripe - Stripe instance
   * @param {string} clientSecret - Payment Intent client secret
   * @returns {Promise}
   */
  async handlePaymentConfirmation(stripe, clientSecret) {
    if (!stripe) {
      throw new Error('Stripe not initialized');
    }

    try {
      const result = await stripe.confirmCardPayment(clientSecret);

      if (result.error) {
        throw new Error(result.error.message);
      }

      return result.paymentIntent;
    } catch (error) {
      console.error('Error handling payment confirmation:', error);
      throw error;
    }
  }

  /**
   * Get Stripe instance
   * @returns {Promise<Stripe>}
   */
  async getStripe() {
    if (!this.stripePromise) {
      return this.initializeStripe();
    }
    return this.stripePromise;
  }

  /**
   * Get publishable key
   * @returns {string}
   */
  getPublishableKey() {
    return this.publishableKey;
  }
}

// Singleton instance
const stripeService = new StripeService();

export default stripeService;
