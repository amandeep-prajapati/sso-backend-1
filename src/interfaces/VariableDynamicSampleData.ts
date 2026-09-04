export interface VariableDynamicSampleDataResponse {
  vdsd_id: number;
  vdsd_vdm_id: number;
  vdsd_sample_value: string;
  vdsd_created_by: number;
  vdsd_created_at: string;
  vdsd_updated_by?: number;
  vdsd_updated_at?: string;
  vdsd_active: number;
  vdsd_deleted: number;
}

export interface CreateVariableDynamicSampleDataRequest {
  vdsd_vdm_id: number;
  vdsd_sample_value: string;
  vdsd_created_by: number;
}

export interface UpdateVariableDynamicSampleDataRequest {
  vdsd_id: number;
  vdsd_vdm_id?: number;
  vdsd_sample_value?: string;
  vdsd_active?: number;
  vdsd_updated_by: number;
}