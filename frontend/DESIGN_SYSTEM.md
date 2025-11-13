# SALON Design System Documentation

## Overview

A comprehensive, production-ready Design System for the SALON React PWA frontend, featuring 10 reusable UI components, 4 layout components, theme management, custom hooks, and a complete styling system.

## 📦 Components Created

### UI Components (10)

Located in `/home/user/Salon/frontend/src/components/ui/`

#### 1. **Button** (`Button.jsx`)
Versatile button component with multiple variants and states.

**Features:**
- Variants: `primary`, `secondary`, `success`, `danger`, `outline`, `ghost`
- Sizes: `sm`, `md`, `lg`, `xl`
- States: default, hover, active, disabled, loading
- Icon support (left/right positioning)
- Loading spinner animation

**Usage:**
```jsx
import { Button } from './components/ui';

<Button variant="primary" size="md" onClick={handleClick}>
  Click Me
</Button>

<Button variant="success" loading icon={SaveIcon}>
  Save
</Button>
```

#### 2. **Input** (`Input.jsx`)
Complete form input with validation and icon support.

**Features:**
- Types: text, email, password, number, tel, date, time, datetime-local, search
- Floating/static labels
- Error message display
- Icon support (left/right)
- Help text
- States: default, focus, error, disabled

**Usage:**
```jsx
import { Input } from './components/ui';

<Input
  type="email"
  label="Email Address"
  placeholder="you@example.com"
  icon={EmailIcon}
  error={errors.email}
  required
/>
```

#### 3. **Card** (`Card.jsx`)
Flexible container with subcomponents for structured content.

**Features:**
- Variants: `flat`, `outlined`, `elevated`
- Subcomponents: `Card.Image`, `Card.Header`, `Card.Body`, `Card.Footer`
- Padding sizes: `sm`, `md`, `lg`
- Clickable option

**Usage:**
```jsx
import { Card } from './components/ui';

<Card variant="elevated">
  <Card.Image src="/image.jpg" alt="Card image" />
  <Card.Header>
    <h3>Card Title</h3>
  </Card.Header>
  <Card.Body>
    <p>Card content goes here...</p>
  </Card.Body>
  <Card.Footer>
    <Button>Action</Button>
  </Card.Footer>
</Card>
```

#### 4. **Modal** (`Modal.jsx`)
Responsive dialog with overlay and animations.

**Features:**
- Sizes: `sm`, `md`, `lg`, `xl`, `full`
- Dark overlay with click-to-close
- ESC key to close
- Smooth fade/slide animations
- Fullscreen on mobile
- Subcomponents: `Modal.Header`, `Modal.Body`, `Modal.Footer`
- Body scroll lock when open

**Usage:**
```jsx
import { Modal } from './components/ui';

<Modal isOpen={isOpen} onClose={handleClose} title="Modal Title" size="md">
  <Modal.Body>
    <p>Modal content...</p>
  </Modal.Body>
  <Modal.Footer>
    <Button onClick={handleClose}>Close</Button>
  </Modal.Footer>
</Modal>
```

#### 5. **Toast** (`Toast.jsx`)
Notification system with auto-dismiss.

**Features:**
- Types: `success`, `error`, `warning`, `info`
- Auto-dismiss with configurable duration
- Positions: `top-right`, `top-center`, `bottom-right`, `bottom-center`, etc.
- Slide-in animation
- Close button
- Toast queue management via `ToastContainer`

**Usage:**
```jsx
import { Toast, ToastContainer } from './components/ui';

// In your root component
<ToastContainer toasts={toasts} position="top-right" />

// Show toast
<Toast
  type="success"
  message="Operation successful!"
  duration={5000}
  onClose={handleClose}
/>
```

#### 6. **Table** (`Table.jsx`)
Feature-rich data table component.

**Features:**
- Column sorting
- Pagination with navigation
- Loading skeleton
- Empty state with custom message
- Responsive (horizontal scroll on mobile)
- Custom cell rendering

**Usage:**
```jsx
import { Table } from './components/ui';

const columns = [
  { key: 'name', header: 'Name', sortable: true },
  { key: 'email', header: 'Email', sortable: true },
  {
    key: 'status',
    header: 'Status',
    render: (value) => <Badge variant={value}>{value}</Badge>
  },
];

<Table
  columns={columns}
  data={data}
  onSort={handleSort}
  pagination={{
    currentPage: 1,
    totalPages: 10,
    from: 1,
    to: 10,
    total: 100,
    hasPrevious: false,
    hasNext: true,
    onPrevious: handlePrevious,
    onNext: handleNext,
  }}
  loading={isLoading}
  emptyMessage="No data available"
/>
```

#### 7. **Loader** (`Loader.jsx`)
Loading indicators with multiple types.

**Features:**
- Types: `spinner`, `dots`, `skeleton`, `pulse`
- Sizes: `sm`, `md`, `lg`, `xl`
- Fullscreen option
- Optional message
- Separate `Spinner` component for inline use

**Usage:**
```jsx
import { Loader, Spinner } from './components/ui';

<Loader type="spinner" size="lg" message="Loading..." />

<Loader type="dots" fullscreen />

// Inline spinner
<Spinner size="sm" />
```

#### 8. **Select** (`Select.jsx`)
Dropdown select with advanced features.

**Features:**
- Searchable option
- Multi-select support
- Custom option rendering
- Keyboard navigation
- Click outside to close
- Clear all (multi-select)

**Usage:**
```jsx
import { Select } from './components/ui';

const options = [
  { value: '1', label: 'Option 1' },
  { value: '2', label: 'Option 2' },
];

<Select
  options={options}
  value={selectedValue}
  onChange={handleChange}
  searchable
  multi
  placeholder="Select options..."
  label="Choose Options"
/>
```

#### 9. **Badge** (`Badge.jsx`)
Status indicators and labels.

**Features:**
- Variants: `default`, `success`, `warning`, `error`, `info`
- Sizes: `sm`, `md`, `lg`
- Optional dot indicator

**Usage:**
```jsx
import { Badge } from './components/ui';

<Badge variant="success" size="md">Active</Badge>
<Badge variant="error" dot>Offline</Badge>
```

#### 10. **Avatar** (`Avatar.jsx`)
User avatars with fallback.

**Features:**
- Image with fallback to initials
- Sizes: `xs`, `sm`, `md`, `lg`, `xl`, `2xl`
- Status indicator: `online`, `offline`, `busy`, `away`
- Auto-generated initials from name

**Usage:**
```jsx
import { Avatar } from './components/ui';

<Avatar
  src="/user-avatar.jpg"
  name="John Doe"
  size="md"
  status="online"
/>
```

### Layout Components (4)

Located in `/home/user/Salon/frontend/src/components/layout/`

#### 1. **Navbar** (`Navbar.jsx`)
Top navigation bar with responsive mobile menu.

**Features:**
- Logo
- Navigation links
- User menu dropdown
- Notification bell with count badge
- Mobile hamburger menu
- Responsive design

**Usage:**
```jsx
import { Navbar } from './components/layout';

<Navbar
  user={{ name: 'John Doe', avatar: '/avatar.jpg', status: 'online' }}
  notificationCount={5}
  onNotificationClick={handleNotifications}
  onLogout={handleLogout}
/>
```

#### 2. **Sidebar** (`Sidebar.jsx`)
Collapsible side navigation.

**Features:**
- Collapsible/expandable
- Active route highlighting
- Role-based menu items (admin, stylist, user)
- Icons for each menu item
- Smooth animations
- Nested sections

**Usage:**
```jsx
import { Sidebar } from './components/layout';

<Sidebar
  isCollapsed={false}
  onToggle={handleToggle}
  activeRoute="/dashboard"
  userRole="admin"
/>
```

#### 3. **Footer** (`Footer.jsx`)
Page footer with links and social media.

**Features:**
- Company links
- Support links
- Social media icons
- Copyright notice
- Responsive layout
- Optional sections

**Usage:**
```jsx
import { Footer } from './components/layout';

<Footer showSocial showLinks />
```

#### 4. **Layout** (`Layout.jsx`)
Main layout wrapper combining all layout components.

**Features:**
- Combines Navbar, Sidebar, Footer
- Content area with proper spacing
- Responsive padding
- Sidebar collapse state management
- Optional sidebar/footer

**Usage:**
```jsx
import { Layout } from './components/layout';

<Layout
  user={currentUser}
  notificationCount={5}
  activeRoute="/dashboard"
  userRole="admin"
  showSidebar
  showFooter
>
  <YourPageContent />
</Layout>
```

## 🎨 Contexts & State Management

Located in `/home/user/Salon/frontend/src/contexts/`

### ThemeContext
Dark/light theme management with localStorage persistence.

**Features:**
- Theme state (dark/light)
- Toggle function
- Persist to localStorage
- CSS variable updates
- Auto-apply on mount

**Usage:**
```jsx
import { ThemeProvider, useTheme } from './contexts';

// Wrap your app
<ThemeProvider>
  <App />
</ThemeProvider>

// Use in components
const { theme, toggleTheme, isDark, isLight } = useTheme();

<Button onClick={toggleTheme}>
  {isDark ? '🌙 Dark' : '☀️ Light'}
</Button>
```

### ToastContext
Global toast notification manager.

**Features:**
- Global toast queue
- Auto-dismiss
- Multiple toast types
- Position management
- Convenience methods

**Usage:**
```jsx
import { ToastProvider, useToast } from './contexts';

// Wrap your app
<ToastProvider position="top-right" defaultDuration={5000}>
  <App />
</ToastProvider>

// Use in components
const { showSuccess, showError, showWarning, showInfo } = useToast();

showSuccess('Operation completed!');
showError('Something went wrong!');
```

## 🪝 Custom Hooks

Located in `/home/user/Salon/frontend/src/hooks/`

### useDebounce
Debounces a value to limit update rate.

**Usage:**
```jsx
import { useDebounce } from './hooks';

const [searchTerm, setSearchTerm] = useState('');
const debouncedSearch = useDebounce(searchTerm, 500);

useEffect(() => {
  if (debouncedSearch) {
    searchAPI(debouncedSearch);
  }
}, [debouncedSearch]);
```

### useLocalStorage
Synchronizes state with localStorage.

**Usage:**
```jsx
import { useLocalStorage } from './hooks';

const [user, setUser, removeUser] = useLocalStorage('user', null);

setUser({ name: 'John' }); // Automatically syncs to localStorage
removeUser(); // Removes from localStorage
```

### useMediaQuery
Tracks media query matches.

**Predefined hooks:**
- `useIsMobile()` - max-width: 767px
- `useIsTablet()` - 768px - 1023px
- `useIsDesktop()` - min-width: 1024px
- `useIsLargeScreen()` - min-width: 1280px
- `usePrefersDarkMode()`
- `usePrefersReducedMotion()`

**Usage:**
```jsx
import { useMediaQuery, useIsMobile } from './hooks';

const isMobile = useIsMobile();
const isCustom = useMediaQuery('(min-width: 1500px)');

return isMobile ? <MobileNav /> : <DesktopNav />;
```

## 🎨 Styling System

### Tailwind Configuration
Updated `/home/user/Salon/frontend/tailwind.config.js` with:

- **Custom Colors:**
  - Primary purple shades
  - Accent golden yellow
  - Extended gray scale for dark theme

- **Animations:**
  - fadeIn/fadeOut
  - slideIn/slideOut (all directions)
  - scaleIn/scaleOut
  - bounce-slow, pulse-slow

- **Custom Utilities:**
  - Extended spacing
  - Custom shadows (glow effects)
  - Extended z-index scale
  - Custom breakpoints (xs, 3xl)
  - Scrollbar styling

### Global Styles
Created `/home/user/Salon/frontend/src/styles/globals.css` with:

- **CSS Variables** for theming
- **Base styles** for typography, links, focus states
- **Component classes** (card, btn, input, badge)
- **Utility classes:**
  - Text gradients
  - Glass effect
  - Glow effects
  - Truncate text (2-3 lines)
  - Animation delays
  - Safe area padding

- **Accessibility:**
  - Screen reader only
  - Skip to content
  - Reduced motion support

- **Custom animations:**
  - Shimmer loading
  - Float
  - Spin slow

## 📁 Directory Structure

```
/home/user/Salon/frontend/src/
├── components/
│   ├── ui/
│   │   ├── Button.jsx
│   │   ├── Input.jsx
│   │   ├── Card.jsx
│   │   ├── Modal.jsx
│   │   ├── Toast.jsx
│   │   ├── Table.jsx
│   │   ├── Loader.jsx
│   │   ├── Select.jsx
│   │   ├── Badge.jsx
│   │   ├── Avatar.jsx
│   │   └── index.js
│   └── layout/
│       ├── Navbar.jsx
│       ├── Sidebar.jsx
│       ├── Footer.jsx
│       ├── Layout.jsx
│       └── index.js
├── contexts/
│   ├── ThemeContext.jsx
│   ├── ToastContext.jsx
│   └── index.js
├── hooks/
│   ├── useDebounce.js
│   ├── useLocalStorage.js
│   ├── useMediaQuery.js
│   └── index.js
└── styles/
    ├── globals.css
    └── theme.js
```

## 🚀 Getting Started

### 1. Import Components

```jsx
// Import UI components
import { Button, Input, Card, Modal, Toast } from './components/ui';

// Import layout components
import { Layout, Navbar, Sidebar, Footer } from './components/layout';

// Import contexts
import { ThemeProvider, ToastProvider } from './contexts';

// Import hooks
import { useDebounce, useLocalStorage, useMediaQuery } from './hooks';
```

### 2. Setup Providers

Wrap your app with the necessary providers:

```jsx
import { ThemeProvider } from './contexts/ThemeContext';
import { ToastProvider } from './contexts/ToastContext';
import App from './App';

function Root() {
  return (
    <ThemeProvider>
      <ToastProvider position="top-right">
        <App />
      </ToastProvider>
    </ThemeProvider>
  );
}
```

### 3. Use Layout

```jsx
import { Layout } from './components/layout';

function App() {
  return (
    <Layout
      user={currentUser}
      notificationCount={3}
      activeRoute="/dashboard"
      userRole="admin"
    >
      <YourContent />
    </Layout>
  );
}
```

## 🎨 Design Tokens

### Colors
- **Primary:** Purple (#8B5CF6)
- **Accent:** Golden Yellow (#FFD700)
- **Success:** Green (#10B981)
- **Error:** Red (#EF4444)
- **Warning:** Orange (#F59E0B)
- **Info:** Blue (#3B82F6)

### Spacing Scale
- xs: 0.25rem (4px)
- sm: 0.5rem (8px)
- md: 1rem (16px)
- lg: 1.5rem (24px)
- xl: 2rem (32px)
- 2xl: 3rem (48px)
- 3xl: 4rem (64px)

### Breakpoints
- xs: 360px
- sm: 640px
- md: 768px
- lg: 1024px
- xl: 1280px
- 2xl: 1536px
- 3xl: 1920px

## ✨ Features Summary

### Component Features
- ✅ 10 fully-featured UI components
- ✅ 4 layout components
- ✅ PropTypes validation
- ✅ Dark mode compatible
- ✅ Responsive mobile-first design
- ✅ Accessibility (ARIA labels, keyboard navigation)
- ✅ Smooth animations
- ✅ Loading states
- ✅ Error states

### Styling Features
- ✅ Tailwind CSS with custom configuration
- ✅ CSS variables for theming
- ✅ Dark/Light mode support
- ✅ Custom animations
- ✅ Utility classes
- ✅ Responsive breakpoints
- ✅ Custom scrollbar styling

### State Management
- ✅ Theme context
- ✅ Toast notification system
- ✅ localStorage persistence

### Custom Hooks
- ✅ Debouncing
- ✅ localStorage sync
- ✅ Media query detection

## 📊 Component Count Summary

- **UI Components:** 10
- **Layout Components:** 4
- **Context Providers:** 2
- **Custom Hooks:** 3 (+ 6 convenience hooks)
- **Total Files Created:** 25+

## 🎯 Next Steps

1. **Import the design system** in your components
2. **Wrap your app** with ThemeProvider and ToastProvider
3. **Use the Layout component** for consistent page structure
4. **Build your pages** using the UI components
5. **Customize** colors and styles in `tailwind.config.js` and `globals.css` as needed

## 📝 Notes

- All components are fully typed with PropTypes
- All components support dark mode
- All components are responsive (360px - 1920px)
- All components follow accessibility best practices
- Animations respect `prefers-reduced-motion`
- Components are tree-shakeable (import only what you need)

---

**Built with React 18+, Tailwind CSS, and modern web standards.**
