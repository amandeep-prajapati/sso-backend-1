export interface SuperModule {
  msm_id?: number;
  msm_mp_id: number;
  msm_code: string;
  msm_name: string;
  msm_description?: string;
  msm_icon?: string;
  msm_url?: string;
  msm_active: number;
  msm_deleted: number;
  msm_created_at?: Date;
  msm_created_by: number;
  msm_updated_at?: Date;
  msm_updated_by?: number;
  msm_created_date?: Date;
}

export interface CreateSuperModuleRequest {
  msm_mp_id: number;
  msm_name: string;
  msm_description?: string;
  msm_icon?: string;
  msm_url?: string;
  msm_created_by: number;
}

export interface UpdateSuperModuleRequest {
  msm_id: number;
  msm_mp_id?: number;
  msm_name?: string;
  msm_description?: string;
  msm_icon?: string;
  msm_url?: string;
  msm_active?: number;
  msm_updated_by?: number;
}

export interface SuperModuleResponse extends SuperModule {}
