import React, { useState, useEffect } from 'react';
import { X, MapPin, Truck, Store, Leaf } from 'lucide-react';
import { getLocationInfo, LocationInfo } from '../services/geocoding';

interface LocationPoint {
  lat: number;
  lng: number;
  role: string;
  name: string;
  timestamp: string;
  action: string;
}

interface SimpleTraceabilityMapProps {
  locations: LocationPoint[];
  onClose: () => void;
  batchInfo: any;
}

const SimpleTraceabilityMap: React.FC<SimpleTraceabilityMapProps> = ({ locations, onClose, batchInfo }) => {
  const [locationInfos, setLocationInfos] = useState<Map<string, LocationInfo>>(new Map());
  const [isLoadingLocations, setIsLoadingLocations] = useState(false);

  useEffect(() => {
    const loadLocationInfos = async () => {
      setIsLoadingLocations(true);
      const newLocationInfos = new Map<string, LocationInfo>();
      
      for (const location of locations) {
        const locationString = `${location.lat},${location.lng}`;
        try {
          const info = await getLocationInfo(locationString);
          newLocationInfos.set(locationString, info);
        } catch (error) {
          console.error('Failed to load location info for', locationString, error);
        }
      }
      
      setLocationInfos(newLocationInfos);
      setIsLoadingLocations(false);
    };
    
    if (locations.length > 0) {
      loadLocationInfos();
    }
  }, [locations]);

  const getRoleIcon = (role: string) => {
    switch (role.toLowerCase()) {
      case 'farmer':
        return <Leaf className="h-5 w-5 text-green-500" />;
      case 'distributor':
        return <Truck className="h-5 w-5 text-blue-500" />;
      case 'retailer':
        return <Store className="h-5 w-5 text-purple-500" />;
      default:
        return <MapPin className="h-5 w-5 text-gray-500" />;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role.toLowerCase()) {
      case 'farmer': return 'border-green-500 bg-green-50';
      case 'distributor': return 'border-blue-500 bg-blue-50';
      case 'retailer': return 'border-purple-500 bg-purple-50';
      default: return 'border-gray-500 bg-gray-50';
    }
  };

  const validLocations = locations.filter(loc => 
    !isNaN(loc.lat) && !isNaN(loc.lng) && loc.lat !== 0 && loc.lng !== 0
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl h-full max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center">
            <MapPin className="h-6 w-6 text-blue-500 mr-3" />
            <div>
              <h2 className="text-xl font-bold text-gray-800">Product Journey Map</h2>
              <p className="text-sm text-gray-600">Batch ID: {batchInfo.batchId}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="h-6 w-6 text-gray-500" />
          </button>
        </div>
        
        <div className="flex-1 p-6 overflow-y-auto">
          {validLocations.length > 0 ? (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Supply Chain Journey</h3>
                <p className="text-gray-600">Product traveled through {validLocations.length} locations</p>
              </div>
              
              {/* Journey Timeline */}
              <div className="relative">
                {validLocations.map((location, index) => (
                  <div key={index} className="flex items-center mb-8 relative">
                    {/* Connection line */}
                    {index < validLocations.length - 1 && (
                      <div className="absolute left-8 top-16 w-0.5 h-16 bg-gray-200 z-0"></div>
                    )}
                    
                    {/* Role icon */}
                    <div className={`w-16 h-16 rounded-full border-2 ${getRoleColor(location.role)} flex items-center justify-center z-10 flex-shrink-0`}>
                      {getRoleIcon(location.role)}
                    </div>
                    
                    {/* Location info */}
                    <div className="ml-6 flex-1">
                      <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold text-gray-800 capitalize">{location.role}</h4>
                          <span className="text-sm text-gray-500">
                            {new Date(location.timestamp).toLocaleDateString()}
                          </span>
                        </div>
                        
                        <p className="text-gray-700 mb-2">
                          <strong>Name:</strong> {location.name}
                        </p>
                        
                        <p className="text-gray-700 mb-2">
                          <strong>Action:</strong> {location.action}
                        </p>
                        
                        <div className="flex items-center text-sm text-gray-600">
                          <MapPin className="h-4 w-4 mr-1" />
                          <span>
                            {isLoadingLocations ? (
                              'Loading location...'
                            ) : (() => {
                              const locationString = `${location.lat},${location.lng}`;
                              const locationInfo = locationInfos.get(locationString);
                              return locationInfo ? locationInfo.formatted : `Coordinates: ${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}`;
                            })()}
                          </span>
                        </div>
                        
                        {(() => {
                          const locationString = `${location.lat},${location.lng}`;
                          const locationInfo = locationInfos.get(locationString);
                          return locationInfo && (
                            <div className="mt-2 text-xs text-gray-500">
                              <div>State: {locationInfo.state}</div>
                              <div>District: {locationInfo.district}</div>
                              {locationInfo.city && <div>City: {locationInfo.city}</div>}
                            </div>
                          );
                        })()}
                        
                        {/* Google Maps link */}
                        <div className="mt-2">
                          <a
                            href={`https://www.google.com/maps?q=${location.lat},${location.lng}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-500 hover:text-blue-700 text-sm underline"
                          >
                            View on Google Maps
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Journey Summary */}
              <div className="border-t pt-6">
                <h3 className="font-semibold mb-3">Journey Summary</h3>
                <div className="flex flex-wrap gap-2">
                  {validLocations.map((location, index) => (
                    <div key={index} className="flex items-center text-sm">
                      <div className={`w-4 h-4 rounded-full border-2 ${getRoleColor(location.role)} mr-2`}></div>
                      <span className="capitalize">{location.role}</span>
                      {index < validLocations.length - 1 && <span className="mx-2 text-gray-400">→</span>}
                    </div>
                  ))}
                  <div className="flex items-center text-sm">
                    <span className="mx-2 text-gray-400">→</span>
                    <div className="w-4 h-4 rounded-full border-2 border-orange-500 bg-orange-50 mr-2"></div>
                    <span className="text-orange-600 font-semibold">Consumer</span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center">
              <div className="text-center">
                <MapPin className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-500 mb-2">No Location Data</h3>
                <p className="text-gray-400">This batch doesn't have sufficient location information to display the journey.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SimpleTraceabilityMap;