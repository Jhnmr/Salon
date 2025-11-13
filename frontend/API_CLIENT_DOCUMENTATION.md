# SALON PWA - API Client & State Management Documentation

## Overview

This document describes the comprehensive API client and state management system for the SALON React PWA.

## Architecture

The system consists of four main layers:

1. **Utilities Layer** - Helper functions for storage, formatting, and validation
2. **API Client Layer** - Axios-based HTTP client with interceptors
3. **Services Layer** - API endpoint wrappers for different features
4. **State Management Layer** - React Context providers for global state

## Directory Structure

```
frontend/src/
├── services/
│   ├── api.js                      # Axios instance with interceptors
│   ├── auth.service.js             # Authentication API calls
│   ├── reservations.service.js     # Reservations API calls
│   ├── services.service.js         # Services API calls
│   ├── stylists.service.js         # Stylists API calls
│   ├── posts.service.js            # Posts/Portfolio API calls
│   ├── conversations.service.js    # Chat/Messaging API calls
│   ├── payments.service.js         # Payments API calls
│   └── index.js                    # Services exports
├── contexts/
│   ├── AuthContext.jsx             # Authentication state
│   ├── ReservationContext.jsx      # Reservations state
│   ├── CartContext.jsx             # Booking cart state
│   ├── NotificationContext.jsx     # Notifications state
│   ├── ThemeContext.jsx            # Theme state (existing)
│   ├── ToastContext.jsx            # Toast notifications (existing)
│   └── index.js                    # Context exports
├── utils/
│   ├── storage.js                  # localStorage wrapper
│   ├── formatters.js               # Data formatting utilities
│   ├── validators.js               # Form validation utilities
│   └── index.js                    # Utilities exports
├── components/
│   └── ProtectedRoute.jsx          # Route guard component
└── router.jsx                      # React Router configuration
```

## 1. API Client (`/src/services/api.js`)

### Features

- **Base URL Configuration**: Reads from `VITE_API_URL` environment variable
- **Request Interceptor**: Automatically adds JWT Authorization header
- **Response Interceptor**: Handles errors, token refresh, and logging
- **Automatic Token Refresh**: Refreshes expired tokens automatically
- **Error Handling**: Consistent error handling across all requests
- **Request Logging**: Logs all requests/responses in development mode

### Usage

```javascript
import { get, post, put, patch, del } from './services/api';

// GET request
const users = await get('/users', { params: { page: 1 } });

// POST request
const newUser = await post('/users', { name: 'John Doe' });

// File upload
import { upload } from './services/api';
const formData = new FormData();
formData.append('file', file);
const result = await upload('/uploads', formData);
```

### Error Handling

The API client automatically handles:
- **401 Unauthorized**: Attempts token refresh, redirects to login if refresh fails
- **403 Forbidden**: Returns permission error
- **404 Not Found**: Returns not found error
- **422 Validation Error**: Returns validation errors
- **429 Rate Limit**: Returns rate limit error with retry-after header
- **500+ Server Errors**: Returns generic server error

## 2. Services Layer

### Authentication Service (`auth.service.js`)

```javascript
import { authService } from './services';

// Login
const { user, access_token } = await authService.login('email@example.com', 'password');

// Register
const { user } = await authService.register({
  name: 'John Doe',
  email: 'john@example.com',
  password: 'password',
  password_confirmation: 'password',
  phone: '1234567890',
  role: 'client'
});

// Logout
await authService.logout();

// Get current user
const user = await authService.getCurrentUser();

// Forgot password
await authService.forgotPassword('email@example.com');

// Reset password
await authService.resetPassword('token', 'newPassword', 'newPassword');
```

### Reservations Service (`reservations.service.js`)

```javascript
import { reservationsService } from './services';

// Get reservations with filters
const reservations = await reservationsService.getReservations({
  status: 'confirmed',
  page: 1,
  per_page: 10
});

// Create reservation
const reservation = await reservationsService.createReservation({
  stylist_id: 1,
  service_id: 5,
  scheduled_at: '2025-11-15T14:00:00Z',
  notes: 'Please confirm'
});

// Check availability
const availability = await reservationsService.checkAvailability(
  stylistId,
  serviceId,
  '2025-11-15'
);

// Cancel reservation
await reservationsService.cancelReservation(reservationId, 'Reason for cancellation');
```

### Services Service (`services.service.js`)

```javascript
import { servicesService } from './services';

// Get all services
const services = await servicesService.getServices({ category_id: 2 });

// Search services
const results = await servicesService.searchServices('haircut', { min_price: 20 });

// Get service categories
const categories = await servicesService.getServiceCategories();

// Get popular services
const popular = await servicesService.getPopularServices(10);
```

### Other Services

Similar patterns for:
- **Stylists Service**: `stylistsService`
- **Posts Service**: `postsService`
- **Conversations Service**: `conversationsService`
- **Payments Service**: `paymentsService`

## 3. State Management (Contexts)

### AuthContext

```javascript
import { useAuth } from './contexts';

function MyComponent() {
  const {
    user,
    isAuthenticated,
    isLoading,
    login,
    logout,
    register,
    hasRole,
    hasPermission
  } = useAuth();

  const handleLogin = async () => {
    try {
      await login('email@example.com', 'password');
      // Redirected automatically
    } catch (error) {
      console.error(error);
    }
  };

  if (isLoading) return <div>Loading...</div>;

  return (
    <div>
      {isAuthenticated ? (
        <>
          <p>Welcome, {user.name}!</p>
          <button onClick={logout}>Logout</button>
        </>
      ) : (
        <button onClick={handleLogin}>Login</button>
      )}
    </div>
  );
}
```

### ReservationContext

```javascript
import { useReservations } from './contexts';

function ReservationsList() {
  const {
    reservations,
    isLoading,
    fetchReservations,
    cancelReservation,
    filters,
    updateFilters
  } = useReservations();

  useEffect(() => {
    fetchReservations();
  }, []);

  const handleCancel = async (id) => {
    await cancelReservation(id, 'Changed my mind');
  };

  return (
    <div>
      {reservations.map(reservation => (
        <div key={reservation.id}>
          <h3>{reservation.service.name}</h3>
          <button onClick={() => handleCancel(reservation.id)}>Cancel</button>
        </div>
      ))}
    </div>
  );
}
```

### CartContext

```javascript
import { useCart } from './contexts';

function BookingCart() {
  const {
    items,
    stylist,
    date,
    time,
    addService,
    setStylist,
    setDateTime,
    getTotalPrice,
    isReadyForCheckout,
    getCheckoutData
  } = useCart();

  const handleCheckout = async () => {
    if (isReadyForCheckout()) {
      const data = getCheckoutData();
      // Create reservation with data
    }
  };

  return (
    <div>
      <h2>Your Booking</h2>
      <p>Total: ${getTotalPrice()}</p>
      <button
        onClick={handleCheckout}
        disabled={!isReadyForCheckout()}
      >
        Complete Booking
      </button>
    </div>
  );
}
```

### NotificationContext

```javascript
import { useNotifications } from './contexts';

function NotificationBell() {
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead
  } = useNotifications();

  return (
    <div>
      <button>
        Notifications ({unreadCount})
      </button>
      {notifications.map(notification => (
        <div key={notification.id}>
          <p>{notification.message}</p>
          <button onClick={() => markAsRead(notification.id)}>
            Mark as read
          </button>
        </div>
      ))}
    </div>
  );
}
```

## 4. Utilities

### Storage Utils

```javascript
import { saveAccessToken, getAccessToken, saveUser, getUser } from './utils/storage';

// Save/get tokens
saveAccessToken('jwt_token_here');
const token = getAccessToken();

// Save/get user
saveUser({ id: 1, name: 'John Doe' });
const user = getUser();

// Clear auth data
clearAuthData();
```

### Formatters

```javascript
import { formatCurrency, formatDate, formatDuration } from './utils/formatters';

formatCurrency(49.99);              // "$49.99"
formatDate('2025-11-13', 'long');   // "November 13, 2025"
formatDuration(90);                 // "1h 30m"
formatPhoneNumber('1234567890');    // "(123) 456-7890"
```

### Validators

```javascript
import { validateEmail, getPasswordError, validateRequired } from './utils/validators';

validateEmail('test@example.com');  // true
getPasswordError('weak');           // "Password must be at least 8 characters"
validateRequired('');               // false
```

## 5. React Router Setup

### App Setup

```javascript
// src/main.jsx
import { RouterProvider } from 'react-router-dom';
import router from './router';
import { AuthProvider, CartProvider, NotificationProvider } from './contexts';

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <NotificationProvider>
          <RouterProvider router={router} />
        </NotificationProvider>
      </CartProvider>
    </AuthProvider>
  );
}
```

### Protected Routes

```javascript
import ProtectedRoute from './components/ProtectedRoute';

// In router.jsx
{
  path: '/client/dashboard',
  element: (
    <ProtectedRoute roles="client">
      <ClientDashboard />
    </ProtectedRoute>
  )
}

// Multiple roles
<ProtectedRoute roles={['admin', 'stylist']}>
  <Component />
</ProtectedRoute>
```

## 6. Environment Variables

Create a `.env` file in the frontend directory:

```bash
VITE_API_URL=http://localhost:8000/api/v1
VITE_STRIPE_PUBLIC_KEY=pk_test_...
VITE_GOOGLE_MAPS_KEY=AIza...
VITE_FIREBASE_API_KEY=AIza...
```

See `.env.example` for all available variables.

## Installation

Install the required dependencies:

```bash
cd /home/user/Salon/frontend
npm install
```

This will install:
- `axios` - HTTP client
- `react-router-dom` - Routing

## Next Steps

1. **Install dependencies**: Run `npm install` in the frontend directory
2. **Configure environment**: Copy `.env.example` to `.env` and update values
3. **Update main.jsx**: Wrap app with context providers
4. **Create actual page components**: Replace placeholder components in `router.jsx`
5. **Implement actual layouts**: Create MainLayout and DashboardLayout components
6. **Set up Firebase**: Configure Firebase for push notifications (optional)
7. **Test API integration**: Ensure backend API is running and accessible

## Testing

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Best Practices

1. **Always use hooks**: Use `useAuth()`, `useCart()`, etc. instead of accessing contexts directly
2. **Handle errors**: Always wrap API calls in try-catch blocks
3. **Loading states**: Show loading indicators when `isLoading` is true
4. **Type safety**: Add JSDoc comments or migrate to TypeScript
5. **Error boundaries**: Implement React error boundaries for production
6. **Security**: Never commit `.env` file, always use `.env.example`

## Support

For issues or questions, refer to:
- React Router docs: https://reactrouter.com/
- Axios docs: https://axios-http.com/
- React Context API: https://react.dev/reference/react/useContext
