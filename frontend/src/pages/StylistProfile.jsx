import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Button, Badge } from '../components/ui';
import * as stylistsService from '../services/stylists.service';

/**
 * Public Stylist Profile Page
 */
const StylistProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [stylist, setStylist] = useState(null);

  useEffect(() => {
    loadStylist();
  }, [id]);

  const loadStylist = async () => {
    try {
      const data = await stylistsService.getStylist(id);
      setStylist(data);
    } catch (error) {
      // Mock data
      setStylist({
        id,
        name: 'Sarah Johnson',
        avatar: null,
        bio: 'Professional hair stylist with 10+ years of experience specializing in modern cuts and color techniques.',
        rating: 4.9,
        reviews_count: 127,
        specialties: ['Hair Coloring', 'Cutting', 'Styling'],
        experience_years: 10,
        portfolio: [],
      });
    }
  };

  if (!stylist) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <p className="text-gray-400">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Profile Header */}
        <Card className="mb-8">
          <div className="flex flex-col md:flex-row items-center md:items-start space-y-6 md:space-y-0 md:space-x-8">
            <img
              src={stylist.avatar || '/placeholder-avatar.png'}
              alt={stylist.name}
              className="w-32 h-32 rounded-full object-cover"
            />
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-3xl font-bold text-white mb-2">{stylist.name}</h1>
              <div className="flex items-center justify-center md:justify-start space-x-4 mb-4">
                <Badge variant="warning" className="text-lg">{stylist.rating} ★</Badge>
                <span className="text-gray-400">({stylist.reviews_count} reviews)</span>
                <span className="text-gray-400">{stylist.experience_years}+ years experience</span>
              </div>
              <p className="text-gray-300 mb-4">{stylist.bio}</p>
              <div className="flex flex-wrap gap-2 justify-center md:justify-start mb-6">
                {stylist.specialties?.map((specialty, i) => (
                  <Badge key={i} variant="secondary">{specialty}</Badge>
                ))}
              </div>
              <Button
                variant="primary"
                size="lg"
                onClick={() => navigate('/client/book-appointment', { state: { stylist } })}
              >
                Book Appointment
              </Button>
            </div>
          </div>
        </Card>

        {/* Portfolio */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-6">Portfolio</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="aspect-square bg-gray-800 rounded-lg"></div>
            ))}
          </div>
        </div>

        {/* Reviews */}
        <div>
          <h2 className="text-2xl font-bold text-white mb-6">Reviews</h2>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Card key={i}>
                <div className="flex items-start space-x-3">
                  <img src="/placeholder-avatar.png" alt="Client" className="w-10 h-10 rounded-full" />
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="text-white font-medium">Client Name</h4>
                      <div className="flex">
                        {[...Array(5)].map((_, j) => (
                          <svg key={j} className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        ))}
                      </div>
                    </div>
                    <p className="text-gray-400 text-sm">Great experience! Highly recommend.</p>
                    <p className="text-gray-500 text-xs mt-2">2 weeks ago</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StylistProfile;
