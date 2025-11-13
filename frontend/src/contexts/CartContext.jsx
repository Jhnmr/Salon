/**
 * SALON PWA - Cart Context
 * Manages booking cart state (services, stylist, date/time selection)
 */

import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { saveCart, getCart, removeCart as removeStoredCart } from '../utils/storage';

const CartContext = createContext(null);

/**
 * Cart Provider Component
 * Manages shopping cart for booking services
 */
export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState({
    items: [],
    stylist: null,
    date: null,
    time: null,
    notes: '',
  });

  /**
   * Load cart from localStorage on mount
   */
  useEffect(() => {
    const storedCart = getCart();
    if (storedCart) {
      setCart(storedCart);
    }
  }, []);

  /**
   * Save cart to localStorage whenever it changes
   */
  useEffect(() => {
    if (cart.items.length > 0 || cart.stylist || cart.date || cart.time) {
      saveCart(cart);
    } else {
      removeStoredCart();
    }
  }, [cart]);

  /**
   * Add service to cart
   * @param {Object} service - Service object
   */
  const addService = useCallback((service) => {
    setCart((prevCart) => {
      const existingItem = prevCart.items.find((item) => item.id === service.id);

      if (existingItem) {
        // Service already in cart, don't add duplicate
        return prevCart;
      }

      return {
        ...prevCart,
        items: [...prevCart.items, { ...service, quantity: 1 }],
      };
    });
  }, []);

  /**
   * Remove service from cart
   * @param {string|number} serviceId - Service ID
   */
  const removeService = useCallback((serviceId) => {
    setCart((prevCart) => ({
      ...prevCart,
      items: prevCart.items.filter((item) => item.id !== serviceId),
    }));
  }, []);

  /**
   * Update service quantity
   * @param {string|number} serviceId - Service ID
   * @param {number} quantity - New quantity
   */
  const updateQuantity = useCallback((serviceId, quantity) => {
    if (quantity <= 0) {
      removeService(serviceId);
      return;
    }

    setCart((prevCart) => ({
      ...prevCart,
      items: prevCart.items.map((item) =>
        item.id === serviceId ? { ...item, quantity } : item
      ),
    }));
  }, []);

  /**
   * Set stylist for booking
   * @param {Object} stylist - Stylist object
   */
  const setStylist = useCallback((stylist) => {
    setCart((prevCart) => ({
      ...prevCart,
      stylist,
    }));
  }, []);

  /**
   * Set date and time for booking
   * @param {string} date - Date (YYYY-MM-DD)
   * @param {string} time - Time (HH:MM)
   */
  const setDateTime = useCallback((date, time) => {
    setCart((prevCart) => ({
      ...prevCart,
      date,
      time,
    }));
  }, []);

  /**
   * Set booking notes
   * @param {string} notes - Notes/comments
   */
  const setNotes = useCallback((notes) => {
    setCart((prevCart) => ({
      ...prevCart,
      notes,
    }));
  }, []);

  /**
   * Clear entire cart
   */
  const clearCart = useCallback(() => {
    setCart({
      items: [],
      stylist: null,
      date: null,
      time: null,
      notes: '',
    });
    removeStoredCart();
  }, []);

  /**
   * Get total price of all items in cart
   * @returns {number} Total price
   */
  const getTotalPrice = useCallback(() => {
    return cart.items.reduce((total, item) => {
      return total + (parseFloat(item.price) * (item.quantity || 1));
    }, 0);
  }, [cart.items]);

  /**
   * Get total duration of all services
   * @returns {number} Total duration in minutes
   */
  const getTotalDuration = useCallback(() => {
    return cart.items.reduce((total, item) => {
      return total + (parseInt(item.duration) * (item.quantity || 1));
    }, 0);
  }, [cart.items]);

  /**
   * Get number of items in cart
   * @returns {number} Item count
   */
  const getItemCount = useCallback(() => {
    return cart.items.reduce((count, item) => {
      return count + (item.quantity || 1);
    }, 0);
  }, [cart.items]);

  /**
   * Check if cart is empty
   * @returns {boolean}
   */
  const isEmpty = useCallback(() => {
    return cart.items.length === 0;
  }, [cart.items]);

  /**
   * Check if cart is ready for checkout
   * @returns {boolean}
   */
  const isReadyForCheckout = useCallback(() => {
    return (
      cart.items.length > 0 &&
      cart.stylist !== null &&
      cart.date !== null &&
      cart.time !== null
    );
  }, [cart]);

  /**
   * Validate cart before checkout
   * @returns {Object} Validation result with errors
   */
  const validateCart = useCallback(() => {
    const errors = [];

    if (cart.items.length === 0) {
      errors.push('Please add at least one service');
    }

    if (!cart.stylist) {
      errors.push('Please select a stylist');
    }

    if (!cart.date) {
      errors.push('Please select a date');
    }

    if (!cart.time) {
      errors.push('Please select a time');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }, [cart]);

  /**
   * Get cart data formatted for reservation creation
   * @returns {Object} Formatted cart data
   */
  const getCheckoutData = useCallback(() => {
    if (!isReadyForCheckout()) {
      throw new Error('Cart is not ready for checkout');
    }

    // Combine date and time into ISO string
    const scheduledAt = new Date(`${cart.date}T${cart.time}`).toISOString();

    return {
      stylist_id: cart.stylist.id,
      services: cart.items.map((item) => ({
        service_id: item.id,
        quantity: item.quantity || 1,
      })),
      scheduled_at: scheduledAt,
      notes: cart.notes,
    };
  }, [cart, isReadyForCheckout]);

  const value = {
    // State
    cart,
    items: cart.items,
    stylist: cart.stylist,
    date: cart.date,
    time: cart.time,
    notes: cart.notes,

    // Actions
    addService,
    removeService,
    updateQuantity,
    setStylist,
    setDateTime,
    setNotes,
    clearCart,

    // Helpers
    getTotalPrice,
    getTotalDuration,
    getItemCount,
    isEmpty,
    isReadyForCheckout,
    validateCart,
    getCheckoutData,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

/**
 * Hook to use Cart Context
 * @returns {Object} Cart context value
 */
export const useCart = () => {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }

  return context;
};

export default CartContext;
