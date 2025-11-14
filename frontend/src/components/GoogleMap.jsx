/**
 * SALON PWA - Google Maps Component
 * Reusable Google Maps integration with markers and info windows
 *
 * NOTE: Requires @react-google-maps/api package
 * Install: npm install @react-google-maps/api
 */

import { useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * GoogleMap Component
 * Displays a map with location markers
 *
 * @param {Array} markers - Array of marker objects {id, lat, lng, title, subtitle, type}
 * @param {Object} center - Map center {lat, lng}
 * @param {number} zoom - Initial zoom level (default: 12)
 * @param {string} height - Map height (default: '400px')
 * @param {Function} onMarkerClick - Callback when marker is clicked (marker) => void
 */
const GoogleMap = ({ markers = [], center, zoom = 12, height = '400px', onMarkerClick }) => {
  const navigate = useNavigate();
  const [selectedMarker, setSelectedMarker] = useState(null);

  // TODO: Check if @react-google-maps/api is installed
  // For now, show placeholder with instructions

  const mapApiKey = import.meta.env.VITE_GOOGLE_MAPS_KEY;

  // If no API key, show placeholder
  if (!mapApiKey || mapApiKey === 'AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX') {
    return (
      <div
        className="bg-gray-800 rounded-lg flex flex-col items-center justify-center text-center p-8"
        style={{ height }}
      >
        <svg className="w-16 h-16 text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
          />
        </svg>
        <h3 className="text-xl font-semibold text-white mb-2">Google Maps Integration</h3>
        <p className="text-gray-400 mb-4 max-w-md">
          To enable Google Maps, you need to:
        </p>
        <ol className="text-left text-gray-300 space-y-2 mb-6">
          <li className="flex items-start">
            <span className="text-yellow-400 mr-2">1.</span>
            <span>Get a Google Maps API key from{' '}
              <a
                href="https://console.cloud.google.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-yellow-400 hover:underline"
              >
                Google Cloud Console
              </a>
            </span>
          </li>
          <li className="flex items-start">
            <span className="text-yellow-400 mr-2">2.</span>
            <span>Install: <code className="bg-gray-700 px-2 py-1 rounded text-sm">npm install @react-google-maps/api</code></span>
          </li>
          <li className="flex items-start">
            <span className="text-yellow-400 mr-2">3.</span>
            <span>Add to frontend/.env: <code className="bg-gray-700 px-2 py-1 rounded text-sm">VITE_GOOGLE_MAPS_KEY=your_key</code></span>
          </li>
        </ol>

        {/* Placeholder markers list */}
        {markers.length > 0 && (
          <div className="w-full max-w-md mt-4">
            <h4 className="text-white font-semibold mb-2">Locations ({markers.length}):</h4>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {markers.map((marker, index) => (
                <div
                  key={marker.id || index}
                  className="bg-gray-700 p-3 rounded-lg flex items-center justify-between cursor-pointer hover:bg-gray-600"
                  onClick={() => {
                    if (onMarkerClick) onMarkerClick(marker);
                    else if (marker.type === 'branch') navigate(`/salon/${marker.id}`);
                  }}
                >
                  <div>
                    <p className="text-white font-medium">{marker.title}</p>
                    {marker.subtitle && <p className="text-gray-400 text-sm">{marker.subtitle}</p>}
                  </div>
                  <svg className="w-5 h-5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                    />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
              ))}
            </div>
          </div>
        )}

        {center && (
          <p className="text-xs text-gray-500 mt-4">
            Map center: {center.lat.toFixed(4)}, {center.lng.toFixed(4)} | Zoom: {zoom}
          </p>
        )}
      </div>
    );
  }

  // TODO: When @react-google-maps/api is installed, replace the above with:
  /*
  import { GoogleMap as GoogleMapComponent, LoadScript, Marker, InfoWindow } from '@react-google-maps/api';

  const mapContainerStyle = {
    width: '100%',
    height: height,
  };

  const defaultCenter = center || { lat: 9.9281, lng: -84.0907 }; // San Jose, Costa Rica

  const handleMarkerClick = useCallback((marker) => {
    setSelectedMarker(marker);
    if (onMarkerClick) {
      onMarkerClick(marker);
    }
  }, [onMarkerClick]);

  return (
    <LoadScript googleMapsApiKey={mapApiKey}>
      <GoogleMapComponent
        mapContainerStyle={mapContainerStyle}
        center={defaultCenter}
        zoom={zoom}
      >
        {markers.map((marker) => (
          <Marker
            key={marker.id}
            position={{ lat: marker.lat, lng: marker.lng }}
            onClick={() => handleMarkerClick(marker)}
            title={marker.title}
          />
        ))}

        {selectedMarker && (
          <InfoWindow
            position={{ lat: selectedMarker.lat, lng: selectedMarker.lng }}
            onCloseClick={() => setSelectedMarker(null)}
          >
            <div className="p-2">
              <h3 className="font-semibold">{selectedMarker.title}</h3>
              {selectedMarker.subtitle && <p className="text-sm text-gray-600">{selectedMarker.subtitle}</p>}
              {selectedMarker.type === 'branch' && (
                <button
                  className="mt-2 text-blue-600 text-sm hover:underline"
                  onClick={() => navigate(`/salon/${selectedMarker.id}`)}
                >
                  View Details →
                </button>
              )}
            </div>
          </InfoWindow>
        )}
      </GoogleMapComponent>
    </LoadScript>
  );
  */

  return (
    <div className="bg-gray-800 rounded-lg p-4" style={{ height }}>
      <p className="text-gray-400">Google Maps component placeholder</p>
    </div>
  );
};

export default GoogleMap;
