export interface MasterUserRoleOperationMapping {
  murom_id?: number;
  murom_mu_id: number; // User ID (Reference: master_users.mu_id)
  murom_mt_id: number; // Tenant ID (Reference: master_tenant.mt_id)
  murom_role_id: number; // Role ID (Reference: master_role_type.mrt_id)
  murom_active?: number; // 1 = Active, 0 = Inactive
  murom_deleted?: number; // Soft delete flag
  murom_created_at?: string;
  murom_created_by: number;
  murom_updated_at?: string;
  murom_updated_by?: number;
  murom_created_date?: string;
}

export interface CreateMasterUserRoleOperationMappingRequest {
  murom_mu_id: number;
  murom_mt_id: number;
  murom_role_id: number;
  murom_created_by: number;
}

export interface UpdateMasterUserRoleOperationMappingRequest {
  murom_mu_id?: number;
  murom_mt_id?: number;
  murom_role_id?: number;
  murom_active?: number;
  murom_updated_by: number;
}