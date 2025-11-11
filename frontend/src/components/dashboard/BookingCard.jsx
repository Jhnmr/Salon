/**
 * BookingCard Component
 *
 * Individual booking/appointment card for today's bookings list
 */
export default function BookingCard({ booking }) {
  const {
    timeRange = '9:30 AM - 10:30 AM',
    duration = '60min',
    serviceCount = 2,
    clientName = 'John Doe',
    clientAvatar = null,
    referenceCode = 'REF 6790768C',
    status = 'confirmed'
  } = booking || {}

  const statusColors = {
    confirmed: 'bg-success/20 text-success',
    pending: 'bg-warning/20 text-warning',
    cancelled: 'bg-danger/20 text-danger',
  }

  return (
    <div className="bg-salon-gray-dark rounded-2xl p-4 hover:bg-salon-gray-light transition-all duration-200">
      <div className="flex items-center justify-between">
        {/* Left: Time and Service Info */}
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className="inline-block bg-salon-yellow text-salon-black px-3 py-1 rounded-full text-sm font-semibold">
              {timeRange}
            </span>
          </div>
          <p className="text-white text-sm font-medium mb-1">
            {duration} x{String(serviceCount).padStart(2, '0')} Services
          </p>
          <div className="flex items-center gap-2">
            {clientAvatar ? (
              <img
                src={clientAvatar}
                alt={clientName}
                className="w-6 h-6 rounded-full object-cover"
              />
            ) : (
              <div className="w-6 h-6 rounded-full bg-salon-yellow flex items-center justify-center">
                <span className="text-salon-black text-xs font-bold">
                  {clientName.charAt(0)}
                </span>
              </div>
            )}
            <span className="text-salon-gray-text text-sm">{clientName}</span>
          </div>
        </div>

        {/* Right: Reference and Status */}
        <div className="flex flex-col items-end gap-2">
          <span className="text-salon-gray-text text-xs font-mono">{referenceCode}</span>
          <span className={`px-2 py-1 rounded-lg text-xs font-medium ${statusColors[status]}`}>
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </span>
        </div>
      </div>
    </div>
  )
}
