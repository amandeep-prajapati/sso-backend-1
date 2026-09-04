export interface AdminType {
  mat_id?: number;
  mat_name: string;
  mat_code: string;
  mat_active: number;
  mat_deleted: number;
  mat_created_at?: Date;
  mat_created_by: number;
  mat_updated_at?: Date;
  mat_updated_by?: number;
  mat_created_date?: Date;
}

export interface CreateAdminTypeRequest {
  mat_name: string;
  mat_code?: string; // Optional - will be auto-generated if not provided
  mat_created_by: number;
}

export interface UpdateAdminTypeRequest {
  mat_id: number;
  mat_name?: string;
  mat_code?: string;
  mat_active?: number;
  mat_updated_by?: number;
}

export interface AdminTypeResponse extends AdminType {}
