import { ApiError } from '../utils/ApiError';
import { HTTP_STATUS } from '../utils/apiConstants';

/**
 * Validation middleware factory
 * Creates middleware that validates request data using Joi schema
 */
export const validate = (schema: any, source: 'body' | 'params' | 'query' = 'body') => {
  return (req: any, res: any, next: any) => {
    const dataToValidate = req[source];

    const { error, value } = schema.validate(dataToValidate, {
      abortEarly: false,
      stripUnknown: true
    });

    if (error) {
      const errorMessages = error.details.map((detail: any) => detail.message).join(', ');
      return res.status(HTTP_STATUS.OK).json(
        new ApiError(HTTP_STATUS.BAD_REQUEST, errorMessages)
      );
    }

    // Replace request data with validated and sanitized data
    req[source] = value;
    next();
  };
};

/**
 * Validation middleware for combined sources
 * Validates body, params, and query together
 */
export const validateCombined = (schema: any) => {
  return (req: any, res: any, next: any) => {
    const dataToValidate = {
      ...req.body,
      ...req.params,
      ...req.query
    };

    const { error, value } = schema.validate(dataToValidate, {
      abortEarly: false,
      stripUnknown: true
    });

    if (error) {
      const errorMessages = error.details.map((detail: any) => detail.message).join(', ');
      return res.status(HTTP_STATUS.OK).json(
        new ApiError(HTTP_STATUS.BAD_REQUEST, errorMessages)
      );
    }

    // Update request with validated data
    Object.assign(req.body, value);
    Object.assign(req.params, value);
    Object.assign(req.query, value);
    
    next();
  };
};
