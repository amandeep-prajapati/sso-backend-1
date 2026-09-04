export interface CompanyGst {
  mgst_id?: number;
  mgst_company_id: number;
  mgst_number: string;
  mgst_state_code: string;
  mgst_state_name: string;
  mgst_billing_address?: string;
  mgst_billing_contact_person_email?: string;
  mgst_billing_contact_person_mobile?: number;
  mgst_active: number;
  mgst_deleted: number;
  mgst_created_at?: Date;
  mgst_created_by: number;
  mgst_updated_at?: Date;
  mgst_updated_by?: number;
  mgst_created_date?: Date;
}

export interface CreateCompanyGstRequest {
  mgst_company_id: number;
  mgst_number: string;
  mgst_state_code: string;
  mgst_state_name: string;
  mgst_billing_address?: string;
  mgst_billing_contact_person_email?: string;
  mgst_billing_contact_person_mobile?: number;
  mgst_created_by: number;
}

export interface UpdateCompanyGstRequest {
  mgst_id: number;
  mgst_company_id?: number;
  mgst_number?: string;
  mgst_state_code?: string;
  mgst_state_name?: string;
  mgst_billing_address?: string;
  mgst_billing_contact_person_email?: string;
  mgst_billing_contact_person_mobile?: number;
  mgst_active?: number;
  mgst_updated_by?: number;
}

export interface CompanyGstResponse extends CompanyGst {}
