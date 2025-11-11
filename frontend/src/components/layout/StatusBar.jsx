/**
 * StatusBar Component
 *
 * Top status bar with time, signal indicators, and notification badge
 */
export default function StatusBar({ notificationCount = 0 }) {
  const currentTime = new Date().toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  })

  return (
    <div className="flex items-center justify-between px-6 py-3 bg-salon-black">
      {/* Left: Signal indicators */}
      <div className="flex items-center gap-1">
        <div className="flex items-end gap-[2px]">
          <div className="w-1 h-2 bg-white rounded-full"></div>
          <div className="w-1 h-3 bg-white rounded-full"></div>
          <div className="w-1 h-4 bg-white rounded-full"></div>
          <div className="w-1 h-5 bg-white rounded-full"></div>
        </div>
      </div>

      {/* Center: Time */}
      <div className="text-white font-medium">{currentTime}</div>

      {/* Right: WiFi, Battery, and Notification */}
      <div className="flex items-center gap-2">
        {/* WiFi Icon */}
        <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
          <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
          <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
        </svg>

        {/* Battery Icon */}
        <div className="flex items-center gap-1">
          <div className="w-5 h-3 border border-white rounded-sm relative">
            <div className="absolute inset-0.5 bg-white rounded-sm"></div>
          </div>
          <div className="w-0.5 h-1.5 bg-white rounded-r-sm"></div>
        </div>

        {/* Notification Badge */}
        {notificationCount > 0 && (
          <div className="relative">
            <div className="w-6 h-6 bg-danger rounded-full flex items-center justify-center">
              <span className="text-white text-xs font-bold">{notificationCount > 99 ? '99+' : notificationCount}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
