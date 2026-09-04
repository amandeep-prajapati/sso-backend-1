// Master Tenant Interface
export interface MasterTenant {
  mt_id?: number;
  mt_code: string;
  mt_name: string;
  mt_logo?: string;
  mt_url?: string;
  mt_sha_key?: string;
  mt_active: number;
  mt_deleted: number;
  mt_created_by: number;
  mt_created_at?: Date;
  mt_updated_by: number;
  mt_updated_at?: Date;
}

export interface CreateMasterTenantRequest {
  mt_code: string;
  mt_name: string;
  mt_logo?: string;
  mt_url?: string;
  mt_sha_key?: string;
  mt_created_by: number;
}

export interface UpdateMasterTenantRequest {
  mt_id: number;
  mt_code?: string;
  mt_name?: string;
  mt_logo?: string;
  mt_url?: string;
  mt_sha_key?: string;
  mt_active?: number;
  mt_updated_by?: number;
}

export interface MasterTenantResponse extends MasterTenant {}
