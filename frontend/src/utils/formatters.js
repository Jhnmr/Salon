/**
 * SALON PWA - Data Formatters
 * Utility functions for formatting dates, times, currency, and durations
 */

/**
 * Format currency amount
 * @param {number} amount - Amount to format
 * @param {string} currency - Currency code (default: 'USD')
 * @returns {string} Formatted currency string
 */
export const formatCurrency = (amount, currency = 'USD') => {
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch (error) {
    console.error('Failed to format currency:', error);
    return `${currency} ${amount.toFixed(2)}`;
  }
};

/**
 * Format date
 * @param {string|Date} date - Date to format
 * @param {string} format - Format type ('short', 'medium', 'long', 'full')
 * @returns {string} Formatted date string
 */
export const formatDate = (date, format = 'medium') => {
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;

    const options = {
      short: { month: 'numeric', day: 'numeric', year: '2-digit' },
      medium: { month: 'short', day: 'numeric', year: 'numeric' },
      long: { month: 'long', day: 'numeric', year: 'numeric' },
      full: { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' },
    };

    return new Intl.DateTimeFormat('en-US', options[format] || options.medium).format(dateObj);
  } catch (error) {
    console.error('Failed to format date:', error);
    return String(date);
  }
};

/**
 * Format time
 * @param {string|Date} time - Time to format
 * @param {boolean} use24Hour - Use 24-hour format (default: false)
 * @returns {string} Formatted time string
 */
export const formatTime = (time, use24Hour = false) => {
  try {
    const dateObj = typeof time === 'string' ? new Date(time) : time;

    return new Intl.DateTimeFormat('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: !use24Hour,
    }).format(dateObj);
  } catch (error) {
    console.error('Failed to format time:', error);
    return String(time);
  }
};

/**
 * Format date and time together
 * @param {string|Date} dateTime - DateTime to format
 * @returns {string} Formatted date and time string
 */
export const formatDateTime = (dateTime) => {
  try {
    const dateObj = typeof dateTime === 'string' ? new Date(dateTime) : dateTime;

    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    }).format(dateObj);
  } catch (error) {
    console.error('Failed to format datetime:', error);
    return String(dateTime);
  }
};

/**
 * Format duration from minutes to readable string
 * @param {number} minutes - Duration in minutes
 * @returns {string} Formatted duration (e.g., "1h 30m", "45m")
 */
export const formatDuration = (minutes) => {
  try {
    if (minutes < 60) {
      return `${minutes}m`;
    }

    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;

    if (remainingMinutes === 0) {
      return `${hours}h`;
    }

    return `${hours}h ${remainingMinutes}m`;
  } catch (error) {
    console.error('Failed to format duration:', error);
    return `${minutes}m`;
  }
};

/**
 * Format relative time (e.g., "2 hours ago", "in 3 days")
 * @param {string|Date} date - Date to compare
 * @returns {string} Relative time string
 */
export const formatRelativeTime = (date) => {
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    const now = new Date();
    const diffMs = dateObj - now;
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);

    if (Math.abs(diffSec) < 60) {
      return 'just now';
    } else if (Math.abs(diffMin) < 60) {
      return diffMin > 0 ? `in ${diffMin} minutes` : `${Math.abs(diffMin)} minutes ago`;
    } else if (Math.abs(diffHour) < 24) {
      return diffHour > 0 ? `in ${diffHour} hours` : `${Math.abs(diffHour)} hours ago`;
    } else if (Math.abs(diffDay) < 30) {
      return diffDay > 0 ? `in ${diffDay} days` : `${Math.abs(diffDay)} days ago`;
    } else {
      return formatDate(dateObj, 'medium');
    }
  } catch (error) {
    console.error('Failed to format relative time:', error);
    return String(date);
  }
};

/**
 * Format phone number
 * @param {string} phone - Phone number to format
 * @returns {string} Formatted phone number
 */
export const formatPhoneNumber = (phone) => {
  try {
    const cleaned = phone.replace(/\D/g, '');

    if (cleaned.length === 10) {
      return cleaned.replace(/(\d{3})(\d{3})(\d{4})/, '($1) $2-$3');
    } else if (cleaned.length === 11 && cleaned[0] === '1') {
      return cleaned.replace(/(\d{1})(\d{3})(\d{3})(\d{4})/, '+$1 ($2) $3-$4');
    }

    return phone;
  } catch (error) {
    console.error('Failed to format phone number:', error);
    return phone;
  }
};

/**
 * Truncate text with ellipsis
 * @param {string} text - Text to truncate
 * @param {number} maxLength - Maximum length
 * @returns {string} Truncated text
 */
export const truncateText = (text, maxLength = 100) => {
  if (!text || text.length <= maxLength) return text;
  return text.substring(0, maxLength).trim() + '...';
};

/**
 * Format file size
 * @param {number} bytes - File size in bytes
 * @returns {string} Formatted file size
 */
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
};

export default {
  formatCurrency,
  formatDate,
  formatTime,
  formatDateTime,
  formatDuration,
  formatRelativeTime,
  formatPhoneNumber,
  truncateText,
  formatFileSize,
};
