/**
 * Dashboard Page
 *
 * Main dashboard showing stats and today's bookings
 */
import StatusBar from '../components/layout/StatusBar'
import SearchBar from '../components/layout/SearchBar'
import StatCard from '../components/dashboard/StatCard'
import BookingCard from '../components/dashboard/BookingCard'
import FloatingButton from '../components/layout/FloatingButton'
import BottomNavigation from '../components/layout/BottomNavigation'

export default function Dashboard() {
  // Sample data
  const stats = [
    {
      title: 'Total Bookings Today',
      value: '28',
      trend: { direction: 'up', value: '+12%' },
      variant: 'primary'
    },
    {
      title: 'Cancelled Month',
      value: '12%',
      trend: { direction: 'down', value: '-5%' },
      variant: 'secondary'
    }
  ]

  const todayBookings = [
    {
      timeRange: '9:30 AM - 10:30 AM',
      duration: '60min',
      serviceCount: 2,
      clientName: 'John Doe',
      referenceCode: 'REF 6790768C',
      status: 'confirmed'
    },
    {
      timeRange: '11:00 AM - 12:00 PM',
      duration: '45min',
      serviceCount: 1,
      clientName: 'Jane Smith',
      referenceCode: 'REF 6790769D',
      status: 'pending'
    },
    {
      timeRange: '2:00 PM - 3:30 PM',
      duration: '90min',
      serviceCount: 3,
      clientName: 'Mike Johnson',
      referenceCode: 'REF 679076AE',
      status: 'confirmed'
    },
    {
      timeRange: '4:00 PM - 5:00 PM',
      duration: '60min',
      serviceCount: 2,
      clientName: 'Sarah Williams',
      referenceCode: 'REF 679076BF',
      status: 'confirmed'
    }
  ]

  return (
    <div className="min-h-screen bg-salon-black pb-20">
      {/* Status Bar */}
      <StatusBar notificationCount={8} />

      {/* Main Content */}
      <div className="px-6 py-4 space-y-6">
        {/* Search Bar */}
        <SearchBar placeholder="Search bookings, clients..." />

        {/* Stats Section */}
        <section>
          <h2 className="text-white font-bold text-xl mb-4">Your Stats</h2>
          <div className="grid grid-cols-2 gap-4">
            {stats.map((stat, index) => (
              <StatCard key={index} {...stat} />
            ))}
          </div>
        </section>

        {/* Today's Bookings Section */}
        <section>
          <h2 className="text-white font-bold text-xl mb-4">Today's Bookings</h2>
          <div className="space-y-3">
            {todayBookings.map((booking, index) => (
              <BookingCard key={index} booking={booking} />
            ))}
          </div>
        </section>
      </div>

      {/* Floating Action Button */}
      <FloatingButton label="Add new booking" />

      {/* Bottom Navigation */}
      <BottomNavigation activeTab="home" />
    </div>
  )
}
