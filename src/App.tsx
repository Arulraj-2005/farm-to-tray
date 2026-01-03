import React, { useState, useEffect } from 'react';
import { Leaf } from 'lucide-react';
import FarmerView from './components/FarmerView';
import DistributorView from './components/DistributorView';
import RetailerView from './components/RetailerView';
import ConsumerView from './components/ConsumerView';
import HomeView from './components/HomeView';
import LanguageSelector from './components/LanguageSelector';
import { TranslationProvider, useTranslation } from './contexts/TranslationContext';

type ViewType = 'home' | 'farmer' | 'distributor' | 'retailer' | 'consumer';

function AppContent() {
  const [currentView, setCurrentView] = useState<ViewType>('home');
  const [userId] = useState(`demoUser_${Math.random().toString(36).substr(2, 9)}`);
  const [initialBatchId, setInitialBatchId] = useState<string | null>(null);
  const { t } = useTranslation();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const batchIdFromUrl = params.get('id') || params.get('batch');
    if (batchIdFromUrl) {
      setInitialBatchId(batchIdFromUrl);
      setCurrentView('consumer');
    }
    
    // Handle QR code redirect from URL hash
    const hash = window.location.hash;
    if (hash && hash.startsWith('#batch=')) {
      const batchId = hash.substring(7);
      setInitialBatchId(batchId);
      setCurrentView('consumer');
    }
  }, []);

  const renderCurrentView = () => {
    switch (currentView) {
      case 'home':
        return <HomeView onViewChange={setCurrentView} />;
      case 'farmer':
        return <FarmerView userId={userId} onBack={() => setCurrentView('home')} />;
      case 'distributor':
        return <DistributorView userId={userId} onBack={() => setCurrentView('home')} />;
      case 'retailer':
        return <RetailerView userId={userId} onBack={() => setCurrentView('home')} />;
      case 'consumer':
        return <ConsumerView onBack={() => setCurrentView('home')} initialBatchId={initialBatchId} />;
      default:
        return <HomeView onViewChange={setCurrentView} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="fixed w-full top-0 left-0 bg-white shadow-lg z-40">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <button 
            onClick={() => setCurrentView('home')}
            className="flex items-center space-x-2 text-xl font-bold text-gray-800 hover:text-green-600 transition-colors"
          >
            <Leaf className="h-6 w-6 text-green-500" />
            <span>{t('app.title')}</span>
          </button>
          <LanguageSelector />
        </div>
      </nav>
      
      <main className="pt-20">
        {renderCurrentView()}
      </main>
      
      <footer className="w-full bg-gray-900 text-white text-center py-6 mt-12">
        <p>{t('footer.copyright')}</p>
      </footer>
    </div>
  );
}

function App() {
  return (
    <TranslationProvider>
      <AppContent />
    </TranslationProvider>
  );
}

export default App;
