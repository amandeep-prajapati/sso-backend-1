export interface Module {
  mm_id?: number;
  mm_msm_id?: number;
  mm_mp_id: number;
  mm_code: string;
  mm_name: string;
  mm_description?: string;
  mm_icon?: string;
  mm_url?: string;
  mm_display_order: number;
  mm_active: number;
  mm_deleted: number;
  mm_created_at?: Date;
  mm_created_by: number;
  mm_updated_at?: Date;
  mm_updated_by?: number;
  mm_created_date?: Date;
}

export interface CreateModuleRequest {
  mm_msm_id?: number;
  mm_mp_id: number;
  mm_name: string;
  mm_description?: string;
  mm_icon?: string;
  mm_url?: string;
  mm_display_order?: number;
  mm_created_by: number;
}

export interface UpdateModuleRequest {
  mm_id: number;
  mm_msm_id?: number;
  mm_mp_id?: number;
  mm_name?: string;
  mm_description?: string;
  mm_icon?: string;
  mm_url?: string;
  mm_display_order?: number;
  mm_active?: number;
  mm_updated_by?: number;
}

export interface ModuleResponse extends Module {}
