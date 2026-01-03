import React, { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { jsPDF } from 'jspdf';
import { Download, FileText, X, ExternalLink, CheckCircle } from 'lucide-react';
import { useTranslation } from '../contexts/TranslationContext';
import { getQRBaseUrl } from '../utils/networkUtils';

interface QrCodeModalProps {
  batchId: string;
  onClose: () => void;
}

const QrCodeModal: React.FC<QrCodeModalProps> = ({ batchId, onClose }) => {
  const { t } = useTranslation();
  const [traceUrl, setTraceUrl] = useState('');

  useEffect(() => {
    const baseUrl = getQRBaseUrl();
    setTraceUrl(`${baseUrl}?id=${batchId}`);
  }, [batchId]);

  const handleDownloadPNG = () => {
    try {
      const svg = document.getElementById('batch-qr-code') as unknown as SVGElement;
      if (!svg) {
        alert('QR code not found. Please try again.');
        return;
      }

      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        alert('Canvas not supported. Please try downloading PDF instead.');
        return;
      }

      const data = new XMLSerializer().serializeToString(svg);
      const svgBlob = new Blob([data], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(svgBlob);
      
      const img = new Image();
      img.onload = function () {
        canvas.width = 400; // Higher resolution
        canvas.height = 400;
        ctx.drawImage(img, 0, 0, 400, 400);
        URL.revokeObjectURL(url);
        
        const pngUrl = canvas.toDataURL("image/png");
        const downloadLink = document.createElement("a");
        downloadLink.href = pngUrl;
        downloadLink.download = `AgriChain-${batchId}-QR.png`;
        downloadLink.style.display = 'none';
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
      };
      
      img.onerror = () => {
        URL.revokeObjectURL(url);
        alert('Failed to generate PNG. Please try again.');
      };
      
      img.src = url;
    } catch (error) {
      console.error('PNG download error:', error);
      alert('Failed to download PNG. Please try again.');
    }
  };

  const handleDownloadPDF = () => {
    try {
      const svg = document.getElementById('batch-qr-code') as unknown as SVGElement;
      if (!svg) {
        alert('QR code not found. Please try again.');
        return;
      }

      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        alert('Canvas not supported. Please try downloading PNG instead.');
        return;
      }

      const data = new XMLSerializer().serializeToString(svg);
      const svgBlob = new Blob([data], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(svgBlob);
      
      const img = new Image();
      img.onload = function () {
        canvas.width = 400; // Higher resolution
        canvas.height = 400;
        ctx.drawImage(img, 0, 0, 400, 400);
        URL.revokeObjectURL(url);
        
        const pngUrl = canvas.toDataURL("image/png");
        const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
        
        // Add title
        pdf.setFontSize(20);
        pdf.text("AgriChain Batch QR Code", 105, 20, { align: 'center' });
        
        // Add QR code (centered)
        const imgWidth = 60;
        const imgHeight = 60;
        const x = (210 - imgWidth) / 2; // Center on A4 page
        const y = 40;
        pdf.addImage(pngUrl, 'PNG', x, y, imgWidth, imgHeight);
        
        // Add batch info
        pdf.setFontSize(14);
        pdf.text(`Batch ID: ${batchId}`, 105, 120, { align: 'center' });
        
        pdf.setFontSize(10);
        pdf.text(`Generated: ${new Date().toLocaleDateString()}`, 105, 130, { align: 'center' });
        pdf.text("Scan to trace product journey", 105, 140, { align: 'center' });
        
        // Add URL (wrapped if too long)
        pdf.setFontSize(8);
        const urlText = traceUrl;
        const maxWidth = 190;
        const lines = pdf.splitTextToSize(urlText, maxWidth);
        pdf.text(lines, 105, 150, { align: 'center' });
        
        pdf.save(`AgriChain-${batchId}-QR.pdf`);
      };
      
      img.onerror = () => {
        URL.revokeObjectURL(url);
        alert('Failed to generate PDF. Please try again.');
      };
      
      img.src = url;
    } catch (error) {
      console.error('PDF download error:', error);
      alert('Failed to download PDF. Please try again.');
    }
  };

  const handleTestQR = () => {
    window.open(traceUrl, '_blank');
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4"
      onClick={onClose} // Allows clicking the background to close the modal
    >
      <div 
        className="bg-white rounded-xl shadow-2xl max-w-md w-full"
        onClick={(e) => e.stopPropagation()} // Prevents clicks inside the modal from closing it
      >
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-800">{t('qrCode.title')}</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="h-6 w-6 text-gray-500" />
          </button>
        </div>
        
        <div className="p-6 text-center">
          <div className="mb-4">
            <p className="text-gray-600 mb-2">{t('qrCode.subtitle')}</p>
            <p className="font-mono text-lg font-bold text-green-600 bg-green-50 p-2 rounded">
              {batchId}
            </p>
          </div>
          
          <p className="text-gray-600 mb-6">
            {t('qrCode.subtitle')}
          </p>
          
          <div className="p-6 bg-white inline-block border-2 border-gray-200 rounded-lg shadow-sm">
            <QRCodeSVG 
              id="batch-qr-code" 
              value={traceUrl} 
              size={200} 
              level="M"
              includeMargin={true}
            />
          </div>
          
          <div className="mt-4 p-3 bg-gray-50 rounded-lg">
            <p className="font-mono text-xs text-gray-500 break-all">{traceUrl}</p>
          </div>
          
          <div className="mt-6 space-y-3">
            <button
              onClick={handleTestQR}
              className="w-full flex items-center justify-center bg-green-500 text-white py-3 px-4 rounded-lg font-semibold hover:bg-green-600 transition-colors"
            >
              <ExternalLink className="h-5 w-5 mr-2" />
              {t('qrCode.testQR')}
            </button>
            
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={handleDownloadPNG}
                className="flex items-center justify-center bg-blue-500 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-600 transition-colors"
              >
                <Download className="h-4 w-4 mr-2" />
                {t('qrCode.downloadPNG')}
              </button>
              
              <button
                onClick={handleDownloadPDF}
                className="flex items-center justify-center bg-red-500 text-white py-3 px-4 rounded-lg font-semibold hover:bg-red-600 transition-colors"
              >
                <FileText className="h-4 w-4 mr-2" />
                {t('qrCode.downloadPDF')}
              </button>
            </div>
            
            {/* 💡 ADDED: The 'Done' button to explicitly close the modal */}
            <button
              onClick={onClose}
              className="w-full flex items-center justify-center bg-gray-200 text-gray-800 py-3 px-4 rounded-lg font-semibold hover:bg-gray-300 transition-colors mt-4"
            >
              <CheckCircle className="h-5 w-5 mr-2 text-green-600" />
              {t('qrCode.done')}
            </button>
            
          </div>
          
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h3 className="font-semibold text-blue-800 mb-2">What's Next?</h3>
            <ul className="text-sm text-blue-700 text-left space-y-1">
              <li>• Share QR code with your distributor</li>
              <li>• They'll scan it to update transport details</li>
              <li>• Retailer will scan to add retail information</li>
              <li>• Consumers can scan to see the full journey</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QrCodeModal;