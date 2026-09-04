import { ApiError } from '../utils/ApiError';

interface Request {
  body: any;
  params: any;
  query: any;
}

interface Response {
  status: (code: number) => Response;
  json: (data: any) => void;
}

interface NextFunction {
  (error?: any): void;
}

export const errorHandler = (
  err: any,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  console.error('Error:', err);

  if (err instanceof ApiError) {
    res.status(err.statusCode || 500).json(err);
  } else {
    res.status(500).json(
      new ApiError(500, err.message || 'Internal Server Error')
    );
  }
};
