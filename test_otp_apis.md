# OTP API Testing Commands

## Prerequisites
1. Make sure your server is running on port 3000 (or update the URLs accordingly)
2. Ensure you have valid user credentials in the database
3. Make sure the OTP columns exist in master_users table (user_otp, user_expiry_time)

## Step-by-Step Testing

### 1. Login to get JWT token
```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "user_email": "your-email@example.com",
    "user_password": "your-password",
    "dashboard_type": 2,
    "source": 2
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "user_id": 1,
      "user_name": "Test User",
      "user_email": "test@example.com",
      "role_name": "User"
    }
  },
  "message": "Login successful"
}
```

### 2. Send OTP (Protected - requires JWT token)
```bash
curl -X POST http://localhost:3000/auth/send-otp \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE"
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "email": "test@example.com",
    "expiry_time": "2026-04-23T14:32:12.000Z"
  },
  "message": "OTP sent successfully"
}
```

### 3. Resend OTP (Protected - requires JWT token)
```bash
curl -X POST http://localhost:3000/auth/resend-otp \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE"
```

### 4. Verify OTP (Protected - requires JWT token)
```bash
curl -X POST http://localhost:3000/auth/verify-otp \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE" \
  -d '{
    "otp": "123456"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "user_id": 1,
      "user_name": "Test User",
      "user_email": "test@example.com",
      "role_name": "User"
    }
  },
  "message": "OTP verified successfully"
}
```

## Debug Endpoints

### 5. Test Auth Middleware
```bash
curl -X GET http://localhost:3000/auth/test-auth \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE"
```

### 6. Test Database Structure
```bash
curl -X GET http://localhost:3000/auth/test-database \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE"
```

### 7. Test Timezone Handling (Debug endpoint)
```bash
curl -X GET http://localhost:3000/auth/test-timezone \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE"
```

### 8. Test Email API
```bash
curl -X POST http://localhost:3000/auth/test-email \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE"
```

## Common Issues and Solutions

### Issue 1: "Authentication failed - user not found in request"
- **Cause**: JWT token is invalid or auth middleware failed
- **Solution**: Check if JWT_SECRET is set in .env file, verify token format

### Issue 2: "Invalid or expired OTP"
- **Cause**: Timezone mismatch between storage and verification
- **Solution**: Fixed in the latest code - now stores times in UTC format

### Issue 3: "Email API key not found for tenant"
- **Cause**: Missing email API keys in .env file
- **Solution**: Add tenant-specific email API keys to .env:
  ```
  RUPEE112_EMAIL_API_KEY=your_api_key_here
  BHARATALOAN_EMAIL_API_KEY=your_api_key_here
  # etc.
  ```

### Issue 4: "User not found"
- **Cause**: Database query issues or user doesn't exist
- **Solution**: Check database connection and user data

## Notes:
- Replace `YOUR_JWT_TOKEN_HERE` with the actual JWT token from login response
- Replace `your-email@example.com` and `your-password` with valid credentials
- The OTP APIs use the authenticated user's email from the JWT token
- No need to pass email in request body for OTP APIs
- OTP expires in 10 minutes
- Resend OTP has rate limiting (can only resend after 2 minutes)