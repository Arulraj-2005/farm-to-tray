import React, { useState, useEffect } from 'react';
import { Store, ArrowLeft, QrCode, ShoppingBag, Eye } from 'lucide-react';
import { submitRetailerData, traceBatch, getBatchForRetailer } from '../services/api';
import CustomAlert from './CustomAlert';
import LocationInput from './LocationInput';
import LocationPreview from './LocationPreview';
import FarmerDetails from './FarmerDetails';
import DistributorDetails from './DistributorDetails';
import QrCodeScanner from './QrCodeScanner';

interface RetailerViewProps {
  userId: string;
  onBack: () => void;
}

const RetailerView: React.FC<RetailerViewProps> = ({ userId, onBack }) => {
  const [formData, setFormData] = useState({
    batchId: '',
    retailerName: '',
    storeName: '',
    sellingPrice: '',
    location: '',
    shelfLife: '',
    storageConditions: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [alert, setAlert] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [showScanner, setShowScanner] = useState(false);
  const [showTrace, setShowTrace] = useState(false);
  const [traceData, setTraceData] = useState<any>(null);
  const [isTracing, setIsTracing] = useState(false);
  const [batchDetails, setBatchDetails] = useState<any>(null);
  const [isLoadingBatch, setIsLoadingBatch] = useState(false);

  // Check if batch ID is provided via URL (QR scan)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const batchIdFromUrl = params.get('batch');
    if (batchIdFromUrl) {
      setFormData(prev => ({ ...prev, batchId: batchIdFromUrl }));
    }
  }, []);

  // Fetch batch details (farmer and distributor) when batch ID changes
  useEffect(() => {
    const fetchBatchDetails = async () => {
      if (!formData.batchId.trim()) {
        setBatchDetails(null);
        return;
      }

      setIsLoadingBatch(true);
      try {
        const data = await getBatchForRetailer(formData.batchId);
        setBatchDetails(data);
      } catch (error) {
        console.error('Failed to fetch batch details:', error);
        setBatchDetails(null);
      } finally {
        setIsLoadingBatch(false);
      }
    };

    const timeoutId = setTimeout(fetchBatchDetails, 500);
    return () => clearTimeout(timeoutId);
  }, [formData.batchId]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleLocationChange = (locationValue: string) => {
    setFormData(prev => ({ ...prev, location: locationValue }));
  };

  const handleQrScan = (batchId: string) => {
    setFormData(prev => ({ ...prev, batchId }));
    setShowScanner(false);
    setAlert({ message: `Batch ID ${batchId} scanned successfully!`, type: 'success' });
  };

  const handleTraceBatch = async () => {
    if (!formData.batchId) {
      setAlert({ message: 'Please enter a batch ID first', type: 'error' });
      return;
    }
    
    setIsTracing(true);
    try {
      const result = await traceBatch(formData.batchId);
      setTraceData(result);
      setShowTrace(true);
    } catch (error) {
      const err = error as Error;
      setAlert({ message: err.message, type: 'error' });
    } finally {
      setIsTracing(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const statusUpdate = {
        retailerName: formData.retailerName,
        storeName: formData.storeName,
        sellingPrice: parseFloat(formData.sellingPrice),
        location: formData.location,
        shelfLife: formData.shelfLife,
        storageConditions: formData.storageConditions,
        status: 'AVAILABLE_FOR_SALE',
        role: 'retailer',
        note: 'Product received and available for sale.',
        timestamp: new Date().toISOString()
      };
      
      const result = await submitRetailerData(formData.batchId, statusUpdate);
      setAlert({ message: `Retailer data updated for batch ${result.batchId}`, type: 'success' });
      setFormData({ 
        batchId: '', 
        retailerName: '', 
        storeName: '', 
        sellingPrice: '', 
        location: '', 
        shelfLife: '', 
        storageConditions: '' 
      });
    } catch (error) {
      const err = error as Error;
      setAlert({ message: err.message, type: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-purple-100 py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-xl shadow-lg p-8">
            <div className="flex items-center mb-6">
              <button onClick={onBack} className="mr-4 p-2 hover:bg-gray-100 rounded-full">
                <ArrowLeft className="h-6 w-6" />
              </button>
              <div className="flex items-center">
                <Store className="h-8 w-8 text-purple-500 mr-3" />
                <h1 className="text-3xl font-bold text-gray-800">Retailer Dashboard</h1>
              </div>
            </div>
            
            <p className="text-gray-600 mb-6">Scan QR code or enter batch ID to update retail details. You can also trace the batch to see farmer and distributor details.</p>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <ShoppingBag className="inline h-4 w-4 mr-1" />
                    Batch ID
                  </label>
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      name="batchId" 
                      value={formData.batchId} 
                      onChange={handleInputChange} 
                      placeholder="Enter or scan batch ID" 
                      className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent" 
                      required 
                    />
                    <button
                      type="button"
                      onClick={() => setShowScanner(true)}
                      className="px-4 py-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600 flex items-center"
                      title="Scan QR Code"
                    >
                      <QrCode className="h-5 w-5" />
                    </button>
                    <button
                      type="button"
                      onClick={handleTraceBatch}
                      disabled={isTracing || !formData.batchId}
                      className="px-4 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 flex items-center"
                      title="Trace Batch History"
                    >
                      {isTracing ? (
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Retailer Name</label>
                  <input 
                    type="text" 
                    name="retailerName" 
                    value={formData.retailerName} 
                    onChange={handleInputChange} 
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent" 
                    required 
                    placeholder="Enter retailer name"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Store Name</label>
                  <input 
                    type="text" 
                    name="storeName" 
                    value={formData.storeName} 
                    onChange={handleInputChange} 
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent" 
                    required 
                    placeholder="Enter store/shop name"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Store Location</label>
                  <LocationInput 
                    value={formData.location} 
                    onChange={handleLocationChange} 
                    required 
                    placeholder="Click GPS button to auto-detect"
                  />
                  <LocationPreview 
                    location={formData.location} 
                    className="bg-purple-50 border-purple-200"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Selling Price (₹/kg)</label>
                  <input 
                    type="number" 
                    name="sellingPrice" 
                    value={formData.sellingPrice} 
                    onChange={handleInputChange} 
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent" 
                    required 
                    step="0.01"
                    min="0"
                    placeholder="Enter retail selling price"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Shelf Life (days)</label>
                  <input 
                    type="number" 
                    name="shelfLife" 
                    value={formData.shelfLife} 
                    onChange={handleInputChange} 
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent" 
                    required 
                    min="1"
                    placeholder="Expected shelf life in days"
                  />
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Storage Conditions</label>
                  <select 
                    name="storageConditions" 
                    value={formData.storageConditions} 
                    onChange={handleInputChange} 
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent" 
                    required
                  >
                    <option value="">Select storage conditions</option>
                    <option value="room_temperature">Room Temperature</option>
                    <option value="refrigerated">Refrigerated (2-8°C)</option>
                    <option value="frozen">Frozen (Below 0°C)</option>
                    <option value="dry_cool">Dry & Cool Place</option>
                    <option value="controlled_atmosphere">Controlled Atmosphere</option>
                  </select>
                </div>
              </div>
              
              <div className="bg-purple-50 p-4 rounded-lg">
                <p className="text-sm text-purple-700">
                  <strong>Note:</strong> This update will mark the product as available for sale and 
                  record your retail location in the supply chain.
                </p>
              </div>
              
              <button 
                type="submit" 
                disabled={isSubmitting} 
                className="w-full bg-purple-500 text-white py-3 px-6 rounded-lg font-semibold hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Updating...
                  </>
                ) : (
                  'Update Batch on Blockchain'
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
      
      {/* Batch Details Section */}
      {batchDetails && (
        <div className="mt-6 space-y-4">
          {batchDetails.farmer && (
            <FarmerDetails farmer={batchDetails.farmer} />
          )}
          {batchDetails.distributor && (
            <DistributorDetails distributor={batchDetails.distributor} />
          )}
        </div>
      )}
      
      {isLoadingBatch && (
        <div className="mt-6 bg-gray-50 border border-gray-200 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-500"></div>
            <span className="text-sm text-gray-600">Loading batch details...</span>
          </div>
        </div>
      )}
      
      {showScanner && (
        <QrCodeScanner 
          onScan={handleQrScan} 
          onClose={() => setShowScanner(false)} 
        />
      )}
      
      {showTrace && traceData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-2xl font-bold text-gray-800">Batch Trace History</h2>
              <button
                onClick={() => setShowTrace(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <ArrowLeft className="h-6 w-6 text-gray-500" />
              </button>
            </div>
            
            <div className="p-6">
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Batch Information</h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p><strong>Batch ID:</strong> {traceData.batchId}</p>
                  <p><strong>Current Owner:</strong> {traceData.currentOwner}</p>
                  <p><strong>Status:</strong> {traceData.status}</p>
                  {traceData.metadata && (
                    <>
                      <p><strong>Product:</strong> {traceData.metadata.name}</p>
                      <p><strong>Produce:</strong> {traceData.metadata.produce}</p>
                      <p><strong>Harvest Date:</strong> {new Date(traceData.metadata.harvestDate).toLocaleDateString()}</p>
                      <p><strong>Location:</strong> {traceData.metadata.location}</p>
                    </>
                  )}
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Supply Chain Journey</h3>
                <div className="space-y-4">
                  {traceData.history?.map((item: any, index: number) => (
                    <div key={index} className="border-l-4 border-purple-500 pl-4 py-2">
                      <div className="flex items-center justify-between">
                        <h4 className="font-semibold text-gray-800">{item.action}</h4>
                        <span className="text-sm text-gray-500">
                          {new Date(item.timestamp).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">Actor: {item.actor}</p>
                      {item.location && <p className="text-sm text-gray-600">Location: {item.location}</p>}
                      {item.details && (
                        <div className="mt-2 text-sm text-gray-600">
                          {Object.entries(item.details).map(([key, value]) => (
                            <p key={key}><strong>{key}:</strong> {String(value)}</p>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
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

export default RetailerView;