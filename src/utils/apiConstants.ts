// HTTP Status Codes
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_SERVER_ERROR: 500
} as const;

// API Messages - Success Messages
export const API_MESSAGES = {
  // Common Success Messages
  SUCCESS: 'success',
  OPERATION_SUCCESS: 'Operation completed successfully',
  INTERNAL_USER: '1',
  EXTERNAL_USER: '2',

  // Authentication Messages
  LOGIN_SUCCESS: 'Login successful',
  LOGOUT_SUCCESS: 'Logout successful',
  TOKEN_VALID: 'Token is valid',
  TOKEN_REFRESHED: 'Token refreshed successfully',
  
  // User Messages
  USER_CREATED: 'User created successfully',
  USER_UPDATED: 'User updated successfully',
  USER_DELETED: 'User deleted successfully',
  USER_FETCHED: 'User fetched successfully',
  USERS_FETCHED: 'Users fetched successfully',
  
  // Tenant Messages
  TENANT_SELECTED: 'Tenant selected successfully',
  TENANTS_FETCHED: 'User tenants retrieved successfully',
  TENANT_ACCESS_GRANTED: 'Tenant access granted',
  
  // Role Messages
  ROLES_FETCHED: 'Roles fetched successfully',
  ROLE_FETCHED: 'Role fetched successfully',
  
  // Dashboard Messages
  DASHBOARD_ACCESS_GRANTED: 'Dashboard access granted',
  ADMIN_DASHBOARD_ACCESS: 'Admin dashboard access granted',
  USER_DASHBOARD_ACCESS: 'User dashboard access granted'
} as const;

// API Messages - Error Messages
export const API_ERROR_MESSAGES = {
  // Common Error Messages
  SOMETHING_WENT_WRONG: 'something went wrong',
  VALIDATION_ERROR: 'Validation error occurred',
  INTERNAL_SERVER_ERROR: 'Internal server error',
  
  // Authentication & Authorization Errors
  INVALID_CREDENTIALS: 'Invalid username or password',
  INVALID_TOKEN: 'Invalid token',
  TOKEN_EXPIRED: 'Token has expired',
  TOKEN_NOT_PROVIDED: 'No token provided',
  UNAUTHORIZED_ACCESS: 'You are not authorized to access this resource',
  ACCESS_DENIED: 'Access denied',
  INSUFFICIENT_PERMISSIONS: 'Access denied. Insufficient permissions.',
  
  // Dashboard Access Errors
  DASHBOARD_ACCESS_DENIED: 'Access denied to this dashboard',
  ADMIN_DASHBOARD_ONLY: 'Access denied. You don\'t have permission to access the Admin Dashboard. Please use the User Dashboard.',
  USER_DASHBOARD_ONLY: 'Access denied. You don\'t have permission to access the User Dashboard. Please use the Admin Dashboard.',
  INVALID_DASHBOARD_TYPE: 'Invalid dashboard type requested',
  
  // User Errors
  USER_NOT_FOUND: 'User not found',
  USER_INACTIVE: 'User account is inactive',
  USER_BLOCKED: 'User account is blocked',
  USER_NOT_FOUND_OR_INACTIVE: 'User not found or inactive',
  USER_ALREADY_EXISTS: 'User with this email already exists',
  
  // Tenant Errors
  TENANT_NOT_FOUND: 'Tenant not found',
  TENANT_ACCESS_DENIED: 'Access denied. You do not have permission to access this tenant.',
  NO_TENANTS_FOUND: 'No accessible tenants found for this user',
  INVALID_TENANT_ID: 'Invalid or missing tenant ID',
  TENANT_ID_REQUIRED: 'Tenant ID is required',
  
  // Validation Errors
  USERNAME_REQUIRED: 'Username is required',
  PASSWORD_REQUIRED: 'Password is required',
  EMAIL_REQUIRED: 'Email is required',
  INVALID_EMAIL: 'Invalid email format',
  PASSWORD_TOO_SHORT: 'Password must be at least 6 characters',
  TENANT_ID_INVALID: 'Valid tenant ID is required',
  
  // Role Errors
  ROLE_NOT_FOUND: 'Role not found',
  INVALID_ROLE: 'Invalid role specified',
  
  // Session Errors
  SESSION_EXPIRED: 'Your session has expired. Please login again.',
  MULTIPLE_LOGIN_ATTEMPTS: 'Too many login attempts from this IP, please try again after 15 minutes.',
  
  // Operation Failed Errors
  FAILED_TO_CREATE_USER: 'Failed to create user',
  FAILED_TO_UPDATE_USER: 'Failed to update user',
  FAILED_TO_DELETE_USER: 'Failed to delete user',
  FAILED_TO_FETCH_USER: 'Failed to fetch user',
  FAILED_TO_FETCH_USERS: 'Failed to fetch users',
  FAILED_TO_AUTHENTICATE: 'Failed to authenticate user',
  FAILED_TO_VALIDATE_TOKEN: 'Failed to validate token',
  FAILED_TO_REFRESH_TOKEN: 'Failed to refresh token',
  FAILED_TO_FETCH_TENANTS: 'Failed to fetch tenants',
  FAILED_TO_SELECT_TENANT: 'Failed to select tenant',
  
  // Database Errors
  DATABASE_CONNECTION_FAILED: 'Failed to connect to database',
  DATABASE_QUERY_FAILED: 'Database query failed',
  
  // Service Health Errors
  SERVICE_HEALTH_CHECK_FAILED: 'Service health check failed',
  SERVICE_UNAVAILABLE: 'Service temporarily unavailable'
} as const;
