import Joi from "joi";

const emailValidation = Joi.string().email().trim().lowercase().messages({
  "string.base": "Email should be a type of text.",
  "string.email": "Please provide a valid email address.",
  "string.empty": "Email should not be empty.",
  "any.required": "Email is required.",
});

const passwordValidation = Joi.string()
  .pattern(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/,
  )
  .messages({
    "string.pattern.base":
      "Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character.",
    "string.empty": "Password should not be empty.",
    "any.required": "Password is required.",
  });

const roleValidation = Joi.string().valid("admin", "user").messages({
  "string.base": "Role should be a type of text.",
  "any.only": "Role must be either admin or user.",
  "any.required": "Role is required.",
});

const tokenValidation = Joi.string().required().messages({
  "string.base": "Verification token should be a type of text.",
  "string.empty": "Verification token should not be empty.",
  "any.required": "Verification token is required.",
});

export { emailValidation, passwordValidation, roleValidation, tokenValidation };
