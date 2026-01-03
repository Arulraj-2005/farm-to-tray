import React, { useState, useEffect } from 'react';
import { Truck, ArrowLeft, QrCode, Package2, Eye } from 'lucide-react';
import { submitDistributorData, traceBatch, getBatchForDistributor } from '../services/api';
import CustomAlert from './CustomAlert';
import LocationInput from './LocationInput';
import LocationPreview from './LocationPreview';
import FarmerDetails from './FarmerDetails';
import QrCodeScanner from './QrCodeScanner';

interface DistributorViewProps {
  userId: string;
  onBack: () => void;
}

const DistributorView: React.FC<DistributorViewProps> = ({ userId, onBack }) => {
  const [formData, setFormData] = useState({
    batchId: '',
    distributorName: '',
    quantity: '',
    marginPrice: '',
    location: '',
    transportMode: '',
    expectedDelivery: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [alert, setAlert] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [showScanner, setShowScanner] = useState(false);
  const [showTrace, setShowTrace] = useState(false);
  const [traceData, setTraceData] = useState<any>(null);
  const [isTracing, setIsTracing] = useState(false);
  const [farmerDetails, setFarmerDetails] = useState<any>(null);
  const [isLoadingFarmer, setIsLoadingFarmer] = useState(false);

  // Check if batch ID is provided via URL (QR scan)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const batchIdFromUrl = params.get('batch');
    if (batchIdFromUrl) {
      setFormData(prev => ({ ...prev, batchId: batchIdFromUrl }));
    }
  }, []);

  // Fetch farmer details when batch ID changes
  useEffect(() => {
    const fetchFarmerDetails = async () => {
      if (!formData.batchId.trim()) {
        setFarmerDetails(null);
        return;
      }

      setIsLoadingFarmer(true);
      try {
        const data = await getBatchForDistributor(formData.batchId);
        setFarmerDetails(data.farmer);
      } catch (error) {
        console.error('Failed to fetch farmer details:', error);
        setFarmerDetails(null);
      } finally {
        setIsLoadingFarmer(false);
      }
    };

    const timeoutId = setTimeout(fetchFarmerDetails, 500);
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
        name: formData.distributorName,
        quantity: parseFloat(formData.quantity),
        marginPrice: parseFloat(formData.marginPrice),
        location: formData.location,
        transportMode: formData.transportMode,
        expectedDelivery: formData.expectedDelivery,
        status: 'IN_TRANSIT',
        role: 'distributor',
        note: 'Received from farmer and being transported.',
        timestamp: new Date().toISOString()
      };
      
      const result = await submitDistributorData(formData.batchId, statusUpdate);
      setAlert({ message: `Distributor data updated for batch ${result.batchId}`, type: 'success' });
      setFormData({ 
        batchId: '', 
        distributorName: '', 
        quantity: '', 
        marginPrice: '', 
        location: '', 
        transportMode: '', 
        expectedDelivery: '' 
      });
    } catch (error) {
      const err = error as Error;
      setAlert({ message: err.message, type: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-xl shadow-lg p-8">
            <div className="flex items-center mb-6">
              <button onClick={onBack} className="mr-4 p-2 hover:bg-gray-100 rounded-full">
                <ArrowLeft className="h-6 w-6" />
              </button>
              <div className="flex items-center">
                <Truck className="h-8 w-8 text-blue-500 mr-3" />
                <h1 className="text-3xl font-bold text-gray-800">Distributor Dashboard</h1>
              </div>
            </div>
            
            <p className="text-gray-600 mb-6">Scan QR code or enter batch ID to update distribution details. You can also trace the batch to see farmer details and location.</p>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Package2 className="inline h-4 w-4 mr-1" />
                    Batch ID
                  </label>
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      name="batchId" 
                      value={formData.batchId} 
                      onChange={handleInputChange} 
                      placeholder="Enter or scan batch ID" 
                      className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                      required 
                    />
                    <button
                      type="button"
                      onClick={() => setShowScanner(true)}
                      className="px-4 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 flex items-center"
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">Distributor Name</label>
                  <input 
                    type="text" 
                    name="distributorName" 
                    value={formData.distributorName} 
                    onChange={handleInputChange} 
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                    required 
                    placeholder="Enter distributor company name"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Current Location</label>
                  <LocationInput 
                    value={formData.location} 
                    onChange={handleLocationChange} 
                    required 
                    placeholder="Click GPS button to auto-detect"
                  />
                  <LocationPreview 
                    location={formData.location} 
                    className="bg-blue-50 border-blue-200"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Quantity Received (kg)</label>
                  <input 
                    type="number" 
                    name="quantity" 
                    value={formData.quantity} 
                    onChange={handleInputChange} 
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                    required 
                    step="0.01"
                    min="0"
                    placeholder="Enter quantity received"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Margin Price (₹)</label>
                  <input 
                    type="number" 
                    name="marginPrice" 
                    value={formData.marginPrice} 
                    onChange={handleInputChange} 
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                    required 
                    step="0.01"
                    min="0"
                    placeholder="Enter distribution margin"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Transport Mode</label>
                  <select 
                    name="transportMode" 
                    value={formData.transportMode} 
                    onChange={handleInputChange} 
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                    required
                  >
                    <option value="">Select transport mode</option>
                    <option value="truck">Truck</option>
                    <option value="van">Van</option>
                    <option value="refrigerated">Refrigerated Vehicle</option>
                    <option value="train">Train</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Expected Delivery Date</label>
                  <input 
                    type="date" 
                    name="expectedDelivery" 
                    value={formData.expectedDelivery} 
                    onChange={handleInputChange} 
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                    required
                  />
                </div>
              </div>
              
              <button 
                type="submit" 
                disabled={isSubmitting} 
                className="w-full bg-blue-500 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
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
      
      {/* Farmer Details Section */}
      {farmerDetails && (
        <div className="mt-6">
          <FarmerDetails farmer={farmerDetails} />
        </div>
      )}
      
      {isLoadingFarmer && (
        <div className="mt-6 bg-gray-50 border border-gray-200 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
            <span className="text-sm text-gray-600">Loading farmer details...</span>
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
                    <div key={index} className="border-l-4 border-blue-500 pl-4 py-2">
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

export default DistributorView;