# Login V2 API Documentation

## Endpoint
`POST /auth/login-v2`

## Description
New login API that searches for users across tenant databases (1-5), retrieves tenant information from user_tenant_mapping, and returns JWT token.

## Request Body
```json
{
  "user_email": "user@example.com",
  "user_password": "password123"
}
```

## Flow

### 1. Search in Tenant Databases (NOT Master)
- Loops through tenant IDs: 1, 2, 3, 4, 5
- Uses `executeQuery` with each tenant ID to search in tenant-specific databases
- Queries `master_users` table with columns:
  - `mu_id` - User ID
  - `mu_username` - Username
  - `mu_email` - Email
  - `mu_password` - Password (bcrypt or plain text)
  - `mu_mrt_id` - Role ID
  - `mu_status` - Status (1 = active)
  - `mu_deleted` - Deleted flag (0 = not deleted)
- When user is found and password verified: BREAK

### 2. Get Role Name
- Gets role name from `master_roles` table in that tenant database
- Uses `mu_mrt_id` to find role

### 3. Check mu_multi_tenant_access
- If `mu_multi_tenant_access = 1`:
  - Get `mu_baseline_user_id` from the found user
  - Query ALL tenant databases (1-5) using `executeQuery`
  - Find all users with matching `mu_baseline_user_id`
  - Collect `mu_tenant_id` from all matching users
  - Use `executeMasterQuery` to get tenant names from `master_tenant` table where `mt_id` matches collected tenant IDs
- If `mu_multi_tenant_access != 1`:
  - Use only the tenant where user was found
  - Get tenant name from `master_tenant` table using `executeMasterQuery`

### 4. Return User Data
- Returns user data with tenant information
- NO TOKEN is generated or returned

## Response - Success (200)
```json
{
  "statusCode": 200,
  "data": {
    "user": {
      "user_id": 123,
      "user_name": "John Doe",
      "user_email": "user@example.com",
      "role_name": "Admin",
      "multi_tenant_access": 1,
      "tenant_ids": [1, 2],
      "tenant_names": ["Rupee112", "BhartaLoan"]
    }
  },
  "message": "User data retrieved successfully"
}
```

Note: NO TOKEN is returned, only user data with tenant information.

## Response - Error (403)
```json
{
  "statusCode": 403,
  "message": "Invalid credentials"
}
```

## Response - Error (400)
```json
{
  "statusCode": 400,
  "message": "Email and password are required"
}
```

## Database Tables Used

### Tenant Databases (executeQuery with tenantId 1-5)
- `master_users` - User information with MasterUser interface columns
  - `mu_id` - User ID
  - `mu_username` - Username
  - `mu_email` - Email
  - `mu_password` - Password
  - `mu_mrt_id` - Role ID
  - `mu_status` - Status
  - `mu_deleted` - Deleted flag
  - `mu_multi_tenant_access` - Multi-tenant access flag (0 or 1)
  - `mu_baseline_user_id` - Baseline user ID for multi-tenant matching
  - `mu_tenant_id` - Tenant ID
- `master_roles` - Role names

### Master Database (executeMasterQuery)
- `master_tenant` - Tenant names
  - `mt_id` - Tenant ID
  - `tenant_name` - Tenant name

## Key Features
- Searches only in tenant databases (1-5), NOT in master database
- Uses MasterUser interface column names (mu_* prefix)
- Password verification (bcrypt and plain text support)
- Checks `mu_multi_tenant_access` field to determine tenant access
- If multi-tenant access = 1, uses `mu_baseline_user_id` to find matching users in all tenant databases
- Collects tenant IDs from matching users and gets tenant names from `master_tenant`
- Returns user data with tenant information (NO TOKEN)
- Breaks loop when user found and password verified
- Returns 404 if user not found in any tenant database
