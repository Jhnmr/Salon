/**
 * Button Component
 *
 * Versatile button component with multiple variants for the Salon app
 */
export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  icon,
  iconPosition = 'left',
  loading = false,
  disabled = false,
  onClick,
  className = '',
  ...props
}) {
  const baseStyles = 'inline-flex items-center justify-center gap-2 font-medium rounded-2xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-salon-yellow focus:ring-offset-2 focus:ring-offset-salon-black disabled:opacity-50 disabled:cursor-not-allowed'

  const variants = {
    primary: 'bg-salon-yellow text-salon-black hover:bg-salon-yellow-light active:scale-95 shadow-float',
    secondary: 'bg-salon-gray-dark text-white hover:bg-salon-gray-light',
    outline: 'border-2 border-salon-yellow text-salon-yellow hover:bg-salon-yellow hover:text-salon-black',
    ghost: 'text-salon-gray-text hover:text-white hover:bg-salon-gray-dark',
    danger: 'bg-danger text-white hover:bg-danger-light',
    success: 'bg-success text-white hover:bg-success-light',
  }

  const sizes = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
  }

  const classes = `${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`

  return (
    <button
      className={classes}
      disabled={disabled || loading}
      onClick={onClick}
      {...props}
    >
      {loading && (
        <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      )}
      {!loading && icon && iconPosition === 'left' && (
        <span className="flex-shrink-0">{icon}</span>
      )}
      {children}
      {!loading && icon && iconPosition === 'right' && (
        <span className="flex-shrink-0">{icon}</span>
      )}
    </button>
  )
}
