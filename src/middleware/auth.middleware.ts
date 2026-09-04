import jwt from 'jsonwebtoken';

interface Request {
  body: any;
  params: any;
  query: any;
  header: (name: string) => string | undefined;
  user?: any;
}

interface Response {
  status: (code: number) => Response;
  json: (data: any) => void;
}

interface NextFunction {
  (error?: any): void;
}

export interface AuthenticatedRequest extends Request {
  user?: {
    user_id: number;
    user_name: string;
    role_name: string;
    tenant_ids: number[];
    selected_tenant_id: number;
    role_id: number;
    product_id: number | null;
  };
}

export const authMiddleware = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");
    if (!token) {
      res.status(401).json({
        success: false,
        message: "Access denied. No token provided.",
      });
      return;
    }

    const jwtSecret = process.env.JWT_SECRET || "your-secret-key";
    const decoded = jwt.verify(token, jwtSecret) as any;
    req.user = {
      user_id: decoded.user_id,
      selected_tenant_id: decoded.selected_tenant_id,
      user_name: decoded.user_name,
      role_name: decoded.role_name,
      tenant_ids: decoded.tenant_ids || [],
      role_id : decoded.role_id,
      product_id: decoded.product_id || null
    };

    next();
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(401).json({
      success: false,
      message: "Invalid token.",
    });
  }
};
