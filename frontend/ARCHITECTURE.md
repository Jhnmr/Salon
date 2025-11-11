# SALON Frontend Architecture

## Overview

This document describes the architecture, patterns, and design decisions for the SALON frontend application.

## Architecture Patterns

### 1. Component-Based Architecture

The application follows a component-based architecture with clear separation of concerns:

```
┌─────────────────────────────────────┐
│          Application (main.jsx)      │
│                                      │
│  ┌────────────────────────────────┐ │
│  │      Context Providers          │ │
│  │  - ThemeProvider                │ │
│  │  - AuthProvider                 │ │
│  │                                 │ │
│  │  ┌──────────────────────────┐  │ │
│  │  │      App Component        │  │ │
│  │  │                           │  │ │
│  │  │  ┌─────────────────────┐ │  │ │
│  │  │  │   Page Components    │ │  │ │
│  │  │  │  - Login             │ │  │ │
│  │  │  │  - Home              │ │  │ │
│  │  │  │                      │ │  │ │
│  │  │  │  ┌────────────────┐ │ │  │ │
│  │  │  │  │ UI Components  │ │ │  │ │
│  │  │  │  │ - Button       │ │ │  │ │
│  │  │  │  │ - Input        │ │ │  │ │
│  │  │  │  │ - Card         │ │ │  │ │
│  │  │  │  │ - Modal        │ │ │  │ │
│  │  │  │  └────────────────┘ │ │  │ │
│  │  │  └─────────────────────┘ │  │ │
│  │  └──────────────────────────┘  │ │
│  └────────────────────────────────┘ │
└─────────────────────────────────────┘
```

### 2. State Management

#### Global State (Context API)

We use React Context API for global state management:

**AuthContext**: Manages user authentication state
- User data
- Loading states
- Authentication methods (login, logout, register)
- Token management

**ThemeContext**: Manages application theme
- Current theme (dark/light)
- Theme values
- Theme switching functions

#### Local State (useState/useReducer)

Component-specific state is managed locally using React hooks.

### 3. Custom Hooks Pattern

Custom hooks encapsulate reusable logic:

```javascript
// Authentication
useAuth() → Access auth context

// API Calls
useFetch(url, options) → GET requests with caching
useMutate() → POST/PUT/DELETE requests

// Forms
useForm(initialValues, onSubmit, validate) → Form state management

// Theme
useTheme() → Access theme context
```

### 4. Compound Component Pattern

UI components use the compound component pattern for flexibility:

```jsx
<Modal isOpen={isOpen} onClose={handleClose}>
  <Modal.Header>Title</Modal.Header>
  <Modal.Body>Content</Modal.Body>
  <Modal.Footer>Actions</Modal.Footer>
</Modal>
```

## Data Flow

### Authentication Flow

```
┌──────────┐     ┌──────────────┐     ┌─────────┐     ┌──────────┐
│  Login   │────>│ AuthContext  │────>│   API   │────>│localStorage│
│   Page   │     │   (login)    │     │         │     │  (token)  │
└──────────┘     └──────────────┘     └─────────┘     └──────────┘
                        │
                        │ Updates user state
                        ▼
                  ┌──────────┐
                  │   App    │
                  │ (redirect)│
                  └──────────┘
                        │
                        ▼
                  ┌──────────┐
                  │   Home   │
                  └──────────┘
```

### API Request Flow

```
┌───────────┐     ┌──────────┐     ┌─────────────┐     ┌─────────┐
│ Component │────>│ useFetch │────>│localStorage │────>│   API   │
│           │     │          │     │  (get token)│     │         │
└───────────┘     └──────────┘     └─────────────┘     └─────────┘
                        │                                     │
                        │<────────────────────────────────────│
                        │              Response
                        │
                        ├──> Update state (data, loading, error)
                        │
                        ▼
                  ┌───────────┐
                  │ Component │
                  │  Re-render│
                  └───────────┘
```

## Progressive Web App (PWA) Architecture

### Service Worker Strategy

```
User Request
     │
     ▼
┌─────────────────┐
│ Service Worker  │
│   Intercepts    │
└─────────────────┘
     │
     ├──> Static Assets ────> Cache First
     │                         │
     │                         ├─> Try Cache
     │                         │     │
     │                         │     ├─> Found ──> Return
     │                         │     │
     │                         │     └─> Not Found
     │                         │           │
     │                         └───────────┴─> Fetch from Network
     │
     ├──> API Requests ─────> Network First
     │                         │
     │                         ├─> Try Network
     │                         │     │
     │                         │     ├─> Success ──> Cache & Return
     │                         │     │
     │                         │     └─> Failed
     │                         │           │
     │                         └───────────┴─> Try Cache
     │
     └──> HTML Pages ───────> Network First (same as API)
```

### Caching Strategy

1. **Static Assets** (Cache-First):
   - JavaScript bundles
   - CSS files
   - Images
   - Fonts

2. **API Requests** (Network-First):
   - User data
   - Appointments
   - Services
   - Fall back to cache when offline

3. **HTML Pages** (Network-First):
   - Always try to get fresh content
   - Fall back to cached version
   - Show offline page if not cached

## Design System

### Theme Structure

```javascript
theme = {
  // Color palette
  bg: { primary, secondary, tertiary, hover, active },
  text: { primary, secondary, tertiary, inverse },
  accent: { primary, secondary, light, dark },
  semantic: { success, error, warning, info },

  // Spacing (rem units)
  spacing: { xs, sm, md, lg, xl, 2xl, 3xl },

  // Typography
  typography: {
    fontFamily: { sans, mono },
    fontSize: { xs, sm, base, lg, xl, 2xl, 3xl, 4xl, 5xl },
    fontWeight: { light, normal, medium, semibold, bold },
    lineHeight: { none, tight, snug, normal, relaxed, loose }
  },

  // Effects
  shadow: { sm, md, lg, xl },
  radius: { none, sm, md, lg, xl, 2xl, full },
  transition: { fast, base, slow },

  // Layout
  zIndex: { base, dropdown, sticky, fixed, modal, popover, tooltip },
  breakpoints: { sm, md, lg, xl, 2xl }
}
```

### Component API Design

All UI components follow consistent patterns:

```javascript
Component({
  // Core props
  children,           // Content
  className,          // Additional CSS classes
  style,             // Inline styles

  // Variants
  variant,           // Visual variant (primary, secondary, etc.)
  size,             // Size variant (sm, md, lg)

  // States
  disabled,         // Disabled state
  loading,          // Loading state
  error,           // Error message/state

  // Behavior
  onClick,          // Click handler
  onChange,         // Change handler
  onBlur,          // Blur handler

  // Accessibility
  ariaLabel,       // ARIA label
  role,           // ARIA role
  tabIndex        // Tab index
})
```

## File Organization

### Directory Structure Philosophy

```
src/
├── components/     # Reusable UI components
│   └── ui/        # Pure presentation components
├── contexts/      # Global state providers
├── hooks/         # Custom React hooks
├── pages/         # Route-level components
├── styles/        # Theme and global styles
├── utils/         # Helper functions
└── assets/        # Static assets
```

### Import Strategy

1. **Absolute Imports**: Not currently configured
2. **Relative Imports**: Used throughout
3. **Index Files**: Used for cleaner imports

```javascript
// Good - using index files
import { Button, Input, Card } from './components/ui';
import { useAuth, useFetch } from './hooks';

// Avoid - importing individual files
import Button from './components/ui/Button';
import Input from './components/ui/Input';
```

## Performance Optimizations

### 1. Code Splitting

Future implementation will use React.lazy and Suspense:

```javascript
const Home = lazy(() => import('./pages/Home'));
const Login = lazy(() => import('./pages/Login'));
```

### 2. Memoization

Use React.memo for expensive components:

```javascript
export const ExpensiveComponent = React.memo(({ data }) => {
  // Expensive rendering logic
});
```

### 3. Service Worker Caching

- Static assets cached indefinitely
- API responses cached with TTL
- Cache-busting on new deployments

### 4. Image Optimization

Future implementation:
- WebP format with fallbacks
- Responsive images
- Lazy loading
- Progressive loading

## Security Considerations

### 1. Authentication

- JWT tokens stored in localStorage
- Tokens included in all API requests
- Auto-logout on token expiration
- Secure token transmission (HTTPS only)

### 2. XSS Prevention

- React's built-in XSS protection
- Sanitize user input when necessary
- No `dangerouslySetInnerHTML` usage

### 3. CSRF Protection

- API uses token-based auth (no cookies)
- CSRF not applicable to this architecture

### 4. Content Security Policy

Future implementation:
```html
<meta http-equiv="Content-Security-Policy"
      content="default-src 'self'; script-src 'self'">
```

## Testing Strategy (Future Implementation)

### Unit Tests
- Component rendering
- Hook behavior
- Utility functions

### Integration Tests
- User flows
- Context interactions
- API mocking

### E2E Tests
- Critical user journeys
- Authentication flows
- Appointment booking

## Deployment

### Build Process

```bash
npm run build
  ↓
Vite bundles application
  ↓
Optimized assets in dist/
  ↓
Deploy to static hosting
```

### Environment Configuration

- Development: `.env.development`
- Production: `.env.production`
- Variables prefixed with `VITE_`

## Future Improvements

### Short Term
- [ ] Add routing with React Router
- [ ] Implement more pages (Services, Profile, etc.)
- [ ] Add more UI components (Calendar, DatePicker, etc.)
- [ ] Error boundaries
- [ ] Loading skeletons

### Medium Term
- [ ] Real-time updates with WebSockets
- [ ] Advanced caching strategies
- [ ] Optimistic UI updates
- [ ] Image upload and optimization
- [ ] Internationalization (i18n)

### Long Term
- [ ] Offline editing
- [ ] Background sync
- [ ] Push notification campaigns
- [ ] Advanced analytics
- [ ] A/B testing framework

## Troubleshooting

### Common Issues

1. **Service Worker not updating**
   - Clear cache
   - Unregister old service worker
   - Hard refresh (Ctrl+Shift+R)

2. **Context not accessible**
   - Ensure component is wrapped in provider
   - Check provider hierarchy

3. **Hooks error**
   - Verify hooks are called at top level
   - Not in conditions or loops

## References

- [React Best Practices](https://react.dev/learn)
- [PWA Guidelines](https://web.dev/progressive-web-apps/)
- [Component Design Patterns](https://www.patterns.dev/)
