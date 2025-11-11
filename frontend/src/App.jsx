/**
 * SALON - Main Application Component
 * Root component with routing and authentication
 */

import { useAuth } from './hooks/useAuth';
import { Login } from './pages/Login';
import { Home } from './pages/Home';

function App() {
  const { user, loading } = useAuth();

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          backgroundColor: '#0A0A0B',
          color: '#FFFFFF',
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <div
            style={{
              fontSize: '48px',
              fontWeight: 'bold',
              color: '#FFD700',
              marginBottom: '16px',
            }}
          >
            SALON
          </div>
          <div
            style={{
              fontSize: '14px',
              color: '#9CA3AF',
            }}
          >
            Cargando...
          </div>
        </div>
      </div>
    );
  }

  // Show Login page if not authenticated
  if (!user) {
    return <Login />;
  }

  // Show Home page if authenticated
  return <Home />;
}

export default App;
