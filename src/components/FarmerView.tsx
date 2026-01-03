import React, { useState } from 'react';
import { Leaf, ArrowLeft, DollarSign, Package } from 'lucide-react';
import { submitFarmerData } from '../services/api';
import CustomAlert from './CustomAlert';
import LocationInput from './LocationInput';
import QrCodeModal from './QrCodeModal';
import { useTranslation } from '../contexts/TranslationContext';

interface FarmerViewProps {
  userId: string;
  onBack: () => void;
}

const FarmerView: React.FC<FarmerViewProps> = ({ userId, onBack }) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({ 
    farmerName: '', 
    location: '', 
    produce: '', 
    price: '', 
    quantity: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [alert, setAlert] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [showQrModal, setShowQrModal] = useState(false);
  const [lastBatchId, setLastBatchId] = useState('');

  // Generate unique batch ID automatically
  const generateBatchId = (): string => {
    const timestamp = Date.now().toString(36);
    const randomStr = Math.random().toString(36).substring(2, 8);
    return `BATCH-${timestamp}-${randomStr}`.toUpperCase();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleLocationChange = (locationValue: string) => {
    setFormData(prev => ({ ...prev, location: locationValue }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Auto-generate batch ID
      const batchId = generateBatchId();
      
      const metadata = { 
        name: formData.farmerName, 
        location: formData.location, 
        produce: formData.produce, 
        price: parseFloat(formData.price),
        quantity: parseFloat(formData.quantity),
        harvestDate: new Date().toISOString(),
        role: 'farmer'
      };
      
      const result = await submitFarmerData(batchId, metadata);
      setLastBatchId(result.batchId);
      setShowQrModal(true);
      setAlert({ message: `Batch ${result.batchId} created successfully!`, type: 'success' });
      setFormData({ farmerName: '', location: '', produce: '', price: '', quantity: '' });
    } catch (error) {
      const err = error as Error;
      setAlert({ message: err.message, type: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-xl shadow-lg p-8">
            <div className="flex items-center mb-6">
              <button onClick={onBack} className="mr-4 p-2 hover:bg-gray-100 rounded-full">
                <ArrowLeft className="h-6 w-6" />
              </button>
              <div className="flex items-center">
                <Leaf className="h-8 w-8 text-green-500 mr-3" />
                <h1 className="text-3xl font-bold text-gray-800">{t('farmer.title')}</h1>
              </div>
            </div>
            
            <p className="text-gray-600 mb-6">{t('farmer.subtitle')}</p>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Package className="inline h-4 w-4 mr-1" />
                    {t('common.name')}
                  </label>
                  <input 
                    type="text" 
                    name="farmerName" 
                    value={formData.farmerName} 
                    onChange={handleInputChange} 
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent" 
                    required 
                    placeholder={t('farmer.form.namePlaceholder')}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">{t('common.location')}</label>
                  <LocationInput 
                    value={formData.location} 
                    onChange={handleLocationChange} 
                    required 
                    placeholder={t('farmer.form.locationPlaceholder')}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">{t('farmer.produce')}</label>
                  <input 
                    type="text" 
                    name="produce" 
                    value={formData.produce} 
                    onChange={handleInputChange} 
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent" 
                    required 
                    placeholder={t('farmer.form.producePlaceholder')}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <DollarSign className="inline h-4 w-4 mr-1" />
                    {t('farmer.farmPrice')}
                  </label>
                  <input 
                    type="number" 
                    name="price" 
                    value={formData.price} 
                    onChange={handleInputChange} 
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent" 
                    required 
                    step="0.01"
                    min="0"
                    placeholder={t('farmer.form.pricePlaceholder')}
                  />
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">{t('common.quantity')} (kg)</label>
                  <input 
                    type="number" 
                    name="quantity" 
                    value={formData.quantity} 
                    onChange={handleInputChange} 
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent" 
                    required 
                    step="0.01"
                    min="0"
                    placeholder={t('farmer.form.quantityPlaceholder')}
                  />
                </div>
              </div>
              
              <div className="bg-green-50 p-4 rounded-lg">
                <p className="text-sm text-green-700">
                  <strong>Note:</strong> A unique Batch ID will be generated automatically when you submit this form. 
                  Your location will be captured using GPS for accurate traceability.
                </p>
              </div>
              
              <button 
                type="submit" 
                disabled={isSubmitting} 
                className="w-full bg-green-500 text-white py-3 px-6 rounded-lg font-semibold hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    {t('common.loading')}
                  </>
                ) : (
                  t('common.generateQR')
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
      
      {showQrModal && (
        <QrCodeModal 
          batchId={lastBatchId} 
          onClose={() => setShowQrModal(false)} 
        />
      )}
      
      {alert && (
        <CustomAlert 
          message={alert.message} 
          type={alert.type} 
          onClose={() => setAlert(null)} 
        />
      )}
    </div>
  );
};

export default FarmerView;