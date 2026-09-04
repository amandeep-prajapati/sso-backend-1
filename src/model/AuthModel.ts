import bcrypt from 'bcryptjs';
import { UserSession } from "../interfaces/Auth";
import { executeMasterQuery, executeQuery } from "../utils/executeQuery";

interface RowDataPacket {
  [key: string]: any;
}

export class AuthModel {

  async authenticateUser(
    userEmail: string,
    password: string,
    source: number
  ): Promise<UserSession | null> {
    try {
      console.log("Authenticating user:", userEmail);

      // Authenticate user with specific columns
      const rows = await executeMasterQuery(
        `SELECT 
    mu.mu_id,
    mu.mu_username,
    mu.mu_email,
    mu.mu_password,
    mu.mu_mrt_id,
    mrt.mrt_name,
    mu.mu_department,
    mu.mu_status,
    GROUP_CONCAT(DISTINCT utm.utm_tenant_id) AS tenant_ids,
    GROUP_CONCAT(DISTINCT mt.mt_name) AS tenant_names
FROM master_users mu
LEFT JOIN master_role_type mrt
    ON mu.mu_mrt_id = mrt.mrt_id
LEFT JOIN user_tenant_mapping utm
    ON mu.mu_id = utm.utm_user_id
LEFT JOIN master_tenant mt
    ON utm.utm_tenant_id = mt.mt_id
WHERE TRIM(mu.mu_email) = ?
    AND mu.mu_deleted = 0
    AND mu.mu_status = 1
GROUP BY mu.mu_id`,
        [userEmail.trim()]
      );

      if (!rows || rows.length === 0) {
        console.log("No user found with email:", userEmail);
        return null;
      }

      const user = rows[0];
      
      if (!user) {
        console.log("User data is undefined for email:", userEmail);
        return null;
      }
      
      console.log(
        "Found user:",
        user.user_name,
        "| Active:",
        user.user_is_active,
        "| Blocked:",
        user.user_block
      );

      // Verify password
      // console.log("Checking password for user:", user.user_name);
      // console.log("Stored password:", user.user_password);
      // console.log("Input password:", password);

      let isPasswordValid = false;

      // Check if password looks like a bcrypt hash (starts with $2a$, $2b$, etc.)
      const isBcryptHash =
        user.user_password && user.user_password.startsWith("$2");
      console.log("Is bcrypt hash:", isBcryptHash);

      if (isBcryptHash) {
        // Try bcrypt comparison
        try {
          isPasswordValid = await bcrypt.compare(password, user.user_password);
          console.log("Bcrypt comparison result:", isPasswordValid);
        } catch (error) {
          console.log("Bcrypt comparison error:", error);
          isPasswordValid = false;
        }
      } else {
        // Plain text comparison
        console.log("Using plain text comparison");
        isPasswordValid = password === user.user_password;
      }

      console.log("Password validation result:", isPasswordValid);

      if (!isPasswordValid) {
        console.log("Password validation failed for user:", user.user_name);
        return null;
      }

      // Parse tenant data - admin roles get all tenants
      let tenantIds: number[] = [];
      let tenantNames: string[] = [];

      if (this.isAdminRole(user.role_name)) {
        console.log("Admin role detected, granting access to all tenants");
        const allTenants = await this.getAllTenants();
        tenantIds = allTenants.tenant_ids;
        tenantNames = allTenants.tenant_names;
      } else {
        console.log("Regular user, using assigned tenants from mapping table");
        // Parse tenant data from GROUP_CONCAT results from mapping table
        if (user.tenant_ids && user.tenant_names) {
          tenantIds = user.tenant_ids.split(',').map((id: string) => parseInt(id.trim())).filter((id: number) => !isNaN(id));
          tenantNames = user.tenant_names.split(',').map((name: string) => name.trim());
        }
      }

      console.log("Final tenant access:", { tenantIds, tenantNames });

// ===============================================G=================et dashboard type for the user's role=====================================================//
      const dashboardType = await this.getDashboardTypeForRole(user.role_name);

      return {
        user_id: user.user_id,
        user_name: user.user_name,
        user_email: user.user_email,
        role_id: user.role_id,
        role_name: user.role_name,
        tenant_ids: tenantIds,
        tenant_names: tenantNames,
        user_department: user.user_department,
        user_is_active: user.user_is_active,
        dashboard_type: dashboardType,
      };
    } catch (error) {
      console.error("Error authenticating user:", error);
      throw error;
    }
  }

//=================================================================Get Users By id=1,2,4.====================================================================//
  async getUserById(userId: number): Promise<UserSession | null> {
    try {
      const rows = await executeMasterQuery(
        `SELECT 
    mu.mu_id,
    mu.mu_username,
    mu.mu_email,
    mu.mu_otp,
    mu.mu_expiry_time,
    mu.mu_mrt_id,
    mrt.mrt_name,
    mu.mu_department,
    mu.mu_status
FROM master_users mu
LEFT JOIN master_role_type mrt
    ON mu.mu_mrt_id = mrt.mrt_id
WHERE mu.mu_id = ?
    AND mu.mu_status = 1
    AND mu.mu_deleted = 0;`,
        [userId]
      );

      if (rows.length === 0) {
        return null;
      }

      const user = rows[0];

      // Since no tenant mapping table exists, use default tenant
      let tenantIds: number[] = [1]; // Default to tenant 1
      let tenantNames: string[] = ['Default Tenant'];

      // Admin roles can access all tenants (if needed in future)
      if (this.isAdminRole(user.role_name)) {
        console.log("Admin role detected, using default tenant access");
        tenantIds = [1, 2, 3, 4, 5]; // All available tenants
        tenantNames = ['Rupee112', 'Bharta Loan', 'Bright Loan', 'Loan112', 'Rupee On Time'];
      }

      // Get dashboard type for the user's role
      const dashboardType = await this.getDashboardTypeForRole(user.role_name);

      return {
        user_id: user.user_id,
        user_name: user.user_name,
        user_email: user.user_email,
        user_otp: user.user_otp,
        user_expiry_time: user.user_expiry_time,
        role_id: user.role_id,
        role_name: user.role_name,
        tenant_ids: tenantIds,
        tenant_names: tenantNames,
        user_department: user.user_department,
        user_is_active: user.user_is_active,
        dashboard_type: dashboardType,
      };
    } catch (error) {
      console.error("Error fetching user by ID:", error);
      throw error;
    }
  }

  async validateUserAccess(
    userId: number,
    requiredRoles: string[]
  ): Promise<boolean> {
    try {
      const rows = await executeMasterQuery(
          `SELECT mrt.mrt_name
FROM master_users mu
JOIN master_role_type mrt
    ON mu.mu_mrt_id = mrt.mrt_id
WHERE mu.mu_id = ?
    AND mu.mu_deleted = 0
    AND mu.mu_status = 1;`,
        [userId]
      );

      if (rows.length === 0) {
        return false;
      }

      const userRole = rows[0].mrt_name.toLowerCase();
      return requiredRoles.some((role) => role.toLowerCase() === userRole);
    } catch (error) {
      console.error("Error validating user access:", error);
      return false;
    }
  }

// ===============================================================Get Dasboard Access Roles like admin and super admin=========================================//
  async getDashboardAccessRoles(): Promise<string[]> {
    try {
      const rows = await executeMasterQuery(
        `SELECT mrt_name 
         FROM master_role_type 
         WHERE mrt_active = 1 
         AND (mrt_name LIKE '%admin%' OR mrt_name LIKE '%super%')
         ORDER BY mrt_id`
      );

      return rows.map((row: any) => row.mrt_name);
    } catch (error) {
      console.error("Error fetching dashboard access roles:", error);
      return ["Super Admin", "Admin"];
    }
  }

  async getAdminRoles(): Promise<string[]> {
    try {
      const rows = await executeMasterQuery(
        `SELECT mrt_name 
         FROM master_role_type 
         WHERE mrt_active = 1 
         AND (mrt_name LIKE '%admin%' OR mrt_name LIKE '%super%')
         ORDER BY mrt_id`
      );

      console.log("Admin roles from database:", rows.map((row: any) => row.mrt_name));
      return rows.map((row: any) => row.mrt_name);
    } catch (error) {
      console.error("Error fetching admin roles:", error);
      return ["Super Admin", "Admin"];
    }
  }

// ===============================================================Determine dashboard type based on user role (dynamic from database)===========================//
  async getDashboardTypeForRole(roleName: string): Promise<number> {
    try {
      const adminRoles = await this.getAdminRoles();
      const userRole = roleName.toLowerCase().trim();

      // Check if user role matches any admin role from database
      const isAdminUser = adminRoles.some(role =>
        userRole === role.toLowerCase().trim() ||
        userRole.includes('admin') ||
        userRole.includes('super')
      );

      const dashboardType = isAdminUser ? 1 : 2;
      console.log(`Dashboard type ${dashboardType} assigned for role: ${roleName}`);

      return dashboardType;
    } catch (error) {
      console.error("Error determining dashboard type:", error);
      // Fallback logic
      const userRole = roleName.toLowerCase().trim();
      return (userRole.includes('admin') || userRole.includes('super')) ? 1 : 2;
    }
  }

// ==========================================================Validate dashboard access based on requested dashboard type and user role==========================//
  async validateDashboardAccess(roleName: string, requestedDashboardType?: number): Promise<{
    hasAccess: boolean;
    assignedDashboardType: number;
    message?: string;
  }> {
    try {
      const assignedDashboardType = await this.getDashboardTypeForRole(roleName);

      // If no specific dashboard type requested, just return assigned type
      if (!requestedDashboardType) {
        return {
          hasAccess: true,
          assignedDashboardType,
        };
      }

      // Check if requested dashboard type matches assigned type
      if (requestedDashboardType === assignedDashboardType) {
        return {
          hasAccess: true,
          assignedDashboardType,
        };
      }

      // Access denied - user trying to access wrong dashboard
      const dashboardName = requestedDashboardType === 1 ? 'Admin Dashboard' : 'User Dashboard';
      const allowedDashboard = assignedDashboardType === 1 ? 'Admin Dashboard' : 'User Dashboard';

      return {
        hasAccess: false,
        assignedDashboardType,
        message: `Access denied. You don't have permission to access the ${dashboardName}. Please use the ${allowedDashboard}.`,
      };
    } catch (error) {
      console.error("Error validating dashboard access:", error);
      return {
        hasAccess: false,
        assignedDashboardType: 2,
        message: "Error validating dashboard access. Please try again.",
      };
    }
  }

//===========================================================Get all tenants from tenant master database==========================================================//
  async getAllTenants(): Promise<{
    tenant_ids: number[];
    tenant_names: string[];
  }> {
    try {
      const rows = await executeMasterQuery(
        `SELECT tenant_id, tenant_name FROM master_tenant ORDER BY tenant_id`
      );

      const tenantIds = rows.map((row: any) => row.tenant_id);
      const tenantNames = rows.map((row: any) => row.tenant_name);

      return { tenant_ids: tenantIds, tenant_names: tenantNames };
    } catch (error) {
      console.error("Error fetching all tenants:", error);
      return { tenant_ids: [], tenant_names: [] };
    }
  }

// ===================================================Get users accessible tenants for tenant selection when user login in user_dasboard=========================//
  async getUserAccessibleTenants(userId: number): Promise<any[]> {
    try {
      const rows = await executeMasterQuery(
        `SELECT mu.mu_id, mu.mu_username, mu.mu_mrt_id, mrt.mrt_name,
                GROUP_CONCAT(utm.utm_tenant_id) as tenant_ids
         FROM master_users mu
         LEFT JOIN master_role_type mrt ON mu.mu_mrt_id = mrt.mrt_id
         LEFT JOIN user_tenant_mapping utm ON mu.mu_id = utm.utm_user_id
         WHERE mu.mu_id = ? AND mu.mu_deleted = 0 AND mu.mu_status = 1
         GROUP BY mu.mu_id`,
        [userId]
      );

      if (rows.length === 0) {
        return [];
      }

      const user = rows[0];

      // If admin role, return all tenants
      if (this.isAdminRole(user.mrt_name)) {
        const allTenants = await executeMasterQuery(
          `SELECT tenant_id, tenant_name, tenant_code 
           FROM master_tenant 
           ORDER BY tenant_name`
        );
        return allTenants;
      } else {
        // Regular user, return assigned tenants from mapping table
        if (user.tenant_ids) {
          const tenantIds = user.tenant_ids.split(',').map((id: string) => parseInt(id.trim())).filter((id: number) => !isNaN(id));

          // Get tenant details
          if (tenantIds.length > 0) {
            return await this.getTenantsByIds(tenantIds);
          }
        }
        return [];
      }
    } catch (error) {
      console.error("Error fetching user accessible tenants:", error);
      return [];
    }
  }

// =======================================================Verify if user has access to specific tenant====================================================//
  async verifyUserTenantAccess(userId: number, tenantId: number): Promise<boolean> {
    try {
      const rows = await executeMasterQuery(
        `SELECT mu.mu_id, mu.mu_mrt_id, mrt.mrt_name,
                GROUP_CONCAT(utm.utm_tenant_id) as tenant_ids
         FROM master_users mu
         LEFT JOIN master_role_type mrt ON mu.mu_mrt_id = mrt.mrt_id
         LEFT JOIN user_tenant_mapping utm ON mu.mu_id = utm.utm_user_id
         WHERE mu.mu_id = ? AND mu.mu_deleted = 0 AND mu.mu_status = 1
         GROUP BY mu.mu_id`,
        [userId]
      );

      if (rows.length === 0) {
        return false;
      }

      const user = rows[0];

      // If admin role, has access to all tenants
      if (this.isAdminRole(user.mrt_name)) {
        // Verify tenant exists
        const tenantRows = await executeMasterQuery(
          `SELECT tenant_id FROM master_tenant WHERE tenant_id = ?`,
          [tenantId]
        );
        return tenantRows.length > 0;
      } else {
        // Regular user, check if tenant is in their assigned tenants from mapping table
        if (user.tenant_ids) {
          const tenantIds = user.tenant_ids.split(',').map((id: string) => parseInt(id.trim())).filter((id: number) => !isNaN(id));
          return tenantIds.includes(tenantId);
        }
        return false;
      }
    } catch (error) {
      console.error("Error verifying user tenant access:", error);
      return false;
    }
  }

// ===========================================================Get multiple tenants by IDs==================================================//
  async getTenantsByIds(tenantIds: number[]): Promise<any[]> {
    try {
      if (tenantIds.length === 0) {
        return [];
      }

      const placeholders = tenantIds.map(() => '?').join(',');
      const rows = await executeMasterQuery(
        `SELECT tenant_id, tenant_name, tenant_code, tenant_domain_name
         FROM master_tenant 
         WHERE tenant_id IN (${placeholders})
         ORDER BY tenant_name`,
        tenantIds
      );

      return rows;
    } catch (error) {
      console.error("Error fetching tenants by IDs:", error);
      return [];
    }
  }

  async getTenantById(tenantId: number): Promise<any | null> {
    try {
      const rows = await executeMasterQuery(
        `SELECT tenant_id, tenant_name, tenant_code, tenant_domain_name
         FROM master_tenant 
         WHERE tenant_id = ?`,
        [tenantId]
      );

      if (rows.length === 0) {
        return null;
      }

      return rows[0];
    } catch (error) {
      console.error("Error fetching tenant by ID:", error);
      return null;
    }
  }

  private isAdminRole(roleName: string): boolean {
    const adminRoles = ["super admin", "superadmin", "admin"];
    return adminRoles.some(
      (role) => role.toLowerCase() === roleName.toLowerCase()
    );
  }



  // Get user by email
  async getUserByEmail(email: string): Promise<any | null> {
    try {
    
      
      const query = `
        SELECT 
          mu.mu_id,
          mu.mu_username,
          mu.mu_email,
          mu.mu_otp,
          mu.mu_expiry_time,
          mu.mu_status,
          mrt.mrt_name
        FROM master_users mu
        LEFT JOIN master_role_type mrt ON mu.mu_mrt_id = mrt.mrt_id
        WHERE mu.mu_email = ? AND mu.mu_status = 1
      `;

      
      const rows = await executeMasterQuery(query, [email]) as any[];

      
      if (!rows || rows.length === 0) {

        return null;
      }

      const user = rows[0];
    

      if (!user || !user.mu_id) {
       
        return null;
      }
      const result_user = {
        user_id: user.mu_id,
        user_name: user.mu_username,
        user_email: user.mu_email,
        user_otp: user.mu_otp,
        user_expiry_time: user.mu_expiry_time,
        user_is_active: user.mu_status,
        role_name: user.mrt_name,
        tenant_ids: [1], // Default to tenant 1 since no mapping table
        tenant_names: ['Default Tenant'] // Default tenant name
      };

      console.log('Returning user:', result_user);
      
      
      return result_user;
    } catch (error) {
      console.error('Error fetching user by email:', error);
      throw error;
    }
  }

  // Update user OTP and expiry time
  async updateUserOTP(userId: number, otp: string, expiryTime: Date): Promise<void> {
    try {
      
      
      // Convert to MySQL datetime format in UTC
      const mysqlDateTime = expiryTime.toISOString().slice(0, 19).replace('T', ' ');
     

      const query = `
        UPDATE master_users 
        SET user_otp = ?, user_expiry_time = ?
        WHERE user_id = ?
      `;

      // Store as MySQL datetime string in UTC
      await executeMasterQuery(query, [otp, expiryTime, userId]);
    } catch (error) {
      console.error('Error updating user OTP:', error);
      throw error;
    }
  }

  // Verify OTP
  async verifyOTP(email: string, otp: string): Promise<{ isValid: boolean; message?: string; user?: any }> {
      try {
        const user = await this.getUserByEmail(email);

        // Check if user exists first
        if (!user) {
          console.log('User not found');
          return { message: 'User account not found. Please check your email address.', isValid: false };
        }

        // Check if OTP is expired
        const now = new Date();
        const expiry = new Date(user.user_expiry_time);
        const isValid = now < expiry;

        if (!isValid) {
          const localTime = new Date(user.user_expiry_time).toLocaleString("en-IN", {
            timeZone: "Asia/Kolkata"
          });
          console.log(localTime, 'OTP expired at');
          return { message: 'OTP has expired. Please request a new OTP to continue.', isValid: false };
        }

        // Check if OTP matches
        if (user.user_otp != otp) {
          return { message: 'Invalid OTP. Please enter the correct OTP sent to your email.', isValid: false };
        }

        // OTP is valid
        return { isValid: true, user };
      } catch (error) {
        console.error('Error verifying OTP:', error);
        throw error;
      }
    }

  // Clear OTP after successful verification
  async clearUserOTP(userId: number): Promise<void> {
    try {
      const query = `
        UPDATE master_users 
        SET user_otp = NULL, user_expiry_time = NULL
        WHERE user_id = ?
      `;

      await executeMasterQuery(query, [userId]);
    } catch (error) {
      console.error('Error clearing user OTP:', error);
      throw error;
    }
  }

}
