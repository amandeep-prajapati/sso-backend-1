# Send OTP V2 API Documentation

## Overview
The Send OTP V2 API is a public endpoint that sends an OTP (One-Time Password) to a user's email address based on `tenant_id` and `user_id` provided in the request body. This API does not require authentication.

## Endpoint
```
POST /auth/send-otp-v2
```

## Authentication
**No authentication required** - This is a public endpoint.

## Request Body
```json
{
  "tenant_id": 1,
  "user_id": 123
}
```

### Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| tenant_id | number | Yes | The tenant ID where the user belongs |
| user_id | number | Yes | The user ID to send OTP to |

## Response

### Success Response (200 OK)
```json
{
  "statusCode": 200,
  "data": {
    "email": "user@example.com",
    "expiry_time": "2026-04-29T10:30:00.000Z"
  },
  "message": "OTP sent successfully"
}
```

### Error Responses

#### 400 Bad Request - Missing Parameters
```json
{
  "statusCode": 400,
  "message": "tenant_id and user_id are required"
}
```

#### 400 Bad Request - User Email Not Found
```json
{
  "statusCode": 400,
  "message": "User email not found"
}
```

#### 404 Not Found - User Not Found
```json
{
  "statusCode": 404,
  "message": "User not found"
}
```

#### 500 Internal Server Error - Email Send Failed
```json
{
  "statusCode": 500,
  "message": "Failed to send OTP email"
}
```

## Implementation Details

### Process Flow
1. Validates that both `tenant_id` and `user_id` are provided
2. Queries the `master_users` table in the specified tenant database
3. Retrieves user email address
4. Generates a random 6-digit OTP
5. Sets OTP expiry time to 10 minutes from current time
6. Updates the user record with OTP and expiry time (`mu_otp`, `mu_expiry_time`)
7. Sends OTP email using the tenant's email configuration
8. Returns success response with masked email and expiry time

### Database Updates
The API updates the following fields in the `master_users` table:
- `mu_otp`: Stores the generated 6-digit OTP
- `mu_otp_expiry_time`: Stores the expiry timestamp (10 minutes from generation)

### OTP Details
- **Format**: 6-digit numeric code
- **Validity**: 10 minutes
- **Storage**: Stored in `mu_otp` field in `master_users` table
- **Expiry**: Stored in `mu_otp_expiry_time` field in UTC format

## Example Usage

### cURL Example
```bash
curl -X POST http://localhost:3000/auth/send-otp-v2 \
  -H "Content-Type: application/json" \
  -d '{
    "tenant_id": 1,
    "user_id": 123
  }'
```

### JavaScript/Fetch Example
```javascript
const response = await fetch('http://localhost:3000/auth/send-otp-v2', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    tenant_id: 1,
    user_id: 123
  })
});

const data = await response.json();
console.log(data);
```

## Differences from V1 API

| Feature | V1 (`/auth/send-otp`) | V2 (`/auth/send-otp-v2`) |
|---------|----------------------|--------------------------|
| Authentication | Required (JWT token) | Not required |
| User Identification | From JWT token | From request body (`tenant_id`, `user_id`) |
| Tenant Selection | From JWT token or user's first tenant | From request body |
| Use Case | Authenticated users requesting OTP | Public OTP request with known user/tenant IDs |

## Security Considerations
- This is a public endpoint - implement rate limiting to prevent abuse
- Consider adding CAPTCHA for production environments
- Monitor for suspicious patterns (multiple requests for same user)
- Email addresses are returned in response - consider masking if needed
- OTP is valid for 10 minutes only
- Previous OTP is overwritten when new OTP is requested

## Related APIs
- `POST /auth/login-v2` - Login without token, returns user and tenant data
- `POST /auth/verify-otp` - Verify OTP (V1, requires authentication)
- `POST /auth/resend-otp` - Resend OTP (V1, requires authentication)

## Resend OTP V2
**Endpoint:** `POST /auth/resend-otp-v2`  
**Authentication:** No bearer token required. This follows the V2 public OTP flow and identifies the user from `tenant_id` plus `user_id` or `mu_baseline_user_id` in the request body.

The request body and delivery behavior are the same as `send-otp-v2`. A successful request returns `OTP resent successfully`. Resends count toward the same limit as sends: at most three OTP requests are allowed before one is successfully verified. Successful verification resets this counter.
