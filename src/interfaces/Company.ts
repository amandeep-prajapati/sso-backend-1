export interface Company {
  mc_id?: number;
  mc_name: string;
  mc_logo?: string;
  mc_cin_no?: string;
  mc_pancard?: string;
  mc_tan_no?: string;
  mc_registered_email?: string;
  mc_registered_mobile?: number;
  mc_registered_phone_no?: string;
  mc_care_email?: string;
  mc_care_mobile?: number;
  mc_website_url?: string;
  mc_address?: string;
  mc_city?: string;
  mc_state?: string;
  mc_country?: string;
  mc_pincode?: string;
  mc_active: number;
  mc_deleted: number;
  mc_created_at?: Date;
  mc_created_by: number;
  mc_updated_at?: Date;
  mc_updated_by?: number;
  mc_created_date?: Date;
}

export interface CreateCompanyRequest {
  mc_name: string;
  mc_logo?: string;
  mc_cin_no?: string;
  mc_pancard?: string;
  mc_tan_no?: string;
  mc_registered_email?: string;
  mc_registered_mobile?: number;
  mc_registered_phone_no?: string;
  mc_care_email?: string;
  mc_care_mobile?: number;
  mc_website_url?: string;
  mc_address?: string;
  mc_city?: string;
  mc_state?: string;
  mc_country?: string;
  mc_pincode?: string;
  mc_created_by: number;
}

export interface UpdateCompanyRequest {
  mc_id: number;
  mc_name?: string;
  mc_logo?: string;
  mc_cin_no?: string;
  mc_pancard?: string;
  mc_tan_no?: string;
  mc_registered_email?: string;
  mc_registered_mobile?: number;
  mc_registered_phone_no?: string;
  mc_care_email?: string;
  mc_care_mobile?: number;
  mc_website_url?: string;
  mc_address?: string;
  mc_city?: string;
  mc_state?: string;
  mc_country?: string;
  mc_pincode?: string;
  mc_active?: number;
  mc_updated_by?: number;
}

export interface CompanyResponse extends Company {}
