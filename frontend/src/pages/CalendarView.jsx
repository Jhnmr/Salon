/**
 * CalendarView Page
 *
 * Calendar view with timeline of today's bookings
 */
import StatusBar from '../components/layout/StatusBar'
import Calendar from '../components/calendar/Calendar'
import TimelineBooking from '../components/calendar/TimelineBooking'
import FloatingButton from '../components/layout/FloatingButton'
import BottomNavigation from '../components/layout/BottomNavigation'

export default function CalendarView() {
  // Sample bookings
  const todayBookings = [
    {
      timeRange: '9:30 AM - 10:30 AM',
      clientName: 'John Doe',
      service: 'Haircut & Styling',
      duration: '60min'
    },
    {
      timeRange: '11:00 AM - 12:00 PM',
      clientName: 'Jane Smith',
      service: 'Color Treatment',
      duration: '45min'
    },
    {
      timeRange: '2:00 PM - 3:30 PM',
      clientName: 'Mike Johnson',
      service: 'Full Package',
      duration: '90min'
    },
    {
      timeRange: '4:00 PM - 5:00 PM',
      clientName: 'Sarah Williams',
      service: 'Manicure & Pedicure',
      duration: '60min'
    },
    {
      timeRange: '5:30 PM - 6:30 PM',
      clientName: 'David Brown',
      service: 'Beard Trimming',
      duration: '30min'
    }
  ]

  return (
    <div className="min-h-screen bg-salon-black pb-20">
      {/* Status Bar */}
      <StatusBar notificationCount={8} />

      {/* Main Content */}
      <div className="px-6 py-4 space-y-6">
        {/* Calendar Selector */}
        <Calendar />

        {/* Today's Bookings Timeline */}
        <section>
          <h2 className="text-white font-bold text-xl mb-4">Today's Bookings</h2>
          <div className="space-y-3">
            {todayBookings.map((booking, index) => (
              <TimelineBooking key={index} booking={booking} />
            ))}
          </div>
        </section>
      </div>

      {/* Floating Action Button */}
      <FloatingButton label="Add new booking" />

      {/* Bottom Navigation */}
      <BottomNavigation activeTab="calendar" />
    </div>
  )
}
