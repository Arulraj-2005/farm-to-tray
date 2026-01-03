// Mock API implementation for development
// Replace with your actual backend endpoints

// Point to backend during development by default
// If VITE_API_BASE_URL is missing or not an absolute http(s) URL, fall back to localhost:4000
const rawBase = (import.meta as any).env?.VITE_API_BASE_URL as string | undefined;
const API_BASE_URL = rawBase && /^https?:\/\//i.test(rawBase) ? rawBase : 'http://localhost:4000';
// Gate mock fallback with an env flag (default off)
const USE_MOCK = ((import.meta as any).env?.VITE_USE_MOCK === 'true');

// Mock data store for development
const mockBatches = new Map();

async function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function apiRequest(endpoint: string, method: string, body?: any) {
  // Add delay to simulate network request9
  await delay(200);
  
  try {
    const options: RequestInit = {
      method,
      headers: { 'Content-Type': 'application/json' },
    };
    
    if (body) {
      options.body = JSON.stringify(body);
    }
    
    const base = API_BASE_URL.replace(/\/$/, '');
    const url = `${base}${endpoint}`;
    const response = await fetch(url, options);
    
    if (!response.ok) {
      // For real backend errors, do not silently switch to mock unless explicitly enabled
      // Try parsing JSON error; if HTML is returned (Vite page), give clearer message
      const contentType = response.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        const errorData = await response.json().catch(() => ({} as any));
        throw new Error(errorData.message || 'An API error occurred');
      }
      const text = await response.text();
      throw new Error('Backend not reachable at ' + API_BASE_URL + ' (got non-JSON response)');
    }
    // Ensure we only try to parse JSON when content-type is JSON
    const contentType = response.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      return response.json();
    }
    const text = await response.text();
    throw new Error('Backend returned non-JSON response from ' + url + ' (did you set VITE_API_BASE_URL to the frontend URL by mistake?)');
  } catch (error) {
    if (USE_MOCK) {
      console.warn('API request failed, using mock data:', error);
      return handleMockRequest(endpoint, method, body);
    }
    throw error instanceof Error ? error : new Error('Request failed');
  }
}

function handleMockRequest(endpoint: string, method: string, body?: any) {
  if (method === 'POST' && endpoint === '/api/batch') {
    const { batchId, metadata } = body;
    const batch = {
      batchId,
      metadata,
      currentOwner: 'FarmerMSP',
      status: 'HARVESTED',
      history: [{
        action: 'CREATE',
        actor: 'FarmerMSP',
        location: metadata.location,
        timestamp: new Date().toISOString(),
        details: { ...metadata, role: 'farmer' }
      }]
    };
    mockBatches.set(batchId, batch);
    return Promise.resolve({ success: true, batchId });
  }
  
  if (method === 'POST' && endpoint.includes('/update')) {
    const batchId = endpoint.split('/')[3];
    const { statusUpdate } = body;
    const batch = mockBatches.get(batchId);
    
    if (!batch) {
      throw new Error(`Batch ${batchId} does not exist`);
    }
    
    batch.status = statusUpdate.status || batch.status;
    batch.history.push({
      action: 'UPDATE',
      details: statusUpdate,
      actor: `${statusUpdate.role}MSP`,
      location: statusUpdate.location,
      timestamp: new Date().toISOString()
    });
    
    mockBatches.set(batchId, batch);
    return Promise.resolve({ success: true, batchId });
  }
  
  if (method === 'GET' && endpoint.startsWith('/trace/')) {
    const batchId = endpoint.split('/')[2];
    const batch = mockBatches.get(batchId);
    
    if (!batch) {
      throw new Error(`Batch ${batchId} does not exist`);
    }
    
    return Promise.resolve(batch);
  }
  
  throw new Error('Endpoint not found');
}

export const submitFarmerData = (batchId: string, metadata: any) => {
  return apiRequest('/api/batch', 'POST', { batchId, metadata, identity: 'appUser' });
};

export const submitDistributorData = (batchId: string, statusUpdate: any) => {
  return apiRequest(`/api/batch/${batchId}/update`, 'POST', { statusUpdate, identity: 'appUser' });
};

export const submitRetailerData = (batchId: string, statusUpdate: any) => {
  return apiRequest(`/api/batch/${batchId}/update`, 'POST', { statusUpdate, identity: 'appUser' });
};

export const traceBatch = (batchId: string) => {
  return apiRequest(`/trace/${batchId}`, 'GET');
};

export const getBatchForDistributor = (batchId: string) => {
  return apiRequest(`/api/batch/${batchId}/distributor`, 'GET');
};

export const getBatchForRetailer = (batchId: string) => {
  return apiRequest(`/api/batch/${batchId}/retailer`, 'GET');
};