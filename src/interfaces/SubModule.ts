export interface SubModule {
  msub_id?: number;
  msub_msm_id?: number;
  msub_mp_id: number;
  msub_mm_id: number;
  msub_code: string;
  msub_name: string;
  msub_description?: string;
  msub_icon?: string;
  msub_url?: string;
  msub_display_order: number;
  msub_active: number;
  msub_deleted: number;
  msub_created_at?: Date;
  msub_created_by: number;
  msub_updated_at?: Date;
  msub_updated_by?: number;
  msub_created_date?: Date;
}

export interface CreateSubModuleRequest {
  msub_msm_id?: number;
  msub_mp_id: number;
  msub_mm_id: number;
  msub_name: string;
  msub_description?: string;
  msub_icon?: string;
  msub_url?: string;
  msub_display_order?: number;
  msub_created_by: number;
}

export interface UpdateSubModuleRequest {
  msub_id: number;
  msub_msm_id?: number;
  msub_mp_id?: number;
  msub_mm_id?: number;
  msub_name?: string;
  msub_description?: string;
  msub_icon?: string;
  msub_url?: string;
  msub_display_order?: number;
  msub_active?: number;
  msub_updated_by?: number;
}

export interface SubModuleResponse extends SubModule {}
