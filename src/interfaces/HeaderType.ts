export interface HeaderTypeResponse {
  mht_type_id: number;
  mht_type_code: string;
  mht_type_name: string;
  mht_type_description?: string;
  mht_type_status_id: number;
  mht_type_active: number;
  mht_type_deleted: number;
  mht_type_created_by: number;
  mht_type_created_at: string;
  mht_type_updated_by?: number;
  mht_type_updated_at: string;
}

export interface CreateHeaderTypeRequest {
  mht_type_code: string;
  mht_type_name: string;
  mht_type_description?: string;
  mht_type_status_id?: number;
  mht_type_created_by: number;
}

export interface UpdateHeaderTypeRequest {
  mht_type_id: number;
  mht_type_code?: string;
  mht_type_name?: string;
  mht_type_description?: string;
  mht_type_status_id?: number;
  mht_type_active?: number;
  mht_type_updated_by: number;
}