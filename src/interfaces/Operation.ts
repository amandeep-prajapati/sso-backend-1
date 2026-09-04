export interface Operation {
  mo_id?: number;
  mo_mm_id?: number;
  mo_msm_id?: number;
  mo_mp_id?: number;
  mo_msub_id?: number;
  mo_moc_id: number;
  mo_code: string;
  mo_name: string;
  mo_description?: string;
  mo_active: number;
  mo_deleted: number;
  mo_created_at?: Date;
  mo_created_by: number;
  mo_updated_at?: Date;
  mo_updated_by?: number;
  mo_created_date?: Date;
}

export interface CreateOperationRequest {
  mo_mm_id?: number;
  mo_msm_id?: number;
  mo_mp_id?: number;
  mo_msub_id?: number;
  mo_moc_id: number;
  mo_name: string;
  mo_description?: string;
  mo_created_by: number;
}

export interface UpdateOperationRequest {
  mo_id: number;
  mo_mm_id?: number;
  mo_msm_id?: number;
  mo_mp_id?: number;
  mo_msub_id?: number;
  mo_moc_id?: number;
  mo_name?: string;
  mo_description?: string;
  mo_active?: number;
  mo_updated_by?: number;
}

export interface OperationResponse extends Operation {}
