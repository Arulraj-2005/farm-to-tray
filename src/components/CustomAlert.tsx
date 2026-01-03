import React, { useEffect } from 'react';
import { CheckCircle, XCircle, X } from 'lucide-react';

interface CustomAlertProps {
  message: string;
  type: 'success' | 'error';
  onClose: () => void;
  duration?: number;
}

const CustomAlert: React.FC<CustomAlertProps> = ({ message, type, onClose, duration = 5000 }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [onClose, duration]);

  const baseClasses = "fixed top-5 right-5 max-w-sm w-full shadow-lg rounded-lg pointer-events-auto ring-1 ring-black ring-opacity-5 overflow-hidden z-50";
  const typeClasses = type === 'success' ? 'bg-green-50 ring-green-200' : 'bg-red-50 ring-red-200';

  return (
    <div className={`${baseClasses} ${typeClasses}`}>
      <div className="p-4">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            {type === 'success' ? 
              <CheckCircle className="h-6 w-6 text-green-400" /> : 
              <XCircle className="h-6 w-6 text-red-400" />
            }
          </div>
          <div className="ml-3 w-0 flex-1 pt-0.5">
            <p className={`text-sm font-medium ${type === 'success' ? 'text-green-800' : 'text-red-800'}`}>
              {type === 'success' ? 'Success' : 'Error'}
            </p>
            <p className={`mt-1 text-sm ${type === 'success' ? 'text-green-700' : 'text-red-700'}`}>
              {message}
            </p>
          </div>
          <div className="ml-4 flex-shrink-0 flex">
            <button 
              onClick={onClose} 
              className={`inline-flex rounded-md bg-transparent hover:bg-opacity-75 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                type === 'success' 
                  ? 'text-green-400 hover:text-green-500 focus:ring-green-500' 
                  : 'text-red-400 hover:text-red-500 focus:ring-red-500'
              }`}
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomAlert;