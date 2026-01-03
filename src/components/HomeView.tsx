import React from 'react';
import { Leaf, Truck, Store, ShoppingCart, Shield, MapPin, QrCode } from 'lucide-react';
import { useTranslation } from '../contexts/TranslationContext';

interface HomeViewProps {
  onViewChange: (view: 'farmer' | 'distributor' | 'retailer' | 'consumer') => void;
}

const HomeView: React.FC<HomeViewProps> = ({ onViewChange }) => {
  const { t } = useTranslation();
  
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-green-600 to-green-800 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center mb-6">
            <Leaf className="h-16 w-16 text-green-300 mr-4" />
            <h1 className="text-5xl md:text-6xl font-bold">{t('app.title')}</h1>
          </div>
          <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto">
            {t('app.subtitle')}
          </p>
          
          {/* Role Selection Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 max-w-6xl mx-auto">
            <button 
              onClick={() => onViewChange('farmer')} 
              className="bg-white/10 backdrop-blur-sm p-8 rounded-xl hover:bg-white/20 transition-all transform hover:scale-105 group"
            >
              <Leaf className="h-16 w-16 mx-auto mb-4 text-green-300 group-hover:text-green-200 transition-colors" />
              <h3 className="text-xl font-bold mb-2">{t('navigation.farmer')}</h3>
              <p className="text-green-100 text-sm">Create batch & generate QR codes</p>
            </button>
            
            <button 
              onClick={() => onViewChange('distributor')} 
              className="bg-white/10 backdrop-blur-sm p-8 rounded-xl hover:bg-white/20 transition-all transform hover:scale-105 group"
            >
              <Truck className="h-16 w-16 mx-auto mb-4 text-blue-300 group-hover:text-blue-200 transition-colors" />
              <h3 className="text-xl font-bold mb-2">{t('navigation.distributor')}</h3>
              <p className="text-blue-100 text-sm">Scan QR & update transport details</p>
            </button>
            
            <button 
              onClick={() => onViewChange('retailer')} 
              className="bg-white/10 backdrop-blur-sm p-8 rounded-xl hover:bg-white/20 transition-all transform hover:scale-105 group"
            >
              <Store className="h-16 w-16 mx-auto mb-4 text-purple-300 group-hover:text-purple-200 transition-colors" />
              <h3 className="text-xl font-bold mb-2">{t('navigation.retailer')}</h3>
              <p className="text-purple-100 text-sm">Scan QR & update retail information</p>
            </button>
            
            <button 
              onClick={() => onViewChange('consumer')} 
              className="bg-white/10 backdrop-blur-sm p-8 rounded-xl hover:bg-white/20 transition-all transform hover:scale-105 group"
            >
              <ShoppingCart className="h-16 w-16 mx-auto mb-4 text-orange-300 group-hover:text-orange-200 transition-colors" />
              <h3 className="text-xl font-bold mb-2">{t('navigation.consumer')}</h3>
              <p className="text-orange-100 text-sm">Scan QR & trace product journey</p>
            </button>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-white py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">How AgriChain Works</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              A simple 4-step process that ensures complete transparency in your food supply chain
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center group">
              <div className="bg-green-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6 group-hover:bg-green-200 transition-colors">
                <Leaf className="h-10 w-10 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-3">1. Farmer Creates Batch</h3>
              <p className="text-gray-600">
                Farmer enters details, location is auto-detected via GPS, and a unique QR code is generated automatically.
              </p>
            </div>
            
            <div className="text-center group">
              <div className="bg-blue-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6 group-hover:bg-blue-200 transition-colors">
                <Truck className="h-10 w-10 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-3">2. Distributor Scans QR</h3>
              <p className="text-gray-600">
                Distributor scans QR code, automatically goes to update page, enters details, and batch is updated on blockchain.
              </p>
            </div>
            
            <div className="text-center group">
              <div className="bg-purple-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6 group-hover:bg-purple-200 transition-colors">
                <Store className="h-10 w-10 text-purple-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-3">3. Retailer Scans QR</h3>
              <p className="text-gray-600">
                Retailer scans the same QR code, updates with retail information, and marks product as available for sale.
              </p>
            </div>
            
            <div className="text-center group">
              <div className="bg-orange-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6 group-hover:bg-orange-200 transition-colors">
                <ShoppingCart className="h-10 w-10 text-orange-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-3">4. Consumer Traces Journey</h3>
              <p className="text-gray-600">
                Consumer scans QR code to see complete journey from farm to retail with interactive map visualization.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Key Features */}
      <div className="bg-gray-50 py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">Key Features</h2>
            <p className="text-xl text-gray-600">Built with cutting-edge technology for maximum transparency</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
              <Shield className="h-12 w-12 text-green-500 mb-4" />
              <h3 className="text-xl font-bold text-gray-800 mb-3">Blockchain Security</h3>
              <p className="text-gray-600">
                All data is stored on Hyperledger Fabric blockchain ensuring immutable and tamper-proof records.
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
              <MapPin className="h-12 w-12 text-blue-500 mb-4" />
              <h3 className="text-xl font-bold text-gray-800 mb-3">GPS Location Tracking</h3>
              <p className="text-gray-600">
                Automatic location detection ensures accurate geographical tracking throughout the supply chain.
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
              <QrCode className="h-12 w-12 text-purple-500 mb-4" />
              <h3 className="text-xl font-bold text-gray-800 mb-3">QR Code Integration</h3>
              <p className="text-gray-600">
                Single QR code for the entire journey - scan to update or trace at any stage of the supply chain.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomeView;