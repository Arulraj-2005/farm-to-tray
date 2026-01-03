import React, { useState, useEffect } from 'react';
import { Clock, Leaf, Truck, Store, CheckCircle, Package, MapPin } from 'lucide-react';
import { getLocationInfo, LocationInfo } from '../services/geocoding';

interface TraceResultProps {
  data: {
    batchId: string;
    status: string;
    metadata?: any;
    history: Array<{
      action: string;
      actor: string;
      timestamp: string;
      location?: string;
      locationDetails?: {
        lat: number;
        lng: number;
        address?: string;
      };
      details?: any;
    }>;
  };
}

const TraceResult: React.FC<TraceResultProps> = ({ data }) => {
  const [locationInfo, setLocationInfo] = useState<LocationInfo | null>(null);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);

  useEffect(() => {
    const loadLocationInfo = async () => {
      if (data.metadata?.location) {
        setIsLoadingLocation(true);
        try {
          const info = await getLocationInfo(data.metadata.location);
          setLocationInfo(info);
        } catch (error) {
          console.error('Failed to load location info:', error);
        } finally {
          setIsLoadingLocation(false);
        }
      }
    };
    
    loadLocationInfo();
  }, [data.metadata?.location]);

  const getActionIcon = (action: string) => {
    switch (action.toLowerCase()) {
      case 'create':
        return <Leaf className="h-4 w-4 text-green-500" />;
      case 'update':
        return <Package className="h-4 w-4 text-blue-500" />;
      default:
        return <CheckCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getRoleIcon = (actor: string, details: any) => {
    const role = details?.role || 'unknown';
    switch (role.toLowerCase()) {
      case 'farmer':
        return <Leaf className="h-5 w-5 text-green-500" />;
      case 'distributor':
        return <Truck className="h-5 w-5 text-blue-500" />;
      case 'retailer':
        return <Store className="h-5 w-5 text-purple-500" />;
      default:
        return <Package className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'harvested':
        return 'text-green-600 bg-green-100';
      case 'in_transit':
        return 'text-blue-600 bg-blue-100';
      case 'available_for_sale':
        return 'text-purple-600 bg-purple-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const formatLocation = (location: string, locationDetails?: { lat: number; lng: number; address?: string }) => {
    if (!location || location === 'N/A') return 'Location not specified';
    
    // If we have backend-provided location details, use them (this is the priority)
    if (locationDetails?.address) {
      return locationDetails.address;
    }
    
    // If we have geocoded location info, use it (fallback)
    if (locationInfo && location === data.metadata?.location) {
      return locationInfo.formatted;
    }
    
    // If it's coordinates, format them nicely
    if (location.includes(',')) {
      const [lat, lng] = location.split(',');
      return `${parseFloat(lat).toFixed(4)}, ${parseFloat(lng).toFixed(4)}`;
    }
    
    // Handle object display issue
    if (typeof location === 'object') {
      return 'Location data error';
    }
    
    return location;
  };

  const originLocation = data.metadata?.location || 'N/A';
  const currentStatus = data.status.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase());

  return (
    <div className="bg-white rounded-xl shadow-lg p-8 mt-8">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-4">Product Traceability Report</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm font-medium text-gray-600 mb-1">Batch ID</p>
            <p className="font-mono text-lg font-bold text-gray-800">{data.batchId}</p>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm font-medium text-gray-600 mb-1">Current Status</p>
            <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(data.status)}`}>
              {currentStatus}
            </span>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm font-medium text-gray-600 mb-1">Origin</p>
            <p className="text-gray-800 flex items-center">
              <MapPin className="h-4 w-4 mr-1" />
              {isLoadingLocation ? (
                <span className="text-gray-500">Loading location...</span>
              ) : (
                formatLocation(originLocation, data.metadata?.locationDetails)
              )}
            </p>
            {data.metadata?.locationDetails?.address && (
              <div className="mt-2 text-xs text-gray-600">
                <div>Full Address: {data.metadata.locationDetails.address}</div>
              </div>
            )}
            {locationInfo && !data.metadata?.locationDetails?.address && (
              <div className="mt-2 text-xs text-gray-600">
                <div>State: {locationInfo.state}</div>
                <div>District: {locationInfo.district}</div>
                {locationInfo.city && <div>City: {locationInfo.city}</div>}
              </div>
            )}
          </div>
        </div>

        {/* Product Details */}
        {data.metadata && (
          <div className="mt-6 bg-green-50 p-4 rounded-lg">
            <h3 className="font-semibold text-green-800 mb-2">Product Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
              {data.metadata.produce && (
                <div>
                  <span className="font-medium text-green-700">Product:</span>
                  <span className="ml-2">{data.metadata.produce}</span>
                </div>
              )}
              {data.metadata.name && (
                <div>
                  <span className="font-medium text-green-700">Farmer:</span>
                  <span className="ml-2">{data.metadata.name}</span>
                </div>
              )}
              {data.metadata.quantity && (
                <div>
                  <span className="font-medium text-green-700">Quantity:</span>
                  <span className="ml-2">{data.metadata.quantity} kg</span>
                </div>
              )}
              {data.metadata.price && (
                <div>
                  <span className="font-medium text-green-700">Farm Price:</span>
                  <span className="ml-2">₹{data.metadata.price}</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Timeline */}
      <div>
        <h3 className="text-xl font-semibold mb-6 flex items-center">
          <Clock className="h-6 w-6 mr-3 text-blue-500" />
          Supply Chain Journey
        </h3>
        
        <div className="space-y-6">
          {data.history.map((item, index) => (
            <div key={index} className="relative flex items-start">
              {/* Timeline line */}
              {index < data.history.length - 1 && (
                <div className="absolute left-6 top-12 w-0.5 h-16 bg-gray-200"></div>
              )}
              
              {/* Timeline dot */}
              <div className="flex-shrink-0 w-12 h-12 bg-white border-2 border-gray-200 rounded-full flex items-center justify-center shadow-sm">
                {getRoleIcon(item.actor, item.details)}
              </div>
              
              {/* Content */}
              <div className="ml-6 flex-1">
                <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center">
                      {getActionIcon(item.action)}
                      <h4 className="ml-2 text-lg font-semibold capitalize">
                        {item.action} by {item.details?.role || 'Unknown'}
                      </h4>
                    </div>
                    <div className="text-sm text-gray-500">
                      {new Date(item.timestamp).toLocaleString()}
                    </div>
                  </div>
                  
                  {/* Details */}
                  {item.details && (
                    <div className="mb-3 space-y-2">
                      {item.details.name && (
                        <p className="text-sm">
                          <span className="font-medium">Name:</span> {item.details.name}
                        </p>
                      )}
                      {item.details.distributorName && (
                        <p className="text-sm">
                          <span className="font-medium">Distributor:</span> {item.details.distributorName}
                        </p>
                      )}
                      {item.details.retailerName && (
                        <p className="text-sm">
                          <span className="font-medium">Retailer:</span> {item.details.retailerName}
                        </p>
                      )}
                      {item.details.storeName && (
                        <p className="text-sm">
                          <span className="font-medium">Store:</span> {item.details.storeName}
                        </p>
                      )}
                      {item.details.quantity && (
                        <p className="text-sm">
                          <span className="font-medium">Quantity:</span> {item.details.quantity} kg
                        </p>
                      )}
                      {item.details.marginPrice && (
                        <p className="text-sm">
                          <span className="font-medium">Distribution Price:</span> ₹{item.details.marginPrice}
                        </p>
                      )}
                      {item.details.sellingPrice && (
                        <p className="text-sm">
                          <span className="font-medium">Retail Price:</span> ₹{item.details.sellingPrice}
                        </p>
                      )}
                      {item.details.transportMode && (
                        <p className="text-sm">
                          <span className="font-medium">Transport:</span> {item.details.transportMode}
                        </p>
                      )}
                      {item.details.storageConditions && (
                        <p className="text-sm">
                          <span className="font-medium">Storage:</span> {item.details.storageConditions.replace(/_/g, ' ')}
                        </p>
                      )}
                      {item.details.note && (
                        <p className="text-sm text-gray-600 italic">{item.details.note}</p>
                      )}
                    </div>
                  )}
                  
                  {/* Location */}
                  {item.location && item.location !== 'N/A' && (
                    <div className="flex items-center text-sm text-gray-600">
                      <MapPin className="h-4 w-4 mr-1" />
                      <span>Location: {formatLocation(item.location, item.locationDetails)}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Summary */}
      <div className="mt-8 p-6 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg">
        <h3 className="font-semibold text-gray-800 mb-2">Journey Complete</h3>
        <p className="text-gray-600">
          This product has successfully moved through {data.history.length} stage(s) in the supply chain. 
          All information is secured on the blockchain for transparency and authenticity.
        </p>
      </div>
    </div>
  );
};

export default TraceResult;