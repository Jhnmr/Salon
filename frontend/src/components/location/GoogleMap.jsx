import React, { useState, useEffect, useCallback } from 'react';
import { GoogleMap, LoadScript, Marker, InfoWindow } from '@react-google-maps/api';
import { Loader } from '../ui';
import './GoogleMap.css';

/**
 * Google Maps Component
 * Displays stylists on a map with geolocation
 */
const MapComponent = ({
  stylists = [],
  onStylistSelect = null,
  defaultCenter = { lat: 40.7128, lng: -74.006 }, // NYC default
  defaultZoom = 12,
  apiKey
}) => {
  const [map, setMap] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [selectedStylist, setSelectedStylist] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [bounds, setBounds] = useState(null);

  // Get user's geolocation
  useEffect(() => {
    if ('geolocation' in navigator) {
      setLoading(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation({
            lat: latitude,
            lng: longitude,
          });
          setLoading(false);
        },
        (error) => {
          console.warn('Geolocation error:', error);
          setError('Could not get your location');
          setLoading(false);
          // Fallback to default center
        },
        {
          enableHighAccuracy: false,
          timeout: 10000,
          maximumAge: 3600000,
        }
      );
    } else {
      setError('Geolocation not supported');
      setLoading(false);
    }
  }, []);

  // Handle map load
  const onMapLoad = useCallback((map) => {
    setMap(map);

    // Fit map to show all markers
    if (stylists && stylists.length > 0) {
      const bounds = new window.google.maps.LatLngBounds();

      // Add user location
      if (userLocation) {
        bounds.extend(userLocation);
      }

      // Add stylist locations
      stylists.forEach((stylist) => {
        if (stylist.branch?.latitude && stylist.branch?.longitude) {
          bounds.extend({
            lat: parseFloat(stylist.branch.latitude),
            lng: parseFloat(stylist.branch.longitude),
          });
        }
      });

      setBounds(bounds);
      map.fitBounds(bounds, { top: 50, right: 50, bottom: 50, left: 50 });
    }
  }, [stylists, userLocation]);

  const mapContainerStyle = {
    width: '100%',
    height: '500px',
    borderRadius: '8px',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
  };

  const mapCenter = userLocation || defaultCenter;

  if (!apiKey) {
    return (
      <div className="map-error">
        <p>⚠️ Google Maps API key not configured</p>
      </div>
    );
  }

  return (
    <div className="google-map-container">
      {error && <div className="map-error">{error}</div>}

      <LoadScript googleMapsApiKey={apiKey} libraries={['places']}>
        <GoogleMap
          mapContainerStyle={mapContainerStyle}
          center={mapCenter}
          zoom={defaultZoom}
          onLoad={onMapLoad}
          options={{
            streetViewControl: false,
            fullscreenControl: true,
            mapTypeControl: true,
          }}
        >
          {/* User Location Marker */}
          {userLocation && (
            <Marker
              position={userLocation}
              title="Your Location"
              icon="http://maps.google.com/mapfiles/ms/icons/blue-dot.png"
              zIndex={1000}
            />
          )}

          {/* Stylist Markers */}
          {stylists && stylists.length > 0 && (
            stylists.map((stylist) => {
              const hasLocation =
                stylist.branch?.latitude && stylist.branch?.longitude;

              if (!hasLocation) return null;

              return (
                <Marker
                  key={stylist.id}
                  position={{
                    lat: parseFloat(stylist.branch.latitude),
                    lng: parseFloat(stylist.branch.longitude),
                  }}
                  title={stylist.user?.name || 'Stylist'}
                  onClick={() => setSelectedStylist(stylist)}
                  icon="http://maps.google.com/mapfiles/ms/icons/red-dot.png"
                />
              );
            })
          )}

          {/* Info Window for Selected Stylist */}
          {selectedStylist && selectedStylist.branch && (
            <InfoWindow
              position={{
                lat: parseFloat(selectedStylist.branch.latitude),
                lng: parseFloat(selectedStylist.branch.longitude),
              }}
              onCloseClick={() => setSelectedStylist(null)}
            >
              <div className="info-window">
                <h4>{selectedStylist.user?.name}</h4>
                <p className="speciality">
                  {selectedStylist.specialties?.join(', ') || 'Professional'}
                </p>
                <p className="branch-name">
                  📍 {selectedStylist.branch?.name}
                </p>
                <p className="rating">
                  ⭐ {selectedStylist.average_rating?.toFixed(1) || 'No ratings'}
                </p>
                {onStylistSelect && (
                  <button
                    className="btn-view-profile"
                    onClick={() => {
                      onStylistSelect(selectedStylist);
                      setSelectedStylist(null);
                    }}
                  >
                    View Profile
                  </button>
                )}
              </div>
            </InfoWindow>
          )}
        </GoogleMap>
      </LoadScript>

      <div className="map-legend">
        <div className="legend-item">
          <span className="legend-marker blue">●</span>
          <span>Your Location</span>
        </div>
        <div className="legend-item">
          <span className="legend-marker red">●</span>
          <span>Stylists</span>
        </div>
      </div>
    </div>
  );
};

export default MapComponent;
