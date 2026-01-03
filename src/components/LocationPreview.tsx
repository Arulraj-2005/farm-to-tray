import React, { useState, useEffect } from 'react';
import { MapPin, Loader2 } from 'lucide-react';

interface LocationPreviewProps {
  location: string;
  className?: string;
}

interface LocationDetails {
  lat: number;
  lng: number;
  address?: string;
}

// Use the same API base URL logic as the main API service
const rawBase = (import.meta as any).env?.VITE_API_BASE_URL as string | undefined;
const API_BASE_URL = rawBase && /^https?:\/\//i.test(rawBase) ? rawBase : 'http://localhost:4000';

const LocationPreview: React.FC<LocationPreviewProps> = ({ location, className = '' }) => {
  const [locationDetails, setLocationDetails] = useState<LocationDetails | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!location || !location.includes(',')) {
      setLocationDetails(null);
      setError(null);
      return;
    }

    const [lat, lng] = location.split(',').map(coord => parseFloat(coord.trim()));
    
    if (isNaN(lat) || isNaN(lng)) {
      setError('Invalid coordinates');
      return;
    }

    setLoading(true);
    setError(null);

    const fetchLocationDetails = async () => {
      try {
        const base = API_BASE_URL.replace(/\/$/, '');
        const url = `${base}/api/geocode/reverse?lat=${lat}&lon=${lng}`;
        const response = await fetch(url);
        if (response.ok) {
          const data = await response.json();
          setLocationDetails(data);
        } else {
          setError('Failed to fetch location details');
        }
      } catch (err) {
        setError('Network error');
      } finally {
        setLoading(false);
      }
    };

    // Debounce the API call
    const timeoutId = setTimeout(fetchLocationDetails, 500);
    return () => clearTimeout(timeoutId);
  }, [location]);

  if (!location || !location.includes(',')) {
    return null;
  }

  return (
    <div className={`mt-2 p-3 rounded-lg border ${className}`}>
      <div className="flex items-start gap-2">
        <MapPin className="h-4 w-4 mt-0.5 text-gray-500 flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <div className="text-sm font-medium text-gray-700 mb-1">
            Location Preview:
          </div>
          
          {loading && (
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Loader2 className="h-3 w-3 animate-spin" />
              <span>Getting address...</span>
            </div>
          )}
          
          {error && (
            <div className="text-sm text-red-600">
              {error}
            </div>
          )}
          
          {locationDetails && !loading && !error && (
            <div className="text-sm text-gray-600">
              <div className="font-medium text-green-700 mb-1">
                {locationDetails.address || 'Address not available'}
              </div>
              <div className="text-xs text-gray-500">
                Coordinates: {locationDetails.lat.toFixed(4)}, {locationDetails.lng.toFixed(4)}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LocationPreview;

