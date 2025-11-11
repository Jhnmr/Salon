/**
 * Card Component
 *
 * Base card component with rounded corners for dark mode
 */
export default function Card({
  children,
  className = '',
  variant = 'default',
  padding = 'md',
  hoverable = false,
  ...props
}) {
  const baseStyles = 'rounded-2xl transition-all duration-200'

  const variants = {
    default: 'bg-salon-gray-dark',
    primary: 'bg-salon-yellow text-salon-black',
    glass: 'glass-effect border border-salon-gray-medium',
    bordered: 'bg-salon-black-light border-2 border-salon-gray-medium',
  }

  const paddings = {
    none: '',
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6',
  }

  const hoverStyles = hoverable ? 'hover:shadow-float hover:scale-[1.02] cursor-pointer' : ''

  const classes = `${baseStyles} ${variants[variant]} ${paddings[padding]} ${hoverStyles} ${className}`

  return (
    <div className={classes} {...props}>
      {children}
    </div>
  )
}
