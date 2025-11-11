/**
 * TimelineBooking Component
 *
 * Booking item displayed in a timeline format
 */
export default function TimelineBooking({ booking }) {
  const {
    timeRange = '9:30 AM - 10:30 AM',
    clientName = 'John Doe',
    clientAvatar = null,
    service = 'Haircut & Styling',
    duration = '60min',
  } = booking || {}

  return (
    <div className="flex items-start gap-4 p-4 bg-salon-gray-dark rounded-2xl hover:bg-salon-gray-light transition-all">
      {/* Time Badge */}
      <div className="flex-shrink-0">
        <span className="inline-block bg-salon-yellow text-salon-black px-3 py-1.5 rounded-full text-xs font-bold">
          {timeRange}
        </span>
      </div>

      {/* Client Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          {clientAvatar ? (
            <img
              src={clientAvatar}
              alt={clientName}
              className="w-8 h-8 rounded-full object-cover"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-salon-yellow flex items-center justify-center">
              <span className="text-salon-black text-sm font-bold">
                {clientName.charAt(0)}
              </span>
            </div>
          )}
          <div>
            <p className="text-white font-medium text-sm">{clientName}</p>
            <p className="text-salon-gray-text text-xs">{service} • {duration}</p>
          </div>
        </div>
      </div>

      {/* Details Button */}
      <button className="flex-shrink-0 px-3 py-1.5 bg-salon-yellow/10 text-salon-yellow rounded-lg text-xs font-medium hover:bg-salon-yellow/20 transition-colors">
        Details
      </button>
    </div>
  )
}
