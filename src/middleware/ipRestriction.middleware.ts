import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../utils/ApiError';
import { getPublicIP, isPrivateIP } from '../utils/getPublicIP';
import { json } from 'stream/consumers';

// Get allowed IP addresses from environment variable
const getAllowedIPs = (): string[] => {
  const allowedIpsEnv = process.env.ALLOWED_IPS;
  if (!allowedIpsEnv) {
    return [];
  }
  return allowedIpsEnv.split(',').map(ip => ip.trim());
};

const ALLOWED_IPS = getAllowedIPs();

/**
 * Middleware to restrict access based on IP addresses
 * Returns 403 for IPs NOT in the allowed list (whitelist)
 * Gets real public IP address instead of private network IP
 */
export const ipRestrictionMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    console.log(JSON.stringify(req.headers),'??????????????????????????????')
    console.log(JSON.stringify(req.socket.remoteAddress),'???????????????????????aaa???????')
     const forwarded = req.headers['x-forwarded-for'];  req.socket.remoteAddress;
      const ip =
    typeof forwarded === 'string'
      ? forwarded.split(',')[0]
      : req.socket.remoteAddress;
      console.log(ip,'ipipipipipipipipipipipipipip')
    // Get client IP address - prioritize proxy headers for real network IP
    let clientIP = req.headers['x-forwarded-for'] as string ||
                   req.headers['x-real-ip'] as string ||
                   req.headers['x-client-ip'] as string ||
                   req.headers['cf-connecting-ip'] as string || // Cloudflare
                   req.headers['x-forwarded'] as string ||
                   req.headers['forwarded-for'] as string ||
                   req.headers['forwarded'] as string ||
                   req.ip ||
                   req.socket.remoteAddress;

    console.log('=== IP Detection Debug ===');
    console.log('Raw clientIP:', clientIP);
    console.log('All headers:', {
      'x-forwarded-for': req.headers['x-forwarded-for'],
      'x-real-ip': req.headers['x-real-ip'],
      'x-client-ip': req.headers['x-client-ip'],
      'cf-connecting-ip': req.headers['cf-connecting-ip']
    });

    // Handle x-forwarded-for header (can contain multiple IPs)
    if (typeof clientIP === 'string' && clientIP.includes(',')) {
      console.log('Multiple IPs found:', clientIP);
      clientIP = clientIP.split(',')[0].trim();
      console.log('Taking first IP:', clientIP);
    }

    // Clean IP address (remove IPv6 prefix if present)
    if (clientIP) {
      const originalIP = clientIP;
      clientIP = clientIP.replace(/^::ffff:/, '');
      if (originalIP !== clientIP) {
        console.log('Cleaned IPv6 prefix:', originalIP, '->', clientIP);
      }
    }

    // If we got a private IP (like 192.168.x.x), try to get the real public IP
    if (clientIP && isPrivateIP(clientIP)) {
      console.log(`🏠 Detected private IP: ${clientIP}, fetching real public IP...`);
      
      // Try to get public IP with proper error handling
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3000); // 3 second timeout
        
        const publicIP = await getPublicIP();
        clearTimeout(timeoutId);
        
        if (publicIP && !isPrivateIP(publicIP)) {
          console.log(`🌐 Real public IP found: ${publicIP}`);
          clientIP = publicIP;
        } else {
          console.log('⚠️ Could not get valid public IP, using private IP');
          console.log('💡 Private IP will be checked against allowed list');
        }
      } catch (error: any) {
        console.log('❌ Error fetching public IP:', error.message);
        console.log('⚠️ Using private IP for checking');
      }
    } else {
      console.log(`🌐 Already have public IP: ${clientIP}`);
    }

    console.log(`🎯Final Network IP detected: ${clientIP}`);
    console.log('========================');

    if (!clientIP) {
      return next(new ApiError(400, 'Unable to determine client IP address'));
    }

    // Don't skip localhost in production - we want to block real IPs
    const isLocalhost = clientIP === '127.0.0.1' || 
                       clientIP === '::1' || 
                       clientIP === 'localhost';
    
    // Only skip localhost if explicitly in development AND it's actually localhost
    if (isLocalhost && process.env.NODE_ENV === 'development') {
      console.log(' Development mode: localhost detected, skipping IP restriction');
      console.log('To test IP blocking, deploy to server or use proxy headers');
      return next();
    }

    // Check if IP is in allowed list (whitelist)
    console.log('🔍 Checking against allowed IPs:', ALLOWED_IPS);
    
    // If no allowed IPs are configured, allow all (for safety)
    if (ALLOWED_IPS.length === 0) {
      console.log('⚠️  No allowed IPs configured, allowing all IPs');
      return next();
    }
    
    if (!ALLOWED_IPS.includes(clientIP)) {
      console.log(`🚫 IP NOT IN ALLOWED LIST: ${clientIP}`);
      return res.status(403).json({
        success: false,
        message: `Access denied. IP address ${clientIP} is not in the allowed list.`,
        statusCode: 403,
        deniedIP: clientIP
      });
    }

    console.log(`✅ IP IN ALLOWED LIST: ${clientIP}`);
    next();
  } catch (error) {
    console.error('❌ Error in IP restriction middleware:', error);
    next(new ApiError(500, 'Error in IP restriction middleware'));
  }
};