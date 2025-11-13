import { Link } from 'react-router-dom';
import { Button } from '../components/ui';

/**
 * 404 Not Found Page
 */
const NotFound = () => {
  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="mb-8">
          <svg
            className="w-32 h-32 mx-auto text-yellow-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>

        <h1 className="text-6xl font-bold text-white mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-gray-300 mb-4">Page Not Found</h2>
        <p className="text-gray-400 mb-8">
          Oops! The page you're looking for seems to have wandered off. Let's get you back on track.
        </p>

        <div className="flex flex-col sm:flex-row justify-center space-y-3 sm:space-y-0 sm:space-x-4">
          <Link to="/">
            <Button variant="primary" size="lg">
              Go Home
            </Button>
          </Link>
          <Link to="/client/search-services">
            <Button variant="secondary" size="lg">
              Browse Services
            </Button>
          </Link>
        </div>

        <div className="mt-12">
          <p className="text-gray-500 text-sm mb-4">Looking for something specific?</p>
          <div className="flex justify-center">
            <input
              type="search"
              placeholder="Search for services..."
              className="px-4 py-2 bg-gray-800 text-white border border-gray-700 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 w-64"
            />
            <button className="px-6 py-2 bg-yellow-400 text-gray-900 font-semibold rounded-r-lg hover:bg-yellow-500 transition-colors">
              Search
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
