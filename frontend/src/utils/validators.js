/**
 * SALON PWA - Client-side Validators
 * Form validation utilities for common input types
 */

/**
 * Validate email address
 * @param {string} email - Email address to validate
 * @returns {boolean} True if valid email
 */
export const validateEmail = (email) => {
  if (!email) return false;

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Get email validation error message
 * @param {string} email - Email address
 * @returns {string|null} Error message or null if valid
 */
export const getEmailError = (email) => {
  if (!email) return 'Email is required';
  if (!validateEmail(email)) return 'Please enter a valid email address';
  return null;
};

/**
 * Validate phone number (US format)
 * @param {string} phone - Phone number to validate
 * @returns {boolean} True if valid phone
 */
export const validatePhone = (phone) => {
  if (!phone) return false;

  const cleaned = phone.replace(/\D/g, '');
  return cleaned.length === 10 || (cleaned.length === 11 && cleaned[0] === '1');
};

/**
 * Get phone validation error message
 * @param {string} phone - Phone number
 * @returns {string|null} Error message or null if valid
 */
export const getPhoneError = (phone) => {
  if (!phone) return 'Phone number is required';
  if (!validatePhone(phone)) return 'Please enter a valid 10-digit phone number';
  return null;
};

/**
 * Validate password strength
 * @param {string} password - Password to validate
 * @param {Object} options - Validation options
 * @returns {boolean} True if valid password
 */
export const validatePassword = (password, options = {}) => {
  const {
    minLength = 8,
    requireUppercase = true,
    requireLowercase = true,
    requireNumber = true,
    requireSpecial = false,
  } = options;

  if (!password || password.length < minLength) return false;

  if (requireUppercase && !/[A-Z]/.test(password)) return false;
  if (requireLowercase && !/[a-z]/.test(password)) return false;
  if (requireNumber && !/\d/.test(password)) return false;
  if (requireSpecial && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) return false;

  return true;
};

/**
 * Get password validation error message
 * @param {string} password - Password
 * @param {Object} options - Validation options
 * @returns {string|null} Error message or null if valid
 */
export const getPasswordError = (password, options = {}) => {
  const {
    minLength = 8,
    requireUppercase = true,
    requireLowercase = true,
    requireNumber = true,
    requireSpecial = false,
  } = options;

  if (!password) return 'Password is required';
  if (password.length < minLength) return `Password must be at least ${minLength} characters`;
  if (requireUppercase && !/[A-Z]/.test(password)) return 'Password must contain an uppercase letter';
  if (requireLowercase && !/[a-z]/.test(password)) return 'Password must contain a lowercase letter';
  if (requireNumber && !/\d/.test(password)) return 'Password must contain a number';
  if (requireSpecial && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    return 'Password must contain a special character';
  }

  return null;
};

/**
 * Validate password confirmation
 * @param {string} password - Original password
 * @param {string} confirmPassword - Confirmation password
 * @returns {boolean} True if passwords match
 */
export const validatePasswordConfirmation = (password, confirmPassword) => {
  return password === confirmPassword;
};

/**
 * Get password confirmation error message
 * @param {string} password - Original password
 * @param {string} confirmPassword - Confirmation password
 * @returns {string|null} Error message or null if valid
 */
export const getPasswordConfirmationError = (password, confirmPassword) => {
  if (!confirmPassword) return 'Please confirm your password';
  if (!validatePasswordConfirmation(password, confirmPassword)) return 'Passwords do not match';
  return null;
};

/**
 * Validate required field
 * @param {any} value - Value to validate
 * @returns {boolean} True if not empty
 */
export const validateRequired = (value) => {
  if (value === null || value === undefined) return false;
  if (typeof value === 'string') return value.trim().length > 0;
  if (Array.isArray(value)) return value.length > 0;
  return true;
};

/**
 * Get required field error message
 * @param {any} value - Value
 * @param {string} fieldName - Name of the field
 * @returns {string|null} Error message or null if valid
 */
export const getRequiredError = (value, fieldName = 'This field') => {
  if (!validateRequired(value)) return `${fieldName} is required`;
  return null;
};

/**
 * Validate minimum length
 * @param {string} value - Value to validate
 * @param {number} minLength - Minimum length
 * @returns {boolean} True if meets minimum length
 */
export const validateMinLength = (value, minLength) => {
  return value && value.length >= minLength;
};

/**
 * Get minimum length error message
 * @param {string} value - Value
 * @param {number} minLength - Minimum length
 * @param {string} fieldName - Name of the field
 * @returns {string|null} Error message or null if valid
 */
export const getMinLengthError = (value, minLength, fieldName = 'This field') => {
  if (!validateMinLength(value, minLength)) {
    return `${fieldName} must be at least ${minLength} characters`;
  }
  return null;
};

/**
 * Validate maximum length
 * @param {string} value - Value to validate
 * @param {number} maxLength - Maximum length
 * @returns {boolean} True if within maximum length
 */
export const validateMaxLength = (value, maxLength) => {
  return !value || value.length <= maxLength;
};

/**
 * Get maximum length error message
 * @param {string} value - Value
 * @param {number} maxLength - Maximum length
 * @param {string} fieldName - Name of the field
 * @returns {string|null} Error message or null if valid
 */
export const getMaxLengthError = (value, maxLength, fieldName = 'This field') => {
  if (!validateMaxLength(value, maxLength)) {
    return `${fieldName} must be no more than ${maxLength} characters`;
  }
  return null;
};

/**
 * Validate numeric value
 * @param {any} value - Value to validate
 * @returns {boolean} True if numeric
 */
export const validateNumeric = (value) => {
  return !isNaN(parseFloat(value)) && isFinite(value);
};

/**
 * Get numeric validation error message
 * @param {any} value - Value
 * @param {string} fieldName - Name of the field
 * @returns {string|null} Error message or null if valid
 */
export const getNumericError = (value, fieldName = 'This field') => {
  if (!validateNumeric(value)) return `${fieldName} must be a number`;
  return null;
};

/**
 * Validate minimum value
 * @param {number} value - Value to validate
 * @param {number} min - Minimum value
 * @returns {boolean} True if greater than or equal to min
 */
export const validateMin = (value, min) => {
  return parseFloat(value) >= min;
};

/**
 * Get minimum value error message
 * @param {number} value - Value
 * @param {number} min - Minimum value
 * @param {string} fieldName - Name of the field
 * @returns {string|null} Error message or null if valid
 */
export const getMinError = (value, min, fieldName = 'This field') => {
  if (!validateMin(value, min)) return `${fieldName} must be at least ${min}`;
  return null;
};

/**
 * Validate maximum value
 * @param {number} value - Value to validate
 * @param {number} max - Maximum value
 * @returns {boolean} True if less than or equal to max
 */
export const validateMax = (value, max) => {
  return parseFloat(value) <= max;
};

/**
 * Get maximum value error message
 * @param {number} value - Value
 * @param {number} max - Maximum value
 * @param {string} fieldName - Name of the field
 * @returns {string|null} Error message or null if valid
 */
export const getMaxError = (value, max, fieldName = 'This field') => {
  if (!validateMax(value, max)) return `${fieldName} must be no more than ${max}`;
  return null;
};

/**
 * Validate date is in the future
 * @param {string|Date} date - Date to validate
 * @returns {boolean} True if date is in the future
 */
export const validateFutureDate = (date) => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj > new Date();
};

/**
 * Get future date error message
 * @param {string|Date} date - Date
 * @param {string} fieldName - Name of the field
 * @returns {string|null} Error message or null if valid
 */
export const getFutureDateError = (date, fieldName = 'Date') => {
  if (!validateFutureDate(date)) return `${fieldName} must be in the future`;
  return null;
};

/**
 * Validate date is in the past
 * @param {string|Date} date - Date to validate
 * @returns {boolean} True if date is in the past
 */
export const validatePastDate = (date) => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj < new Date();
};

/**
 * Get past date error message
 * @param {string|Date} date - Date
 * @param {string} fieldName - Name of the field
 * @returns {string|null} Error message or null if valid
 */
export const getPastDateError = (date, fieldName = 'Date') => {
  if (!validatePastDate(date)) return `${fieldName} must be in the past`;
  return null;
};

/**
 * Validate URL
 * @param {string} url - URL to validate
 * @returns {boolean} True if valid URL
 */
export const validateUrl = (url) => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

/**
 * Get URL validation error message
 * @param {string} url - URL
 * @param {string} fieldName - Name of the field
 * @returns {string|null} Error message or null if valid
 */
export const getUrlError = (url, fieldName = 'URL') => {
  if (!url) return `${fieldName} is required`;
  if (!validateUrl(url)) return 'Please enter a valid URL';
  return null;
};

export default {
  validateEmail,
  getEmailError,
  validatePhone,
  getPhoneError,
  validatePassword,
  getPasswordError,
  validatePasswordConfirmation,
  getPasswordConfirmationError,
  validateRequired,
  getRequiredError,
  validateMinLength,
  getMinLengthError,
  validateMaxLength,
  getMaxLengthError,
  validateNumeric,
  getNumericError,
  validateMin,
  getMinError,
  validateMax,
  getMaxError,
  validateFutureDate,
  getFutureDateError,
  validatePastDate,
  getPastDateError,
  validateUrl,
  getUrlError,
};
