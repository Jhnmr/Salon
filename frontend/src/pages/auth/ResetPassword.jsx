import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Button, Input } from '../../components/ui';
import { getPasswordError, getPasswordConfirmationError } from '../../utils/validators';

/**
 * Reset Password Page
 * Allows users to reset their password with a token
 */
const ResetPassword = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { resetPassword, isLoading } = useAuth();

  const [formData, setFormData] = useState({
    password: '',
    password_confirmation: '',
  });

  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [token, setToken] = useState('');
  const [email, setEmail] = useState('');

  /**
   * Get token and email from URL params
   */
  useEffect(() => {
    const tokenParam = searchParams.get('token');
    const emailParam = searchParams.get('email');

    if (!tokenParam || !emailParam) {
      setServerError('Invalid or missing reset token. Please request a new password reset.');
    } else {
      setToken(tokenParam);
      setEmail(emailParam);
    }
  }, [searchParams]);

  /**
   * Handle input change
   */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
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

    const passwordError = getPasswordError(formData.password);
    if (passwordError) newErrors.password = passwordError;

    const confirmError = getPasswordConfirmationError(
      formData.password,
      formData.password_confirmation
    );
    if (confirmError) newErrors.password_confirmation = confirmError;

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * Handle form submission
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');

    if (!token) {
      setServerError('Invalid reset token. Please request a new password reset.');
      return;
    }

    if (!validateForm()) return;

    try {
      await resetPassword(token, formData.password, formData.password_confirmation);

      // Show success message and redirect to login
      navigate('/auth/login', {
        state: {
          message: 'Password reset successful! You can now login with your new password.',
        },
      });
    } catch (error) {
      if (error.errors) {
        setErrors(error.errors);
      } else {
        setServerError(
          error.message ||
            'Failed to reset password. The link may have expired. Please request a new one.'
        );
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 px-4 py-12">
      <div className="max-w-md w-full">
        {/* Logo/Brand */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-yellow-400 mb-2">SALON</h1>
          <p className="text-gray-400">Create a new password</p>
        </div>

        {/* Reset Password Form */}
        <div className="bg-gray-800 rounded-lg shadow-xl p-8">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-white mb-2">Reset Password</h2>
            {email && (
              <p className="text-gray-400 text-sm">
                Resetting password for: <strong>{email}</strong>
              </p>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Server Error */}
            {serverError && (
              <div className="bg-red-500/10 border border-red-500 text-red-500 rounded-lg p-4 text-sm">
                {serverError}
              </div>
            )}

            {/* New Password Field */}
            <Input
              type="password"
              name="password"
              label="New Password"
              placeholder="Create a strong password"
              value={formData.password}
              onChange={handleChange}
              error={errors.password}
              required
              fullWidth
              autoComplete="new-password"
              disabled={isLoading || !token}
              autoFocus
              helpText="At least 8 characters, one uppercase, one lowercase, one number"
            />

            {/* Confirm Password Field */}
            <Input
              type="password"
              name="password_confirmation"
              label="Confirm New Password"
              placeholder="Re-enter your password"
              value={formData.password_confirmation}
              onChange={handleChange}
              error={errors.password_confirmation}
              required
              fullWidth
              autoComplete="new-password"
              disabled={isLoading || !token}
            />

            {/* Submit Button */}
            <Button
              type="submit"
              variant="primary"
              fullWidth
              isLoading={isLoading}
              disabled={isLoading || !token}
            >
              Reset Password
            </Button>
          </form>

          {/* Back to Login */}
          <div className="mt-6 text-center">
            <Link
              to="/auth/login"
              className="text-sm text-yellow-400 hover:text-yellow-300 font-medium transition-colors inline-flex items-center"
            >
              <svg
                className="w-4 h-4 mr-1"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
              Back to login
            </Link>
          </div>

          {/* Request New Link */}
          {!token && (
            <div className="mt-4 text-center">
              <Link
                to="/auth/forgot-password"
                className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
              >
                Request a new reset link
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
