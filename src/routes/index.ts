import { Router } from 'express';
import { AuthController } from '../controllers/AuthController';
import { authMiddleware } from '../middleware/auth.middleware';


const router = Router();
const authController = new AuthController();

// Auth routes - Public
router.post('/auth/login', authController.login);
router.post('/auth/login-v2', authController.loginV2);
router.post('/auth/send-otp-v2', authController.sendOTPV2);
router.post('/auth/verify-otp-v2', authController.verifyOTPV2);
router.post('/auth/forget-password', authController.forgotPasswordV2);
router.post('/auth/update-password', authController.updatePasswordV2);
router.post('/auth/resend-otp-v2', authController.sendOTPV2);
router.post('/auth/logout', authController.logout);


// Auth routes - Protected
router.post('/auth/validate-token', authMiddleware, authController.validateToken);
router.post('/auth/refresh-token', authController.refreshToken);
router.post('/auth/send-otp', authMiddleware, authController.sendOTP);
router.post('/auth/resend-otp', authMiddleware, authController.resendOTP);
router.post('/auth/verify-otp', authMiddleware, authController.verifyOTP);
router.get('/auth/permissions', authMiddleware, authController.getPermissions);
router.get('/auth/accessByRoleId', authMiddleware, authController.getUserAccessByRoleIdAndTenant);


// Tenant selection routes
router.get('/auth/user-tenants', authMiddleware, authController.getUserTenants);
router.post('/auth/select-tenant', authMiddleware, authController.selectTenant);

// Test email API endpoint for debugging
router.post('/auth/test-email', authMiddleware, authController.testEmail);
router.get('/auth/test-timezone', authMiddleware, authController.testTimezone);

export default router;
