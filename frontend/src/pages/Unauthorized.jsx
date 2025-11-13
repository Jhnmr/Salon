import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui';
import { useAuth } from '../contexts/AuthContext';

/**
 * 403 Unauthorized Page
 */
const Unauthorized = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleGoToDashboard = () => {
    if (user?.role === 'admin') {
      navigate('/admin/dashboard');
    } else if (user?.role === 'stylist') {
      navigate('/stylist/dashboard');
    } else {
      navigate('/client/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="mb-8">
          <svg
            className="w-32 h-32 mx-auto text-red-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>

        <h1 className="text-6xl font-bold text-white mb-4">403</h1>
        <h2 className="text-2xl font-semibold text-gray-300 mb-4">Access Denied</h2>
        <p className="text-gray-400 mb-8">
          Sorry, you don't have permission to access this page. This area is restricted to authorized users only.
        </p>

        <div className="bg-red-500/10 border border-red-500 rounded-lg p-4 mb-8">
          <p className="text-red-400 text-sm">
            If you believe this is an error, please contact support or try logging in with a different account.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row justify-center space-y-3 sm:space-y-0 sm:space-x-4">
          {user ? (
            <>
              <Button variant="primary" size="lg" onClick={handleGoToDashboard}>
                Go to Dashboard
              </Button>
              <Button variant="secondary" size="lg" onClick={() => logout()}>
                Logout
              </Button>
            </>
          ) : (
            <>
              <Link to="/auth/login">
                <Button variant="primary" size="lg">
                  Login
                </Button>
              </Link>
              <Link to="/">
                <Button variant="secondary" size="lg">
                  Go Home
                </Button>
              </Link>
            </>
          )}
        </div>

        <div className="mt-12">
          <p className="text-gray-500 text-sm mb-2">Need help?</p>
          <p className="text-gray-400 text-sm">
            Contact us at{' '}
            <a href="mailto:support@salon.com" className="text-yellow-400 hover:text-yellow-300">
              support@salon.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Unauthorized;
