export interface SecurityPolicy {
  msp_id?: number;
  msp_product_id?: number;
  msp_password_min_length: number;
  msp_password_max_length: number;
  msp_password_require_uppercase: number;
  msp_password_require_lowercase: number;
  msp_password_require_number: number;
  msp_password_require_special: number;
  msp_password_expiry_days: number;
  msp_login_attempt_limit: number;
  msp_account_lock_minutes: number;
  msp_session_timeout_minutes: number;
  msp_single_login_allowed: number;
  msp_active: number;
  msp_deleted: number;
  msp_created_at?: Date;
  msp_created_by: number;
  msp_updated_at?: Date;
  msp_updated_by?: number;
  msp_created_date?: Date;
}

export interface CreateSecurityPolicyRequest {
  msp_product_id?: number;
  msp_password_min_length?: number;
  msp_password_max_length?: number;
  msp_password_require_uppercase?: number;
  msp_password_require_lowercase?: number;
  msp_password_require_number?: number;
  msp_password_require_special?: number;
  msp_password_expiry_days?: number;
  msp_login_attempt_limit?: number;
  msp_account_lock_minutes?: number;
  msp_session_timeout_minutes?: number;
  msp_single_login_allowed?: number;
  msp_created_by: number;
}

export interface UpdateSecurityPolicyRequest {
  msp_id: number;
  msp_product_id?: number;
  msp_password_min_length?: number;
  msp_password_max_length?: number;
  msp_password_require_uppercase?: number;
  msp_password_require_lowercase?: number;
  msp_password_require_number?: number;
  msp_password_require_special?: number;
  msp_password_expiry_days?: number;
  msp_login_attempt_limit?: number;
  msp_account_lock_minutes?: number;
  msp_session_timeout_minutes?: number;
  msp_single_login_allowed?: number;
  msp_active?: number;
  msp_updated_by?: number;
}

export interface SecurityPolicyResponse extends SecurityPolicy {}
