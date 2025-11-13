import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Button, Input } from '../../components/ui';
import { getEmailError } from '../../utils/validators';

/**
 * Forgot Password Page
 * Allows users to request a password reset email
 */
const ForgotPassword = () => {
  const { forgotPassword, isLoading } = useAuth();

  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  /**
   * Handle email change
   */
  const handleChange = (e) => {
    setEmail(e.target.value);
    setError('');
    setSuccess(false);
  };

  /**
   * Validate form
   */
  const validateForm = () => {
    const emailError = getEmailError(email);
    if (emailError) {
      setError(emailError);
      return false;
    }
    return true;
  };

  /**
   * Handle form submission
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    if (!validateForm()) return;

    try {
      await forgotPassword(email);
      setSuccess(true);
    } catch (error) {
      setError(error.message || 'Failed to send reset email. Please try again.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 px-4 py-12">
      <div className="max-w-md w-full">
        {/* Logo/Brand */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-yellow-400 mb-2">SALON</h1>
          <p className="text-gray-400">Reset your password</p>
        </div>

        {/* Forgot Password Form */}
        <div className="bg-gray-800 rounded-lg shadow-xl p-8">
          {!success ? (
            <>
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-white mb-2">Forgot Password?</h2>
                <p className="text-gray-400 text-sm">
                  No worries! Enter your email address and we'll send you a link to reset your
                  password.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Error Message */}
                {error && (
                  <div className="bg-red-500/10 border border-red-500 text-red-500 rounded-lg p-4 text-sm">
                    {error}
                  </div>
                )}

                {/* Email Field */}
                <Input
                  type="email"
                  name="email"
                  label="Email Address"
                  placeholder="Enter your email"
                  value={email}
                  onChange={handleChange}
                  error={error && !error.includes('send') ? error : ''}
                  required
                  fullWidth
                  autoComplete="email"
                  disabled={isLoading}
                  autoFocus
                />

                {/* Submit Button */}
                <Button
                  type="submit"
                  variant="primary"
                  fullWidth
                  isLoading={isLoading}
                  disabled={isLoading}
                >
                  Send Reset Link
                </Button>
              </form>
            </>
          ) : (
            /* Success Message */
            <div className="text-center">
              <div className="mb-6">
                <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg
                    className="w-8 h-8 text-green-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">Check Your Email</h2>
                <p className="text-gray-400 text-sm">
                  We've sent a password reset link to <strong>{email}</strong>
                </p>
              </div>

              <div className="bg-blue-500/10 border border-blue-500 text-blue-400 rounded-lg p-4 text-sm mb-6">
                <p>
                  <strong>Didn't receive the email?</strong>
                </p>
                <p className="mt-1">
                  Check your spam folder or{' '}
                  <button
                    onClick={() => setSuccess(false)}
                    className="text-blue-300 hover:text-blue-200 underline font-medium"
                  >
                    try again
                  </button>
                </p>
              </div>
            </div>
          )}

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
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
