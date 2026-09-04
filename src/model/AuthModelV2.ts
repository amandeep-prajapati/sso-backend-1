import bcrypt from 'bcryptjs';
import { executeQuery, executeMasterQuery } from "../utils/executeQuery";
import { profile } from 'console';

export class AuthModelV2 {

  // Get user ID by baseline user ID and tenant ID
  async getUserIdByBaselineAndTenant(baselineUserId: number, tenantId: number): Promise<{ mu_id: number; mu_email: string } | null> {
    try {
      const query = `
        SELECT mu_id
        FROM master_users
        WHERE mu_baseline_user_id = ? AND mu_deleted = 0 AND mu_status = 1
      `;

      const users = await executeQuery(query, tenantId, [baselineUserId]);

      if (!users || users.length === 0) {
        return null;
      }

      return users[0].mu_id;
    } catch (error) {
      console.error('Error in getUserIdByBaselineAndTenant:', error);
      throw error;
    }
  }

    async getUserIdByEmailAndTenant(userEmail: string, tenantId: number): Promise<number | null> {
    try {
      const query = `
        SELECT mu_id
        FROM master_users
        WHERE mu_email = ? AND mu_deleted = 0 AND mu_status = 1
      `;

      const users = await executeQuery(query, tenantId, [userEmail.trim()]);

      if (!users || users.length === 0) {
        return null;
      }

      return users[0].mu_id;
    } catch (error) {
      console.error('Error in getUserIdByEmailAndTenant:', error);
      throw error;
    }
  }

  // Get user by ID and tenant ID
  async getUserByIdAndTenant(userId: number, tenantId: number): Promise<any | null> {
    try {
      const query = `
        SELECT mu_id, mu_username, mu_email, mu_mobile, mu_mrt_id, mu_mp_id, mu_status, mu_deleted , mu_internal_type_id,mu_mat_id

        FROM master_users
        WHERE mu_id = ? AND mu_deleted = 0 AND mu_status = 1
      `;

      const users = await executeQuery(query, tenantId, [userId]);

      if (!users || users.length === 0) {
        return null;
      }

      const user = users[0];

      
      return {
        mu_id: user.mu_id,
        mu_username: user.mu_username,
        mu_email: user.mu_email,
        mu_mobile: user.mu_mobile,
        mu_mrt_id: user.mu_mrt_id,
        mu_mp_id: user.mu_mp_id,
        mu_internal_type_id: user.mu_internal_type_id,
        mu_mat_id: user.mu_mat_id,
      };
    } catch (error) {
      console.error('Error in getUserByIdAndTenant:', error);
      throw error;
    }
  }

  // Update user OTP and expiry time
  async updateUserOTP(userId: number, tenantId: number, otp: string, expiryTime: Date): Promise<void> {
    try {
      const query = `
        UPDATE master_users
        SET mu_otp = ?, mu_otp_expiry_time = ?
        WHERE mu_id = ?
      `;

      await executeQuery(query, tenantId, [otp, expiryTime, userId]);
      console.log(`OTP updated for user ${userId} in tenant ${tenantId}`);
    } catch (error) {
      console.error('Error in updateUserOTP:', error);
      throw error;
    }
  }

  // Verify OTP
  async verifyOTP(userId: number, tenantId: number, otp: string): Promise<{ isValid: boolean; message?: string }> {
    try {
      const query = `
        SELECT mu_otp, mu_otp_expiry_time
        FROM master_users
        WHERE mu_id = ? AND mu_deleted = 0 AND mu_status = 1
      `;

      const users = await executeQuery(query, tenantId, [userId]);

      if (!users || users.length === 0) {
        return { isValid: false, message: 'User not found' };
      }

      const user = users[0];

      // Check if OTP exists
      if (!user.mu_otp) {
        return { isValid: false, message: 'No OTP found. Please request a new OTP.' };
      }

      // Check if OTP is expired
      const now = new Date();
      const expiry = new Date(user.mu_otp_expiry_time);

      console.log('=== VERIFY OTP V2 TIME DEBUG ===');
      console.log('Current time:', now.toISOString());
      console.log('Expiry time:', expiry.toISOString());
      console.log('Is expired?:', now > expiry);
      console.log('=== END TIME DEBUG ===');

      if (now > expiry) {
        const localTime = new Date(user.mu_otp_expiry_time).toLocaleString("en-IN", {
          timeZone: "Asia/Kolkata"
        });
        return { isValid: false, message: `OTP has expired at ${localTime}. Please request a new OTP.` };
      }

      // Check if OTP matches
      if (user.mu_otp != otp) {
        return { isValid: false, message: 'Invalid OTP. Please enter the correct OTP sent to your email.' };
      }

      return { isValid: true };
    } catch (error) {
      console.error('Error in verifyOTP:', error);
      throw error;
    }
  }

  // Clear user OTP after successful verification
  async clearUserOTP(userId: number, tenantId: number): Promise<void> {
    try {
      const query = `
        UPDATE master_users
        SET mu_otp = NULL, mu_otp_expiry_time = NULL
        WHERE mu_id = ?
      `;

      await executeQuery(query, tenantId, [userId]);
      console.log(`OTP cleared for user ${userId} in tenant ${tenantId}`);
    } catch (error) {
      console.error('Error in clearUserOTP:', error);
      throw error;
    }
  }

  // Get role name by role ID
  async getRoleName(roleId: number, tenantId: number): Promise<string | null> {
    try {
      const query = `SELECT mrt_name FROM master_role_type WHERE mrt_id = ?`;
      const roles = await executeQuery(query, tenantId, [roleId]);
      return roles && roles.length > 0 ? roles[0].mrt_name : null;
    } catch (error) {
      console.error('Error in getRoleName:', error);
      return null;
    }
  }

  // Get role details by mrt_id from master_role_type
  async getRoleTypeDetails(mrtId: number, tenantId: number): Promise<any | null> {
    try {
      const query = `SELECT mrt_id, mrt_name, mrt_mp_id FROM master_role_type WHERE mrt_id = ?`;
      const roles = await executeQuery(query, tenantId, [mrtId]);
      return roles && roles.length > 0 ? roles[0] : null;
    } catch (error) {
      console.error('Error in getRoleTypeDetails:', error);
      return null;
    }
  }

  // Get product name by mcp_id from master_client_product
  async getProductName(mcpId: number, tenantId: number): Promise<string | null> {
    try {
      const query = `SELECT mcp_name FROM master_client_product WHERE mcp_id = ?`;
      const products = await executeQuery(query, tenantId, [mcpId]);
      return products && products.length > 0 ? products[0].mcp_name : null;
    } catch (error) {
      console.error('Error in getProductName:', error);
      return null;
    }
  }

    async getProductData(mcpId: number, tenantId: number): Promise<string | null> {
    try {
      const query = `SELECT * FROM master_client_product WHERE mcp_id = ? AND mcp_deleted = 0 AND mcp_active = 1`;
      const products = await executeQuery(query, tenantId, [mcpId]);
      return products && products.length > 0 ? products[0] : null;
    } catch (error) {
      console.error('Error in getProductName:', error);
      return null;
    }
  }

  // Get operations allowed for a role and product
async getOperationsByRoleAndProduct(
  roleId: number,
  tenantId: number
): Promise<any[]> {
  try {
    const query = `
      SELECT DISTINCT
        mo.mo_id,
        mo.mo_name,
        mo.mo_description,
        mo.mo_msub_id,
        mo.mo_moc_id,

        mm.mm_id,
        mm.mm_code,
        mm.mm_name,
        mm.mm_label,
        mm.mm_description,
        mm.mm_icon,
        mm.mm_url,
        mm.mm_display_order,
        mm.mm_hierarchy,

        msm.msm_id,
        msm.msm_code,
        msm.msm_name,
        msm.msm_label,
        msm.msm_description,
        msm.msm_icon,
        msm.msm_url,
        msm.msm_hierarchy,

        msub.msub_id,
        msub.msub_code,
        msub.msub_name,
        msub.msub_label,
        msub.msub_hierarchy,
        msub.msub_description

      FROM role_operation_mapping rom

      JOIN master_operation mo
        ON mo.mo_id = rom.rom_mo_id

      JOIN master_module mm
        ON mm.mm_id = mo.mo_mm_id

      JOIN master_super_module msm
        ON msm.msm_id = mm.mm_msm_id

      JOIN master_sub_module msub
        ON msub.msub_id = mo.mo_msub_id

      WHERE rom.rom_mrt_id = ?
      AND rom.rom_active = 1
      AND rom.rom_deleted = 0

      AND mo.mo_active = 1
      AND mo.mo_deleted = 0

      AND mm.mm_deleted = 0
      AND mm.mm_active = 1

      AND msm.msm_deleted = 0
      AND msm.msm_active = 1

      AND msub.msub_deleted = 0
      AND msub.msub_active = 1

      ORDER BY
        msm.msm_id,
        mm.mm_id,
        msub.msub_id,
        mo.mo_id
    `;

    const rows = (await executeQuery(query, tenantId, [roleId])) || [];

    const superModuleMap = new Map<number, any>();

    for (const row of rows) {

      
      if (!superModuleMap.has(row.msm_id)) {
        superModuleMap.set(row.msm_id, {
          msm_id: row.msm_id,
          msm_code: row.msm_code,
          msm_name: row.msm_name,
          msm_label: row.msm_label,
          msm_description: row.msm_description,
          msm_icon: row.msm_icon,
          msm_url: row.msm_url,
          msm_hierarchy: row.msm_hierarchy,
          modules: []
        });
      }

      const superModule = superModuleMap.get(row.msm_id);

     
      if (!row.msm_hierarchy) {
        continue;
      }

      let module = superModule.modules.find(
        (m: any) => m.mm_id === row.mm_id
      );

      if (!module) {
        module = {
          mm_id: row.mm_id,
          mm_code: row.mm_code,
          mm_name: row.mm_name,
          mm_label: row.mm_label,
          mm_description: row.mm_description,
          mm_icon: row.mm_icon,
          mm_url: row.mm_url,
          mm_display_order: row.mm_display_order,
          mm_hierarchy: row.mm_hierarchy,
          subModules: []
        };

        superModule.modules.push(module);
      }

 
      if (!row.mm_hierarchy) {
        continue;
      }

     
      let subModule = module.subModules.find(
        (sm: any) => sm.msub_id === row.msub_id
      );

      if (!subModule) {
        subModule = {
          msub_id: row.msub_id,
          msub_code: row.msub_code,
          msub_name: row.msub_name,
          msub_label: row.msub_label,
          msub_description: row.msub_description,
          msub_hierarchy: row.msub_hierarchy
        };

        module.subModules.push(subModule);
      }

     
      if (!row.msub_hierarchy) {
        continue;
      }
    }

    return Array.from(superModuleMap.values());

  } catch (error) {
    console.error('Error in getOperationsByRoleAndProduct:', error);
    return [];
  }
}

async getOperationsByProduct(
  productId: number,
  tenantId: number
): Promise<any[]> {
  try {
    const query = `
      SELECT DISTINCT
        mo.mo_id,
        mo.mo_name,
        mo.mo_description,
        mo.mo_msub_id,
        mo.mo_moc_id,

        mm.mm_id,
        mm.mm_code,
        mm.mm_name,
        mm.mm_label,
        mm.mm_description,
        mm.mm_icon,
        mm.mm_url,
        mm.mm_display_order,
        mm.mm_hierarchy,

        msm.msm_id,
        msm.msm_code,
        msm.msm_name,
        msm.msm_label,
        msm.msm_description,
        msm.msm_icon,
        msm.msm_url,
        msm.msm_hierarchy,

        msub.msub_id,
        msub.msub_code,
        msub.msub_name,
        msub.msub_label,
        msub.msub_hierarchy,
        msub.msub_description

      FROM role_operation_mapping rom

      JOIN master_operation mo
        ON mo.mo_id = rom.rom_mo_id
        AND mo.mo_active = 1
        AND mo.mo_deleted = 0

      JOIN master_module mm
        ON mm.mm_id = mo.mo_mm_id
        AND mm.mm_active = 1
        AND mm.mm_deleted = 0

      JOIN master_super_module msm
        ON msm.msm_id = mm.mm_msm_id
        AND msm.msm_active = 1
        AND msm.msm_deleted = 0

      JOIN master_sub_module msub
        ON msub.msub_id = mo.mo_msub_id
        AND msub.msub_active = 1
        AND msub.msub_deleted = 0

      WHERE mo.mo_mp_id = ?
        AND rom.rom_active = 1
        AND rom.rom_deleted = 0

      ORDER BY
        msm.msm_id,
        mm.mm_id,
        msub.msub_id,
        mo.mo_id
    `;

    const rows =
      (await executeQuery(query, tenantId, [productId])) || [];

    const superModuleMap = new Map<number, any>();

    for (const row of rows) {
      if (!superModuleMap.has(row.msm_id)) {
        superModuleMap.set(row.msm_id, {
          msm_id: row.msm_id,
          msm_code: row.msm_code,
          msm_name: row.msm_name,
          msm_label: row.msm_label,
          msm_description: row.msm_description,
          msm_icon: row.msm_icon,
          msm_url: row.msm_url,
          msm_hierarchy: row.msm_hierarchy,
          modules: []
        });
      }

      const superModule = superModuleMap.get(row.msm_id);

      let module = superModule.modules.find(
        (m: any) => m.mm_id === row.mm_id
      );

      if (!module) {
        module = {
          mm_id: row.mm_id,
          mm_code: row.mm_code,
          mm_name: row.mm_name,
          mm_label: row.mm_label,
          mm_description: row.mm_description,
          mm_icon: row.mm_icon,
          mm_url: row.mm_url,
          mm_display_order: row.mm_display_order,
          mm_hierarchy: row.mm_hierarchy,
          subModules: []
        };

        superModule.modules.push(module);
      }

      let subModule = module.subModules.find(
        (sm: any) => sm.msub_id === row.msub_id
      );

      if (!subModule) {
        subModule = {
          msub_id: row.msub_id,
          msub_code: row.msub_code,
          msub_name: row.msub_name,
          msub_label: row.msub_label,
          msub_description: row.msub_description,
          msub_hierarchy: row.msub_hierarchy,
          operations: []
        };

        module.subModules.push(subModule);
      }

      const operationExists = subModule.operations.find(
        (op: any) => op.mo_id === row.mo_id
      );

      if (!operationExists) {
        subModule.operations.push({
          mo_id: row.mo_id,
          mo_name: row.mo_name,
          mo_description: row.mo_description,
          mo_moc_id: row.mo_moc_id
        });
      }
    }

    return Array.from(superModuleMap.values());
  } catch (error) {
    console.error("Error in getOperationsByProduct:", error);
    return [];
  }
}

 async getPermissionsByProductIdAndRole(
  tenantId: number,
  roleId: number,
  mat_id?: number,
  mu_mp_id?: number
): Promise<any[]> {
  try {
    let operations: any[] = [];

    if (mat_id === 6) {
      // Get all permissions for product
      operations = await this.getOperationsByProduct(
        mu_mp_id,
        tenantId
      );
    } else {
      // Get permissions based on role
      operations = await this.getOperationsByRoleAndProduct(
        roleId,
        tenantId
      );
    }

    return operations.map((superModule) => ({
      superModule
    }));
  } catch (error) {
    console.error(
      "Error in getPermissionsByProductIdAndRole:",
      error
    );
    return [];
  }
}

 async getOperationCategoryAndOpeationBySubModuleId(
  subModuleId: number,
  roleId: number,
  tenantId: number
): Promise<any[]> {
  try {
    const query = `
      SELECT
    moc.moc_id,
    moc.moc_msub_id,
    moc.moc_mp_id,
    moc.moc_code,
    moc.moc_name,
    moc.moc_description,
    moc.moc_active,
    moc.moc_deleted,
    moc.moc_created_at,
    moc.moc_created_by,
    moc.moc_updated_at,
    moc.moc_updated_by,
    moc.moc_created_date,
    moc.moc_hierarchy,
    moc.moc_display_order,
    moc.moc_label,
    moc.moc_icon,

    mo.mo_id,
    mo.mo_mm_id,
    mo.mo_msm_id,
    mo.mo_mp_id,
    mo.mo_msub_id,
    mo.mo_moc_id,
    mo.mo_code,
    mo.mo_name,
    mo.mo_description,
    mo.mo_active,
    mo.mo_deleted,
    mo.mo_created_at,
    mo.mo_created_by,
    mo.mo_updated_at,
    mo.mo_updated_by,
    mo.mo_created_date,
    mo.mo_display_order,
    mo.mo_label,
    mo.mo_icon,

    rom.rom_id,
    rom.rom_mrt_id,
    rom.rom_mo_id,
    rom.rom_name,
    rom.rom_active,
    rom.rom_deleted,
    rom.rom_created_at,
    rom.rom_created_by,
    rom.rom_updated_at,
    rom.rom_updated_by

FROM master_operation_category moc

INNER JOIN master_operation mo
    ON mo.mo_moc_id = moc.moc_id
    AND mo.mo_deleted = 0
    AND mo.mo_active = 1

INNER JOIN role_operation_mapping rom
    ON rom.rom_mo_id = mo.mo_id
    AND rom.rom_mrt_id = ?
    AND rom.rom_deleted = 0
    AND rom.rom_active = 1

WHERE moc.moc_deleted = 0
  AND moc.moc_active = 1
  AND mo.mo_msub_id = ?

ORDER BY
    moc.moc_display_order,
    mo.mo_display_order,
    moc.moc_id,
    mo.mo_id;
    `;

    const rows =
      (await executeQuery(query, tenantId, [roleId, subModuleId])) || [];

    const operationCategoryMap = new Map<number, any>();

    for (const row of rows) {

      if (!operationCategoryMap.has(row.moc_id)) {
        operationCategoryMap.set(row.moc_id, {
          moc_id: row.moc_id,
          moc_msub_id: row.moc_msub_id,
          moc_mp_id: row.moc_mp_id,
          moc_code: row.moc_code,
          moc_name: row.moc_name,
          moc_description: row.moc_description,
          moc_active: row.moc_active,
          moc_deleted: row.moc_deleted,
          moc_created_at: row.moc_created_at,
          moc_created_by: row.moc_created_by,
          moc_updated_at: row.moc_updated_at,
          moc_updated_by: row.moc_updated_by,
          moc_created_date: row.moc_created_date,
          moc_hierarchy: row.moc_hierarchy,
          moc_display_order: row.moc_display_order,
          moc_label: row.moc_label,
          moc_icon: row.moc_icon,
          operations: []
        });
      }

      const operationCategory = operationCategoryMap.get(row.moc_id);

        if (!row.moc_hierarchy) {
        continue;
      }

    
      const operationExists = operationCategory.operations.find(
        (op: any) => op.mo_id === row.mo_id
      );

      if (!operationExists) {
        operationCategory.operations.push({
          mo_id: row.mo_id,
          mo_mm_id: row.mo_mm_id,
          mo_msm_id: row.mo_msm_id,
          mo_mp_id: row.mo_mp_id,
          mo_msub_id: row.mo_msub_id,
          mo_moc_id: row.mo_moc_id,
          mo_code: row.mo_code,
          mo_name: row.mo_name,
          mo_description: row.mo_description,
          mo_active: row.mo_active,
          mo_deleted: row.mo_deleted,
          mo_created_at: row.mo_created_at,
          mo_created_by: row.mo_created_by,
          mo_updated_at: row.mo_updated_at,
          mo_updated_by: row.mo_updated_by,
          mo_created_date: row.mo_created_date,
          mo_display_order: row.mo_display_order,
          mo_label: row.mo_label,
          mo_icon: row.mo_icon
        });
      }
    }

    return Array.from(operationCategoryMap.values());

  } catch (error) {
    console.error(
      'Error in getOperationCategoryAndOpeationBySubModuleId:',
      error
    );
    return [];
  }
}


async loginV2(userEmail: string, password: string): Promise<any | null> {
  try {
    const activeTenantQuery = `
      SELECT mt_id
      FROM master_tenant
      WHERE mt_active = 1
      AND mt_deleted = 0
    `;

    const tenantIds = await executeMasterQuery(activeTenantQuery);

    const tenantUserQuery = `
      SELECT
        mu_id,
        mu_username,
        mu_email,
        mu_password,
        mu_mrt_id,
        mu_status,
        mu_deleted,
        mu_multi_tenant_access,
        mu_baseline_user_id,
        mu_tenant_id
      FROM master_users
      WHERE TRIM(mu_email) = ?
      AND mu_deleted = 0
      AND mu_status = 1
    `;

    let foundUser: any = null;
    let foundTenantId: number | null = null;
    let emailFound = false;

    // Search user across all tenants
    for (const tenant of tenantIds) {
      try {
        const tenantId = tenant.mt_id;

        const tenantUsers = await executeQuery(
          tenantUserQuery,
          tenantId,
          [userEmail.trim()]
        );

        if (tenantUsers && tenantUsers.length > 0) {
          emailFound = true;

          const user = tenantUsers[0];

          let isPasswordValid = false;

          const isBcryptHash =
            user.mu_password &&
            user.mu_password.startsWith("$2");

          if (isBcryptHash) {
            isPasswordValid = await bcrypt.compare(
              password,
              user.mu_password
            );
          } else {
            isPasswordValid =
              password === user.mu_password;
          }

          if (isPasswordValid) {
            foundUser = user;
            foundTenantId = tenantId;
            break;
          }

          console.log(
            `Password validation failed for user in tenant ${tenantId}`
          );
        }
      } catch (error) {
        console.log(
          `Error searching tenant ${tenant.mt_id}:`,
          error
        );
        continue;
      }
    }

    if (!emailFound) {
      return {
        error: true,
        statusCode: 404,
        message: "Email not found. Please enter a registered email."
      };
    }


    if (!foundUser || !foundTenantId) {
      return {
        error: true,
        statusCode: 404,
        message: "Please enter the correct password"
      };
    }

    // Get role name
    let roleName = null;

    if (foundUser.mu_mrt_id) {
      const roleQuery = `
        SELECT mrt_name
        FROM master_role_type
        WHERE mrt_id = ?
      `;

      const roles = await executeQuery(
        roleQuery,
        foundTenantId,
        [foundUser.mu_mrt_id]
      );

      roleName =
        roles && roles.length > 0
          ? roles[0].mrt_name
          : null;
    }

    let tenants: any[] = [];

    console.log(
      "Checking user access across all tenants"
    );

   const baselineUserQuery = `
      SELECT
        mu_id,
        mu_tenant_id,
        mu_baseline_user_id
      FROM master_users
      WHERE mu_email = ?
      AND mu_deleted = 0
      AND mu_status = 1
    `;

    const foundTenantIdsSet = new Set<number>();

    // Store baseline user ID against tenant ID
    const tenantBaselineUserMap = new Map<number, number | null>();

    for (const tenant of tenantIds) {
      try {
        const tenantId = tenant.mt_id;

        const matchingUsers = await executeQuery(
          baselineUserQuery,
          tenantId,
          [userEmail.trim()]
        );

        if (matchingUsers && matchingUsers.length > 0) {
          matchingUsers.forEach((u: any) => {
            const actualTenantId =
              u.mu_tenant_id || tenantId;

            foundTenantIdsSet.add(actualTenantId);

            // Store the baseline user ID for this specific tenant
            tenantBaselineUserMap.set(
              actualTenantId,
              u.mu_baseline_user_id || null
            );
          });
        }
      } catch (error) {
        console.log(
          `Error checking tenant ${tenant.mt_id}:`,
          error
        );
      }
    }

    const tenantIdsArray = Array.from(
      foundTenantIdsSet
    );

    if (tenantIdsArray.length > 0) {
      const placeholders = tenantIdsArray
        .map(() => "?")
        .join(",");

      const tenantQuery = `
        SELECT
          mt_id,
          mt_code,
          mt_name
        FROM master_tenant
        WHERE mt_id IN (${placeholders})
      `;

      tenants = await executeMasterQuery(
        tenantQuery,
        tenantIdsArray
      );
    }

    // ---------------------------------------------------------
    // Fallback if no tenants found
    // ---------------------------------------------------------
    if (tenants.length === 0) {
      const tenantQuery = `
        SELECT
          mt_id,
          mt_code,
          mt_name
        FROM master_tenant
        WHERE mt_id = ?
      `;

      const tenantResult = await executeMasterQuery(
        tenantQuery,
        [foundTenantId]
      );

      tenants =
        tenantResult && tenantResult.length > 0
          ? tenantResult
          : [
              {
                mt_id: foundTenantId,
                mt_code: `TENANT${foundTenantId}`,
                mt_name: `Tenant ${foundTenantId}`
              }
            ];

      if (!tenantBaselineUserMap.has(foundTenantId)) {
        tenantBaselineUserMap.set(
          foundTenantId,
          foundUser.mu_baseline_user_id || null
        );
      }
    }

    return {
      user_id: foundUser.mu_id,
      user_name: foundUser.mu_username,
      user_email: foundUser.mu_email,
      role_name: roleName,
      mu_baseline_user_id:
        foundUser.mu_baseline_user_id || null,
      multi_tenant_access:
        foundUser.mu_multi_tenant_access,
      tenants: tenants.map((t: any) => ({
        tenant_id: t.mt_id,
        tenant_code: t.mt_code,
        tenant_name: t.mt_name,
        mu_baseline_user_id:
          tenantBaselineUserMap.get(t.mt_id) || null
      }))
    };
  } catch (error) {
    console.error("Error in loginV2:", error);
    throw error;
  }
}

async updateUserPassword(userId: number, tenantId: number, hashedPassword: string): Promise<boolean> {
  try {
    const updateQuery = `
      UPDATE master_users
      SET mu_password = ?
      WHERE mu_id = ?
      AND mu_tenant_id = ?
      AND mu_deleted = 0
      AND mu_status = 1
    `;

    const result = await executeQuery(updateQuery, tenantId, [hashedPassword, userId, tenantId]);

    return result && result.affectedRows > 0;
  } catch (error) {
    console.error(`Error updating password for user ${userId} in tenant ${tenantId}:`, error);
    throw error;
  }
}

async forgotPassword(userEmail: string): Promise<any | null> {
  try {
    const activeTenantQuery = `
      SELECT mt_id
      FROM master_tenant
      WHERE mt_active = 1
      AND mt_deleted = 0
    `;

    const tenantIds = await executeMasterQuery(activeTenantQuery);

    const tenantUserQuery = `
      SELECT
        mu_id,
        mu_username,
        mu_email,
        mu_mrt_id,
        mu_status,
        mu_deleted,
        mu_multi_tenant_access,
        mu_baseline_user_id,
        mu_tenant_id
      FROM master_users
      WHERE TRIM(mu_email) = ?
      AND mu_deleted = 0
      AND mu_status = 1
    `;

    let foundUser: any = null;
    let foundTenantId: number | null = null;

    // Search user across all tenants
    for (const tenant of tenantIds) {
      try {
        const tenantId = tenant.mt_id;

        const tenantUsers = await executeQuery(
          tenantUserQuery,
          tenantId,
          [userEmail.trim()]
        );

        if (tenantUsers && tenantUsers.length > 0) {
          foundUser = tenantUsers[0];
          foundTenantId = tenantId;
          break;
        }
      } catch (error) {
        console.log(`Error searching tenant ${tenant.mt_id}:`, error);
        continue;
      }
    }

    if (!foundUser || !foundTenantId) {
      return {
        error: true,
        statusCode: 404,
        message: "User not found"
      };
    }

    // Get role name
    let roleName = null;

    if (foundUser.mu_mrt_id) {
      const roleQuery = `
        SELECT mrt_name
        FROM master_role_type
        WHERE mrt_id = ?
      `;

      const roles = await executeQuery(
        roleQuery,
        foundTenantId,
        [foundUser.mu_mrt_id]
      );

      roleName =
        roles && roles.length > 0
          ? roles[0].mrt_name
          : null;
    }

    // Collect all tenant IDs this user belongs to
    const baselineUserQuery = `
      SELECT
        mu_id,
        mu_tenant_id,
        mu_baseline_user_id
      FROM master_users
      WHERE mu_email = ?
      AND mu_deleted = 0
      AND mu_status = 1
    `;

    const foundTenantIdsSet = new Set<number>();

    // Map tenant_id -> mu_baseline_user_id
    const tenantBaselineUserMap = new Map<
      number,
      number | null
    >();

    for (const tenant of tenantIds) {
      try {
        const tenantId = tenant.mt_id;

        const matchingUsers = await executeQuery(
          baselineUserQuery,
          tenantId,
          [userEmail.trim()]
        );

        if (matchingUsers && matchingUsers.length > 0) {
          matchingUsers.forEach((u: any) => {
            const actualTenantId =
              u.mu_tenant_id || tenantId;

            foundTenantIdsSet.add(actualTenantId);

            // Store baseline user ID for this specific tenant
            tenantBaselineUserMap.set(
              actualTenantId,
              u.mu_baseline_user_id || null
            );
          });
        }
      } catch (error) {
        console.log(
          `Error checking tenant ${tenant.mt_id}:`,
          error
        );
      }
    }

    const tenantIdsArray = Array.from(
      foundTenantIdsSet
    );
    let tenants: any[] = [];

   if (tenantIdsArray.length > 0) {
      const placeholders = tenantIdsArray
        .map(() => "?")
        .join(",");

      const tenantQuery = `
        SELECT
          mt_id,
          mt_code,
          mt_name
        FROM master_tenant
        WHERE mt_id IN (${placeholders})
      `;

      tenants = await executeMasterQuery(
        tenantQuery,
        tenantIdsArray
      );
    }

    if (tenants.length === 0) {
      const tenantQuery = `
        SELECT
          mt_id,
          mt_code,
          mt_name
        FROM master_tenant
        WHERE mt_id = ?
      `;

      const tenantResult = await executeMasterQuery(
        tenantQuery,
        [foundTenantId]
      );

      tenants =
        tenantResult && tenantResult.length > 0
          ? tenantResult
          : [
              {
                mt_id: foundTenantId,
                mt_code: `TENANT${foundTenantId}`,
                mt_name: `Tenant ${foundTenantId}`
              }
            ];

      // Make sure fallback tenant has the correct baseline ID
      if (!tenantBaselineUserMap.has(foundTenantId)) {
        tenantBaselineUserMap.set(
          foundTenantId,
          foundUser.mu_baseline_user_id || null
        );
      }
    }

    return {
      user_id: foundUser.mu_id,
      user_name: foundUser.mu_username,
      user_email: foundUser.mu_email,
      role_name: roleName,
      mu_baseline_user_id:
        foundUser.mu_baseline_user_id || null,

      multi_tenant_access:
        foundUser.mu_multi_tenant_access,

      tenants: tenants.map((t: any) => ({
        tenant_id: t.mt_id,
        tenant_code: t.mt_code,
        tenant_name: t.mt_name,
        mu_baseline_user_id:
          tenantBaselineUserMap.get(t.mt_id) || null
      }))
    };
  } catch (error) {
    console.error("Error in forgotPassword:", error);
    throw error;
  }
}
  // old function with naseline user id which is not working properly due to some data inconsistency in baseline user id across tenants. We have implemented new loginV2 function without using baseline user id and it is working fine and giving correct results. We are keeping this old function for reference and debugging purpose but it is not being used anywhere in the code.
//   async loginV2(userEmail: string, password: string): Promise<any | null> {
//     try {
//       // Step 1: Search in tenant databases (NOT master database)
//       // const tenantIds = [1, 2,3,4,5];
//       let activeTenantQuery = `SELECT mt_id FROM master_tenant WHERE mt_active = 1 AND mt_deleted = 0 `
//       let tenantIds = await executeMasterQuery(activeTenantQuery);
//       const tenantUserQuery = `
//         SELECT mu_id, mu_username, mu_email, mu_password, mu_mrt_id, mu_status, mu_deleted, mu_multi_tenant_access, mu_baseline_user_id, mu_tenant_id
//         FROM master_users
//         WHERE TRIM(mu_email) = ? AND mu_deleted = 0 AND mu_status = 1
//       `;

//       let foundUser: any = null;
//       let foundTenantId: number | null = null;

//       // Loop through tenant databases using executeQuery
//       for (let tenantId of tenantIds) {
//         try {
//           tenantId = tenantId.mt_id
//           console.log(`Searching in tenant database: ${tenantId}`);
//           const tenantUsers = await executeQuery(tenantUserQuery, tenantId, [userEmail.trim()]);
//           console.log(tenantUsers, 'tenantUserstenantUserstenantUsers');

//           if (tenantUsers && tenantUsers.length > 0) {
//             const user = tenantUsers[0];
//             console.log(`User found in tenant ${tenantId}`);

//             // Verify password
//             let isPasswordValid = false;
//             const isBcryptHash = user.mu_password && user.mu_password.startsWith("$2");

//             if (isBcryptHash) {
//               isPasswordValid = await bcrypt.compare(password, user.mu_password);
//             } else {
//               isPasswordValid = password === user.mu_password;
//             }

//             if (isPasswordValid) {
//               foundUser = user;
//               foundTenantId = tenantId;
//               console.log(`Password verified for user in tenant ${tenantId}`);
//               break; // BREAK when user found and password verified
//             } else {
//               console.log(`Password validation failed for user in tenant ${tenantId}`);
//             }
//           }
//         } catch (error) {
//           console.log(`Error searching tenant ${tenantId}:`, error);
//           continue; // Try next tenant
//         }
//       }

//       // If user not found in any tenant database - return 404 error
//       if (!foundUser || !foundTenantId) {
//         console.log("User not found in any tenant database");
//         return { error: true, statusCode: 404, message: "User not found" };
//       }

//       // Step 2: Get role name from master role type using mu_mrt_id
//       let roleName = null;
//       if (foundUser.mu_mrt_id) {
//         const roleQuery = `SELECT mrt_name
// FROM master_role_type
// WHERE mrt_id = ?;`;
//         const roles = await executeQuery(roleQuery, foundTenantId, [foundUser.mu_mrt_id]);
//         roleName = roles && roles.length > 0 ? roles[0].mrt_name : null;
//       }

//       // Step 3: Check mu_multi_tenant_access
//       let tenants: any[] = [];

//       if (foundUser.mu_multi_tenant_access === 1) {
//         // User has multi-tenant access - check mu_baseline_user_id in all tenants
//         console.log("User has multi-tenant access, checking mu_baseline_user_id in all tenants");

//         const baselineUserId = foundUser.mu_baseline_user_id;
        
//         if (baselineUserId) {
//           // Query all tenant databases to find matching mu_baseline_user_id
//           const baselineUserQuery = `
//             SELECT mu_id, mu_tenant_id
//             FROM master_users
//             WHERE mu_baseline_user_id = ? AND mu_deleted = 0 AND mu_status = 1
//           `;

//           const foundTenantIdsSet = new Set<number>();

//           // Check in all tenant databases
//           for (let tenantId of tenantIds) {
//             try {
//               tenantId = tenantId.mt_id;
//               console.log(`Checking mu_baseline_user_id in tenant ${tenantId}`);
//               const matchingUsers = await executeQuery(baselineUserQuery, tenantId, [baselineUserId]);

//               if (matchingUsers && matchingUsers.length > 0) {
//                 // Add tenant IDs from matching users
//                 matchingUsers.forEach((u: any) => {
//                   if (u.mu_tenant_id) {
//                     foundTenantIdsSet.add(u.mu_tenant_id);
//                   } else {
//                     foundTenantIdsSet.add(tenantId);
//                   }
//                 });
//               }
//             } catch (error) {
//               console.log(`Error checking tenant ${tenantId}:`, error);
//               continue;
//             }
//           }

//           // Convert Set to Array
//           const tenantIdsArray = Array.from(foundTenantIdsSet);

//           // Get tenant details from master_tenant using executeMasterQuery
//           if (tenantIdsArray.length > 0) {
//             const placeholders = tenantIdsArray.map(() => '?').join(',');
//             const tenantQuery = `
//               SELECT mt_id, mt_code, mt_name 
//               FROM master_tenant 
//               WHERE mt_id IN (${placeholders})
//             `;

//             tenants = await executeMasterQuery(tenantQuery, tenantIdsArray);
//           }
//         }

//         // If no tenants found, use the tenant where user was found
//         if (tenants.length === 0) {
//           console.log("No matching tenants found, using tenant where user was found");

//           const tenantQuery = `SELECT mt_id, mt_code, mt_name FROM master_tenant WHERE mt_id = ?`;
//           const tenantResult = await executeMasterQuery(tenantQuery, [foundTenantId]);
//           tenants = tenantResult && tenantResult.length > 0 ? tenantResult : [{ mt_id: foundTenantId, mt_code: `TENANT${foundTenantId}`, mt_name: `Tenant ${foundTenantId}` }];
//         }
//       } else {
//         // User does NOT have multi-tenant access - use only the tenant where user was found
//         console.log("User does not have multi-tenant access, using single tenant");

//         const tenantQuery = `SELECT mt_id, mt_code, mt_name FROM master_tenant WHERE mt_id = ?`;
//         const tenantResult = await executeMasterQuery(tenantQuery, [foundTenantId]);
//         tenants = tenantResult && tenantResult.length > 0 ? tenantResult : [{ mt_id: foundTenantId, mt_code: `TENANT${foundTenantId}`, mt_name: `Tenant ${foundTenantId}` }];
//       }

//       return {
//         user_id: foundUser.mu_id,
//         user_name: foundUser.mu_username,
//         user_email: foundUser.mu_email,
//         role_name: roleName,
//         mu_baseline_user_id: foundUser.mu_baseline_user_id || null,
//         multi_tenant_access: foundUser.mu_multi_tenant_access,
//         tenants: tenants.map((t: any) => ({
//           tenant_id: t.mt_id,
//           tenant_code: t.mt_code,
//           tenant_name: t.mt_name
//         }))
//       };

//     } catch (error) {
//       console.error('Error in loginV2:', error);
//       throw error;
//     }
//   }
  async getUserProducts(userId: number, tenantId: number): Promise<any[]> {
    try {
      const query = `
        SELECT DISTINCT mcp.mcp_id, mcp.mcp_name, uptm.uptm_created_at
        FROM user_product_tenant_mapping uptm
        JOIN master_client_product mcp ON mcp.mcp_id = uptm.uptm_mp_id
        WHERE uptm.uptm_mu_id = ? AND uptm.uptm_mt_id = ?
        ORDER BY uptm.uptm_created_at DESC`;

      const products = await executeQuery(query, tenantId, [userId, tenantId]);
      return products || [];
    } catch (error) {
      console.error('Error in getUserProducts:', error);
      return [];
    }
  }

async getUserRoles(userId: number, tenantId: number): Promise<any[]> {
  try {
    const query = `
    SELECT 
    mrt.mrt_id,
    mrt.mrt_name,
    mrt.mrt_mp_id,
    mrt.mrt_version
FROM master_user_role_operation_mapping urtm
JOIN master_role_type mrt 
    ON mrt.mrt_id = urtm.murom_mrt_id
    AND mrt.mrt_deleted = 0
    AND mrt.mrt_active = 1
WHERE urtm.murom_mu_id = ?
    AND urtm.murom_mt_id = ?
    AND urtm.murom_deleted = 0
    AND urtm.murom_active = 1
ORDER BY urtm.murom_id ASC;
    `;

    // ASC will return the oldest created role first
    const roles = await executeQuery(query, tenantId, [userId, tenantId]);

    return roles || [];
  } catch (error) {
    console.error("Error in getUserRoles:", error);
    return [];
  }
}

    async getRoleByUserIdAndRoleId(
  userId: number,
  roleId: number,
  tenantId: number
): Promise<any[]> {
  try {
    const query = `
      SELECT
        mrt.mrt_id,
        mrt.mrt_name,
        mrt.mrt_mp_id,
        mrt.mrt_version
      FROM master_user_role_operation_mapping urtm
      INNER JOIN master_role_type mrt
        ON mrt.mrt_id = urtm.murom_mrt_id
      WHERE urtm.murom_mu_id = ?
        AND urtm.murom_mt_id = ?
        AND urtm.murom_mrt_id = ?
        AND urtm.murom_deleted = 0
        AND urtm.murom_active = 1
        AND mrt.mrt_deleted = 0
        AND mrt.mrt_active = 1
      ORDER BY urtm.murom_created_at DESC
    `;

    const roles = await executeQuery(query, tenantId, [
      userId,
      tenantId,
      roleId,
    ]);

    return roles || [];
  } catch (error) {
    console.error('Error in getRoleByUserIdAndRoleId:', error);
    return [];
  }
}
  async checkUserValidRole(
  userId: number,
  tenantId: number,
  roleId: number
): Promise<any[]> {
  try {
    const query = `
      SELECT *
      FROM master_user_role_operation_mapping urtm
      WHERE urtm.murom_mu_id = ?
        AND urtm.murom_mt_id = ?
        AND urtm.murom_mrt_id = ?
        AND urtm.murom_deleted = 0
        AND urtm.murom_active = 1
    `;

    const result =
      (await executeQuery(query, tenantId, [userId, tenantId, roleId])) || [];

   return result
  } catch (error) {
    console.error('Error in checkUserValidRole:', error);
    return [];
  }
}

  async getUserProductRoles(
  userId: number,
  tenantId: number,
  productId?: number
): Promise<any[]> {
  try {
    let query = `
      SELECT DISTINCT
        rt.mrt_id,
        rt.mrt_name,
        rt.mrt_mp_id,
        rt.mrt_version
      FROM master_user_role_operation_mapping murom
      INNER JOIN master_role_type rt
        ON rt.mrt_id = murom.murom_mrt_id
      WHERE murom.murom_mu_id = ?
        AND murom.murom_active = 1
        AND murom.murom_deleted = 0
        AND rt.mrt_active = 1
        AND rt.mrt_deleted = 0
    `;

    const params: any[] = [userId];

    if (productId !== undefined && productId !== null) {
      query += ` AND rt.mrt_mp_id = ?`;
      params.push(productId);
    }

    query += `
      ORDER BY rt.mrt_name ASC
    `;

    const result = await executeQuery(query, tenantId, params);

    return result || [];
  } catch (error) {
    console.error("Error in getUserProductRoles:", error);
    return [];
  }
}
}
