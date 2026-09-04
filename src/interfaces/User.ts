export interface User {
  user_id?: number;
  role_id: number;
  user_name: string;
  user_password: string;
  user_email: string;
  user_mobile: number;
  user_is_active: number;
  user_block: number;
  user_reporting_head?: string;
  user_tenant_id: number;
  user_department: string;
  user_created_by: string;
  user_updated_by?: string;
  user_created_at?: Date;
  user_updated_at?: Date;
}

export interface CreateUserRequest {
  role_id: number;
  user_name: string;
  user_password: string;
  user_email: string;
  user_mobile: number;
  user_reporting_head?: string;
  user_tenant_id: number;
  user_department: string;
  user_created_by?: string;
}

export interface UpdateUserRequest {
  user_id: number;
  role_id?: number;
  user_name?: string;
  user_password?: string;
  user_email?: string;
  user_mobile?: number;
  user_is_active?: number;
  user_reporting_head?: string;
  user_tenant_id?: number;
  user_department?: string;
  user_updated_by?: string;
}

export interface UserResponse {
  user_id: number;
  role_id: number;
  user_tenant_id: number;
  user_name: string;
  user_email: string;
  user_mobile: number;
  user_is_active: number;
  user_block: number;
  user_reporting_head?: string;
  user_department: string;
  user_created_by: string;
  user_updated_by?: string;
  user_created_at: Date;
  user_updated_at: Date;
  role_name?: string;
  tenant_name?: string;
}