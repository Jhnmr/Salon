# SALON Frontend - PWA Application

Progressive Web Application (PWA) for managing beauty salon services, appointments, and client relationships.

## 🚀 Features

### Core Features
- ✅ **Authentication System** - Login/Register with JWT tokens
- ✅ **Context API** - Global state management with AuthContext and ThemeContext
- ✅ **Custom Hooks** - Reusable hooks for common functionality
- ✅ **Progressive Web App (PWA)** - Installable, offline-capable application
- ✅ **Dark Theme** - Modern dark theme design system
- ✅ **Responsive Design** - Mobile-first responsive layout

### Components
- **UI Components**: Button, Input, Card, Avatar, Badge, Modal, Toast, Select
- **Pages**: Login, Home (Dashboard)
- **Contexts**: Authentication, Theme
- **Hooks**: useAuth, useFetch, useForm, useTheme

## 📁 Project Structure

```
frontend/
├── public/
│   ├── manifest.json          # PWA manifest
│   ├── service-worker.js      # Service worker for offline support
│   └── offline.html           # Offline fallback page
├── src/
│   ├── components/
│   │   └── ui/                # Reusable UI components
│   │       ├── Avatar.jsx
│   │       ├── Badge.jsx
│   │       ├── Button.jsx
│   │       ├── Card.jsx
│   │       ├── Input.jsx
│   │       ├── Modal.jsx
│   │       ├── Select.jsx
│   │       ├── Toast.jsx
│   │       └── index.js
│   ├── contexts/              # React Context providers
│   │   ├── AuthContext.jsx   # Authentication state
│   │   ├── ThemeContext.jsx  # Theme management
│   │   └── index.js
│   ├── hooks/                 # Custom React hooks
│   │   ├── useAuth.js        # Authentication hook
│   │   ├── useFetch.js       # API fetching hook
│   │   ├── useForm.js        # Form management hook
│   │   ├── useTheme.js       # Theme access hook
│   │   └── index.js
│   ├── pages/                 # Application pages
│   │   ├── Login.jsx         # Login/Register page
│   │   ├── Home.jsx          # Dashboard page
│   │   └── index.js
│   ├── styles/
│   │   └── theme.js          # Theme configuration
│   ├── utils/
│   │   └── registerServiceWorker.js
│   ├── App.jsx               # Main app component
│   ├── main.jsx              # Application entry point
│   └── index.css             # Global styles
├── index.html                # HTML template
├── package.json              # Dependencies
├── vite.config.js            # Vite configuration
└── tailwind.config.js        # Tailwind CSS configuration
```

## 🛠️ Technology Stack

- **Framework**: React 19
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **State Management**: React Context API
- **PWA**: Service Workers, Web App Manifest
- **HTTP Client**: Fetch API

## 📦 Installation

1. **Install dependencies:**
   ```bash
   cd frontend
   npm install
   ```

2. **Configure environment variables:**
   Create a `.env` file in the frontend directory:
   ```env
   VITE_API_URL=http://localhost:8000/api
   ```

3. **Start development server:**
   ```bash
   npm run dev
   ```

4. **Build for production:**
   ```bash
   npm run build
   ```

5. **Preview production build:**
   ```bash
   npm run preview
   ```

## 🎨 Design System

### Theme Colors

The application uses a dark theme with golden accents:

- **Primary Background**: `#0A0A0B` (Deep black)
- **Secondary Background**: `#1A1A1C` (Carbon gray)
- **Accent Color**: `#FFD700` (Golden yellow)
- **Text Primary**: `#FFFFFF` (White)
- **Text Secondary**: `#9CA3AF` (Light gray)

### Component Variants

Most components support multiple variants:
- **Button**: `primary`, `secondary`, `outline`, `ghost`, `danger`
- **Badge**: `primary`, `secondary`, `success`, `error`, `warning`, `info`
- **Toast**: `success`, `error`, `warning`, `info`

## 🔧 Configuration

### Service Worker

The service worker provides:
- **Offline Support**: Cache-first strategy for static assets
- **Network-First**: For API requests and HTML pages
- **Background Sync**: Sync data when connection is restored
- **Push Notifications**: Support for push notifications (requires VAPID keys)

### PWA Manifest

The application can be installed as a PWA with:
- Custom app icons (72x72 to 512x512)
- Standalone display mode
- Portrait orientation
- Shortcuts for common actions

## 📱 PWA Features

### Installing the App

Users can install the PWA by:
1. Clicking the install prompt in the browser
2. Using the "Add to Home Screen" option
3. Programmatically with `promptPWAInstall()` function

### Offline Support

The app works offline with:
- Cached static assets
- Cached API responses
- Offline fallback page
- Auto-sync when back online

### Push Notifications

To enable push notifications:
1. Generate VAPID keys
2. Add public key to `registerServiceWorker.js`
3. Request notification permission
4. Subscribe users to push notifications

## 🔐 Authentication

### Login Flow

1. User enters credentials on Login page
2. AuthContext handles API request
3. Token stored in localStorage
4. User redirected to Home page

### Protected Routes

The App.jsx component checks authentication:
- If not authenticated: shows Login page
- If authenticated: shows Home page
- Loading state while checking auth

### API Integration

All API requests automatically include:
- JWT token from localStorage
- JSON content-type header
- Proper error handling

## 🎯 Custom Hooks

### useAuth

Access authentication state and functions:
```jsx
const { user, login, logout, register, isAuthenticated } = useAuth();
```

### useFetch

Fetch data from API with loading and error states:
```jsx
const { data, loading, error, refetch } = useFetch('/appointments');
```

### useForm

Manage form state and validation:
```jsx
const { values, errors, handleChange, handleSubmit } = useForm(
  initialValues,
  onSubmit,
  validate
);
```

### useTheme

Access theme configuration:
```jsx
const { theme, isDarkMode, toggleTheme } = useTheme();
```

## 🧩 Component Usage

### Button
```jsx
<Button variant="primary" size="md" onClick={handleClick}>
  Click Me
</Button>
```

### Modal
```jsx
<Modal
  isOpen={isOpen}
  onClose={handleClose}
  title="Modal Title"
  footer={<Button onClick={handleClose}>Close</Button>}
>
  Modal content here
</Modal>
```

### Toast
```jsx
<Toast
  message="Success!"
  variant="success"
  position="top-right"
  duration={3000}
/>
```

### Select
```jsx
<Select
  options={[
    { value: '1', label: 'Option 1' },
    { value: '2', label: 'Option 2' },
  ]}
  value={selectedValue}
  onChange={handleChange}
  searchable
/>
```

## 🚧 Development

### Code Style

- Use functional components with hooks
- Follow React best practices
- Document all components and functions
- Use meaningful variable names
- Keep components small and focused

### Adding New Components

1. Create component in `src/components/ui/`
2. Export from `src/components/ui/index.js`
3. Document props and usage
4. Add to design system if reusable

### Adding New Pages

1. Create page in `src/pages/`
2. Export from `src/pages/index.js`
3. Add route logic to `App.jsx`
4. Ensure proper authentication checks

## 📝 Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_API_URL` | Backend API URL | `http://localhost:8000/api` |

## 🔍 Troubleshooting

### Service Worker Not Updating

Clear cache and unregister:
```javascript
import { unregisterServiceWorker } from './utils/registerServiceWorker';
await unregisterServiceWorker();
```

### CORS Issues

Ensure backend has proper CORS configuration for your frontend URL.

### API Connection Failed

1. Check `VITE_API_URL` in `.env`
2. Verify backend is running
3. Check network tab in browser DevTools

## 📚 Resources

- [React Documentation](https://react.dev)
- [Vite Documentation](https://vitejs.dev)
- [PWA Documentation](https://web.dev/progressive-web-apps/)
- [Tailwind CSS](https://tailwindcss.com)

## 🤝 Contributing

1. Follow the existing code style
2. Document all changes
3. Test thoroughly before committing
4. Update this README if needed

## 📄 License

This project is part of the SALON application suite.
