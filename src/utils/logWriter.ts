import { mongoConnection } from "../config/mongoConfig";
import { LogEntry } from "../interfaces/LogEntry";
import { getFullDateTime } from "./getCurrentDatetime";

// Helper function to convert string datetime to Date object
function getCurrentDateTimeAsDate(): Date {
  const dateTimeString = getFullDateTime();
  return new Date(dateTimeString);
}

async function logwriter(logEntry: LogEntry): Promise<boolean> {
  try {
    const db = await mongoConnection.connect();
    const collection = db.collection(
      process.env.MONGODB_LOG_COLLECTION || "user_activity_logs"
    );

    const { _id, ...logData } = logEntry;
    const currentDateTime = getCurrentDateTimeAsDate();
    const result = await collection.insertOne({
      ...logData,
      timestamp: currentDateTime,
      created_at: currentDateTime,
    });

    return result.acknowledged;
  } catch (error) {
    console.error("Error writing log to MongoDB:", error);
    // Fallback to console log if MongoDB fails
    console.log("LOG ENTRY:", JSON.stringify(logEntry, null, 2));
    return false;
  }
}

// User activity logging functions
async function logUserLogin(
  user_id: number,
  user_email: string,
  dashboard_type?: number,
  ip_address?: string,
  user_agent?: string
): Promise<boolean> {
  const currentDateTime = getCurrentDateTimeAsDate();
  const logEntry: LogEntry = {
    log_type: "USER_LOGIN",
    user_id,
    user_email,
    activity: "User Login",
    details: `Dashboard type: ${dashboard_type || "default"}`,
    ip_address: ip_address || "unknown",
    user_agent,
    dashboard_type,
    timestamp: currentDateTime,
    created_at: currentDateTime,
  };
  return await logwriter(logEntry);
}

async function logUserLogout(
  user_id: number,
  user_email: string,
  session_duration?: string,
  ip_address?: string,
  user_agent?: string
): Promise<boolean> {
  const currentDateTime = getCurrentDateTimeAsDate();
  const logEntry: LogEntry = {
    log_type: "USER_LOGOUT",
    user_id,
    user_email,
    activity: "User Logout",
    details: `Session duration: ${session_duration || "unknown"}`,
    ip_address: ip_address || "unknown",
    user_agent,
    session_duration,
    timestamp: currentDateTime,
    created_at: currentDateTime,
  };
  return await logwriter(logEntry);
}

async function logUserActivity(
  user_id: number,
  activity: string,
  details?: string,
  ip_address?: string,
  user_agent?: string
): Promise<boolean> {
  const currentDateTime = getCurrentDateTimeAsDate();
  const logEntry: LogEntry = {
    log_type: "USER_ACTIVITY",
    user_id,
    activity,
    details: details || "No additional details",
    ip_address: ip_address || "unknown",
    user_agent,
    timestamp: currentDateTime,
    created_at: currentDateTime,
  };
  return await logwriter(logEntry);
}

async function logAuthError(
  email: string,
  error_type: string,
  details?: string,
  ip_address?: string,
  user_agent?: string,
  error_code?: string
): Promise<boolean> {
  const currentDateTime = getCurrentDateTimeAsDate();
  const logEntry: LogEntry = {
    log_type: "AUTH_ERROR",
    user_email: email,
    activity: `Authentication Error: ${error_type}`,
    details: details || "No additional details",
    ip_address: ip_address || "unknown",
    user_agent,
    error_code,
    timestamp: currentDateTime,
    created_at: currentDateTime,
  };
  return await logwriter(logEntry);
}

// Helper function to get client IP from request
function getClientIP(req?: any): string {
  if (!req) return "unknown";

  return (
    req.ip ||
    req.connection?.remoteAddress ||
    req.socket?.remoteAddress ||
    req.headers?.["x-forwarded-for"]?.split(",")[0] ||
    "unknown"
  );
}

// Helper function to get user agent from request
function getUserAgent(req?: any): string {
  return req?.headers?.["user-agent"] || "unknown";
}

// Trim data array
export function commonTrimDataArray(input: any): any {
  if (typeof input !== "object") {
    let output = input.trim();
    output = output.replace(/\s+/g, " ");
    output = output.replace(/Ã¢â‚¬â€œ/g, " ");
    output = output.replace(/ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Å“/g, " ");
    output = output.replace(/\s+/g, " ");
    return output;
  }

  if (Array.isArray(input)) {
    return input.map((item) => commonTrimDataArray(item));
  }

  const result: any = {};
  for (const key in input) {
    result[key] = commonTrimDataArray(input[key]);
  }
  return result;
}

// Log query functions for retrieving logs from MongoDB
async function getUserLogs(
  user_id: number,
  limit: number = 50
): Promise<LogEntry[]> {
  try {
    const db = await mongoConnection.connect();
    const collection = db.collection(
      process.env.MONGODB_LOG_COLLECTION || "user_activity_logs"
    );

    const logs = await collection
      .find({ user_id })
      .sort({ timestamp: -1 })
      .limit(limit)
      .toArray();

    return logs as unknown as LogEntry[];
  } catch (error) {
    console.error("Error retrieving user logs:", error);
    return [];
  }
}

async function getLogsByDateRange(
  start_date: Date,
  end_date: Date,
  limit: number = 100
): Promise<LogEntry[]> {
  try {
    const db = await mongoConnection.connect();
    const collection = db.collection(
      process.env.MONGODB_LOG_COLLECTION || "user_activity_logs"
    );

    const logs = await collection
      .find({
        timestamp: {
          $gte: start_date,
          $lte: end_date,
        },
      })
      .sort({ timestamp: -1 })
      .limit(limit)
      .toArray();

    return logs as unknown as LogEntry[];
  } catch (error) {
    console.error("Error retrieving logs by date range:", error);
    return [];
  }
}

async function getLogsByType(
  log_type: string,
  limit: number = 50
): Promise<LogEntry[]> {
  try {
    const db = await mongoConnection.connect();
    const collection = db.collection(
      process.env.MONGODB_LOG_COLLECTION || "user_activity_logs"
    );

    const logs = await collection
      .find({ log_type })
      .sort({ timestamp: -1 })
      .limit(limit)
      .toArray();

    return logs as unknown as LogEntry[];
  } catch (error) {
    console.error("Error retrieving logs by type:", error);
    return [];
  }
}

export default logwriter;
export {
  logUserLogin,
  logUserLogout,
  logUserActivity,
  logAuthError,
  getUserLogs,
  getLogsByDateRange,
  getLogsByType,
  getClientIP,
  getUserAgent,
  getCurrentDateTimeAsDate,
};
