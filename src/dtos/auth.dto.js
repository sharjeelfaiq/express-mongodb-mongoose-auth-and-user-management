import Joi from "joi";

const emailValidation = Joi.string().email().trim().lowercase().messages({
  "string.base": "Email should be a type of text.",
  "string.email": "Please provide a valid email address.",
  "string.empty": "Email should not be empty.",
  "any.required": "Email is required.",
});

const passwordValidation = Joi.string().trim().min(6).messages({
  "string.base": "Password should be a type of text.",
  "string.empty": "Password should not be empty.",
  "string.min": "Password must be at least 6 characters long.",
  "any.required": "Password is required.",
});

const roleValidation = Joi.string()
  .valid("admin", "organization", "educator")
  .messages({
    "string.base": "Role should be a type of text.",
    "any.only": "Role must be either admin or user.",
    "any.required": "Role is required.",
  });

const signUpDto = Joi.object({
  email: emailValidation.required(),
  password: passwordValidation.required(),
  role: roleValidation.required(),
});

const signInDto = Joi.object({
  email: emailValidation.required(),
  password: passwordValidation.required(),
});

const forgotPasswordDto = Joi.object({
  email: emailValidation.required(),
});

const updatePasswordDto = Joi.object({
  password: passwordValidation.required(),
  token: Joi.string().required().messages({
    "string.base": "Verification token should be a type of text.",
    "string.empty": "Verification token should not be empty.",
    "any.required": "Verification token is required.",
  }),
});

export { signUpDto, signInDto, forgotPasswordDto, updatePasswordDto };
