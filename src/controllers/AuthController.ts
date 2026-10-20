import jwt from 'jsonwebtoken';
import { AuthModel } from "../model/AuthModel";
import { AuthModelV2 } from "../model/AuthModelV2";
import { TokenPayload, SendOTPRequest, SendOTPResponse, ResendOTPRequest, ResendOTPResponse, VerifyOTPRequest, VerifyOTPResponse } from "../interfaces/Auth";
import { ApiError } from "../utils/ApiError";
import { ApiResponse } from "../utils/ApiResponse";
import { HTTP_STATUS, API_MESSAGES, API_ERROR_MESSAGES } from "../utils/apiConstants";
import { sendOTPEmail, sendEmail, generateUniqueTransactionNo, getTenantEmailConfig } from "../utils/emailService";
import { sendOTPSMS } from "../utils/smsService";
const bcrypt = require("bcryptjs");
import {
  validateLoginInput,
  validateToken,
  validateTenantSelection,
} from "../utils/validation";
import { getTenantId } from '../utils/getTenantId';
import { fetchUserRolesAndProducts, getAdminType } from '../utils/user';
import { updateMasterUserPasswordByEmail } from '../utils/updateMasterUserPasswordByEmail';

export class AuthController {
  private authModel = new AuthModel();
  private authModelV2 = new AuthModelV2();

  login = async (req: any, res: any): Promise<void> => {
    try {
      const source = req.body.source;
      // Validate input using utils validation
      let r = {
        user_email: req.body.user_email,
        user_password: req.body.user_password,
        dashboard_type: req.body.dashboard_type
      }
      const validation = validateLoginInput(r);
      const { user_email, user_password, dashboard_type: requestedDashboardType } = validation.data;

      // Authenticate user
      const user = await this.authModel.authenticateUser(
        user_email,
        user_password,
        source
      );
      if (!user) {
        return res
          .status(HTTP_STATUS.OK)
          .json(new ApiError(HTTP_STATUS.BAD_REQUEST, API_ERROR_MESSAGES.INVALID_CREDENTIALS));
      }
      const dashboardValidation = await this.authModel.validateDashboardAccess(
        user.role_name,
        requestedDashboardType
      );

      if (!dashboardValidation.hasAccess) {
        return res
          .status(HTTP_STATUS.OK)
          .json(
            new ApiError(
              HTTP_STATUS.BAD_REQUEST,
              dashboardValidation.message || API_ERROR_MESSAGES.DASHBOARD_ACCESS_DENIED
            )
          );
      }

      // Use the assigned dashboard type from database validation
      const dashboardType = dashboardValidation.assignedDashboardType;

      console.log(
        `Dashboard access granted: Type ${dashboardType} for role: ${user.role_name}`
      );

      // Generate JWT token
      const jwtSecret = process.env.JWT_SECRET || "your-secret-key";
      const tokenPayload: TokenPayload = {
        user_id: user.user_id,
        user_name: user.user_name,
        role_name: user.role_name,
        tenant_ids: user.tenant_ids,
      };

      const token = jwt.sign(tokenPayload, jwtSecret, {
        expiresIn: process.env.JWT_EXPIRES_IN || "24h",
      } as any);

      // Log successful login
      // await logUserLogin(
      //   user.user_id,
      //   user.user_email,
      //   dashboardType,
      //   getClientIP(req),
      //   getUserAgent(req)
      // );

      // login response using LoginResponse interface
      let response: any = {}
      // console.log({ source });

      if (source == 1) {
        response = {
          token,
          user: {
            user_id: user.user_id,
            user_name: user.user_name,
            user_email: user.user_email,
            role_name: user.role_name,
            tenant_names: user.tenant_names,
          }
        };
      } else {
        response = {
          token,
          user: {
            user_id: user.user_id,
            user_name: user.user_name,
            user_email: user.user_email,
            role_name: user.role_name,
            tenant_names: user.tenant_names,
            user_department: user.user_department,
            dashboard_type: dashboardType,
          }
        };
      }
      return res.status(HTTP_STATUS.OK).json(new ApiResponse(HTTP_STATUS.OK, response, API_MESSAGES.LOGIN_SUCCESS));
    } catch (error: any) {
      console.error("Login error:", error);
      return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(new ApiError(HTTP_STATUS.INTERNAL_SERVER_ERROR, error.message || API_ERROR_MESSAGES.INTERNAL_SERVER_ERROR));
    }
  };


  validateToken = async (req: any, res: any): Promise<void> => {
    try {
      // Validate token using utils validation
      const tokenValidation = validateToken(req.header("Authorization"));
      if (!tokenValidation.isValid) {
        return res.status(HTTP_STATUS.OK).json(new ApiError(HTTP_STATUS.UNAUTHORIZED, tokenValidation.message));
      }

      const token = tokenValidation.data?.token;

      const jwtSecret = process.env.JWT_SECRET || "your-secret-key";
      const decoded = jwt.verify(token, jwtSecret) as TokenPayload;

      // Fetch fresh user data to ensure user is still active
      const user = await this.authModel.getUserById(decoded.user_id);
      if (!user) {
        return res
          .status(HTTP_STATUS.OK)
          .json(new ApiError(HTTP_STATUS.UNAUTHORIZED, API_ERROR_MESSAGES.USER_NOT_FOUND_OR_INACTIVE));
      }

      // Validate dashboard access dynamically from database
      const dashboardValidation = await this.authModel.validateDashboardAccess(
        user.role_name
      );

      if (!dashboardValidation.hasAccess) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json(
          new ApiError(HTTP_STATUS.BAD_REQUEST, API_ERROR_MESSAGES.INSUFFICIENT_PERMISSIONS)
        );
      }

      // Get dashboard type dynamically from database
      const dashboardType = dashboardValidation.assignedDashboardType;

      return res.status(HTTP_STATUS.OK).json(
        new ApiResponse(
          HTTP_STATUS.OK,
          {
            user: {
              user_id: user.user_id,
              user_name: user.user_name,
              user_email: user.user_email,
              role_name: user.role_name,
              tenant_names: user.tenant_names,
              user_department: user.user_department,
              dashboard_type: dashboardType,
            },
          },
          API_MESSAGES.TOKEN_VALID
        )
      );
    } catch (error) {
      if (error instanceof jwt.JsonWebTokenError) {
        return res.status(HTTP_STATUS.OK).json(new ApiError(HTTP_STATUS.UNAUTHORIZED, API_ERROR_MESSAGES.INVALID_TOKEN));
      } else {
        console.error("Token validation error:", error);
        return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(new ApiError(HTTP_STATUS.INTERNAL_SERVER_ERROR, (error as any).message || API_ERROR_MESSAGES.INTERNAL_SERVER_ERROR));
      }
    }
  };

  logout = async (req: any, res: any): Promise<void> => {
    try {
      // In a stateless JWT system, logout is handled client-side by removing the token
      return res
        .status(HTTP_STATUS.OK)
        .json(new ApiResponse(HTTP_STATUS.OK, {}, API_MESSAGES.LOGOUT_SUCCESS));
    } catch (error: any) {
      console.error("Logout error:", error);
      return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(new ApiError(HTTP_STATUS.INTERNAL_SERVER_ERROR, error.message || API_ERROR_MESSAGES.INTERNAL_SERVER_ERROR));
    }
  };

 

  refreshToken = async (req: any, res: any): Promise<void> => {
    try {
      const token = req.header("Authorization")?.replace("Bearer ", "");

      if (!token) {
        return res.status(HTTP_STATUS.UNAUTHORIZED).json(
          new ApiError(HTTP_STATUS.UNAUTHORIZED, API_ERROR_MESSAGES.TOKEN_NOT_PROVIDED)
        );
      }

      const jwtSecret = process.env.JWT_SECRET || "your-secret-key";
      const decoded = jwt.verify(token, jwtSecret) as TokenPayload;

      // Fetch fresh user data
      const user = await this.authModel.getUserById(decoded.user_id);
      if (!user) {
        return res.status(HTTP_STATUS.UNAUTHORIZED).json(
          new ApiError(HTTP_STATUS.UNAUTHORIZED, API_ERROR_MESSAGES.USER_NOT_FOUND_OR_INACTIVE)
        );
      }

      // Generate new token with fresh data
      const tokenPayload: TokenPayload = {
        user_id: user.user_id,
        user_name: user.user_name,
        role_name: user.role_name,
        tenant_ids: user.tenant_ids,
      };

      const newToken = jwt.sign(tokenPayload, jwtSecret, {
        expiresIn: process.env.JWT_EXPIRES_IN || "24h",
      } as any);

      // Get dashboard type dynamically from database for refresh token response
      const dashboardType = await this.authModel.getDashboardTypeForRole(
        user.role_name
      );

      return res.status(HTTP_STATUS.OK).json(
        new ApiResponse(HTTP_STATUS.OK, {
          token: newToken,
          user: {
            user_id: user.user_id,
            user_name: user.user_name,
            user_email: user.user_email,
            role_name: user.role_name,
            tenant_names: user.tenant_names,
            user_department: user.user_department,
            dashboard_type: dashboardType,
          },
        }, API_MESSAGES.TOKEN_REFRESHED)
      );
    } catch (error) {
      if (error instanceof jwt.JsonWebTokenError) {
        return res.status(HTTP_STATUS.UNAUTHORIZED).json(
          new ApiError(HTTP_STATUS.UNAUTHORIZED, API_ERROR_MESSAGES.INVALID_TOKEN)
        );
      } else {
        console.error("Token refresh error:", error);
        return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
          new ApiError(HTTP_STATUS.INTERNAL_SERVER_ERROR, API_ERROR_MESSAGES.INTERNAL_SERVER_ERROR)
        );
      }
    }
  };

  // Get user's accessible tenants (for tenant selection screen)
  getUserTenants = async (req: any, res: any): Promise<void> => {
    try {
      const token = req.header("Authorization")?.replace("Bearer ", "");

      if (!token) {
        return res.status(HTTP_STATUS.UNAUTHORIZED).json(
          new ApiError(HTTP_STATUS.UNAUTHORIZED, API_ERROR_MESSAGES.TOKEN_NOT_PROVIDED)
        );
      }

      const jwtSecret = process.env.JWT_SECRET || "your-secret-key";
      const decoded = jwt.verify(token, jwtSecret) as TokenPayload;

      // Get user's accessible tenants
      const userTenants = await this.authModel.getUserAccessibleTenants(
        decoded.user_id
      );

      if (!userTenants || userTenants.length === 0) {
        return res.status(HTTP_STATUS.NOT_FOUND).json(
          new ApiError(HTTP_STATUS.NOT_FOUND, API_ERROR_MESSAGES.NO_TENANTS_FOUND)
        );
      }

      return res.status(HTTP_STATUS.OK).json(
        new ApiResponse(HTTP_STATUS.OK, {
          tenants: userTenants,
          user: {
            user_id: decoded.user_id,
            user_name: decoded.user_name,
            role_name: decoded.role_name,
          },
        }, API_MESSAGES.TENANTS_FETCHED)
      );
    } catch (error) {
      if (error instanceof jwt.JsonWebTokenError) {
        return res.status(HTTP_STATUS.UNAUTHORIZED).json(
          new ApiError(HTTP_STATUS.UNAUTHORIZED, API_ERROR_MESSAGES.INVALID_TOKEN)
        );
      } else {
        console.error("Get user tenants error:", error);
        return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
          new ApiError(HTTP_STATUS.INTERNAL_SERVER_ERROR, API_ERROR_MESSAGES.FAILED_TO_FETCH_TENANTS)
        );
      }
    }
  };

  // Select tenant for user session
  selectTenant = async (req: any, res: any): Promise<void> => {
    try {
      // Validate token
      const tokenValidation = validateToken(req.header("Authorization"));
      if (!tokenValidation.isValid) {
        return res.status(HTTP_STATUS.OK).json(new ApiError(HTTP_STATUS.UNAUTHORIZED, tokenValidation.message));
      }

      // Validate tenant selection input
      const tenantValidation = validateTenantSelection(req.body);
      if (!tenantValidation.isValid) {
        return res
          .status(HTTP_STATUS.OK)
          .json(new ApiError(HTTP_STATUS.BAD_REQUEST, tenantValidation.message));
      }

      const { tenant_id } = tenantValidation.data;
      const token = tokenValidation.data?.token;

      const jwtSecret = process.env.JWT_SECRET || "your-secret-key";
      const decoded = jwt.verify(token, jwtSecret) as TokenPayload;

      // Verify user has access to this tenant
      const hasAccess = await this.authModel.verifyUserTenantAccess(
        decoded.user_id,
        tenant_id
      );

      if (!hasAccess) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json(
          new ApiError(HTTP_STATUS.BAD_REQUEST, API_ERROR_MESSAGES.TENANT_ACCESS_DENIED)
        );
      }

      // Get tenant details
      const tenantDetails = await this.authModel.getTenantById(tenant_id);

      if (!tenantDetails) {
        return res.status(HTTP_STATUS.NOT_FOUND).json(
          new ApiError(HTTP_STATUS.NOT_FOUND, API_ERROR_MESSAGES.TENANT_NOT_FOUND)
        );
      }

      // Generate new token with selected tenant
      const tokenPayload: TokenPayload = {
        user_id: decoded.user_id,
        user_name: decoded.user_name,
        role_name: decoded.role_name,
        tenant_ids: [tenant_id],
        selected_tenant_id: tenant_id,
      };

      const newToken = jwt.sign(tokenPayload, jwtSecret, {
        expiresIn: process.env.JWT_EXPIRES_IN || "24h",
      } as any);

      return res.status(HTTP_STATUS.OK).json(
        new ApiResponse(HTTP_STATUS.OK, {
          token: newToken,
          selected_tenant: {
            tenant_id: tenantDetails.tenant_id,
            tenant_name: tenantDetails.tenant_name,
            tenant_code: tenantDetails.tenant_code,
          },
          user: {
            user_id: decoded.user_id,
            user_name: decoded.user_name,
            role_name: decoded.role_name,
          },
        }, API_MESSAGES.TENANT_SELECTED)
      );
    } catch (error) {
      if (error instanceof jwt.JsonWebTokenError) {
        return res.status(HTTP_STATUS.UNAUTHORIZED).json(
          new ApiError(HTTP_STATUS.UNAUTHORIZED, API_ERROR_MESSAGES.INVALID_TOKEN)
        );
      } else {
        console.error("Select tenant error:", error);
        return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
          new ApiError(HTTP_STATUS.INTERNAL_SERVER_ERROR, API_ERROR_MESSAGES.FAILED_TO_SELECT_TENANT)
        );
      }
    }
  };

  // Send OTP to user email
  sendOTP = async (req: any, res: any): Promise<void> => {
    try {
      console.log('=== SEND OTP DEBUG ===');
      console.log('req.user:', req.user);
      console.log('Authorization header:', req.header("Authorization"));
      console.log('=== END DEBUG ===');

      // Get user ID from authenticated user (from auth middleware)
      const userId = req.user?.user_id;
      let selectedTenantId = req.user?.selected_tenant_id;

      if (!req.user) {
        console.error('req.user is undefined - auth middleware may have failed');
        return res.status(HTTP_STATUS.UNAUTHORIZED).json(
          new ApiError(HTTP_STATUS.UNAUTHORIZED, "Authentication failed - user not found in request")
        );
      }

      if (!userId) {
        console.error('user_id is undefined in req.user:', req.user);
        return res.status(HTTP_STATUS.UNAUTHORIZED).json(
          new ApiError(HTTP_STATUS.UNAUTHORIZED, "User ID not found in token")
        );
      }

      // Get user details by ID
      const user = await this.authModel.getUserById(userId);
      if (!user) {
        return res.status(HTTP_STATUS.NOT_FOUND).json(
          new ApiError(HTTP_STATUS.NOT_FOUND, "User not found")
        );
      }

      // If no selected tenant, use the first available tenant or default to 1
      if (!selectedTenantId) {
        selectedTenantId = user.tenant_ids && user.tenant_ids.length > 0 ? user.tenant_ids[0] : 1;
        console.log(`No selected tenant found, using tenant ID: ${selectedTenantId}`);
      }

      console.log(`Sending OTP for user ${userId}, tenant ${selectedTenantId}, email: ${user.user_email}`);

      // Generate 6-digit OTP
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      
      // Set expiry time (10 minutes from now) - ensure UTC
      const now = new Date();
      const expiryTime = new Date(now.getTime() + (10 * 60 * 1000)); // Add 10 minutes in milliseconds
      
      console.log('=== SEND OTP TIME DEBUG ===');
      console.log('Current time:', now);
      console.log('Current time ISO:', now.toISOString());
      console.log('Expiry time:', expiryTime);
      console.log('Expiry time ISO:', expiryTime.toISOString());
      console.log('Time difference (minutes):', (expiryTime.getTime() - now.getTime()) / (1000 * 60));
      console.log('=== END TIME DEBUG ===');

      // Update user with OTP and expiry time
      await this.authModel.updateUserOTP(user.user_id, otp, expiryTime);

      // Send OTP email using selected tenant ID
      const emailResult = await sendOTPEmail(
        selectedTenantId,
        user.user_email,
        otp,
        undefined, // Remove leadId - send as undefined
        10
      );

      if (!emailResult.success) {
        return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
          new ApiError(HTTP_STATUS.INTERNAL_SERVER_ERROR, "Failed to send OTP email")
        );
      }

      const response: SendOTPResponse = {
        success: true,
        message: "OTP sent successfully",
        data: {
          email: user.user_email,
          expiry_time: expiryTime.toISOString()
        }
      };

      return res.status(HTTP_STATUS.OK).json(
        new ApiResponse(HTTP_STATUS.OK, response.data, response.message)
      );

    } catch (error: any) {
      console.error("Send OTP error:", error);
      return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
        new ApiError(HTTP_STATUS.INTERNAL_SERVER_ERROR, error.message || "Failed to send OTP")
      );
    }
  };

  // Resend OTP to user email
  resendOTP = async (req: any, res: any): Promise<void> => {
    try {
      // Get user ID from authenticated user (from auth middleware)
      const userId = req.user?.user_id;
      let selectedTenantId = req.user?.selected_tenant_id;

      if (!userId) {
        return res.status(HTTP_STATUS.UNAUTHORIZED).json(
          new ApiError(HTTP_STATUS.UNAUTHORIZED, "User not authenticated")
        );
      }

      // Get user details by ID
      const user = await this.authModel.getUserById(userId);
      if (!user) {
        return res.status(HTTP_STATUS.NOT_FOUND).json(
          new ApiError(HTTP_STATUS.NOT_FOUND, "User not found")
        );
      }

      // If no selected tenant, use the first available tenant or default to 1
      if (!selectedTenantId) {
        selectedTenantId = user.tenant_ids && user.tenant_ids.length > 0 ? user.tenant_ids[0] : 1;
        console.log(`No selected tenant found for resend, using tenant ID: ${selectedTenantId}`);
      }

      console.log(`Resending OTP for user ${userId}, tenant ${selectedTenantId}, email: ${user.user_email}`);

      // Check if previous OTP is still valid (prevent spam)
      // if (user.user_expiry_time) {
      //   const now = new Date();
      //   const expiryTime = new Date(user.user_expiry_time);
      //   const timeDiff = expiryTime.getTime() - now.getTime();
      //   const minutesLeft = Math.floor(timeDiff / (1000 * 60));
      //   console.log(minutesLeft,'minutesLeft')

      //   if (minutesLeft > 8) { // Allow resend only if less than 2 minutes passed
      //     return res.status(HTTP_STATUS.BAD_REQUEST).json(
      //       new ApiError(HTTP_STATUS.BAD_REQUEST, `Please wait ${minutesLeft - 8} more minutes before requesting new OTP`)
      //     );
      //   }
      // } 

      // Generate new 6-digit OTP
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      
      // Set expiry time (10 minutes from now) - ensure UTC
      const now = new Date();
      const expiryTime = new Date(now.getTime() + (10 * 60 * 1000)); // Add 10 minutes in milliseconds
      
      console.log('=== RESEND OTP TIME DEBUG ===');
      console.log('Current time:', now);
      console.log('Current time ISO:', now.toISOString());
      console.log('Expiry time:', expiryTime);
      console.log('Expiry time ISO:', expiryTime.toISOString());
      console.log('=== END TIME DEBUG ===');

      // Update user with new OTP and expiry time
      await this.authModel.updateUserOTP(user.user_id, otp, expiryTime);

      // Send OTP email using selected tenant ID
      const emailResult = await sendOTPEmail(
        selectedTenantId,
        user.user_email,
        otp,
        undefined, // Remove leadId - send as undefined
        10
      );

      if (!emailResult.success) {
        return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
          new ApiError(HTTP_STATUS.INTERNAL_SERVER_ERROR, "Failed to send OTP email")
        );
      }

      const response: ResendOTPResponse = {
        success: true,
        message: "OTP resent successfully",
        data: {
          email: user.user_email,
          expiry_time: expiryTime.toISOString()
        }
      };

      return res.status(HTTP_STATUS.OK).json(
        new ApiResponse(HTTP_STATUS.OK, response.data, response.message)
      );

    } catch (error: any) {
      console.error("Resend OTP error:", error);
      return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
        new ApiError(HTTP_STATUS.INTERNAL_SERVER_ERROR, error.message || "Failed to resend OTP")
      );
    }
  };

  // Verify OTP
  verifyOTP = async (req: any, res: any): Promise<void> => {
    try {

      // Get user ID from authenticated user (from auth middleware)
      const userId = req.user?.user_id;
      const selectedTenantId = req.user?.selected_tenant_id;
      const { otp }: VerifyOTPRequest = req.body;

      if (!req.user) {
        console.error('req.user is undefined - auth middleware may have failed');
        return res.status(HTTP_STATUS.UNAUTHORIZED).json(
          new ApiError(HTTP_STATUS.UNAUTHORIZED, "Authentication failed - user not found in request")
        );
      }

      if (!userId) {
        console.error('user_id is undefined in req.user:', req.user);
        return res.status(HTTP_STATUS.UNAUTHORIZED).json(
          new ApiError(HTTP_STATUS.UNAUTHORIZED, "User ID not found in token")
        );
      }

      if (!otp) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json(
          new ApiError(HTTP_STATUS.BAD_REQUEST, "OTP is required")
        );
      }

      console.log(`Verifying OTP for user ${userId}, selected tenant: ${selectedTenantId}`);

      // Get user details by ID
      const user = await this.authModel.getUserById(userId);
      if (!user) {
        return res.status(HTTP_STATUS.NOT_FOUND).json(
          new ApiError(HTTP_STATUS.NOT_FOUND, "User not found")
        );
      }

      console.log(`Found user: ${user.user_email}, stored OTP: ${user.user_otp}, expiry: ${user.user_expiry_time}`);

      // Verify OTP using the model method
      const verificationResult = await this.authModel.verifyOTP(user.user_email, otp);

      if (!verificationResult.isValid) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json(
          new ApiError(HTTP_STATUS.BAD_REQUEST, verificationResult.message || "Invalid or expired OTP")
        );
      }

      // Clear OTP after successful verification
      await this.authModel.clearUserOTP(user.user_id);

      // Generate new JWT token (same as current token but refreshed)
      const jwtSecret = process.env.JWT_SECRET || "your-secret-key";
      const tokenPayload: TokenPayload = {
        user_id: user.user_id,
        user_name: user.user_name,
        role_name: user.role_name,
        tenant_ids: user.tenant_ids,
        selected_tenant_id: selectedTenantId || (user.tenant_ids && user.tenant_ids.length > 0 ? user.tenant_ids[0] : 1)
      };

      const token = jwt.sign(tokenPayload, jwtSecret, {
        expiresIn: process.env.JWT_EXPIRES_IN || "24h",
      } as any);

      const response: VerifyOTPResponse = {
        success: true,
        message: "OTP verified successfully",
        data: {
          token,
          user: {
            user_id: user.user_id,
            user_name: user.user_name,
            user_email: user.user_email,
            role_name: user.role_name
          }
        }
      };

      return res.status(HTTP_STATUS.OK).json(
        new ApiResponse(HTTP_STATUS.OK, response.data, response.message)
      );

    } catch (error: any) {
      console.error("Verify OTP error:", error);
      return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
        new ApiError(HTTP_STATUS.INTERNAL_SERVER_ERROR, error.message || "Failed to verify OTP")
      );
    }
  };

;

;

  // Test email API for debugging
  testEmail = async (req: any, res: any): Promise<void> => {
    try {
      const userId = req.user?.user_id;
      let selectedTenantId = req.user?.selected_tenant_id;

      if (!userId) {
        return res.status(HTTP_STATUS.UNAUTHORIZED).json(
          new ApiError(HTTP_STATUS.UNAUTHORIZED, "User not authenticated")
        );
      }

      const user = await this.authModel.getUserById(userId);
      if (!user) {
        return res.status(HTTP_STATUS.NOT_FOUND).json(
          new ApiError(HTTP_STATUS.NOT_FOUND, "User not found")
        );
      }

      if (!selectedTenantId) {
        selectedTenantId = user.tenant_ids && user.tenant_ids.length > 0 ? user.tenant_ids[0] : 1;
      }

      // Get email configuration for the tenant
      const { fromEmail } = getTenantEmailConfig(selectedTenantId);

      console.log(`Testing email API for user ${userId}, tenant ${selectedTenantId}, email: ${user.user_email}`);

      // Create a simple test email
      const testEmailRequest = {
        uniqueTransactionNo: generateUniqueTransactionNo(),
        isTransactional: true,
        messages: [{
          sender: fromEmail,
          destinations: [{
            to: [{ destination: user.user_email }]
          }],
          content: {
            subject: "Test Email - API Debug",
            text: "This is a test email to debug the API.",
            html: "<h1>Test Email</h1><p>This is a test email to debug the API.</p>"
          }
        }],
        options: {
          tracking: {
            track: true,
            trackOpens: true,
            trackClicks: true
          },
          clientPriority: 'STANDARD' as const
        }
      };

      console.log('Test email request created:', JSON.stringify(testEmailRequest, null, 2));

      const emailResult = await sendEmail(selectedTenantId, testEmailRequest);

      return res.status(HTTP_STATUS.OK).json(
        new ApiResponse(HTTP_STATUS.OK, {
          emailResult,
          testData: {
            userId,
            selectedTenantId,
            userEmail: user.user_email,
            emailRequest: testEmailRequest
          }
        }, "Email test completed")
      );

    } catch (error: any) {
      console.error("Test email error:", error);
      return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
        new ApiError(HTTP_STATUS.INTERNAL_SERVER_ERROR, error.message || "Failed to test email")
      );
    }
  };

  // Test timezone debugging
  testTimezone = async (req: any, res: any): Promise<void> => {
    try {
      console.log('=== TIMEZONE TEST DEBUG ===');
      
      // Test with your exact expiry time
      const testExpiryTime = '2026-04-23T03:43:07.000Z';
      const now = new Date();
      
      console.log('Test expiry time:', testExpiryTime);
      console.log('Current time:', now.toISOString());
      
      // Parse the expiry time different ways
      const parsed1 = new Date(testExpiryTime);
      const parsed2 = new Date(testExpiryTime.replace('Z', ''));
      const parsed3 = new Date(testExpiryTime.replace('Z', '') + 'Z');
      
      console.log('Parsed method 1 (direct):', parsed1.toISOString());
      console.log('Parsed method 2 (no Z):', parsed2.toISOString());
      console.log('Parsed method 3 (add Z):', parsed3.toISOString());
      
      // Calculate differences
      const diff1 = parsed1.getTime() - now.getTime();
      const diff2 = parsed2.getTime() - now.getTime();
      const diff3 = parsed3.getTime() - now.getTime();
      
      console.log('Difference 1 (minutes):', (diff1 / (1000 * 60)).toFixed(2));
      console.log('Difference 2 (minutes):', (diff2 / (1000 * 60)).toFixed(2));
      console.log('Difference 3 (minutes):', (diff3 / (1000 * 60)).toFixed(2));
      
      // Check which is expired
      console.log('Method 1 expired?:', now.getTime() > parsed1.getTime());
      console.log('Method 2 expired?:', now.getTime() > parsed2.getTime());
      console.log('Method 3 expired?:', now.getTime() > parsed3.getTime());
      
      console.log('=== END TIMEZONE TEST ===');

      return res.status(HTTP_STATUS.OK).json(
        new ApiResponse(HTTP_STATUS.OK, {
          testExpiryTime,
          currentTime: now.toISOString(),
          parsed: {
            method1: parsed1.toISOString(),
            method2: parsed2.toISOString(),
            method3: parsed3.toISOString()
          },
          differences: {
            method1Minutes: (diff1 / (1000 * 60)).toFixed(2),
            method2Minutes: (diff2 / (1000 * 60)).toFixed(2),
            method3Minutes: (diff3 / (1000 * 60)).toFixed(2)
          },
          expired: {
            method1: now.getTime() > parsed1.getTime(),
            method2: now.getTime() > parsed2.getTime(),
            method3: now.getTime() > parsed3.getTime()
          }
        }, "Timezone test completed")
      );

    } catch (error: any) {
      console.error("Timezone test error:", error);
      return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
        new ApiError(HTTP_STATUS.INTERNAL_SERVER_ERROR, error.message || "Failed to test timezone")
      );
    }
  };
loginV2 = async (req: any, res: any): Promise<void> => {
  try {
    const { user_email, user_password } = req.body;

    if (!user_email || !user_password) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json(
        new ApiError(
          HTTP_STATUS.BAD_REQUEST,
          "Email and password are required"
        )
      );
    }

    const userData = await this.authModelV2.loginV2(
      user_email,
      user_password
    );

    // Handle all model-level errors
    if (userData?.error) {
      return res.status(userData.statusCode).json(
        new ApiError(
          userData.statusCode,
          userData.message
        )
      );
    }

    if (!userData) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json(
        new ApiError(
          HTTP_STATUS.BAD_REQUEST,
          API_ERROR_MESSAGES.INVALID_CREDENTIALS
        )
      );
    }

    let response;

    if (
      userData.mu_baseline_user_id != null &&
      userData.multi_tenant_access == 1
    ) {
      response = {
        user: {
          user_id: null,
          mu_baseline_user_id: userData.mu_baseline_user_id,
          user_name: userData.user_name,
          user_email: userData.user_email,
          multi_tenant_access: userData.multi_tenant_access,
          tenants: userData.tenants
        }
      };
    } else {
      response = {
        user: {
          user_id: userData.user_id,
          user_name: userData.user_name,
          user_email: userData.user_email,
          role_name: userData.role_name,
          mu_baseline_user_id: null,
          multi_tenant_access: userData.multi_tenant_access,
          tenants: userData.tenants
        }
      };
    }

    return res.status(HTTP_STATUS.OK).json(
      new ApiResponse(
        HTTP_STATUS.OK,
        response,
        "User data retrieved successfully"
      )
    );
  } catch (error: any) {
    console.error("Login V2 error:", error);

    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
      new ApiError(
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
        error.message || API_ERROR_MESSAGES.INTERNAL_SERVER_ERROR
      )
    );
  }
};

  // Shared V2 send/resend flow. V2 is public, so the user and tenant are
  // resolved from the request body rather than a bearer token.
  private issueOTPV2 = async (req: any, res: any, isResend: boolean): Promise<void> => {
    try {
      const { tenant_id, user_id, mu_baseline_user_id } = req.body;

      if (!tenant_id || (!user_id && !mu_baseline_user_id)) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json(
          new ApiError(HTTP_STATUS.BAD_REQUEST, "tenant_id and user_id (or mu_baseline_user_id) are required")
        );
      }

      const tenantId = Number(tenant_id);
      if (isNaN(tenantId)) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json(
          new ApiError(HTTP_STATUS.BAD_REQUEST, "Invalid tenant_id")
        );
      }

      let actualUserId = user_id ? Number(user_id) : undefined;

      // If mu_baseline_user_id is provided, get the actual user_id for this tenant
      if (mu_baseline_user_id) {
        const baselineUserId = Number(mu_baseline_user_id);
        console.log(`${isResend ? 'Resend' : 'Send'} OTP V2 - Getting user_id using mu_baseline_user_id: ${baselineUserId}, tenant_id: ${tenantId}`);
        
        const userIdFromBaseline = await this.authModelV2.getUserIdByBaselineAndTenant(baselineUserId, tenantId);
        
        if (!userIdFromBaseline) {
          return res.status(HTTP_STATUS.NOT_FOUND).json(
            new ApiError(HTTP_STATUS.NOT_FOUND, "User not found for this tenant")
          );
        }
        
        actualUserId = Number(userIdFromBaseline);
        console.log(`Found actual user_id: ${actualUserId} for baseline_id: ${baselineUserId}`);
      }

      // Validate input
      if (!actualUserId || isNaN(actualUserId)) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json(
          new ApiError(HTTP_STATUS.BAD_REQUEST, "Valid user_id (or mu_baseline_user_id) is required")
        );
      }

      console.log(`${isResend ? 'Resend' : 'Send'} OTP V2 - tenant_id: ${tenantId}, user_id: ${actualUserId}`);

      // Get user details from AuthModelV2
      const user = await this.authModelV2.getUserByIdAndTenant(actualUserId, tenantId);

      if (!user) {
        return res.status(HTTP_STATUS.NOT_FOUND).json(
          new ApiError(HTTP_STATUS.NOT_FOUND, "User not found")
        );
      }

      if (!user.mu_email) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json(
          new ApiError(HTTP_STATUS.BAD_REQUEST, "User email not found")
        );
      }

      console.log(`${isResend ? 'Resending' : 'Sending'} OTP V2 for user ${actualUserId}, tenant ${tenantId}, email: ${user.mu_email}`);

      // Generate 6-digit OTP
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      
      // Set expiry time (10 minutes from now) - ensure UTC
      const now = new Date();
      const expiryTime = new Date(now.getTime() + (10 * 60 * 1000));
      
      console.log('=== SEND OTP V2 TIME DEBUG ===');
      console.log('Current time:', now.toISOString());
      console.log('Expiry time:', expiryTime.toISOString());
      console.log('=== END TIME DEBUG ===');
      
      // Atomically update the OTP and count this send, unless the user has
      // already requested the maximum number without verifying one.
      const otpUpdated = await this.authModelV2.updateUserOTP(actualUserId, tenantId, otp, expiryTime);

      if (!otpUpdated) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json(
          new ApiError(HTTP_STATUS.BAD_REQUEST, "Maximum OTP requests exceeded. Please verify an OTP or contact support.")
        );
      }

      // Send OTP email
      const emailResult = await sendOTPEmail(
        tenantId,
        user.mu_email,
        otp,
        undefined,
        10
      );

      if (!emailResult.success) {
        return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
          new ApiError(HTTP_STATUS.INTERNAL_SERVER_ERROR, "Failed to send OTP email")
        );
      }

      // Send OTP SMS if mobile number exists
      if (user.mu_mobile) {
        console.log(`Sending OTP SMS to mobile: ${user.mu_mobile}`);
        const smsResult = await sendOTPSMS(
          tenantId,
          user.mu_mobile,
          otp,
          10
        );
        
        if (!smsResult.success) {
          console.log('SMS sending failed, but continuing with email OTP');
        }
      }

      const response: SendOTPResponse = {
        success: true,
        message: isResend ? "OTP resent successfully" : "OTP sent successfully",
        data: {
          email: user.mu_email,
          expiry_time: expiryTime.toISOString(),
          user_id: actualUserId
        }
      };

      return res.status(HTTP_STATUS.OK).json(
        new ApiResponse(HTTP_STATUS.OK, response.data, response.message)
      );

    } catch (error: any) {
      console.error(`${isResend ? 'Resend' : 'Send'} OTP V2 error:`, error);
      return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
        new ApiError(HTTP_STATUS.INTERNAL_SERVER_ERROR, error.message || "Failed to send OTP")
      );
    }
  };

  // Send OTP V2 - No authentication required; uses tenant_id and user_id or
  // mu_baseline_user_id from the request body.
  sendOTPV2 = async (req: any, res: any): Promise<void> => {
    return this.issueOTPV2(req, res, false);
  };

  // Resend OTP V2 follows the same public identity resolution, email/SMS
  // delivery, and three-unverified-send limit as the initial send endpoint.
  resendOTPV2 = async (req: any, res: any): Promise<void> => {
    return this.issueOTPV2(req, res, true);
  };

  forgotPasswordV2 = async (req: any, res: any): Promise<void> => {
  try {
    const { user_email } = req.body;

    if (!user_email) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json(
        new ApiError(HTTP_STATUS.BAD_REQUEST, "Email is reforget-passwordquired")
      );
    }

    const userData = await this.authModelV2.forgotPassword(user_email);

    if (userData && (userData as any).error && (userData as any).statusCode === 404) {
      return res.status(HTTP_STATUS.NOT_FOUND).json(
        new ApiError(HTTP_STATUS.NOT_FOUND, (userData as any).message)
      );
    }

    if (!userData) {
      return res.status(HTTP_STATUS.NOT_FOUND).json(
        new ApiError(HTTP_STATUS.NOT_FOUND, "User not found")
      );
    }

    let response;

    if (userData.mu_baseline_user_id != null && userData.multi_tenant_access == 1) {
      response = {
        user: {
          user_id: null,
          mu_baseline_user_id: userData.mu_baseline_user_id,
          user_name: userData.user_name,
          user_email: userData.user_email,
          multi_tenant_access: userData.multi_tenant_access,
          tenants: userData.tenants
        }
      };
    } else {
      response = {
        user: {
          user_id: userData.user_id,
          user_name: userData.user_name,
          user_email: userData.user_email,
          role_name: userData.role_name,
          mu_baseline_user_id: null,
          multi_tenant_access: userData.multi_tenant_access,
          tenants: userData.tenants
        }
      };  
    }

    return res.status(HTTP_STATUS.OK).json(
      new ApiResponse(HTTP_STATUS.OK, response, "User data retrieved successfully")
    );
  } catch (error: any) {
    console.error("Forgot Password V2 error:", error);
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
      new ApiError(HTTP_STATUS.INTERNAL_SERVER_ERROR, error.message || API_ERROR_MESSAGES.INTERNAL_SERVER_ERROR)
    );
  }
};

  verifyOTPV2 = async (req: any, res: any): Promise<void> => {
  try {
    const { tenant_id, user_id, otp, mu_baseline_user_id } = req.body;

    const requestedProductId = req.body.product_id || null;

    const tenantId = Number(tenant_id);
    let actualUserId = user_id ? Number(user_id) : undefined;

    if (mu_baseline_user_id && tenantId) {
      const baselineUserId = Number(mu_baseline_user_id);
      console.log(`Verify OTP V2 - Getting user_id using mu_baseline_user_id: ${baselineUserId}, tenant_id: ${tenantId}`);

      const userIdFromBaseline = await this.authModelV2.getUserIdByBaselineAndTenant(baselineUserId, tenantId);

      if (!userIdFromBaseline) {
        return res.status(HTTP_STATUS.NOT_FOUND).json(
          new ApiError(HTTP_STATUS.NOT_FOUND, "User not found for this tenant")
        );
      }

      actualUserId = Number(userIdFromBaseline);
      console.log(`Found actual user_id: ${actualUserId} for baseline_id: ${baselineUserId}`);
    }

    if (!tenantId || !actualUserId || !otp) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json(
        new ApiError(HTTP_STATUS.BAD_REQUEST, "tenant_id, user_id (or mu_baseline_user_id), and otp are required")
      );
    }

    console.log(`Verify OTP V2 - tenant_id: ${tenantId}, user_id: ${actualUserId}`);

    const user = await this.authModelV2.getUserByIdAndTenant(actualUserId, tenantId);

    if (!user) {
      return res.status(HTTP_STATUS.NOT_FOUND).json(
        new ApiError(HTTP_STATUS.NOT_FOUND, "User not found")
      );
    }

    console.log(`Found user: ${user.mu_email}, verifying OTP`);

    const verificationResult = await this.authModelV2.verifyOTP(actualUserId, tenantId, otp);

    if (!verificationResult.isValid) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json(
        new ApiError(HTTP_STATUS.BAD_REQUEST, verificationResult.message || "Invalid or expired OTP")
      );
    }

    await this.authModelV2.clearUserOTP(actualUserId, tenantId);


    const jwtSecret = process.env.JWT_SECRET || "your-secret-key";


    let roleName = null;
    let role_version = null;
    let mu_mp_id = user.mu_mp_id || null;
    let mu_mrt_id = user.mu_mrt_id || null;
    let mu_internal_type_id = user.mu_internal_type_id || null;
    let roleTypeName = null;
    let productName = null;

    let userProductDetails;
    let userRolesDetails;

    if (mu_internal_type_id == API_MESSAGES.INTERNAL_USER) {

      if (requestedProductId) {
        const products = await this.authModelV2.getProductData(requestedProductId, tenant_id);

        if (!products || products.length === 0) {
          return res.status(HTTP_STATUS.NOT_FOUND).json(
            new ApiError(HTTP_STATUS.NOT_FOUND, "No product access found for user with the specified product_id")
          );
        }

        userProductDetails = products;
        mu_mp_id = requestedProductId;


        const roles = await this.authModelV2.getUserProductRoles(actualUserId, tenant_id,requestedProductId);

        if (!roles || roles.length === 0) {
          return res.status(HTTP_STATUS.BAD_REQUEST).json(
            new ApiError(HTTP_STATUS.BAD_REQUEST, "User does not have a valid role for the specified product")
          );
        }

        userRolesDetails = roles;
        roleName      = roles[0].mrt_name;
        mu_mrt_id     = roles[0].mrt_id;
        role_version  = roles[0].mrt_version;
   

      } else {

        const defaultProduct = user.mu_mp_id;
        const defaultRole    = user.mu_mrt_id;

        if (defaultProduct && defaultRole) {
          mu_mp_id  = defaultProduct;
          mu_mrt_id = defaultRole;

          const products = await this.authModelV2.getProductData(defaultProduct, tenant_id);

          if (!products || products.length === 0) {
            return res.status(HTTP_STATUS.NOT_FOUND).json(
              new ApiError(HTTP_STATUS.NOT_FOUND, "No product access found for user")
            );
          }

          userProductDetails = products;

          const roles = await this.authModelV2.getRoleByUserIdAndRoleId(actualUserId, defaultRole, tenant_id);

          if (!roles || roles.length === 0) {
            return res.status(HTTP_STATUS.NOT_FOUND).json(
              new ApiError(HTTP_STATUS.NOT_FOUND, "No role access for the user")
            );
          }

          userRolesDetails = roles;
          roleName     = roles[0].mrt_name;
          role_version = roles[0].mrt_version;

        } else {
          const data = await fetchUserRolesAndProducts(this.authModelV2, actualUserId, tenant_id);

          userProductDetails = data.products;
          userRolesDetails   = data.userRolesDetails;
          roleName           = data.roleName;
          mu_mrt_id          = data.mu_mrt_id;
          role_version       = data.role_version;
        }
      }

    } else {

      const [products] = await Promise.all([
        this.authModelV2.getUserProducts(actualUserId, tenant_id),
      ]);

      if (!products || products.length < 0) {
        return res.status(HTTP_STATUS.NOT_FOUND).json(
          new ApiError(HTTP_STATUS.NOT_FOUND, "No product access found for user")
        );
      }

      if (requestedProductId) {

        const matchedProduct = products.find(
          (p: any) => String(p.mu_mp_id) === String(requestedProductId) ||
                      String(p.mcp_id)   === String(requestedProductId)
        );

        if (!matchedProduct) {
          return res.status(HTTP_STATUS.BAD_REQUEST).json(
            new ApiError(HTTP_STATUS.BAD_REQUEST, "User does not have access to the specified product")
          );
        }

        userProductDetails = [matchedProduct];
        productName        = matchedProduct.mp_name;
        mu_mp_id           = matchedProduct.mu_mp_id;

        const roles = await this.authModelV2.getUserProductRoles(actualUserId, tenant_id, matchedProduct.mcp_id);

        if (!roles || roles.length === 0) {
          return res.status(HTTP_STATUS.BAD_REQUEST).json(
            new ApiError(HTTP_STATUS.BAD_REQUEST, "User does not have a valid role for the specified product")
          );
        }

        userRolesDetails = roles;
        roleName         = roles[0].role_name;
        mu_mrt_id        = roles[0].mu_mrt_id;
        role_version     = roles[0].mrt_version;
 

      } else {

        userProductDetails = products;
        productName        = products[0].mp_name;
        mu_mp_id           = products[0].mu_mp_id;

        const roles = await this.authModelV2.getUserProductRoles(actualUserId, tenant_id, products[0].mcp_id);

        if (roles && roles.length > 0) {
          userRolesDetails = roles;
          roleName         = roles[0].role_name;
          mu_mrt_id        = roles[0].mu_mrt_id;
          role_version     = roles[0].mrt_version;
        }
      }
    }

    if (!userProductDetails || userProductDetails.length === 0) {
      return res.status(HTTP_STATUS.NOT_FOUND).json(
        new ApiError(HTTP_STATUS.NOT_FOUND, "No product access found for user")
      );
    }

    productName = userProductDetails.mcp_name;
    mu_mp_id    = userProductDetails.mcp_id;


    let permissions: any[] = [];
    if (mu_mp_id) {
      permissions = await this.authModelV2.getPermissionsByProductIdAndRole(tenant_id, mu_mrt_id, user.mu_mat_id,mu_mp_id);
    }

  
    const adminType = await getAdminType(user.mu_mat_id);

    const tokenPayload: TokenPayload = {
      mu_internal_type_id: mu_internal_type_id,
      user_id:             user.mu_id,
      user_name:           user.mu_username,
      role_name:           roleName || 'user',
      tenant_ids:          [tenant_id],
      selected_tenant_id:  tenant_id,
      product_id:          mu_mp_id,
      role_id:             mu_mrt_id,
      product_name:        productName,
      role_version:        role_version,
    };

    const token = jwt.sign(tokenPayload, jwtSecret, {
      expiresIn: process.env.JWT_EXPIRES_IN || "24h",
    } as any);

    const response: VerifyOTPResponse = {
      success: true,
      message: "OTP verified successfully",
      data: {
        token,
        user: {
          user_id:       user.mu_id,
          user_name:     user.mu_username,
          user_email:    user.mu_email,
          role_name:     roleName || 'user',
          product_id:    mu_mp_id,
          role_id:       mu_mrt_id,
          role_version:  role_version,
          product_name:  productName,
          role_type_name: roleTypeName,
          admin_type_id: user.mu_mat_id,
          adminType:     adminType,
        },
        permissions: permissions
      }
    };

    return res.status(HTTP_STATUS.OK).json(
      new ApiResponse(HTTP_STATUS.OK, response.data, response.message)
    );

  } catch (error: any) {
    console.error("Verify OTP V2 error:", error);
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
      new ApiError(HTTP_STATUS.INTERNAL_SERVER_ERROR, error.message || "Failed to verify OTP")
    );
  }
};


  updatePasswordV2 = async (req: any, res: any): Promise<void> => {
  try {
    const { tenant_id, user_id, mu_baseline_user_id, new_password } = req.body;

    let actualUserId = user_id;
    let userEmail = null;

    // If mu_baseline_user_id is provided, get the actual user_id for this tenant
    if (mu_baseline_user_id && tenant_id) {
      console.log(`Update Password - Getting user_id using mu_baseline_user_id: ${mu_baseline_user_id}, tenant_id: ${tenant_id}`);

      const userIdFromBaseline = await this.authModelV2.getUserIdByBaselineAndTenant(mu_baseline_user_id, tenant_id);

      if (!userIdFromBaseline) {
        return res.status(HTTP_STATUS.NOT_FOUND).json(
          new ApiError(HTTP_STATUS.NOT_FOUND, "User not found for this tenant")
        );
      }

      actualUserId = userIdFromBaseline;
      console.log(`Found actual user_id: ${actualUserId} for baseline_id: ${mu_baseline_user_id}`);
    }

    // Validate input
    if (!tenant_id || !actualUserId || !new_password) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json(
        new ApiError(HTTP_STATUS.BAD_REQUEST, "tenant_id, user_id (or mu_baseline_user_id), and new_password are required")
      );
    }

    console.log(`Update Password - tenant_id: ${tenant_id}, user_id: ${actualUserId}`);

    // Get user details
    const user = await this.authModelV2.getUserByIdAndTenant(actualUserId, tenant_id);
    userEmail = user ? user.mu_email : null;





    if (!user) {
      return res.status(HTTP_STATUS.NOT_FOUND).json(
        new ApiError(HTTP_STATUS.NOT_FOUND, "User not found")
      );
    }

    console.log(`Found user: ${user.mu_email}, updating password`);

    // Hash the new password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(new_password, saltRounds);

    // Update password
    const updateResult = await updateMasterUserPasswordByEmail(userEmail, hashedPassword);

    if (!updateResult) {
      return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
        new ApiError(HTTP_STATUS.INTERNAL_SERVER_ERROR, "Failed to update password")
      );
    }

    return res.status(HTTP_STATUS.OK).json(
      new ApiResponse(HTTP_STATUS.OK, null, "Password updated successfully")
    );

  } catch (error: any) {
    console.error("Update Password error:", error);
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
      new ApiError(HTTP_STATUS.INTERNAL_SERVER_ERROR, error.message || API_ERROR_MESSAGES.INTERNAL_SERVER_ERROR)
    );
  }
};

  
    
  getPermissions = async (req: any, res: any): Promise<void> => {
    const tenantId = getTenantId(req);
    const userId = req.user?.user_id;
    try {
      if (!tenantId) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json(
          new ApiError(HTTP_STATUS.BAD_REQUEST, "Tenant ID is required")
        );
      }
      const roleId = req.query.role_id;

      const isExist = await this.authModelV2.checkUserValidRole(userId, tenantId, roleId);

      if (!isExist) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json(
          new ApiError(HTTP_STATUS.BAD_REQUEST, "User does not have a valid role in this tenant")
        );
      }



      const subModuleId = req.query.sub_module_id;
      
      // Validate that subModuleId is provided
      if (!subModuleId) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json(
          new ApiError(HTTP_STATUS.BAD_REQUEST, "sub_module_id query parameter is required")
        );
      }

    const permissions = await this.authModelV2.getOperationCategoryAndOpeationBySubModuleId(subModuleId,roleId,tenantId);

      
      return res.status(HTTP_STATUS.OK).json(
        new ApiResponse(HTTP_STATUS.OK, permissions, "Permissions retrieved successfully")
      );
    }
    catch (error: any) {  
      console.error("Get permissions error:", error);
      return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
        new ApiError(HTTP_STATUS.INTERNAL_SERVER_ERROR, error.message || "Failed to retrieve permissions")
      );
    }
  };


  getUserAccessByRoleIdAndTenant = async (
  req: any,
  res: any
): Promise<void> => {
  const tenantId = getTenantId(req);
  const userId = req.user?.user_id;

  try {
    if (!tenantId) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json(
        new ApiError(HTTP_STATUS.BAD_REQUEST, "Tenant ID is required")
      );
    }

    const roleId = Number(req.query.role_id);

    if (!roleId) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json(
        new ApiError(HTTP_STATUS.BAD_REQUEST, "role_id is required")
      );
    }

    const userData = await this.authModelV2.getUserByIdAndTenant(
      userId,
      tenantId
    );

    if (!userData) {
      return res.status(HTTP_STATUS.NOT_FOUND).json(
        new ApiError(HTTP_STATUS.NOT_FOUND, "User not found")
      );
    }

    const roleData = await this.authModelV2.getRoleByUserIdAndRoleId(
      userId,
      roleId,
      tenantId
    );

    if (!roleData || roleData.length === 0) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json(
        new ApiError(
          HTTP_STATUS.BAD_REQUEST,
          "User does not have a valid role in this tenant"
        )
      );
    }

    const selectedRole = roleData[0];

    const accessData =
      await this.authModelV2.getPermissionsByProductIdAndRole(
        tenantId,
        roleId,
        userData.mu_mat_id,
        selectedRole.mrt_mp_id
      );

    const jwtSecret = process.env.JWT_SECRET || "your-secret-key";

    const tokenPayload: TokenPayload = {
      mu_internal_type_id: userData.mu_internal_type_id,
      user_id: userData.mu_id,
      user_name: userData.mu_username,
      role_name: selectedRole.mrt_name,
      tenant_ids: [tenantId],
      selected_tenant_id: tenantId,
      product_id: selectedRole.mrt_mp_id,
      role_id: selectedRole.mrt_id,
      role_version: selectedRole.mrt_version,
    };

    const token = jwt.sign(tokenPayload, jwtSecret, {
      expiresIn: process.env.JWT_EXPIRES_IN || "24h",
    } as any);

    return res.status(HTTP_STATUS.OK).json(
      new ApiResponse(
        HTTP_STATUS.OK,
        {
          token,
          role_id: selectedRole.mrt_id,
          role_name: selectedRole.mrt_name,
          role_version: selectedRole.mrt_version,
          accessData,
        },
        "Access data retrieved successfully"
      )
    );
  } catch (error: any) {
    console.error("Get user access by role and tenant error:", error);

    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
      new ApiError(
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
        error.message || "Failed to retrieve access data"
      )
    );
  }
};
}
