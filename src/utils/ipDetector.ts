// Utility to help users find their local IP address for mobile access

export const getLocalIPInstructions = (): string => {
  return `
To find your computer's IP address for mobile access:

Windows:
1. Open Command Prompt (cmd)
2. Type: ipconfig
3. Look for "IPv4 Address" under your WiFi adapter
4. It will be something like 192.168.1.100

Mac:
1. Open Terminal
2. Type: ifconfig | grep "inet "
3. Look for an address starting with 192.168 or 10.

Linux:
1. Open Terminal
2. Type: ip addr show
3. Look for an address starting with 192.168 or 10.

Then use: http://YOUR_IP:8080
  `.trim();
};

export const detectLocalIP = async (): Promise<string | null> => {
  try {
    // Try to detect using WebRTC
    const pc = new RTCPeerConnection({
      iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
    });
    
    pc.createDataChannel('');
    pc.createOffer().then(offer => pc.setLocalDescription(offer));
    
    return new Promise((resolve) => {
      pc.onicecandidate = (event) => {
        if (event.candidate) {
          const candidate = event.candidate.candidate;
          const ipMatch = candidate.match(/([0-9]{1,3}(\.[0-9]{1,3}){3})/);
          if (ipMatch) {
            const localIP = ipMatch[1];
            // Check if it's a local network IP
            if (isLocalNetworkIP(localIP)) {
              pc.close();
              resolve(localIP);
              return;
            }
          }
        }
      };
      
      // Timeout after 3 seconds
      setTimeout(() => {
        pc.close();
        resolve(null);
      }, 3000);
    });
  } catch (error) {
    return null;
  }
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

