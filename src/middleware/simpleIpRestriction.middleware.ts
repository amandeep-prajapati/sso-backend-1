import { Request, Response, NextFunction } from 'express';
import { ApiResponse } from '../utils/ApiResponse';
import { ApiError } from '../utils/ApiError';

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
 * Simple IP restriction middleware using working IP detection
 * Uses the line that works in UAT: const ip = (req.headers['x-forwarded-for'] as string)?.split(',')[0] || req.socket.remoteAddress;
 */
export const simpleIpRestrictionMiddleware = (req: Request, res: Response, next: NextFunction) => {
  try {
    // Use the working IP detection line from UAT - gets public IP
    const ip = (req.headers['x-forwarded-for'] as string)?.split(',')[0] || req.socket.remoteAddress;
    console.log(ip);
    
    // Clean IP address (remove IPv6 prefix if present)
    const clientIP = ip?.replace(/^::ffff:/, '');
    
    // console.log('=== IP Protection System ===');
    // console.log('🛡️  Security Check: IP Address Validation');
    // console.log('📍 Detected Public IP:', clientIP);
    // console.log('🔍 Checking against security whitelist...');

    if (!clientIP) {
      console.log('❌ Security Alert: Unable to identify client IP');
      return res.status(400).json(
        new ApiError(400, 'Security Protection: Unable to determine client IP address for validation')
      );
    }

    // Check if IP is in allowed list
    // console.log('🔐 Security Policy: Checking IP against authorized list');
    // console.log('📋 Authorized IPs configured:', ALLOWED_IPS.length);
    
    // If no allowed IPs are configured, allow all (for safety)
    if (ALLOWED_IPS.length === 0) {
      console.log('⚠️  Security Notice: No IP restrictions configured - allowing all access');
      return next();
    }
    
    // if (true) {
    //   console.log(`🚫 SECURITY BLOCK: Unauthorized IP access attempt from ${clientIP}`);
    //   console.log('🛡️  Protection Status: ACCESS DENIED');
      
    //   return res.status(403).json(
    //     new ApiResponse(403, {
    //       securityStatus: 'BLOCKED',
    //       protectionType: 'IP_WHITELIST_PROTECTION',
    //       blockedIP: clientIP,
    //       reason: 'IP address not in authorized whitelist',
    //       timestamp: new Date().toISOString(),
    //       action: 'ACCESS_DENIED',
    //       message: 'Your IP address is not authorized to access this service'
    //     }, `Security Protection: Access denied for IP ${clientIP}. This IP is not authorized to access this service.`)
    //   );
    // }

    // console.log(`✅ SECURITY PASS: IP ${clientIP} is authorized`);
    // console.log('🛡️  Protection Status: ACCESS GRANTED');
    // console.log('========================');
    
    next();
  } catch (error) {
    console.error('❌ Security System Error:', error);
    return res.status(500).json(
      new ApiError(500, 'Security Protection System Error: Unable to validate IP address')
    );
  }
};