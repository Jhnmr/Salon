/**
 * SALON PWA - Pages Index
 * Central export for all application pages
 */

// Auth Pages
export * from './auth';

// Client Pages
export * from './client';

// Stylist Pages
export * from './stylist';

// Admin Pages
export * from './admin';

// Shared Pages
export { default as Home } from './Home';
export { default as ServiceDetails } from './ServiceDetails';
export { default as StylistProfile } from './StylistProfile';
export { default as NotFound } from './NotFound';
export { default as Unauthorized } from './Unauthorized';
