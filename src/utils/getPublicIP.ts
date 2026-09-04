import axios from 'axios';

/**
 * Get the real public IP address using external services
 */
export const getPublicIP = async (): Promise<string | null> => {
  // Use only the fastest and most reliable service
  const service = 'https://api.ipify.org?format=json';
  
  try {
    const response = await axios.get(service, { 
      timeout: 2000, // 2 second timeout
      headers: {
        'User-Agent': 'Mozilla/5.0',
        'Accept': 'application/json'
      }
    });
    
    // Type guard to check if response.data has ip property
    if (response.data && typeof response.data === 'object' && 'ip' in response.data) {
      const data = response.data as { ip: string };
      console.log(`✅ Public IP fetched successfully: ${data.ip}`);
      return data.ip;
    }
  } catch (error: any) {
    console.log(`❌ Failed to get public IP:`, error.message);
  }
  
  return null;
};

/**
 * Check if an IP is a private/local network IP
 */
export const isPrivateIP = (ip: string): boolean => {
  const privateRanges = [
    /^10\./,                    // 10.0.0.0/8
    /^172\.(1[6-9]|2[0-9]|3[0-1])\./, // 172.16.0.0/12
    /^192\.168\./,              // 192.168.0.0/16
    /^127\./,                   // 127.0.0.0/8 (localhost)
    /^169\.254\./,              // 169.254.0.0/16 (link-local)
    /^::1$/,                    // IPv6 localhost
    /^fe80:/                    // IPv6 link-local
  ];
  
  return privateRanges.some(range => range.test(ip));
};