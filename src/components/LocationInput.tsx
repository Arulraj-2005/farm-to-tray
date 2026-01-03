import React, { useState, Suspense, lazy, useEffect } from 'react';
import { MapPin, Loader } from 'lucide-react';
const MapPicker = lazy(() => import('./MapPicker')) as any;

interface LocationInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
}

const LocationInput: React.FC<LocationInputProps> = ({ value, onChange, placeholder, required }) => {
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [showPicker, setShowPicker] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('agrichain:lastLocation');
      if (saved && !value) {
        const parsed = JSON.parse(saved);
        if (typeof parsed.lat === 'number' && typeof parsed.lng === 'number') {
          onChange(`${parsed.lat.toFixed(6)},${parsed.lng.toFixed(6)}`);
        }
      }
    } catch (_) {}
  }, []);

  const handleGetLocation = async () => {
    setIsGettingLocation(true);

    const tryGps = (): Promise<string | null> => new Promise((resolve) => {
      if (!navigator.geolocation) return resolve(null);
      navigator.geolocation.getCurrentPosition(
        (position) => resolve(`${position.coords.latitude.toFixed(6)},${position.coords.longitude.toFixed(6)}`),
        () => resolve(null),
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 300000 }
      );
    });

    let gps = await tryGps();
    if (!gps) gps = await tryGps();

    if (gps) {
      onChange(gps);
      const [lat, lng] = gps.split(',').map(Number);
      localStorage.setItem('agrichain:lastLocation', JSON.stringify({ lat, lng, ts: Date.now() }));
      setIsGettingLocation(false);
      return;
    }

    setIsGettingLocation(false);
    setShowPicker(true);
  };

  return (
    <div className="relative">
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder || "e.g., 11.016844,76.955832"}
        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all pr-12"
        required={required}
        pattern={"^\\s*-?\\d{1,2}(?:\\.\\d+)?\\s*,\\s*-?\\d{1,3}(?:\\.\\d+)?\\s*$"}
        title="Enter coordinates as lat,lng"
      />
      <button
        type="button"
        onClick={handleGetLocation}
        disabled={isGettingLocation}
        className="absolute top-1/4 right-3 -translate-y-1/2 flex items-center text-gray-500 hover:text-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        title="Get my current location"
      >
        {isGettingLocation ? <Loader className="h-5 w-5 animate-spin" /> : <MapPin className="h-5 w-5" />}
      </button>
      <div className="mt-2 flex justify-between items-center">
        <button type="button" onClick={() => setShowPicker(true)} className="text-sm text-green-700 hover:text-green-800 underline">
          Pick on Map
        </button>
        <button 
          type="button" 
          onClick={handleGetLocation}
          disabled={isGettingLocation}
          className="text-sm text-blue-700 hover:text-blue-800 underline disabled:opacity-50"
        >
          {isGettingLocation ? 'Getting Location...' : 'Auto Detect Location'}
        </button>
      </div>

      {value && <div className="mt-1 text-xs text-gray-500">Location: {value}</div>}

      {showPicker && (
        <Suspense fallback={null}>
          <MapPicker
            onCancel={() => setShowPicker(false)}
            onConfirm={(lat: number, lng: number) => {
              onChange(`${lat.toFixed(6)},${lng.toFixed(6)}`);
              setShowPicker(false);
            }}
          />
        </Suspense>
      )}
    </div>
  );
};

export default LocationInput;
