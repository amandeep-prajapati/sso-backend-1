export interface RoleType {
  mrt_id?: number;
  mrt_mat_id: number;
  mrt_mp_id: number;
  mrt_name: string;
  mrt_description?: string;
  mrt_active: number;
  mrt_deleted: number;
  mrt_created_at?: Date;
  mrt_created_by: number;
  mrt_updated_at?: Date;
  mrt_updated_by?: number;
  mrt_created_date?: Date;
}

export interface CreateRoleTypeRequest {
  mrt_mat_id: number;
  mrt_mp_id: number;
  mrt_name: string;
  mrt_description?: string;
  mrt_created_by: number;
}

export interface UpdateRoleTypeRequest {
  mrt_id: number;
  mrt_mat_id?: number;
  mrt_mp_id?: number;
  mrt_name?: string;
  mrt_description?: string;
  mrt_active?: number;
  mrt_updated_by?: number;
}

export interface RoleTypeResponse extends RoleType {}
