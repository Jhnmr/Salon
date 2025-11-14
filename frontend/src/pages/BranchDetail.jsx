/**
 * SALON PWA - Branch (Salon) Detail Page
 * Displays comprehensive information about a salon branch including:
 * - Location on map
 * - Services offered
 * - Stylists
 * - Reviews
 * - Portfolio photos
 */

import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Card, Button, Badge, Loader } from '../components/ui';
import GoogleMap from '../components/GoogleMap';
import { formatCurrency } from '../utils/formatters';
import * as branchesService from '../services/branches.service';

const BranchDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [branch, setBranch] = useState(null);
  const [services, setServices] = useState([]);
  const [stylists, setStylists] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('services'); // services, stylists, reviews, portfolio

  useEffect(() => {
    loadBranchDetails();
  }, [id]);

  /**
   * Load all branch data
   */
  const loadBranchDetails = async () => {
    try {
      setIsLoading(true);

      // Load branch details
      const branchData = await branchesService.getBranch(id);
      setBranch(branchData.data || branchData);

      // Load related data in parallel
      const [servicesData, stylistsData, reviewsData, postsData] = await Promise.allSettled([
        branchesService.getBranchServices(id),
        branchesService.getBranchStylists(id),
        branchesService.getBranchReviews(id),
        branchesService.getBranchPosts(id),
      ]);

      if (servicesData.status === 'fulfilled') {
        setServices(servicesData.value.data || servicesData.value || []);
      }
      if (stylistsData.status === 'fulfilled') {
        setStylists(stylistsData.value.data || stylistsData.value || []);
      }
      if (reviewsData.status === 'fulfilled') {
        setReviews(reviewsData.value.data || reviewsData.value || []);
      }
      if (postsData.status === 'fulfilled') {
        setPosts(postsData.value.data || postsData.value || []);
      }
    } catch (error) {
      console.error('Failed to load branch details:', error);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Render star rating
   */
  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <span key={`full-${i}`} className="text-yellow-400">
          ★
        </span>
      );
    }

    if (hasHalfStar) {
      stars.push(
        <span key="half" className="text-yellow-400">
          ★
        </span>
      );
    }

    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(
        <span key={`empty-${i}`} className="text-gray-600">
          ★
        </span>
      );
    }

    return stars;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <Loader />
      </div>
    );
  }

  if (!branch) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-400 mb-4">Salon not found</p>
          <Button onClick={() => navigate('/search')}>Back to Search</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Back Button */}
          <button
            onClick={() => navigate(-1)}
            className="text-gray-400 hover:text-white flex items-center mb-4 transition-colors"
          >
            <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back
          </button>

          <div className="flex flex-col md:flex-row md:items-start md:justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-2">
                <h1 className="text-3xl md:text-4xl font-bold text-white">{branch.name}</h1>
                {branch.verified && (
                  <Badge variant="success">Verified</Badge>
                )}
              </div>

              <div className="flex items-center space-x-4 mb-4">
                <div className="flex items-center">
                  {renderStars(branch.rating || 0)}
                  <span className="ml-2 text-gray-400">
                    ({branch.reviews_count || 0} reviews)
                  </span>
                </div>
              </div>

              {/* Location */}
              <div className="flex items-start space-x-2 text-gray-300 mb-2">
                <svg className="w-5 h-5 text-yellow-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <p>{branch.address}, {branch.city}, {branch.state} {branch.postal_code}</p>
              </div>

              {/* Phone */}
              {branch.phone && (
                <div className="flex items-center space-x-2 text-gray-300 mb-2">
                  <svg className="w-5 h-5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  <a href={`tel:${branch.phone}`} className="hover:text-yellow-400">{branch.phone}</a>
                </div>
              )}

              {/* Hours */}
              {branch.hours && (
                <div className="flex items-start space-x-2 text-gray-300">
                  <svg className="w-5 h-5 text-yellow-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p>{branch.hours}</p>
                </div>
              )}
            </div>

            {/* Book Now Button */}
            <div className="mt-4 md:mt-0">
              <Button
                variant="primary"
                size="lg"
                onClick={() => navigate('/client/book', { state: { branchId: branch.id } })}
              >
                Book Appointment
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Google Maps */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <GoogleMap
          markers={[{
            id: branch.id,
            lat: parseFloat(branch.latitude) || 0,
            lng: parseFloat(branch.longitude) || 0,
            title: branch.name,
            subtitle: `${branch.address}, ${branch.city}`,
            type: 'branch',
          }]}
          center={{
            lat: parseFloat(branch.latitude) || 0,
            lng: parseFloat(branch.longitude) || 0,
          }}
          zoom={15}
          height="400px"
        />

        {/* Tabs */}
        <div className="mb-6">
          <div className="border-b border-gray-700">
            <nav className="-mb-px flex space-x-8">
              {['services', 'stylists', 'reviews', 'portfolio'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`
                    py-4 px-1 border-b-2 font-medium text-sm capitalize
                    ${activeTab === tab
                      ? 'border-yellow-400 text-yellow-400'
                      : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-300'
                    }
                  `}
                >
                  {tab}
                  {tab === 'services' && ` (${services.length})`}
                  {tab === 'stylists' && ` (${stylists.length})`}
                  {tab === 'reviews' && ` (${reviews.length})`}
                  {tab === 'portfolio' && ` (${posts.length})`}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        <div>
          {/* Services Tab */}
          {activeTab === 'services' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {services.length > 0 ? (
                services.map((service) => (
                  <Card key={service.id} className="hover:border-yellow-400/50 transition-all">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-white mb-1">{service.name}</h3>
                        <Badge variant="secondary">{service.category}</Badge>
                      </div>
                    </div>
                    <p className="text-gray-400 text-sm mb-4 line-clamp-2">{service.description}</p>
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-yellow-400 text-xl font-bold">{formatCurrency(service.price)}</p>
                        <p className="text-gray-500 text-sm">{service.duration} min</p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate('/client/book', { state: { service, branchId: branch.id } })}
                      >
                        Book
                      </Button>
                    </div>
                  </Card>
                ))
              ) : (
                <div className="col-span-full text-center py-12">
                  <p className="text-gray-400">No services available</p>
                </div>
              )}
            </div>
          )}

          {/* Stylists Tab */}
          {activeTab === 'stylists' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {stylists.length > 0 ? (
                stylists.map((stylist) => (
                  <Card key={stylist.id} className="hover:border-yellow-400/50 transition-all text-center">
                    <div className="flex flex-col items-center">
                      <img
                        src={stylist.avatar_url || '/placeholder-avatar.png'}
                        alt={stylist.name}
                        className="w-24 h-24 rounded-full object-cover mb-4"
                      />
                      <h3 className="text-lg font-semibold text-white mb-1">{stylist.name}</h3>
                      <p className="text-gray-400 text-sm mb-2">{stylist.specialization}</p>
                      <div className="flex items-center mb-4">
                        {renderStars(stylist.rating || 0)}
                        <span className="ml-1 text-sm text-gray-400">({stylist.reviews_count || 0})</span>
                      </div>
                      <Link to={`/stylists/${stylist.id}`}>
                        <Button variant="outline" size="sm">View Profile</Button>
                      </Link>
                    </div>
                  </Card>
                ))
              ) : (
                <div className="col-span-full text-center py-12">
                  <p className="text-gray-400">No stylists available</p>
                </div>
              )}
            </div>
          )}

          {/* Reviews Tab */}
          {activeTab === 'reviews' && (
            <div className="space-y-6">
              {reviews.length > 0 ? (
                reviews.map((review) => (
                  <Card key={review.id}>
                    <div className="flex items-start space-x-4">
                      <img
                        src={review.client?.avatar_url || '/placeholder-avatar.png'}
                        alt={review.client?.name}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <h4 className="text-white font-semibold">{review.client?.name || 'Anonymous'}</h4>
                            <div className="flex items-center">
                              {renderStars(review.rating)}
                            </div>
                          </div>
                          <span className="text-sm text-gray-500">{review.created_at}</span>
                        </div>
                        <p className="text-gray-300">{review.comment}</p>
                      </div>
                    </div>
                  </Card>
                ))
              ) : (
                <div className="text-center py-12">
                  <p className="text-gray-400">No reviews yet</p>
                </div>
              )}
            </div>
          )}

          {/* Portfolio Tab */}
          {activeTab === 'portfolio' && (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {posts.length > 0 ? (
                posts.map((post) => (
                  <div key={post.id} className="aspect-square rounded-lg overflow-hidden bg-gray-800">
                    <img
                      src={post.image_url}
                      alt={post.caption || 'Portfolio image'}
                      className="w-full h-full object-cover hover:scale-110 transition-transform cursor-pointer"
                    />
                  </div>
                ))
              ) : (
                <div className="col-span-full text-center py-12">
                  <p className="text-gray-400">No portfolio images</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BranchDetail;
