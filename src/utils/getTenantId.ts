interface Request {
  user?: {
    selected_tenant_id?: number;
    tenant_ids?: number[];
  };
}

/**
 * Extract tenant ID from authenticated request
 * @param req - Express request object with user data
 * @returns tenant_id or null
 */
export const getTenantId = (req: Request): number | null => {
  if (req.user?.selected_tenant_id) {
    return req.user.selected_tenant_id;
  }
  
  if (req.user?.tenant_ids && req.user.tenant_ids.length > 0) {
    return req.user.tenant_ids[0];
  }
  
  return null;
};
