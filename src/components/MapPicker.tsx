import React, { useMemo, useState } from 'react';
import { MapContainer, TileLayer, useMap, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix default marker icon paths for Leaflet in bundlers
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

interface MapPickerProps {
  initialLat?: number;
  initialLng?: number;
  onCancel: () => void;
  onConfirm: (lat: number, lng: number) => void;
}

const CenterTracker: React.FC<{ onCenter: (lat: number, lng: number) => void }> = ({ onCenter }) => {
  const map = useMap();
  useMapEvents({
    move() {
      const c = map.getCenter();
      onCenter(c.lat, c.lng);
    },
    moveend() {
      const c = map.getCenter();
      onCenter(c.lat, c.lng);
    },
  });
  return null;
};

const MapPicker: React.FC<MapPickerProps> = ({ initialLat, initialLng, onCancel, onConfirm }) => {
  const [lat, setLat] = useState<number>(initialLat ?? 11.016844);
  const [lng, setLng] = useState<number>(initialLng ?? 76.955832);
  const center = useMemo<[number, number]>(() => [lat, lng], [lat, lng]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl overflow-hidden">
        <div className="p-4 border-b flex items-center justify-between">
          <h3 className="text-lg font-semibold">Pick Location on Map</h3>
          <button onClick={onCancel} className="text-gray-500 hover:text-gray-700">✕</button>
        </div>
        <div className="relative h-[70vh] w-full">
          <MapContainer center={center} zoom={14} style={{ height: '100%', width: '100%' }}>
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="&copy; OpenStreetMap contributors" />
            <CenterTracker onCenter={(a, b) => { setLat(a); setLng(b); }} />
          </MapContainer>
          {/* Center crosshair */}
          <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
            <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="3"></circle>
              <line x1="12" y1="2" x2="12" y2="6"></line>
              <line x1="12" y1="18" x2="12" y2="22"></line>
              <line x1="2" y1="12" x2="6" y2="12"></line>
              <line x1="18" y1="12" x2="22" y2="12"></line>
            </svg>
          </div>
        </div>
        <div className="p-4 border-t flex items-center justify-between">
          <div className="text-sm text-gray-600">
            Selected: {lat.toFixed(6)},{lng.toFixed(6)}
          </div>
          <div className="space-x-2">
            <button onClick={onCancel} className="px-4 py-2 rounded border border-gray-300 text-gray-700">Cancel</button>
            <button onClick={() => onConfirm(lat, lng)} className="px-4 py-2 rounded bg-green-600 text-white">Use this location</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MapPicker;


