export interface Role {
  role_id?: number;
  role_name: string;
  role_description: string;
  role_is_active: number;
  role_created_by: string;
  role_updated_by?: string;
  role_created_at?: Date;
  role_updated_at?: Date;
}

export interface RoleResponse {
  role_id: number;
  role_name: string;
  role_description: string;
  role_is_active: number;
  role_created_by: string;
  role_updated_by?: string;
  role_created_at: Date;
  role_updated_at: Date;
}

export interface CreateRoleRequest {
  role_name: string;
  role_description: string;
  role_is_active: number;
  role_created_by?: string;
}

export interface UpdateRoleRequest {
  role_id: number;
  role_name?: string;
  role_description?: string;
  role_is_active?: number;
  role_updated_by?: string;
}
