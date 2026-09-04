export interface Product {
  mp_id?: number;
  mp_name: string;
  mp_code: string;
  mp_active: number;
  mp_deleted: number;
  mp_created_at?: Date;
  mp_created_by: number;
  mp_updated_at?: Date;
  mp_updated_by?: number;
  mp_created_date?: Date;
}

export interface CreateProductRequest {
  mp_name: string;
  mp_code: string;
  mp_created_by: number;
}

export interface UpdateProductRequest {
  mp_id: number;
  mp_name?: string;
  mp_code?: string;
  mp_active?: number;
  mp_updated_by?: number;
}

export interface ProductResponse extends Product {}
