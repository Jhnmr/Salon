/**
 * StatCard Component
 *
 * Statistics card showing key metrics with trend indicators
 */
export default function StatCard({ title, value, trend, variant = 'primary' }) {
  const variants = {
    primary: 'bg-salon-yellow text-salon-black',
    secondary: 'bg-salon-gray-dark text-white',
    success: 'bg-success text-white',
    danger: 'bg-danger text-white',
  }

  const trendColors = {
    up: 'text-success',
    down: 'text-danger',
  }

  return (
    <div className={`rounded-2xl p-5 ${variants[variant]} transition-all duration-200 hover:scale-105`}>
      <p className="text-sm font-medium opacity-90 mb-2">{title}</p>
      <div className="flex items-end justify-between">
        <h3 className="text-4xl font-bold">{value}</h3>
        {trend && (
          <div className={`flex items-center gap-1 ${trendColors[trend.direction]}`}>
            {trend.direction === 'up' ? (
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M14.707 10.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 12.586V5a1 1 0 012 0v7.586l2.293-2.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            )}
            <span className="text-sm font-semibold">{trend.value}</span>
          </div>
        )}
      </div>
    </div>
  )
}
