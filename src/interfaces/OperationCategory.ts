export interface OperationCategory {
  moc_id?: number;
  moc_msub_id: number;
  moc_mp_id: number;
  moc_code: string;
  moc_name: string;
  moc_description?: string;
  moc_active: number;
  moc_deleted: number;
  moc_created_at?: Date;
  moc_created_by: number;
  moc_updated_at?: Date;
  moc_updated_by?: number;
  moc_created_date?: Date;
}

export interface CreateOperationCategoryRequest {
  moc_msub_id: number;
  moc_mp_id: number;
  moc_name: string;
  moc_description?: string;
  moc_created_by: number;
}

export interface UpdateOperationCategoryRequest {
  moc_id: number;
  moc_msub_id?: number;
  moc_mp_id?: number;
  moc_name?: string;
  moc_description?: string;
  moc_active?: number;
  moc_updated_by?: number;
}

export interface OperationCategoryResponse extends OperationCategory {}
