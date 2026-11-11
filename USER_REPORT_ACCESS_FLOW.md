# User Access to Reports: End-to-End Flow

This document explains how report access is represented in this SSO backend, how to grant it, how the client reads it, and what the report API must enforce.

## Important: what this repository does and does not do

- Access is organized as **tenant → user → role → operation**. A report should be represented as an operation (or a set of report operations) in the tenant database.
- The backend exposes endpoints that return role-based access/menu data. It does **not** contain report routes or an API for creating/updating role grants. Configure the operation and mapping rows using the system that administers these tables or an authorized database migration/administration process.
- The permission response is not a substitute for authorization. The frontend can hide a report link, but each report-data endpoint must independently verify the caller's role and the required report operation before returning data.
- Do not use a role name such as `Admin` as the authorization check. Use the authenticated user, selected tenant, active role assignment, and operation mapping.

## Access model and database relationships

| Purpose | Current table / fields used by the code |
|---|---|
| User has a role in a tenant | `master_user_role_operation_mapping`: `murom_mu_id`, `murom_mt_id`, `murom_mrt_id`, `murom_active`, `murom_deleted` |
| Role belongs to a product | `master_role_type`: `mrt_id`, `mrt_name`, `mrt_mp_id`, `mrt_active`, `mrt_deleted` |
| Role is granted an operation | `role_operation_mapping`: `rom_mrt_id`, `rom_mo_id`, `rom_active`, `rom_deleted` |
| Operation / permission identifier | `master_operation`: `mo_id`, `mo_code`, `mo_name`, `mo_msub_id`, `mo_moc_id`, `mo_mp_id`, `mo_active`, `mo_deleted` |
| Menu/feature grouping | `master_super_module` → `master_module` → `master_sub_module` → `master_operation_category` → `master_operation` |
| Tenant database selection | JWT `selected_tenant_id`; queries use that tenant ID |

**Column-name note:** the runtime queries use `murom_mrt_id` for the assigned role, while the TypeScript interface `MasterUserRoleOperationMapping` currently says `murom_role_id`. Follow the actual deployed schema and runtime query (`murom_mrt_id`) when checking or maintaining assignments; reconcile this mismatch before creating schema changes.

## How to grant report access

1. **Choose the tenant.** All role and operation queries are run against the selected tenant's database. Ensure the report operation and its mappings exist in the tenant where the user will work.
2. **Register the report feature.** Add/verify active rows in the feature hierarchy: super-module, module, sub-module, operation category, and operation. Give the report an identifiable operation code, for example `REPORT_VIEW`; add distinct codes such as `REPORT_EXPORT` only if those actions need separate authorization. The codebase has no report-specific operation seed, so use the operation IDs/codes already established by your deployment.
3. **Grant operations to a role.** Add active, non-deleted `role_operation_mapping` rows linking the intended `rom_mrt_id` to each `rom_mo_id` required for the report. Grant only the actions the role should perform (view, export, etc.).
4. **Assign the role to the user in that tenant.** Add/activate the corresponding user-role mapping row for `murom_mu_id`, `murom_mt_id`, and `murom_mrt_id`. The row must be active and not deleted. A user with no active assignment for the selected tenant cannot use that role.
5. **Verify product and status.** Ensure the role is active/not deleted and belongs to the expected product (`mrt_mp_id`); ensure the product and operation hierarchy rows are active/not deleted. Use the correct role/product IDs for the tenant.
6. **Sign in and select the tenant/product/role.** Use the application's configured login/OTP flow. The V2 OTP verification flow issues a JWT containing the selected tenant, product, role ID, and role name, and returns permission/menu data. For an already authenticated user, `/api/auth/accessByRoleId?role_id=<roleId>` can return access data for a role assigned to that user in the current tenant and issue a token for that role.
7. **Check the response and test the report endpoint.** Confirm the report operation is in the access data. Then test both an allowed and a denied request directly against the report-data API; a missing UI link alone is not a denial test.

There is no role-management or user-role-assignment route in `src/routes/index.ts` in this repository. Do not assume that `/auth/permissions` grants rights—it only reads permission data.

## Runtime request flow

1. A protected request sends `Authorization: Bearer <JWT>`.
2. `authMiddleware` verifies the JWT signature and fills `req.user` with claims such as `user_id`, `selected_tenant_id`, `role_id`, `product_id`, and `tenant_ids`.
3. `getTenantId(req)` picks `selected_tenant_id` (otherwise the first tenant ID).
4. The client can retrieve the role's access/menu data from the endpoints below.
5. For each report API request, the report service must confirm the role is still assigned to the user in the selected tenant and that the role has the required report operation. Only then should it fetch/report data, scoped to the same tenant and any user-level data restrictions.

JWT claims establish identity and selected context; they do not prove that the current role-operation grant is still valid. Re-check the database (or use a suitably invalidated authorization cache) on protected report endpoints so revoked grants stop working even before the token expires.

## Relevant endpoints

The Express app mounts routes below `/api/`.

### Read permissions for a sub-module

`GET /api/auth/permissions?role_id=<roleId>&sub_module_id=<subModuleId>`

- Requires a bearer token (`authMiddleware`).
- Tenant comes from the token's `selected_tenant_id` (or first `tenant_ids` entry).
- Returns operation categories and role-operation entries for the supplied sub-module and role.
- Intended for permission/menu details. It is not a write/grant endpoint and does not authorize report data requests by itself.

### Read access data / switch to a role

`GET /api/auth/accessByRoleId?role_id=<roleId>`

- Requires a bearer token.
- Checks that the requested role is assigned to the authenticated user in the selected tenant.
- Returns a new token for the selected role and an `accessData` menu/feature structure.
- The role assignment is checked for user and tenant; report handlers still need an operation-level check.

### V2 OTP verification

`POST /api/auth/verify-otp-v2`

- Public route in the current route table; request body and OTP rules are described in the existing OTP API documentation.
- On successful verification, the handler resolves the user's product/role and returns a JWT and initial permissions/access data.
- Treat the returned permission data as client display information; authorize every report API request server-side.

### Other relevant routes

- `GET /api/auth/user-tenants` lists tenants available to a signed-in user.
- `POST /api/auth/select-tenant` verifies tenant membership and returns a token with the selected tenant.
- `POST /api/auth/validate-token` verifies a supplied bearer JWT, but does not check whether a report operation is allowed.

## Suggested checks for administrators

Use read-only queries against the **target tenant database** to inspect the IDs and grants before testing. Adjust the report code and IDs to your deployment:

```sql
-- Find the report operation(s) and their feature grouping.
SELECT mo.mo_id, mo.mo_code, mo.mo_name, mo.mo_mp_id,
       mo.mo_msub_id, mo.mo_moc_id, mo.mo_active, mo.mo_deleted
FROM master_operation AS mo
WHERE mo.mo_code IN ('REPORT_VIEW', 'REPORT_EXPORT');

-- Confirm which operations are granted to a role.
SELECT rom.rom_mrt_id, rom.rom_mo_id, rom.rom_active, rom.rom_deleted,
       mo.mo_code, mo.mo_name
FROM role_operation_mapping AS rom
JOIN master_operation AS mo ON mo.mo_id = rom.rom_mo_id
WHERE rom.rom_mrt_id = <role_id>
  AND mo.mo_code IN ('REPORT_VIEW', 'REPORT_EXPORT');

-- Confirm the user has that role in the selected tenant.
SELECT murom.murom_mu_id, murom.murom_mt_id, murom.murom_mrt_id,
       murom.murom_active, murom.murom_deleted
FROM master_user_role_operation_mapping AS murom
WHERE murom.murom_mu_id = <user_id>
  AND murom.murom_mt_id = <tenant_id>
  AND murom.murom_mrt_id = <role_id>;
```

These are inspection queries only. Use your deployment's authorized role/user administration procedure to write grant rows, preserve audit fields, and apply soft-delete/status conventions.

## Required authorization behavior for report APIs

For an endpoint such as `GET /reports/...`, the backend should:

1. Require `authMiddleware`.
2. Obtain `user_id`, `selected_tenant_id`, and `role_id` from verified claims—not from client-supplied query/body IDs.
3. Confirm an active, non-deleted assignment for `(user_id, selected_tenant_id, role_id)` in `master_user_role_operation_mapping`.
4. Confirm an active, non-deleted `role_operation_mapping` for the report's stable operation ID/code.
5. Deny by default (401 for missing/invalid identity; 403 for authenticated but unauthorized access).
6. Query report data only within the selected tenant and enforce any row/department/ownership restrictions separately.
7. Apply the same checks to exports, downloads, background jobs, and alternate report endpoints; do not rely on frontend visibility.

## Current implementation caveats to fix before relying on it for security

1. **`GET /auth/permissions` has an empty-result check bug.** `checkUserValidRole()` returns an array, but the controller tests `if (!isExist)`. An empty array is truthy in JavaScript, so an unassigned role can pass this check. Change the condition to reject when the result is missing or has length zero, and validate/normalize `role_id` before querying.
2. **Permission metadata is not enforced by `authMiddleware`.** It verifies only the JWT signature and copies claims to `req.user`; it does not check role-operation grants. Add operation authorization to every report-data handler (or a reusable permission middleware).
3. **The role access tree may omit operation items.** `getOperationsByRoleAndProduct()` assembles the module/sub-module tree but does not append operation objects, while the sub-module permission endpoint joins `role_operation_mapping`. Verify the response shape used by the UI and fix it if the UI needs role-specific operation IDs/codes.
4. **Admin-type bypass:** `getPermissionsByProductIdAndRole()` returns all active product operations when `mat_id === 6`, instead of filtering by role. Confirm this admin type is intended to receive every product permission; never let this menu shortcut bypass server-side report authorization.
5. **Role query product scoping:** the role-based operation query is filtered by role but does not explicitly filter `mo.mo_mp_id`. Validate role/product consistency in the data and add product scoping where required.
6. **No report endpoint or grant-management API is present here.** This document describes the existing access model and the required report authorization pattern; implementation of report-specific enforcement belongs in the report service/routes.

## Source locations

- Route registrations: `src/routes/index.ts`
- JWT middleware: `src/middleware/auth.middleware.ts`
- Tenant extraction: `src/utils/getTenantId.ts`
- Permission and role access controllers: `src/controllers/AuthController.ts`
- Role/operation and user-role queries: `src/model/AuthModelV2.ts`
- Mapping interfaces: `src/interfaces/RoleOperationMapping.ts`, `src/interfaces/MasterUserRoleOperationMapping.ts`
