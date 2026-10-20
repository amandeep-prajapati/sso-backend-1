export interface LogEntry {
  _id?: any;
  log_type: string;
  user_id?: number;
  user_email?: string;
  activity?: string;
  details?: string;
  ip_address?: string;
  user_agent?: string;
  dashboard_type?: number;
  session_duration?: string;
  error_code?: string;
  timestamp?: Date;
  created_at?: Date;
}
