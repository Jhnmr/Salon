import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Button, Input } from '../../components/ui';
import { getEmailError, getPasswordError } from '../../utils/validators';

/**
 * Login Page
 * Allows users to login with email and password
 */
const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isLoading } = useAuth();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    remember: false,
  });

  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');

  const from = location.state?.from?.pathname || '/';

  /**
   * Handle input change
   */
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));

    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
    setServerError('');
  };

  /**
   * Validate form
   */
  const validateForm = () => {
    const newErrors = {};

    const emailError = getEmailError(formData.email);
    if (emailError) newErrors.email = emailError;

    const passwordError = getPasswordError(formData.password, {
      minLength: 1, // Just check if not empty for login
      requireUppercase: false,
      requireLowercase: false,
      requireNumber: false,
    });
    if (passwordError) newErrors.password = 'Password is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * Handle form submission
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');

    if (!validateForm()) return;

    try {
      const result = await login(formData.email, formData.password);

      if (result.success) {
        // Redirect based on user role
        const user = result.user;
        if (user.role === 'admin') {
          navigate('/admin/dashboard');
        } else if (user.role === 'stylist') {
          navigate('/stylist/dashboard');
        } else {
          navigate(from !== '/' ? from : '/client/dashboard');
        }
      }
    } catch (error) {
      setServerError(error.message || 'Invalid email or password');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 px-4 py-12">
      <div className="max-w-md w-full">
        {/* Logo/Brand */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-yellow-400 mb-2">SALON</h1>
          <p className="text-gray-400">Sign in to your account</p>
        </div>

        {/* Login Form */}
        <div className="bg-gray-800 rounded-lg shadow-xl p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Server Error */}
            {serverError && (
              <div className="bg-red-500/10 border border-red-500 text-red-500 rounded-lg p-4 text-sm">
                {serverError}
              </div>
            )}

            {/* Email Field */}
            <Input
              type="email"
              name="email"
              label="Email Address"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleChange}
              error={errors.email}
              required
              fullWidth
              autoComplete="email"
              disabled={isLoading}
            />

            {/* Password Field */}
            <Input
              type="password"
              name="password"
              label="Password"
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleChange}
              error={errors.password}
              required
              fullWidth
              autoComplete="current-password"
              disabled={isLoading}
            />

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="remember"
                  checked={formData.remember}
                  onChange={handleChange}
                  disabled={isLoading}
                  className="w-4 h-4 text-yellow-400 bg-gray-700 border-gray-600 rounded focus:ring-yellow-400 focus:ring-2"
                />
                <span className="ml-2 text-sm text-gray-300">Remember me</span>
              </label>

              <Link
                to="/auth/forgot-password"
                className="text-sm text-yellow-400 hover:text-yellow-300 transition-colors"
              >
                Forgot password?
              </Link>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              variant="primary"
              fullWidth
              isLoading={isLoading}
              disabled={isLoading}
            >
              Sign In
            </Button>
          </form>

          {/* Register Link */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-400">
              Don't have an account?{' '}
              <Link
                to="/auth/register"
                className="text-yellow-400 hover:text-yellow-300 font-medium transition-colors"
              >
                Create one now
              </Link>
            </p>
          </div>
        </div>

        {/* Additional Info */}
        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500">
            By signing in, you agree to our{' '}
            <Link to="/terms" className="text-gray-400 hover:text-gray-300">
              Terms of Service
            </Link>{' '}
            and{' '}
            <Link to="/privacy" className="text-gray-400 hover:text-gray-300">
              Privacy Policy
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
