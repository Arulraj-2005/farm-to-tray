import express, { Request, Response } from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { CreateBatchSchema, UpdateBatchSchema } from './validators.js';
import { Batch, BatchHistoryItem, GeoPoint } from './types.js';
import { getBatch, putBatch } from './store.js';
import { fabricSubmit, fabricEvaluate, getFabricConfig } from './fabric.js';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));
app.set('trust proxy', true);

const PORT = Number(process.env.PORT || 4000);
const USE_FILE_STORE = process.env.USE_FILE_STORE === 'true';
const GEOCODE_BASE_URL = process.env.GEOCODE_BASE_URL || 'https://geocode.maps.co';

function normalizeLocation(input: string | GeoPoint): GeoPoint {
  if (typeof input === 'string') {
    const [latStr, lngStr] = input.split(',');
    const lat = parseFloat(latStr.trim());
    const lng = parseFloat(lngStr.trim());
    return { lat, lng };
  }
  return input;
}

function stringifyLocation(point?: GeoPoint | string): string | undefined {
  if (!point) return undefined;
  
  // If it's already a string, return it
  if (typeof point === 'string') {
    return point;
  }
  
  // If it's an object with lat/lng, convert to string
  if (typeof point === 'object' && point.lat !== undefined && point.lng !== undefined) {
    return `${point.lat},${point.lng}`;
  }
  
  return undefined;
}

// Health check
app.get('/health', async (_req: Request, res: Response) => {
  const cfg = await getFabricConfig();
  res.json({ ok: true, fabricEnabled: cfg.enabled, useFileStore: USE_FILE_STORE });
});

// Reverse geocode: lat/lng -> address
app.get('/api/reverse-geocode', async (req: Request, res: Response) => {
  try {
    const lat = req.query.lat as string;
    const lon = req.query.lon as string;

    if (!lat || !lon) {
      return res.status(400).json({ message: 'lat and lon query parameters are required' });
    }

    const url = `${GEOCODE_BASE_URL}/reverse?lat=${encodeURIComponent(lat)}&lon=${encodeURIComponent(lon)}`;
    const response = await fetch(url);
    if (!response.ok) {
      return res.status(502).json({ message: 'Failed to fetch address from geocode.maps.co' });
    }

    const data = await response.json();
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ message: err.message || 'Unexpected error' });
  }
});

// Create batch (Farmer)
app.post('/api/batch', async (req: Request, res: Response) => {
  try {
    const parsed = CreateBatchSchema.parse(req.body);
    const { batchId } = parsed;

    const metadata = {
      ...parsed.metadata,
      location: normalizeLocation(parsed.metadata.location),
    };

    const historyItem = {
      action: 'CREATE',
      actor: 'FarmerMSP',
      location: metadata.location,
      timestamp: new Date().toISOString(),
      details: { ...metadata },
    } as unknown as BatchHistoryItem;

    const batch: Batch = {
      batchId,
      metadata,
      currentOwner: 'FarmerMSP',
      status: 'HARVESTED',
      history: [historyItem],
    };

    // Persist locally so updates and tracing work even when Fabric is disabled
    putBatch(batch);

    const cfg = await getFabricConfig();
    if (cfg.enabled) {
      await fabricSubmit('CreateBatch', batchId, JSON.stringify(metadata));
    }

    res.json({ success: true, batchId });
  } catch (err: any) {
    res.status(400).json({ message: err.message || 'Invalid request' });
  }
});

// Update batch
app.post('/api/batch/:id/update', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const parsed = UpdateBatchSchema.parse(req.body);

    let batch = getBatch(id);
    const cfg = await getFabricConfig();

    if (!batch && !cfg.enabled && !USE_FILE_STORE) {
      return res.status(404).json({ message: `Batch ${id} not found` });
    }

    if (!batch) {
      batch = {
        batchId: id,
        metadata: {
          name: 'Unknown',
          produce: 'Unknown',
          price: 0,
          quantity: 0,
          location: normalizeLocation(parsed.statusUpdate.location),
          harvestDate: new Date().toISOString(),
          role: 'farmer',
        },
        currentOwner: 'UnknownMSP',
        status: 'UNKNOWN',
        history: [],
      } as Batch;
    }

    const normUpdate = {
      ...parsed.statusUpdate,
      location: normalizeLocation(parsed.statusUpdate.location),
    } as any;

    batch.status = normUpdate.status || batch.status;
    batch.currentOwner = `${normUpdate.role}MSP`;

    const updateItem = {
      action: 'UPDATE',
      actor: `${normUpdate.role}MSP`,
      location: normUpdate.location,
      timestamp: normUpdate.timestamp || new Date().toISOString(),
      details: { ...normUpdate },
    } as unknown as BatchHistoryItem;

    batch.history.push(updateItem);

    // Persist local cache regardless of Fabric flag
    putBatch(batch);

    if (cfg.enabled) {
      await fabricSubmit('UpdateBatch', id, JSON.stringify(normUpdate));
    }

    res.json({ success: true, batchId: id });
  } catch (err: any) {
    res.status(400).json({ message: err.message || 'Invalid request' });
  }
});

// Helper function to get location details
async function getLocationDetails(location: string | GeoPoint): Promise<{ lat: number; lng: number; address?: string }> {
  let lat: number, lng: number;
  
  if (typeof location === 'string') {
    const coords = location.split(',').map(Number);
    [lat, lng] = coords;
  } else if (typeof location === 'object' && location.lat !== undefined && location.lng !== undefined) {
    lat = location.lat;
    lng = location.lng;
  } else {
    // Fallback for invalid location data
    return { lat: 0, lng: 0, address: 'Invalid location data' };
  }
  
  // Try multiple geocoding services for better reliability
  const services = [
    `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=en`,
    `https://geocode.maps.co/reverse?lat=${lat}&lon=${lng}`,
    `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`
  ];
  
  for (const url of services) {
    try {
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'AgriChain/1.0'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        let address = '';
        
        if (url.includes('bigdatacloud')) {
          address = `${data.city || 'Unknown'}, ${data.principalSubdivision || 'Unknown'}, ${data.countryName || 'Unknown'}`;
        } else if (url.includes('geocode.maps.co')) {
          address = data.display_name || `${data.address?.city || 'Unknown'}, ${data.address?.state || 'Unknown'}, ${data.address?.country || 'Unknown'}`;
        } else if (url.includes('nominatim')) {
          address = data.display_name || `${data.address?.city || 'Unknown'}, ${data.address?.state || 'Unknown'}, ${data.address?.country || 'Unknown'}`;
        }
        
        if (address && address !== 'Unknown, Unknown, Unknown') {
          return { lat, lng, address };
        }
      }
    } catch (err) {
      console.warn(`Geocoding service failed: ${url}`, err.message);
    }
  }
  
  // Fallback to coordinates if all services fail
  return { lat, lng, address: `${lat.toFixed(4)}, ${lng.toFixed(4)}` };
}

// New endpoint for reverse geocoding
app.get('/api/geocode/reverse', async (req: Request, res: Response) => {
  const { lat, lon } = req.query;

  if (!lat || !lon) {
    return res.status(400).json({ message: 'Latitude and longitude are required.' });
  }

  try {
    const locationDetails = await getLocationDetails({ lat: parseFloat(lat as string), lng: parseFloat(lon as string) });
    res.json(locationDetails);
  } catch (error) {
    console.error('Error in reverse geocoding endpoint:', error);
    res.status(500).json({ message: 'Failed to retrieve location details.' });
  }
});

// Get batch details for distributor view (includes farmer info)
app.get('/api/batch/:id/distributor', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    let batch = getBatch(id);
    const cfg = await getFabricConfig();

    if (!batch && cfg.enabled) {
      const fabricResult = await fabricEvaluate('ReadBatch', id);
      batch = fabricResult as Batch;
    }

    if (!batch) {
      return res.status(404).json({ message: `Batch ${id} does not exist` });
    }

    // Get farmer details from the first history entry (CREATE action)
    const farmerEntry = batch.history.find(h => h.action === 'CREATE');
    const farmerLocation = farmerEntry ? stringifyLocation(farmerEntry.location) : null;
    const farmerLocationDetails = farmerLocation ? await getLocationDetails(farmerLocation) : null;

    const response = {
      batchId: batch.batchId,
      farmer: {
        name: batch.metadata.name || 'Unknown',
        location: farmerLocation || 'N/A',
        locationDetails: farmerLocationDetails,
        harvestDate: batch.metadata.harvestDate,
        produce: batch.metadata.produce,
        quantity: batch.metadata.quantity,
        price: batch.metadata.price
      },
      currentOwner: batch.currentOwner,
      status: batch.status
    };

    res.json(response);
  } catch (err: any) {
    res.status(400).json({ message: err.message || 'Invalid request' });
  }
});

// Get batch details for retailer view (includes farmer and distributor info)
app.get('/api/batch/:id/retailer', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    let batch = getBatch(id);
    const cfg = await getFabricConfig();

    if (!batch && cfg.enabled) {
      const fabricResult = await fabricEvaluate('ReadBatch', id);
      batch = fabricResult as Batch;
    }

    if (!batch) {
      return res.status(404).json({ message: `Batch ${id} does not exist` });
    }

    // Get farmer details from the first history entry (CREATE action)
    const farmerEntry = batch.history.find(h => h.action === 'CREATE');
    const farmerLocation = farmerEntry ? stringifyLocation(farmerEntry.location) : null;
    const farmerLocationDetails = farmerLocation ? await getLocationDetails(farmerLocation) : null;

    // Get distributor details from the second history entry (UPDATE action)
    const distributorEntry = batch.history.find(h => h.action === 'UPDATE' && h.details?.role === 'distributor');
    const distributorLocation = distributorEntry ? stringifyLocation(distributorEntry.location) : null;
    const distributorLocationDetails = distributorLocation ? await getLocationDetails(distributorLocation) : null;

    const response = {
      batchId: batch.batchId,
      farmer: {
        name: batch.metadata.name || 'Unknown',
        location: farmerLocation || 'N/A',
        locationDetails: farmerLocationDetails,
        harvestDate: batch.metadata.harvestDate,
        produce: batch.metadata.produce,
        quantity: batch.metadata.quantity,
        price: batch.metadata.price
      },
      distributor: distributorEntry ? {
        name: distributorEntry.details?.distributorName || 'Unknown',
        location: distributorLocation || 'N/A',
        locationDetails: distributorLocationDetails,
        quantity: distributorEntry.details?.quantity,
        marginPrice: distributorEntry.details?.marginPrice,
        transportMode: distributorEntry.details?.transportMode,
        timestamp: distributorEntry.timestamp
      } : null,
      currentOwner: batch.currentOwner,
      status: batch.status
    };

    res.json(response);
  } catch (err: any) {
    res.status(400).json({ message: err.message || 'Invalid request' });
  }
});

// Trace batch
app.get('/trace/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    let batch = getBatch(id);
    const cfg = await getFabricConfig();

    if (!batch && cfg.enabled) {
      const fabricResult = await fabricEvaluate('ReadBatch', id);
      batch = fabricResult as Batch;
    }

    if (!batch) {
      return res.status(404).json({ message: `Batch ${id} does not exist` });
    }

    // Get location details for metadata
    const metadataLocation = await getLocationDetails(batch.metadata.location);
    
    // Get location details for each history item
    const historyWithLocations = await Promise.all(
      batch.history.map(async (h: BatchHistoryItem) => {
        const locationString = stringifyLocation(h.location) || 'N/A';
        const locationDetails = locationString !== 'N/A' ? await getLocationDetails(locationString) : null;
        return {
          ...h,
          location: locationString,
          locationDetails,
        };
      })
    );

    const response = {
      batchId: batch.batchId,
      metadata: {
        ...batch.metadata,
        location: stringifyLocation(batch.metadata.location) || 'N/A',
        locationDetails: metadataLocation,
      },
      currentOwner: batch.currentOwner,
      status: batch.status,
      history: historyWithLocations,
    };

    // Debug logging
    console.log('Trace response for batch:', id);
    console.log('Metadata location:', batch.metadata.location);
    console.log('Metadata locationDetails:', metadataLocation);
    console.log('History items with locations:', historyWithLocations.map(h => ({
      action: h.action,
      location: h.location,
      locationDetails: h.locationDetails
    })));

    res.json(response);
  } catch (err: any) {
    res.status(400).json({ message: err.message || 'Invalid request' });
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Backend listening on http://0.0.0.0:${PORT}`);
});
