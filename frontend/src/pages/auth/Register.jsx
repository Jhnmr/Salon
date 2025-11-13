import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Button, Input, Select } from '../../components/ui';
import {
  getEmailError,
  getPasswordError,
  getPasswordConfirmationError,
  getRequiredError,
} from '../../utils/validators';

/**
 * Register Page
 * Allows new users to create an account
 */
const Register = () => {
  const navigate = useNavigate();
  const { register, isLoading } = useAuth();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    password_confirmation: '',
    role: 'client',
    terms: false,
  });

  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');

  const roleOptions = [
    { value: 'client', label: 'Client - Book appointments' },
    { value: 'stylist', label: 'Stylist - Offer services' },
  ];

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

    const nameError = getRequiredError(formData.name, 'Name');
    if (nameError) newErrors.name = nameError;

    const emailError = getEmailError(formData.email);
    if (emailError) newErrors.email = emailError;

    const passwordError = getPasswordError(formData.password);
    if (passwordError) newErrors.password = passwordError;

    const confirmError = getPasswordConfirmationError(
      formData.password,
      formData.password_confirmation
    );
    if (confirmError) newErrors.password_confirmation = confirmError;

    if (!formData.terms) {
      newErrors.terms = 'You must accept the terms and conditions';
    }

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
      const result = await register({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        password_confirmation: formData.password_confirmation,
        role: formData.role,
      });

      if (result.success) {
        // Redirect based on user role
        const user = result.user;
        if (user.role === 'stylist') {
          navigate('/stylist/dashboard');
        } else {
          navigate('/client/dashboard');
        }
      }
    } catch (error) {
      if (error.errors) {
        // Server validation errors
        setErrors(error.errors);
      } else {
        setServerError(error.message || 'Registration failed. Please try again.');
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 px-4 py-12">
      <div className="max-w-md w-full">
        {/* Logo/Brand */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-yellow-400 mb-2">SALON</h1>
          <p className="text-gray-400">Create your account</p>
        </div>

        {/* Register Form */}
        <div className="bg-gray-800 rounded-lg shadow-xl p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Server Error */}
            {serverError && (
              <div className="bg-red-500/10 border border-red-500 text-red-500 rounded-lg p-4 text-sm">
                {serverError}
              </div>
            )}

            {/* Name Field */}
            <Input
              type="text"
              name="name"
              label="Full Name"
              placeholder="Enter your full name"
              value={formData.name}
              onChange={handleChange}
              error={errors.name}
              required
              fullWidth
              autoComplete="name"
              disabled={isLoading}
            />

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

            {/* Phone Field */}
            <Input
              type="tel"
              name="phone"
              label="Phone Number"
              placeholder="(555) 123-4567"
              value={formData.phone}
              onChange={handleChange}
              error={errors.phone}
              fullWidth
              autoComplete="tel"
              disabled={isLoading}
              helpText="Optional - for appointment notifications"
            />

            {/* Role Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                I want to <span className="text-red-500">*</span>
              </label>
              <div className="space-y-2">
                {roleOptions.map((option) => (
                  <label
                    key={option.value}
                    className={`
                      flex items-center p-4 rounded-lg border-2 cursor-pointer transition-all
                      ${
                        formData.role === option.value
                          ? 'border-yellow-400 bg-yellow-400/10'
                          : 'border-gray-700 bg-gray-800/50 hover:border-gray-600'
                      }
                      ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}
                    `}
                  >
                    <input
                      type="radio"
                      name="role"
                      value={option.value}
                      checked={formData.role === option.value}
                      onChange={handleChange}
                      disabled={isLoading}
                      className="w-4 h-4 text-yellow-400 bg-gray-700 border-gray-600 focus:ring-yellow-400 focus:ring-2"
                    />
                    <span className="ml-3 text-sm text-gray-300">{option.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Password Field */}
            <Input
              type="password"
              name="password"
              label="Password"
              placeholder="Create a strong password"
              value={formData.password}
              onChange={handleChange}
              error={errors.password}
              required
              fullWidth
              autoComplete="new-password"
              disabled={isLoading}
              helpText="At least 8 characters, one uppercase, one lowercase, one number"
            />

            {/* Confirm Password Field */}
            <Input
              type="password"
              name="password_confirmation"
              label="Confirm Password"
              placeholder="Re-enter your password"
              value={formData.password_confirmation}
              onChange={handleChange}
              error={errors.password_confirmation}
              required
              fullWidth
              autoComplete="new-password"
              disabled={isLoading}
            />

            {/* Terms & Conditions */}
            <div>
              <label className="flex items-start">
                <input
                  type="checkbox"
                  name="terms"
                  checked={formData.terms}
                  onChange={handleChange}
                  disabled={isLoading}
                  className="w-4 h-4 mt-1 text-yellow-400 bg-gray-700 border-gray-600 rounded focus:ring-yellow-400 focus:ring-2"
                />
                <span className="ml-2 text-sm text-gray-300">
                  I agree to the{' '}
                  <Link to="/terms" className="text-yellow-400 hover:text-yellow-300">
                    Terms of Service
                  </Link>{' '}
                  and{' '}
                  <Link to="/privacy" className="text-yellow-400 hover:text-yellow-300">
                    Privacy Policy
                  </Link>
                </span>
              </label>
              {errors.terms && <p className="mt-1 text-sm text-red-500">{errors.terms}</p>}
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              variant="primary"
              fullWidth
              isLoading={isLoading}
              disabled={isLoading}
            >
              Create Account
            </Button>
          </form>

          {/* Login Link */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-400">
              Already have an account?{' '}
              <Link
                to="/auth/login"
                className="text-yellow-400 hover:text-yellow-300 font-medium transition-colors"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
