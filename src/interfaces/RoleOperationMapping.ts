export interface RoleOperationMapping {
  rom_id?: number;
  rom_mrt_id: number; // Role ID (Reference: master_role_type.mrt_id)
  rom_mo_id: number; // Operation ID (Reference: master_operation.mo_id)
  rom_name?: string | null; // Role Operation Mapping Name
  rom_active: number;
  rom_deleted: number;
  rom_created_at?: Date;
  rom_created_by: number;
  rom_updated_at?: Date;
  rom_updated_by?: number;
}

export interface CreateRoleOperationMappingRequest {
  rom_mrt_id: number;
  rom_mo_id: number;
  rom_name?: string | null;
  rom_created_by: number;
}

export interface CreateBulkRoleOperationMappingRequest {
  mappings: CreateRoleOperationMappingRequest[];
}

export interface UpdateRoleOperationMappingRequest {
  rom_id: number;
  rom_mrt_id?: number;
  rom_mo_id?: number;
  rom_name?: string;
  rom_active?: number;
  rom_updated_by?: number;
}

export interface RoleOperationMappingResponse extends RoleOperationMapping {}
export interface UpdateBulkRoleOperationMappingRequest {
  roleId: number;
  operationIds?: number[]; // For complete replacement
  addOperationIds?: number[]; // For adding operations
  removeOperationIds?: number[]; // For removing operations
}