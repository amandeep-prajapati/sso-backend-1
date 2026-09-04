import Joi from "joi";

/*==============email validation===========*/
const IsEmail = (email: string): boolean => {
  let regx = /^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/;
  return regx.test(email);
};

/*==============mobile no validation============*/
const IsMobile = (mobile: number | string): boolean => {
  let regx = /^[6-9][0-9]{9}$/;
  return regx.test(mobile.toString());
};

/*==============Joi Schemas===========*/

// Login validation schema
const loginSchema = Joi.object({
  user_email: Joi.string().email().min(3).max(100).required().messages({
    "string.email": "Please enter a valid email address",
    "string.min": "Email must be at least 3 characters long",
    "string.max": "Email must not exceed 100 characters",
    "any.required": "Email is required",
  }),
  user_password: Joi.string().min(1).required().messages({
    "string.min": "Password is required",
    "any.required": "Password is required",
  }),
  dashboard_type: Joi.number().integer().min(1).max(2).optional().messages({
    "number.min": "Invalid dashboard type",
    "number.max": "Invalid dashboard type",
  }),
});

// User registration validation schema
const userRegistrationSchema = Joi.object({
  user_name: Joi.string().min(2).max(50).required().messages({
    "string.min": "Name must be at least 2 characters long",
    "string.max": "Name must not exceed 50 characters",
    "any.required": "Name is required",
  }),
  user_email: Joi.string().email().required().messages({
    "string.email": "Please enter a valid email address",
    "any.required": "Email is required",
  }),
  user_password: Joi.string().min(6).required().messages({
    "string.min": "Password must be at least 6 characters long",
    "any.required": "Password is required",
  }),
});

// Password reset validation schema
const passwordResetSchema = Joi.object({
  email: Joi.string().email().required().messages({
    "string.email": "Please enter a valid email address",
    "any.required": "Email is required",
  }),
  password: Joi.string().min(6).required().messages({
    "string.min": "Password must be at least 6 characters long",
    "any.required": "Password is required",
  }),
  confirmPassword: Joi.string().valid(Joi.ref("password")).required().messages({
    "any.only": "Password and Confirm Password do not match",
    "any.required": "Confirm Password is required",
  }),
});

// Tenant selection validation schema
const tenantSelectionSchema = Joi.object({
  tenant_id: Joi.number().integer().positive().required().messages({
    "number.positive": "Invalid tenant ID",
    "any.required": "Tenant ID is required",
  }),
});

// Token validation schema (for Authorization header)
const tokenValidationSchema = Joi.object({
  token: Joi.string().required().messages({
    "any.required": "No token provided",
  }),
});

/*==============Validation Functions===========*/

const validateLoginInput = (data: any) => {
  const { error, value } = loginSchema.validate(data);
  if (error) {
    return {
      isValid: false,
      message: error.details[0].message,
      errors: error.details.map((detail: any) => detail.message),
    };
  }
  return { isValid: true, message: "Valid input", data: value };
};

const validateUserInput = (data: any) => {
  const { error, value } = userRegistrationSchema.validate(data);
  if (error) {
    return {
      isValid: false,
      message: error.details[0].message,
      errors: error.details.map((detail: any) => detail.message),
    };
  }
  return { isValid: true, message: "Valid input", data: value };
};

const validatePasswordInput = (data: any) => {
  const { error, value } = passwordResetSchema.validate(data);
  if (error) {
    return {
      isValid: false,
      message: error.details[0].message,
      errors: error.details.map((detail: any) => detail.message),
    };
  }
  return { isValid: true, message: "Valid input", data: value };
};

const validateTenantId = (data: any) => {
  const { error, value } = tenantSelectionSchema.validate(data);
  if (error) {
    return {
      isValid: false,
      message: error.details[0].message,
      errors: error.details.map((detail: any) => detail.message),
    };
  }
  return { isValid: true, message: "Valid input", data: value };
};

// Validate token from Authorization header
const validateToken = (authHeader: string | undefined) => {
  if (!authHeader) {
    return {
      isValid: false,
      message: "No token provided",
    };
  }

  const token = authHeader.replace("Bearer ", "");
  const { error, value } = tokenValidationSchema.validate({ token });
  
  if (error) {
    return {
      isValid: false,
      message: error.details[0].message,
    };
  }
  
  return { isValid: true, message: "Valid token", data: { token } };
};

// Validate tenant selection request
const validateTenantSelection = (data: any) => {
  const { error, value } = tenantSelectionSchema.validate(data);
  if (error) {
    return {
      isValid: false,
      message: error.details[0].message,
      errors: error.details.map((detail: any) => detail.message),
    };
  }
  return { isValid: true, message: "Valid input", data: value };
};

export {
  IsEmail,
  IsMobile,
  validateLoginInput,
  validateUserInput,
  validatePasswordInput,
  validateTenantId,
  validateToken,
  validateTenantSelection,
  loginSchema,
  userRegistrationSchema,
  passwordResetSchema,
  tenantSelectionSchema,
  tokenValidationSchema,
};
