export interface TenantResponse {
  mt_id: number;
  mt_code: string;
  mt_name: string;
  mt_logo?: string;
  mt_url?: string;
  mt_sha_key?: string;
  mt_active: number;
  mt_created_by: number;
  mt_created_at: string;
  mt_updated_by: number;
  mt_updated_at: string;
}

export interface CreateTenantRequest {
  mt_code: string;
  mt_name: string;
  mt_logo?: string;
  mt_url?: string;
  mt_sha_key?: string;
  mt_created_by: number;
}

export interface UpdateTenantRequest {
  mt_id: number;
  mt_code?: string;
  mt_name?: string;
  mt_logo?: string;
  mt_url?: string;
  mt_sha_key?: string;
  mt_active?: number;
  mt_updated_by: number;
}