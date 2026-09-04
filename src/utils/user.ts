import { Query } from "mysql2/typings/mysql/lib/protocol/sequences/Query";
import { executeMasterQuery } from "./executeQuery";

export async function fetchUserRolesAndProducts(
              authModelV2: any,
              actualUserId: any,
              tenant_id: any
            ): Promise<{
              userRolesDetails: any;
              roleName: string | null;
              mu_mrt_id: any;
              role_version: number | null;
              products: any;
            }> {
              const roles = await authModelV2.getUserRoles(actualUserId, tenant_id);

              if (!roles || roles.length === 0) {
                throw new Error("No role access for the user");
              }

              const userRolesDetails = roles;
              const role_version = roles[0]?.mrt_version ?? null;
              const roleName = roles[0]?.mrt_name ?? null;
              const mu_mrt_id = roles[0]?.mrt_id ?? null;
             
              const products = await authModelV2.getProductData(roles[0].mrt_mp_id, tenant_id);

              if (!products || products.length === 0) {
                throw new Error("No product access found for user");
              }

              return { userRolesDetails, roleName, mu_mrt_id, products, role_version };
            }

export async function getAdminType(mu_mat_id: number): Promise<string> {
    try{
        const query = `SELECT mat_name FROM master_admin_type WHERE mat_id = ?`;
        const result: any = await executeMasterQuery(query, [mu_mat_id]);
        if(result && result.length > 0) {
            return result[0].mat_name;
        } else {
            return 'Unknown';
        }
    } catch (error) {
        console.error('Error fetching admin type:', error);
        return 'Unknown';
    }

}