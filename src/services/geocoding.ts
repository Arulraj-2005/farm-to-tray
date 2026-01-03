// Geocoding service to convert coordinates to readable location names
interface LocationInfo {
  state: string;
  district: string;
  city?: string;
  country: string;
  formatted: string;
}

// Reverse geocoding using OpenStreetMap Nominatim API with better accuracy
export async function reverseGeocode(lat: number, lng: number): Promise<LocationInfo> {
  try {
    // Use multiple zoom levels for better accuracy
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1&accept-language=en&zoom=18&addressdetails=1`
    );
    
    if (!response.ok) {
      throw new Error('Geocoding service unavailable');
    }
    
    const data = await response.json();
    
    if (!data.address) {
      return {
        state: 'Unknown',
        district: 'Unknown',
        country: 'Unknown',
        formatted: `${lat.toFixed(4)}, ${lng.toFixed(4)}`
      };
    }
    
    const address = data.address;
    
    // Better mapping for Indian addresses
    const state = address.state || address.region || address.province || address.state_district || 'Unknown';
    
    // Try multiple fields for district/county
    const district = address.county || 
                   address.district || 
                   address.city_district || 
                   address.municipality ||
                   address.suburb ||
                   address.town ||
                   'Unknown';
    
    // Try multiple fields for city
    const city = address.city || 
                address.town || 
                address.village || 
                address.hamlet ||
                address.suburb ||
                address.municipality ||
                null;
    
    const country = address.country || 'Unknown';
    
    // Create a more accurate formatted string
    let formatted = '';
    if (city && city !== district && city !== state) {
      formatted = `${city}, ${district}, ${state}`;
    } else if (district && district !== state) {
      formatted = `${district}, ${state}`;
    } else {
      formatted = state;
    }
    
    // Add country if not India
    if (country !== 'India' && country !== 'Unknown') {
      formatted += `, ${country}`;
    }
    
    return {
      state,
      district,
      city,
      country,
      formatted
    };
  } catch (error) {
    console.error('Geocoding error:', error);
    return {
      state: 'Unknown',
      district: 'Unknown',
      country: 'Unknown',
      formatted: `${lat.toFixed(4)}, ${lng.toFixed(4)}`
    };
  }
}

// Format location string to readable format
export function formatLocationString(location: string): string {
  if (!location || location === 'N/A') return 'Location not specified';
  
  // If it's coordinates, try to geocode them
  if (location.includes(',')) {
    const coords = location.split(',').map(coord => parseFloat(coord.trim()));
    if (coords.length === 2 && !isNaN(coords[0]) && !isNaN(coords[1])) {
      // Return coordinates for now, will be replaced with geocoded data
      return `${coords[0].toFixed(4)}, ${coords[1].toFixed(4)}`;
    }
  }
  
  return location;
}

// Alternative geocoding using Google Maps API (if available)
async function reverseGeocodeGoogle(lat: number, lng: number): Promise<LocationInfo | null> {
  try {
    // This would require a Google Maps API key
    // For now, we'll use a free alternative
    return null;
  } catch (error) {
    return null;
  }
}

// Alternative geocoding using BigDataCloud API (free tier)
async function reverseGeocodeBigDataCloud(lat: number, lng: number): Promise<LocationInfo | null> {
  try {
    const response = await fetch(
      `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=en`
    );
    
    if (!response.ok) {
      return null;
    }
    
    const data = await response.json();
    
    if (!data.localityInfo) {
      return null;
    }
    
    const info = data.localityInfo;
    const administrative = info.administrative || [];
    
    // Extract state and district from administrative levels
    let state = 'Unknown';
    let district = 'Unknown';
    let city = data.city || data.locality || null;
    
    // Map administrative levels (varies by country)
    for (const admin of administrative) {
      if (admin.adminLevel === 1) {
        state = admin.name;
      } else if (admin.adminLevel === 2) {
        district = admin.name;
      }
    }
    
    // Fallback to other fields
    if (state === 'Unknown') {
      state = data.principalSubdivision || data.administrativeArea || 'Unknown';
    }
    if (district === 'Unknown') {
      district = data.principalSubdivision || data.administrativeArea || 'Unknown';
    }
    
    let formatted = '';
    if (city && city !== district && city !== state) {
      formatted = `${city}, ${district}, ${state}`;
    } else if (district && district !== state) {
      formatted = `${district}, ${state}`;
    } else {
      formatted = state;
    }
    
    return {
      state,
      district,
      city,
      country: data.countryName || 'Unknown',
      formatted
    };
  } catch (error) {
    return null;
  }
}

// Cache for geocoding results to avoid repeated API calls
const geocodingCache = new Map<string, LocationInfo>();

export async function getLocationInfo(location: string): Promise<LocationInfo> {
  if (!location || location === 'N/A') {
    return {
      state: 'Unknown',
      district: 'Unknown',
      country: 'Unknown',
      formatted: 'Location not specified'
    };
  }
  
  // Check cache first
  if (geocodingCache.has(location)) {
    return geocodingCache.get(location)!;
  }
  
  // If it's coordinates, geocode them
  if (location.includes(',')) {
    const coords = location.split(',').map(coord => parseFloat(coord.trim()));
    if (coords.length === 2 && !isNaN(coords[0]) && !isNaN(coords[1])) {
      // Try multiple geocoding services for better accuracy
      let result = await reverseGeocode(coords[0], coords[1]);
      
      // If the result is not accurate enough, try alternative service
      if (result.state === 'Unknown' || result.district === 'Unknown') {
        const altResult = await reverseGeocodeBigDataCloud(coords[0], coords[1]);
        if (altResult && (altResult.state !== 'Unknown' || altResult.district !== 'Unknown')) {
          result = altResult;
        }
      }
      
      geocodingCache.set(location, result);
      return result;
    }
  }
  
  // If it's already a readable location, return as is
  return {
    state: 'Unknown',
    district: 'Unknown',
    country: 'Unknown',
    formatted: location
  };
}
