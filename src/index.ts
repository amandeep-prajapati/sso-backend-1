import express, { Application, Request, Response } from 'express';
import cors from 'cors';
// import helmet from 'helmet';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';
import { appendFileSync, mkdirSync } from 'node:fs';
import path from 'node:path';

import apiRoutes from './routes';
import { ApiError } from './utils/ApiError';
import { ApiResponse } from './utils/ApiResponse';
import { errorHandler } from './middleware/errorHandler.middleware';
// import { ipRestrictionMiddleware } from './middleware/ipRestriction.middleware';
import { simpleIpRestrictionMiddleware } from './middleware/simpleIpRestriction.middleware';

import DatabaseConnection from './config/database';
//  import proxy from 'express-http-proxy'

dotenv.config();
const app: Application = express();
const PORT = process.env.PORT || 5000;
const accessLogPath = path.resolve(
    process.env.API_ACCESS_LOG_PATH || path.join(process.cwd(), 'logs', 'api-requests.log')
);

const writeAccessLog = (entry: Record<string, unknown>): void => {
    const line = JSON.stringify(entry);

    try {
        mkdirSync(path.dirname(accessLogPath), { recursive: true });
        appendFileSync(accessLogPath, `${line}\n`, { encoding: 'utf8' });
    } catch (error) {
        // Keep stdout logging active if the configured file path is not writable.
        console.error(`Unable to write API access log to ${accessLogPath}:`, error);
    }

    process.stdout.write(`${line}\n`);
};

// Trust proxy to get real client IP (important for IP restriction)
// Use specific proxy configuration instead of true for security
app.set('trust proxy', 1); // Trust first proxy

// Write request logs to stdout so PM2 captures them in its app logs. Emit the
// incoming event immediately (even if the client disconnects or the request
// never finishes); log only the path to avoid recording query-string secrets.
app.use((req: Request, res: Response, next) => {
    const startedAt = Date.now();
    const requestLog = {
        timestamp: new Date().toISOString(),
        event: 'http_request',
        method: req.method,
        path: req.originalUrl.split('?')[0],
        ip: req.ip,
        userAgent: req.get('user-agent')
    };

    writeAccessLog(requestLog);

    let responseLogged = false;
    const logResponse = (event: 'http_response' | 'http_request_aborted') => {
        if (responseLogged) return;
        responseLogged = true;
        writeAccessLog({
            timestamp: new Date().toISOString(),
            event,
            method: req.method,
            path: req.originalUrl.split('?')[0],
            statusCode: res.statusCode,
            durationMs: Date.now() - startedAt
        });
    };

    res.on('finish', () => logResponse('http_response'));
    res.on('close', () => {
        if (!res.writableFinished) logResponse('http_request_aborted');
    });

    next();
});

// Initialize database connection

// const campaignServiceRoute = proxy(process.env.campaign_proxy_ip);
// const adminServiceRoute = proxy(process.env.admin_proxy_ip);
const dbConnection = DatabaseConnection.getInstance();

// Add security headers to protect against common vulnerabilities
// app.use(helmet({
//     referrerPolicy: {
//         policy: 'strict-origin-when-cross-origin'
//     },
//     contentSecurityPolicy: false
// }));

// Allow cross-origin requests from frontend
// app.use(cors({
//     origin: process.env.CORS_ORIGIN || '*',
//     credentials: true
// }));
app.use(cors({
  origin: "*"
}));

// IP restriction middleware - block specific IPs
// app.use(ipRestrictionMiddleware);
app.use(simpleIpRestrictionMiddleware)

// Parse incoming JSON and URL-encoded data
app.use(express.json({ limit: '16kb' }));
app.use(express.urlencoded({ extended: true, limit: '16kb' }));

// Limit requests to prevent abuse (100 requests per 15 minutes per IP)
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 9000,
    message: 'Too many requests from this IP, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
    // Handle trust proxy properly
    skip: (req) => {
        // Skip rate limiting for localhost in development
        if (process.env.NODE_ENV === 'development') {
            const ip = req.ip || req.socket.remoteAddress;
            return ip === '127.0.0.1' || ip === '::1';
        }
        return false;
    }
});
app.use('/api/', limiter);


// app.use("/campaign/",campaignServiceRoute);
// app.use("/admin/",adminServiceRoute);



// Stricter rate limit for login attempts
const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    skipSuccessfulRequests: true,
    message: 'Too many login attempts from this IP, please try again after 15 minutes.',
    standardHeaders: true,
    legacyHeaders: false,
    // Handle trust proxy properly
    skip: (req) => {
        // Skip rate limiting for localhost in development
        if (process.env.NODE_ENV === 'development') {
            const ip = req.ip || req.socket.remoteAddress;
            return ip === '127.0.0.1' || ip === '::1';
        }
        return false;
    }
});
app.use('/api/auth/login', loginLimiter);

// Simple health check endpoint to verify server is running
app.get('/health', (_req: Request, res: Response) => {
    res.status(200).json(
        new ApiResponse(200, { 
            status: 'OK', 
            timestamp: new Date().toISOString() 
        }, 'SSO Service is running')
    );
});

// Register API routes
app.use('/api/', apiRoutes);

// Handle requests to non-existent routes
app.use((req: Request, res: Response) => {
    res.status(404).json(
        new ApiError(404, `Route ${req.originalUrl} not found`)
    );
});

// Global error handler
app.use(errorHandler);

// Start server
app.listen(PORT, async () => {
    console.log('='.repeat(60));
    console.log(`Admin Manager Service running on port ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`Health check: http://localhost:${PORT}/health`);
    console.log(`API access log file: ${accessLogPath}`);
    
    // Test database connection
    const isConnected = await dbConnection.testConnection();
    if (isConnected) {
        console.log('Database: Connected and ready');
    } else {
        console.log('Database: Connection failed - Service may not work properly');
    }
    
    console.log('='.repeat(60));
});

export default app;
