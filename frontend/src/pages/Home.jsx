import { Link } from 'react-router-dom';
import { Card, Button, Badge } from '../components/ui';
import { formatCurrency } from '../utils/formatters';

/**
 * Home/Landing Page
 * Public landing page for the SALON PWA
 */
const Home = () => {
  const features = [
    {
      icon: '📅',
      title: 'Easy Booking',
      description: 'Book appointments with top-rated stylists in just a few clicks',
    },
    {
      icon: '⭐',
      title: 'Verified Stylists',
      description: 'All our stylists are verified professionals with excellent reviews',
    },
    {
      icon: '💳',
      title: 'Secure Payment',
      description: 'Safe and secure online payment processing',
    },
    {
      icon: '🔔',
      title: 'Smart Reminders',
      description: 'Never miss an appointment with our notification system',
    },
  ];

  const popularServices = [
    { name: "Women's Haircut", price: 50, duration: 60, image: null },
    { name: 'Hair Coloring', price: 130, duration: 120, image: null },
    { name: "Men's Haircut", price: 40, duration: 45, image: null },
    { name: 'Hair Styling', price: 50, duration: 60, image: null },
  ];

  const topStylists = [
    { name: 'Sarah Johnson', rating: 4.9, specialties: ['Coloring', 'Cutting'], avatar: null },
    { name: 'Mike Chen', rating: 4.8, specialties: ['Men\'s Cut', 'Styling'], avatar: null },
    { name: 'Emily Davis', rating: 4.7, specialties: ['Bridal', 'Special Events'], avatar: null },
  ];

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-yellow-400/20 to-gray-900 py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
              Book Your Perfect <span className="text-yellow-400">Salon Experience</span>
            </h1>
            <p className="text-xl text-gray-300 mb-8">
              Connect with top-rated stylists and book your next appointment in minutes
            </p>
            <div className="flex justify-center space-x-4">
              <Link to="/client/book-appointment">
                <Button variant="primary" size="lg">
                  Book Now
                </Button>
              </Link>
              <Link to="/auth/register">
                <Button variant="secondary" size="lg">
                  Join as Stylist
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">Why Choose SALON?</h2>
            <p className="text-gray-400">Everything you need for the perfect salon experience</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <Card key={index} className="text-center hover:border-yellow-400/50 transition-all">
                <div className="text-5xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold text-white mb-2">{feature.title}</h3>
                <p className="text-gray-400 text-sm">{feature.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Popular Services */}
      <div className="py-20 px-6 bg-gray-800/50">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="text-3xl font-bold text-white mb-2">Popular Services</h2>
              <p className="text-gray-400">Browse our most booked services</p>
            </div>
            <Link to="/client/search-services">
              <Button variant="ghost">View All Services</Button>
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {popularServices.map((service, index) => (
              <Card key={index} className="hover:border-yellow-400/50 transition-all cursor-pointer">
                <div className="h-48 bg-gray-700 rounded-lg mb-4 flex items-center justify-center">
                  <svg className="w-16 h-16 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-white font-semibold mb-2">{service.name}</h3>
                <div className="flex items-center justify-between text-sm text-gray-400">
                  <span>{service.duration} min</span>
                  <span className="text-yellow-400 font-semibold">{formatCurrency(service.price)}</span>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Top Stylists */}
      <div className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">Meet Our Top Stylists</h2>
            <p className="text-gray-400">Experienced professionals ready to serve you</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {topStylists.map((stylist, index) => (
              <Card key={index} className="text-center hover:border-yellow-400/50 transition-all cursor-pointer">
                <img
                  src={stylist.avatar || '/placeholder-avatar.png'}
                  alt={stylist.name}
                  className="w-24 h-24 rounded-full object-cover mx-auto mb-4"
                />
                <h3 className="text-white font-semibold text-lg mb-1">{stylist.name}</h3>
                <div className="flex items-center justify-center mb-3">
                  <Badge variant="warning">{stylist.rating} ★</Badge>
                </div>
                <div className="flex flex-wrap justify-center gap-2">
                  {stylist.specialties.map((specialty, i) => (
                    <Badge key={i} variant="secondary">{specialty}</Badge>
                  ))}
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* How It Works */}
      <div className="py-20 px-6 bg-gray-800/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">How It Works</h2>
            <p className="text-gray-400">Get started in 3 simple steps</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { step: 1, title: 'Choose a Service', desc: 'Browse and select from our wide range of services' },
              { step: 2, title: 'Pick Your Stylist', desc: 'Choose your preferred stylist based on reviews and availability' },
              { step: 3, title: 'Book & Relax', desc: 'Confirm your booking and get ready for your transformation' },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="w-16 h-16 bg-yellow-400 rounded-full flex items-center justify-center text-2xl font-bold text-gray-900 mx-auto mb-4">
                  {item.step}
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">{item.title}</h3>
                <p className="text-gray-400">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <Card className="bg-gradient-to-br from-yellow-400/20 to-gray-800 border-yellow-400/50">
            <h2 className="text-3xl font-bold text-white mb-4">Ready to Get Started?</h2>
            <p className="text-gray-300 mb-8">
              Join thousands of satisfied clients and experience the best salon services
            </p>
            <div className="flex justify-center space-x-4">
              <Link to="/auth/register">
                <Button variant="primary" size="lg">
                  Sign Up Now
                </Button>
              </Link>
              <Link to="/auth/login">
                <Button variant="secondary" size="lg">
                  Sign In
                </Button>
              </Link>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Home;
