// Network utilities for QR code generation

export const getPublicUrl = (): string => {
  // Check if we have a public URL configured in environment
  const publicUrl = (import.meta as any).env?.VITE_PUBLIC_BASE_URL;
  if (publicUrl) {
    return publicUrl;
  }
  
  // If running on localhost, try to detect the local network IP
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    // For development, we'll provide instructions to the user
    // or try to detect the local IP using WebRTC
    return detectLocalIP();
  }
  
  return window.location.origin;
};

const detectLocalIP = (): string => {
  // Try to detect local IP using WebRTC
  return new Promise<string>((resolve) => {
    const pc = new RTCPeerConnection({
      iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
    });
    
    pc.createDataChannel('');
    pc.createOffer().then(offer => pc.setLocalDescription(offer));
    
    pc.onicecandidate = (event) => {
      if (event.candidate) {
        const candidate = event.candidate.candidate;
        const ipMatch = candidate.match(/([0-9]{1,3}(\.[0-9]{1,3}){3})/);
        if (ipMatch) {
          const localIP = ipMatch[1];
          // Check if it's a local network IP (192.168.x.x, 10.x.x.x, 172.16-31.x.x)
          if (isLocalNetworkIP(localIP)) {
            pc.close();
            resolve(`http://${localIP}:${window.location.port || '8080'}`);
            return;
          }
        }
      }
    };
    
    // Fallback after 3 seconds
    setTimeout(() => {
      pc.close();
      resolve('http://192.168.1.100:8080'); // Default fallback
    }, 3000);
  }).catch(() => {
    return 'http://192.168.1.100:8080'; // Fallback if WebRTC fails
  });
};

const isLocalNetworkIP = (ip: string): boolean => {
  const parts = ip.split('.').map(Number);
  if (parts.length !== 4) return false;
  
  // 192.168.x.x
  if (parts[0] === 192 && parts[1] === 168) return true;
  
  // 10.x.x.x
  if (parts[0] === 10) return true;
  
  // 172.16.x.x - 172.31.x.x
  if (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31) return true;
  
  return false;
};

// Alternative: Get the current hostname and port for QR generation
export const getQRBaseUrl = (): string => {
  const publicUrl = (import.meta as any).env?.VITE_PUBLIC_BASE_URL;
  if (publicUrl && publicUrl !== 'http://172.16.119.201:8080/') {
    return publicUrl;
  }
  
  // For development, try to use the current hostname
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    // Try to detect if we're running on a network IP
    const currentUrl = window.location.href;
    if (currentUrl.includes('192.168.') || currentUrl.includes('10.') || currentUrl.includes('172.')) {
      return window.location.origin;
    }
    // Return a placeholder that the user needs to replace
    return 'http://172.20.43.195:8080';
  }
  
  return window.location.origin;
};

// Get instructions for setting up mobile access
export const getMobileSetupInstructions = (): string => {
  const hostname = window.location.hostname;
  const port = window.location.port || '8080';
  
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return `To make QR codes work on mobile devices:
1. Find your computer's IP address (e.g., 192.168.1.100)
2. Replace 'https://your-app-domain.com' in the QR code with 'http://YOUR_IP:${port}'
3. Make sure your phone is on the same WiFi network
4. Or deploy your app to a public domain`;
  }
  
  return '';
};
