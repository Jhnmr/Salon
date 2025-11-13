import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Card, Button, Badge } from '../components/ui';
import { formatCurrency } from '../utils/formatters';
import * as servicesService from '../services/services.service';

/**
 * Service Details Page
 * Display detailed information about a specific service
 */
const ServiceDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [service, setService] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadServiceDetails();
  }, [id]);

  const loadServiceDetails = async () => {
    try {
      setIsLoading(true);
      const data = await servicesService.getService(id);
      setService(data);
    } catch (error) {
      console.error('Failed to load service:', error);
      // Mock data
      setService({
        id,
        name: "Women's Haircut",
        category: 'haircut',
        price: 50,
        duration: 60,
        description: 'Professional women\'s haircut with style consultation, wash, cut, and blow dry.',
        images: [],
        rating: 4.8,
        reviews_count: 127,
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <p className="text-gray-400">Loading...</p>
      </div>
    );
  }

  if (!service) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <p className="text-gray-400">Service not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="text-gray-400 hover:text-white flex items-center mb-6 transition-colors"
        >
          <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Image Gallery */}
          <div>
            <div className="h-96 bg-gray-800 rounded-lg mb-4 flex items-center justify-center">
              {service.images?.length > 0 ? (
                <img src={service.images[0]} alt={service.name} className="w-full h-full object-cover rounded-lg" />
              ) : (
                <svg className="w-24 h-24 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              )}
            </div>
          </div>

          {/* Service Info */}
          <div>
            <div className="mb-4">
              <Badge variant="primary">{service.category}</Badge>
            </div>
            <h1 className="text-4xl font-bold text-white mb-4">{service.name}</h1>
            <div className="flex items-center space-x-4 mb-6">
              <div className="flex items-center">
                <span className="text-yellow-400 text-2xl font-bold mr-2">{service.rating}</span>
                <span className="text-yellow-400 text-xl">★</span>
              </div>
              <span className="text-gray-400">({service.reviews_count} reviews)</span>
            </div>

            <Card className="mb-6">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Price</span>
                  <span className="text-yellow-400 text-2xl font-bold">{formatCurrency(service.price)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Duration</span>
                  <span className="text-white font-semibold">{service.duration} minutes</span>
                </div>
              </div>
            </Card>

            <div className="mb-6">
              <h2 className="text-xl font-semibold text-white mb-3">Description</h2>
              <p className="text-gray-300 leading-relaxed">{service.description}</p>
            </div>

            <Button
              variant="primary"
              size="lg"
              fullWidth
              onClick={() => navigate('/client/book-appointment', { state: { service } })}
            >
              Book This Service
            </Button>
          </div>
        </div>

        {/* Stylists Offering This Service */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-white mb-6">Stylists Offering This Service</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="hover:border-yellow-400/50 transition-all cursor-pointer">
                <div className="flex items-center space-x-4">
                  <img
                    src="/placeholder-avatar.png"
                    alt="Stylist"
                    className="w-16 h-16 rounded-full object-cover"
                  />
                  <div>
                    <h3 className="text-white font-semibold">Stylist Name</h3>
                    <Badge variant="warning">4.8 ★</Badge>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Related Services */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-white mb-6">Related Services</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i} className="hover:border-yellow-400/50 transition-all cursor-pointer">
                <div className="h-32 bg-gray-700 rounded-lg mb-3"></div>
                <h3 className="text-white font-semibold mb-2">Related Service {i}</h3>
                <p className="text-yellow-400 font-semibold">{formatCurrency(45)}</p>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServiceDetails;
