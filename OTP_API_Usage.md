# OTP API Usage Guide

## APIs Created

### 1. Send OTP API
**Endpoint:** `POST /auth/send-otp`
**Authentication:** Required (Bearer Token)

**Request Body:** Empty (uses authenticated user's ID)
```json
{}
```

**Response:**
```json
{
  "success": true,
  "message": "OTP sent successfully",
  "data": {
    "email": "user@example.com",
    "expiry_time": "2024-04-23T10:30:00.000Z"
  }
}
```

### 2. Resend OTP API
**Endpoint:** `POST /auth/resend-otp`
**Authentication:** Required (Bearer Token)

**Request Body:** Empty (uses authenticated user's ID)
```json
{}
```

**Response:**
```json
{
  "success": true,
  "message": "OTP resent successfully",
  "data": {
    "email": "user@example.com",
    "expiry_time": "2024-04-23T10:40:00.000Z"
  }
}
```

## cURL Commands

### 1. Send OTP
```bash
curl -X POST http://localhost:8000/auth/send-otp \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{}'
```

### 2. Resend OTP
```bash
curl -X POST http://localhost:8000/auth/resend-otp \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{}'
```

## Features

1. **Authentication Required** - Both APIs require valid JWT token
2. **Uses req.user.user_id** - Gets user ID from authenticated session
3. **Uses req.user.selected_tenant_id** - Uses selected tenant for email configuration
4. **Professional Email Template** - Beautiful HTML email with company branding
5. **Rate Limiting** - Prevents spam by allowing resend only after 2 minutes
6. **Database Integration** - Stores OTP and expiry time in `master_users` table
7. **Security** - 6-digit OTP with 10-minute expiry

## Database Fields Added

You need to add these fields to your `master_users` table:
```sql
ALTER TABLE master_users 
ADD COLUMN user_otp VARCHAR(6) NULL,
ADD COLUMN user_expiry_time TIMESTAMP NULL;
```

## How It Works

1. User must be authenticated (have valid JWT token)
2. System gets user_id from req.user.user_id
3. System gets selected_tenant_id from req.user.selected_tenant_id
4. Fetches user email from master_users table using user_id
5. Generates 6-digit OTP and saves to database
6. Sends professional email using tenant-specific configuration
7. User can resend OTP (with rate limiting)
8. OTP expires after 10 minutes

## Email Template Features

- Responsive design
- Company-specific branding based on tenant
- Security warnings
- Professional styling
- Large, easy-to-read OTP code

### 3. Verify OTP API
**Endpoint:** `POST /auth/verify-otp`
**Authentication:** Required (Bearer Token)

**Request Body:**
```json
{
  "otp": "123456"
}
```

**cURL Command:**
```bash
curl -X POST http://localhost:8000/auth/verify-otp \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "otp": "123456"
  }'
```

**Response:**
```json
{
  "success": true,
  "message": "OTP verified successfully",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "user_id": 123,
      "user_name": "John Doe",
      "user_email": "user@example.com",
      "role_name": "User"
    }
  }
}
```

## Verify OTP Error Responses

### Invalid OTP:
```json
{
  "success": false,
  "message": "Invalid or expired OTP",
  "statusCode": 400
}
```

### Missing OTP:
```json
{
  "success": false,
  "message": "OTP is required",
  "statusCode": 400
}
```

## Complete OTP Flow

1. **Send OTP** - User requests OTP via `/auth/send-otp`
2. **Receive Email** - User gets OTP in email (6-digit code)
3. **Verify OTP** - User submits OTP via `/auth/verify-otp`
4. **Success** - User gets refreshed JWT token
5. **Optional Resend** - User can resend OTP if needed via `/auth/resend-otp`