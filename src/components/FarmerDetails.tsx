import React from 'react';
import { User, MapPin, Calendar, Package, DollarSign } from 'lucide-react';

interface FarmerDetailsProps {
  farmer: {
    name: string;
    location: string;
    locationDetails?: {
      lat: number;
      lng: number;
      address?: string;
    };
    harvestDate: string;
    produce: string;
    quantity: number;
    price: number;
  };
  className?: string;
}

const FarmerDetails: React.FC<FarmerDetailsProps> = ({ farmer, className = '' }) => {
  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  const formatLocation = () => {
    if (farmer.locationDetails?.address) {
      return farmer.locationDetails.address;
    }
    if (farmer.location && farmer.location !== 'N/A') {
      return farmer.location;
    }
    return 'Location not specified';
  };

  return (
    <div className={`bg-green-50 border border-green-200 rounded-lg p-4 ${className}`}>
      <div className="flex items-center gap-2 mb-3">
        <User className="h-5 w-5 text-green-600" />
        <h3 className="text-lg font-semibold text-green-800">Farmer Details</h3>
      </div>
      
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <User className="h-4 w-4 text-gray-500" />
          <span className="text-sm font-medium text-gray-700">Name:</span>
          <span className="text-sm text-gray-900">{farmer.name}</span>
        </div>
        
        <div className="flex items-start gap-2">
          <MapPin className="h-4 w-4 text-gray-500 mt-0.5" />
          <div className="flex-1">
            <span className="text-sm font-medium text-gray-700">Location:</span>
            <div className="text-sm text-gray-900 mt-1">
              {formatLocation()}
            </div>
            {farmer.location && farmer.location !== 'N/A' && (
              <div className="text-xs text-gray-500 mt-1">
                Coordinates: {farmer.location}
              </div>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-gray-500" />
          <span className="text-sm font-medium text-gray-700">Harvest Date:</span>
          <span className="text-sm text-gray-900">{formatDate(farmer.harvestDate)}</span>
        </div>
        
        <div className="flex items-center gap-2">
          <Package className="h-4 w-4 text-gray-500" />
          <span className="text-sm font-medium text-gray-700">Produce:</span>
          <span className="text-sm text-gray-900 capitalize">{farmer.produce}</span>
        </div>
        
        <div className="flex items-center gap-2">
          <Package className="h-4 w-4 text-gray-500" />
          <span className="text-sm font-medium text-gray-700">Quantity:</span>
          <span className="text-sm text-gray-900">{farmer.quantity} kg</span>
        </div>
        
        <div className="flex items-center gap-2">
          <DollarSign className="h-4 w-4 text-gray-500" />
          <span className="text-sm font-medium text-gray-700">Price:</span>
          <span className="text-sm text-gray-900">₹{farmer.price}/kg</span>
        </div>
      </div>
    </div>
  );
};

export default FarmerDetails;

