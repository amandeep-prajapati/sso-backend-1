import { executeQuery } from "./executeQuery";

export interface TenantPasswordUpdateResult {
  tenantId: number;
  updated: boolean;
  error?: string;
}

/**
 * Updates master_users password by email across tenant databases (tenantId 1 to 7).
 * Expects password to already be hashed.
 */
export async function updateMasterUserPasswordByEmail(
  email: string,
  password: string
): Promise<TenantPasswordUpdateResult[]> {
  const results: TenantPasswordUpdateResult[] = [];

  for (let tenantId = 1; tenantId <= 10; tenantId++) {
    try {
      const query = `UPDATE master_users
                     SET mu_password = ?
                     WHERE mu_email = ? AND mu_deleted = 0`;

      const result: any = await executeQuery(query, tenantId, [
        password,
        email,
      ]);

      if (result?.error) {
        results.push({ tenantId, updated: false, error: result.message });
        continue;
      }

      results.push({ tenantId, updated: result.affectedRows > 0 });
    } catch (error: any) {
      results.push({ tenantId, updated: false, error: error.message });
    }
  }

  return results;
}
