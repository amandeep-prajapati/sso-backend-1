export interface MasterUser {
  mu_id?: number;
  mu_mp_id?: number;
  mu_username: string;
  mu_password: string;
  mu_email?: string;
  mu_mobile?: number;
  mu_login_attempt: number;
  mu_total_login_count: number;
  mu_logins_failed_count: number;
  mu_last_login_ip?: string;
  mu_last_login_datetime?: Date;
  mu_last_password_reset_datetime?: Date;
  mu_login_allow_time_status: number;
  mu_login_allow_start_time?: string;
  mu_login_allow_end_time?: string;
  mu_status: number;
  mu_tenant_id?: number;
  mu_department?: string;
  mu_internal_type_id?: number;
  mu_mrt_id?: number;
  mm_msm_id?: number;
  mu_deleted: number;
  mu_created_at?: Date;
  mu_created_by: number;
  mu_updated_at?: Date;
  mu_updated_by?: number;
  mu_created_date?: Date;
  mu_baseline_user_id?: number;
  mu_multi_tenant_access?: number;
  mu_otp?: string;
  mu_otp_expiry_time?: Date;
}

export interface CreateMasterUserRequest {
  mu_mp_id?: number;
  mu_username: string;
  mu_password: string;
  mu_email?: string;
  mu_mobile?: number;
  mu_tenant_id?: number;
  mu_department?: string;
  mu_internal_type_id?: number;
  mu_mrt_id?: number;
  mm_msm_id?: number;
  mu_baseline_user_id?: number;
  mu_created_by: number;
}

export interface UpdateMasterUserRequest {
  mu_id: number;
  mu_mp_id?: number;
  mu_username?: string;
  mu_password?: string;
  mu_email?: string;
  mu_mobile?: number;
  mu_status?: number;
  mu_tenant_id?: number;
  mu_department?: string;
  mu_internal_type_id?: number;
  mu_mrt_id?: number;
  mm_msm_id?: number;
  mu_baseline_user_id?: number;
  mu_updated_by?: number;
}

export interface MasterUserResponse extends Omit<MasterUser, 'mu_password'> {}
