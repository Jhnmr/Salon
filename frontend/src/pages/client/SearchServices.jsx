import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card, Button, Input, Select, Badge, Loader } from '../../components/ui';
import * as servicesService from '../../services/services.service';
import { formatCurrency } from '../../utils/formatters';

/**
 * Search Services Page
 * Browse and search for services with filters
 */
const SearchServices = () => {
  const navigate = useNavigate();

  const [services, setServices] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'map'

  const [filters, setFilters] = useState({
    search: '',
    category: '',
    min_price: '',
    max_price: '',
    min_rating: '',
    branch_id: '',
  });

  useEffect(() => {
    loadServices();
  }, [filters]);

  /**
   * Load services with filters
   */
  const loadServices = async () => {
    try {
      setIsLoading(true);
      const response = await servicesService.getServices(filters);
      setServices(response.data || response);
    } catch (error) {
      console.error('Failed to load services:', error);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Handle filter change
   */
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  /**
   * Clear all filters
   */
  const clearFilters = () => {
    setFilters({
      search: '',
      category: '',
      min_price: '',
      max_price: '',
      min_rating: '',
      branch_id: '',
    });
  };

  /**
   * Navigate to service details
   */
  const handleServiceClick = (serviceId) => {
    navigate(`/services/${serviceId}`);
  };

  const categoryOptions = [
    { value: '', label: 'All Categories' },
    { value: 'haircut', label: 'Haircut' },
    { value: 'coloring', label: 'Hair Coloring' },
    { value: 'styling', label: 'Hair Styling' },
    { value: 'treatment', label: 'Hair Treatment' },
    { value: 'nails', label: 'Nail Care' },
    { value: 'makeup', label: 'Makeup' },
    { value: 'facial', label: 'Facial' },
    { value: 'massage', label: 'Massage' },
  ];

  const ratingOptions = [
    { value: '', label: 'Any Rating' },
    { value: '4', label: '4+ Stars' },
    { value: '4.5', label: '4.5+ Stars' },
    { value: '4.8', label: '4.8+ Stars' },
  ];

  return (
    <div className="min-h-screen bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Browse Services</h1>
          <p className="text-gray-400">Find the perfect service for your needs</p>
        </div>

        {/* Search and Filters */}
        <Card className="mb-6">
          <div className="space-y-4">
            {/* Search Bar */}
            <Input
              type="search"
              name="search"
              placeholder="Search services..."
              value={filters.search}
              onChange={handleFilterChange}
              fullWidth
            />

            {/* Filter Row */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Select
                name="category"
                value={filters.category}
                onChange={handleFilterChange}
                options={categoryOptions}
              />

              <Input
                type="number"
                name="min_price"
                placeholder="Min Price"
                value={filters.min_price}
                onChange={handleFilterChange}
              />

              <Input
                type="number"
                name="max_price"
                placeholder="Max Price"
                value={filters.max_price}
                onChange={handleFilterChange}
              />

              <Select
                name="min_rating"
                value={filters.min_rating}
                onChange={handleFilterChange}
                options={ratingOptions}
              />
            </div>

            {/* Filter Actions */}
            <div className="flex items-center justify-between pt-2">
              <p className="text-sm text-gray-400">
                {services.length} service{services.length !== 1 ? 's' : ''} found
              </p>
              <div className="flex items-center space-x-2">
                <Button variant="ghost" size="sm" onClick={clearFilters}>
                  Clear Filters
                </Button>
                <div className="flex items-center bg-gray-700 rounded-lg p-1">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded transition-colors ${
                      viewMode === 'grid' ? 'bg-yellow-400 text-gray-900' : 'text-gray-400 hover:text-white'
                    }`}
                    aria-label="Grid view"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M3 3h8v8H3V3zm10 0h8v8h-8V3zM3 13h8v8H3v-8zm10 0h8v8h-8v-8z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => setViewMode('map')}
                    className={`p-2 rounded transition-colors ${
                      viewMode === 'map' ? 'bg-yellow-400 text-gray-900' : 'text-gray-400 hover:text-white'
                    }`}
                    aria-label="Map view"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Services Grid */}
        {viewMode === 'grid' ? (
          isLoading ? (
            <div className="flex justify-center py-12">
              <Loader size="lg" />
            </div>
          ) : services.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {services.map((service) => (
                <Card
                  key={service.id}
                  className="hover:border-yellow-400/50 transition-all cursor-pointer group"
                  onClick={() => handleServiceClick(service.id)}
                >
                  {/* Service Image */}
                  <div className="relative h-48 mb-4 rounded-lg overflow-hidden bg-gray-700">
                    {service.image ? (
                      <img
                        src={service.image}
                        alt={service.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <svg className="w-16 h-16 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                    )}
                    {service.category && (
                      <Badge
                        variant="primary"
                        className="absolute top-2 left-2 bg-gray-900/80 backdrop-blur"
                      >
                        {service.category}
                      </Badge>
                    )}
                  </div>

                  {/* Service Info */}
                  <div>
                    <h3 className="text-white font-semibold text-lg mb-2 group-hover:text-yellow-400 transition-colors">
                      {service.name}
                    </h3>
                    <p className="text-gray-400 text-sm mb-3 line-clamp-2">
                      {service.description || 'Professional service by experienced stylists'}
                    </p>

                    {/* Service Details */}
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-4 text-sm text-gray-400">
                        <span className="flex items-center">
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          {service.duration || 60} min
                        </span>
                        {service.rating && (
                          <span className="flex items-center">
                            <svg className="w-4 h-4 mr-1 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                            {service.rating}
                          </span>
                        )}
                      </div>
                      <span className="text-yellow-400 font-bold text-lg">
                        {formatCurrency(service.price)}
                      </span>
                    </div>

                    {/* Branch */}
                    {service.branch && (
                      <p className="text-gray-500 text-xs mb-3">
                        {service.branch.name}
                      </p>
                    )}

                    {/* Actions */}
                    <div className="flex space-x-2">
                      <Button
                        variant="primary"
                        size="sm"
                        fullWidth
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate('/client/book-appointment', { state: { service } });
                        }}
                      >
                        Book Now
                      </Button>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleServiceClick(service.id);
                        }}
                      >
                        Details
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="text-center py-12">
              <div className="text-gray-400">
                <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <p className="text-lg mb-2">No services found</p>
                <p className="text-sm">Try adjusting your filters</p>
              </div>
            </Card>
          )
        ) : (
          /* Map View Placeholder */
          <Card className="h-96 flex items-center justify-center">
            <div className="text-center text-gray-400">
              <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
              </svg>
              <p className="text-lg">Map View Coming Soon</p>
              <p className="text-sm mt-2">Google Maps integration will be added here</p>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};

export default SearchServices;
