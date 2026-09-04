# Verify OTP V2 API Documentation

## Overview
The Verify OTP V2 API is a public endpoint that verifies an OTP (One-Time Password) for a user based on `tenant_id`, `user_id`, and `otp` provided in the request body. This API does not require authentication and returns a JWT token upon successful verification.

## Endpoint
```
POST /auth/verify-otp-v2
```

## Authentication
**No authentication required** - This is a public endpoint.

## Request Body
```json
{
  "tenant_id": 1,
  "user_id": 123,
  "otp": "123456"
}
```

### Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| tenant_id | number | Yes | The tenant ID where the user belongs |
| user_id | number | Yes | The user ID to verify OTP for |
| otp | string | Yes | The 6-digit OTP code sent to user's email/SMS |

## Response

### Success Response (200 OK)
```json
{
  "statusCode": 200,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "user_id": 123,
      "user_name": "john_doe",
      "user_email": "john@example.com",
      "role_name": "admin"
    }
  },
  "message": "OTP verified successfully"
}
```

### Error Responses

#### 400 Bad Request - Missing Parameters
```json
{
  "statusCode": 400,
  "message": "tenant_id, user_id, and otp are required"
}
```

#### 400 Bad Request - Invalid OTP
```json
{
  "statusCode": 400,
  "message": "Invalid OTP. Please enter the correct OTP sent to your email."
}
```

#### 400 Bad Request - Expired OTP
```json
{
  "statusCode": 400,
  "message": "OTP has expired at 2026-04-29 16:00:00. Please request a new OTP."
}
```

#### 400 Bad Request - No OTP Found
```json
{
  "statusCode": 400,
  "message": "No OTP found. Please request a new OTP."
}
```

#### 404 Not Found - User Not Found
```json
{
  "statusCode": 404,
  "message": "User not found"
}
```

#### 500 Internal Server Error
```json
{
  "statusCode": 500,
  "message": "Failed to verify OTP"
}
```

## Implementation Details

### Process Flow
1. Validates that `tenant_id`, `user_id`, and `otp` are provided
2. Queries the `master_users` table in the specified tenant database
3. Retrieves stored OTP and expiry time (`mu_otp`, `mu_otp_expiry_time`)
4. Checks if OTP exists
5. Checks if OTP has expired (10 minutes validity)
6. Compares provided OTP with stored OTP
7. If valid, clears the OTP from database
8. Generates JWT token with user and tenant information
9. Returns token and user details

### Database Operations
- **Read**: Retrieves `mu_otp` and `mu_otp_expiry_time` from `master_users` table
- **Update**: Clears `mu_otp` and `mu_otp_expiry_time` after successful verification

### OTP Validation Rules
- **Expiry Check**: OTP must be used within 10 minutes of generation
- **Match Check**: Provided OTP must exactly match stored OTP
- **One-Time Use**: OTP is cleared after successful verification

### JWT Token
Upon successful verification, a JWT token is generated with:
- `user_id`: User's ID
- `user_name`: User's username
- `role_name`: User's role
- `tenant_ids`: Array containing the tenant ID
- `selected_tenant_id`: The verified tenant ID
- **Expiry**: 24 hours (configurable via `JWT_EXPIRES_IN` env variable)

## Example Usage

### cURL Example
```bash
curl -X POST http://localhost:3000/auth/verify-otp-v2 \
  -H "Content-Type: application/json" \
  -d '{
    "tenant_id": 1,
    "user_id": 123,
    "otp": "123456"
  }'
```

### JavaScript/Fetch Example
```javascript
const response = await fetch('http://localhost:3000/auth/verify-otp-v2', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    tenant_id: 1,
    user_id: 123,
    otp: '123456'
  })
});

const data = await response.json();

if (data.statusCode === 200) {
  // Store the token
  localStorage.setItem('token', data.data.token);
  console.log('User:', data.data.user);
} else {
  console.error('Verification failed:', data.message);
}
```

### Complete Flow Example
```javascript
// Step 1: Send OTP
const sendOtpResponse = await fetch('http://localhost:3000/auth/send-otp-v2', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    tenant_id: 1,
    user_id: 123
  })
});

// Step 2: User receives OTP via email/SMS and enters it

// Step 3: Verify OTP
const verifyResponse = await fetch('http://localhost:3000/auth/verify-otp-v2', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    tenant_id: 1,
    user_id: 123,
    otp: '123456' // User-entered OTP
  })
});

const result = await verifyResponse.json();

if (result.statusCode === 200) {
  // Authentication successful
  const token = result.data.token;
  const user = result.data.user;
  
  // Use token for subsequent API calls
  console.log('Authenticated:', user);
}
```

## Differences from V1 API

| Feature | V1 (`/auth/verify-otp`) | V2 (`/auth/verify-otp-v2`) |
|---------|------------------------|--------------------------|
| Authentication | Required (JWT token) | Not required |
| User Identification | From JWT token | From request body (`tenant_id`, `user_id`) |
| OTP Input | Request body | Request body |
| Database Fields | `user_otp`, `user_expiry_time` | `mu_otp`, `mu_otp_expiry_time` |
| Token Generation | Refreshes existing token | Generates new token |
| Use Case | Authenticated users verifying OTP | Public OTP verification with known user/tenant IDs |

## Security Considerations
- This is a public endpoint - implement rate limiting to prevent brute force attacks
- OTP is valid for only 10 minutes
- OTP is cleared after successful verification (one-time use)
- Failed verification attempts should be logged
- Consider implementing account lockout after multiple failed attempts
- Monitor for suspicious patterns (multiple failed attempts for same user)
- JWT token expires after 24 hours by default

## Related APIs
- `POST /auth/login-v2` - Login without token, returns user and tenant data
- `POST /auth/send-otp-v2` - Send OTP (V2, no authentication required)
- `POST /auth/verify-otp` - Verify OTP (V1, requires authentication)

## Error Handling Best Practices
- Always check the `statusCode` in the response
- Display user-friendly error messages
- For expired OTP, redirect user to request new OTP
- For invalid OTP, allow user to retry (with attempt limit)
- Log all verification attempts for security monitoring
