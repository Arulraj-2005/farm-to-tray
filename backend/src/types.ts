export type Role = 'farmer' | 'distributor' | 'retailer';

export interface GeoPoint { lat: number; lng: number }

export interface FarmerMetadata {
  name: string;
  produce: string;
  price: number;
  quantity: number;
  location: GeoPoint;
  harvestDate: string;
  role: 'farmer';
}

export interface DistributorUpdate {
  name: string;
  quantity: number;
  marginPrice: number;
  location: GeoPoint;
  transportMode: string;
  expectedDelivery: string;
  status: 'IN_TRANSIT';
  role: 'distributor';
  note: string;
  timestamp: string;
}

export interface RetailerUpdate {
  retailerName: string;
  storeName: string;
  sellingPrice: number;
  location: GeoPoint;
  shelfLife: string;
  storageConditions: string;
  status: 'AVAILABLE_FOR_SALE';
  role: 'retailer';
  note: string;
  timestamp: string;
}

export type StatusUpdate = DistributorUpdate | RetailerUpdate;

export interface BatchHistoryItem {
  action: 'CREATE' | 'UPDATE';
  actor: string;
  location?: GeoPoint;
  timestamp: string;
  details?: Partial<FarmerMetadata & DistributorUpdate & RetailerUpdate>;
}

export interface Batch {
  batchId: string;
  metadata: FarmerMetadata;
  currentOwner: string;
  status: string;
  history: BatchHistoryItem[];
} 