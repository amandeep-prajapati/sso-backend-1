// Simple log schema definition for MongoDB collections
export interface LogSchema {
  _id?: string;
  timestamp: Date;
  log_type: 'USER_LOGIN' | 'USER_LOGOUT' | 'USER_ACTIVITY' | 'AUTH_ERROR' | 'SYSTEM_ERROR';
  user_id?: number;
  user_email?: string;
  activity: string;
  details?: string;
  ip_address?: string;
  user_agent?: string;
  dashboard_type?: number;
  session_duration?: string;
  error_code?: string;
  tenant_id?: number;
  created_at: Date;
}

// Collection name constant
export const LOG_COLLECTION_NAME = process.env.MONGODB_LOG_COLLECTION || 'user_activity_logs';