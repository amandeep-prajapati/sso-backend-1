import dotenv from 'dotenv';

dotenv.config();

/**
 * Get tenant IDs from environment variable
 * @returns Array of tenant IDs configured in the environment
 */
export const getTenantIds = (): number[] => {
  const tenantIdsStr = process.env.TENANT_IDS;
  return tenantIdsStr.split(',').map(id => parseInt(id.trim(), 10));
};

/**
 * Check if a tenant ID is valid
 * @param tenantId - The tenant ID to validate
 * @returns boolean indicating if the tenant ID is valid
 */
export const isValidTenantId = (tenantId: number): boolean => {
  const validIds = getTenantIds();
  return validIds.includes(tenantId);
};

/**
 * Get tenant name by ID
 * @param tenantId - The tenant ID
 * @returns Tenant name or null if not found
 */
export const getTenantNameById = (tenantId: number): string | null => {
  const tenantMap: { [key: number]: string } = {
    1: 'rupee112',
    2: 'bhartaloan',
    3: 'brightloan',
    4: 'loan112',
    5: 'rupeeontime',
    6: 'titanfincorp',
    7: 'kreditbuddha',
    8: 'salary112',
    9: 'credme',
    10: 'salarymantra'
  };
  return tenantMap[tenantId] || null;
};