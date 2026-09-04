export interface ServiceProviderResponse {
  msp_provider_id: number;
  msp_provider_name: string;
  msp_provider_code: string;
  msp_active: number;
  msp_deleted: number;
  msp_created_by: number;
  msp_created_at: string;
  msp_updated_by: number;
  msp_updated_at: string;
}

export interface CreateServiceProviderRequest {
  msp_provider_name: string;
  msp_provider_code: string;
  msp_created_by: number;
}

export interface UpdateServiceProviderRequest {
  msp_provider_id: number;
  msp_provider_name?: string;
  msp_provider_code?: string;
  msp_active?: number;
  msp_updated_by: number;
}