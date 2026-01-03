import React, { useState, useEffect } from 'react';
import { Search, ArrowLeft, QrCode, MapPin } from 'lucide-react';
import { traceBatch } from '../services/api';
import CustomAlert from './CustomAlert';
import TraceResult from './TraceResult';
import QrCodeScanner from './QrCodeScanner';
import TraceabilityMap from './SimpleTraceabilityMap';
import { useTranslation } from '../contexts/TranslationContext';

interface ConsumerViewProps {
  onBack: () => void;
  initialBatchId?: string | null;
}

const ConsumerView: React.FC<ConsumerViewProps> = ({ onBack, initialBatchId }) => {
  const { t } = useTranslation();
  const [batchId, setBatchId] = useState(initialBatchId || '');
  const [traceData, setTraceData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [alert, setAlert] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [showScanner, setShowScanner] = useState(false);
  const [showMap, setShowMap] = useState(false);

  // Auto-trace if batch ID is provided via URL
  useEffect(() => {
    if (initialBatchId) {
      handleTrace(initialBatchId);
    }
  }, [initialBatchId]);

  const handleTrace = async (idToTrace?: string) => {
    const targetId = idToTrace || batchId;
    if (!targetId.trim()) {
      setAlert({ message: 'Please enter a batch ID', type: 'error' });
      return;
    }

    setIsLoading(true);
    try {
      const data = await traceBatch(targetId);
      setTraceData(data);
      setAlert({ message: 'Trace completed successfully!', type: 'success' });
    } catch (error) {
      const err = error as Error;
      setAlert({ message: err.message, type: 'error' });
      setTraceData(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQrScan = (scannedBatchId: string) => {
    setBatchId(scannedBatchId);
    setShowScanner(false);
    handleTrace(scannedBatchId);
  };

  const getLocationPath = () => {
    if (!traceData || !traceData.history) return [];
    
    return traceData.history
      .filter((item: any) => item.location && item.location !== 'N/A')
      .map((item: any) => {
        const [lat, lng] = item.location.split(',').map((coord: string) => parseFloat(coord.trim()));
        return {
          lat,
          lng,
          role: item.details?.role || 'unknown',
          name: item.details?.name || item.actor,
          timestamp: item.timestamp,
          action: item.action
        };
      });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100 py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-xl shadow-lg p-8">
            <div className="flex items-center mb-6">
              <button onClick={onBack} className="mr-4 p-2 hover:bg-gray-100 rounded-full">
                <ArrowLeft className="h-6 w-6" />
              </button>
              <div className="flex items-center">
                <Search className="h-8 w-8 text-orange-500 mr-3" />
                <h1 className="text-3xl font-bold text-gray-800">{t('consumer.title')}</h1>
              </div>
            </div>
            
            <p className="text-gray-600 mb-6">
              {t('consumer.subtitle')}
            </p>
            
            <div className="mb-8">
              <div className="flex gap-2 mb-4">
                <input
                  type="text"
                  value={batchId}
                  onChange={(e) => setBatchId(e.target.value)}
                  placeholder={t('consumer.enterBatchId')}
                  className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
                <button
                  onClick={() => setShowScanner(true)}
                  className="px-4 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 flex items-center"
                  title="Scan QR Code"
                >
                  <QrCode className="h-5 w-5" />
                </button>
                <button
                  onClick={() => handleTrace()}
                  disabled={isLoading}
                  className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      {t('consumer.loadingTrace')}
                    </>
                  ) : (
                    t('consumer.traceButton')
                  )}
                </button>
              </div>
              
              {traceData && (
                <div className="flex justify-end">
                  <button
                    onClick={() => setShowMap(true)}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 flex items-center text-sm"
                  >
                    <MapPin className="h-4 w-4 mr-2" />
                    View Journey Map
                  </button>
                </div>
              )}
            </div>

            {traceData && <TraceResult data={traceData} />}
            
            {!traceData && !isLoading && (
              <div className="text-center py-12">
                <Search className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-500 mb-2">Ready to Trace</h3>
                <p className="text-gray-400">Enter a batch ID or scan QR code to see the complete journey</p>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {showScanner && (
        <QrCodeScanner 
          onScan={handleQrScan} 
          onClose={() => setShowScanner(false)} 
        />
      )}
      
      {showMap && traceData && (
        <TraceabilityMap 
          locations={getLocationPath()}
          onClose={() => setShowMap(false)}
          batchInfo={traceData}
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

export default ConsumerView;