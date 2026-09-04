// Token payload interface for JWT
export interface TokenPayload {
  user_id: number;
  user_name: string;
  role_name: string;
  tenant_ids: number[];
  selected_tenant_id?: number;
  role_version?: number;
  product_id?: number | null;
  role_id?: number | null;
  product_name?: string | null;
  mu_internal_type_id?: number | null;
  mu_mat_id?: number | null;
}

// User session interface
export interface UserSession {
  user_id: number;
  user_name: string;
  user_email: string;
  role_id: number;
  role_name: string;
  tenant_ids: number[];
  tenant_names: string[];
  user_department?: string;
  user_is_active: number;
  dashboard_type?: number;
  user_otp?: string;
  user_expiry_time?: Date;
}

// OTP related interfaces
export interface SendOTPRequest {
  // No body needed - user info comes from token
}

export interface SendOTPResponse {
  success: boolean;
  message: string;
  data: {
    email: string;
    expiry_time: string;
    user_id?: number; // Optional user_id for V2 API
  };
}

export interface ResendOTPRequest {
  // No body needed - user info comes from token
}

export interface ResendOTPResponse {
  success: boolean;
  message: string;
  data: {
    email: string;
    expiry_time: string;
  };
}

export interface VerifyOTPRequest {
  otp: string;
}

export interface VerifyOTPResponse {
  success: boolean;
  message: string;
  data: {
    token: string;
    user: {
      user_id: number;
      user_name: string;
      user_email: string;
      role_name: string;
      product_id?: number | null;
      role_id?: number | null;
      product_name?: string | null;
      role_type_name?: string | null;
      admin_type_id ?: number | null;
      role_version?: number | null;
      adminType?: string | null;
    };
    permissions?: any[];
  };
}
