import React from 'react';
import { Truck, MapPin, Package, DollarSign, Clock } from 'lucide-react';

interface DistributorDetailsProps {
  distributor: {
    name: string;
    location: string;
    locationDetails?: {
      lat: number;
      lng: number;
      address?: string;
    };
    quantity: number;
    marginPrice: number;
    transportMode: string;
    timestamp: string;
  };
  className?: string;
}

const DistributorDetails: React.FC<DistributorDetailsProps> = ({ distributor, className = '' }) => {
  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateString;
    }
  };

  const formatLocation = () => {
    if (distributor.locationDetails?.address) {
      return distributor.locationDetails.address;
    }
    if (distributor.location && distributor.location !== 'N/A') {
      return distributor.location;
    }
    return 'Location not specified';
  };

  return (
    <div className={`bg-blue-50 border border-blue-200 rounded-lg p-4 ${className}`}>
      <div className="flex items-center gap-2 mb-3">
        <Truck className="h-5 w-5 text-blue-600" />
        <h3 className="text-lg font-semibold text-blue-800">Distributor Details</h3>
      </div>
      
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Truck className="h-4 w-4 text-gray-500" />
          <span className="text-sm font-medium text-gray-700">Name:</span>
          <span className="text-sm text-gray-900">{distributor.name}</span>
        </div>
        
        <div className="flex items-start gap-2">
          <MapPin className="h-4 w-4 text-gray-500 mt-0.5" />
          <div className="flex-1">
            <span className="text-sm font-medium text-gray-700">Location:</span>
            <div className="text-sm text-gray-900 mt-1">
              {formatLocation()}
            </div>
            {distributor.location && distributor.location !== 'N/A' && (
              <div className="text-xs text-gray-500 mt-1">
                Coordinates: {distributor.location}
              </div>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Package className="h-4 w-4 text-gray-500" />
          <span className="text-sm font-medium text-gray-700">Quantity Received:</span>
          <span className="text-sm text-gray-900">{distributor.quantity} kg</span>
        </div>
        
        <div className="flex items-center gap-2">
          <DollarSign className="h-4 w-4 text-gray-500" />
          <span className="text-sm font-medium text-gray-700">Margin Price:</span>
          <span className="text-sm text-gray-900">₹{distributor.marginPrice}/kg</span>
        </div>
        
        <div className="flex items-center gap-2">
          <Truck className="h-4 w-4 text-gray-500" />
          <span className="text-sm font-medium text-gray-700">Transport Mode:</span>
          <span className="text-sm text-gray-900 capitalize">{distributor.transportMode}</span>
        </div>
        
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-gray-500" />
          <span className="text-sm font-medium text-gray-700">Received:</span>
          <span className="text-sm text-gray-900">{formatDate(distributor.timestamp)}</span>
        </div>
      </div>
    </div>
  );
};

export default DistributorDetails;

