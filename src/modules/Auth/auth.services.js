import createError from "http-errors";
import bcrypt from "bcryptjs";

import {
  generateToken,
  decodeToken,
  sendVerificationEmail,
  sendWhatsAppOTP,
} from "#utils/index.js";
import { dataAccess } from "#dataAccess/index.js";

const { save, read, remove, update } = dataAccess;

export const authServices = {
  signUp: async (data) => {
    const { phone, email, password, role } = data;

    const existingUser = await read.userByEmail(email);
    if (existingUser) {
      throw createError(400, "A user with this email already exists.", {
        expose: true,
        code: "EMAIL_EXISTS",
        field: "email",
        operation: "sign_up",
        context: { email, role },
      });
    }

    const newUser = await save.user(phone, email, password, role);
    if (!newUser) {
      throw createError(500, "Failed to create a new user.", {
        expose: false,
        code: "USER_CREATION_FAILED",
        operation: "save.user",
        context: { email, role },
      });
    }

    const verificationToken = generateToken(newUser._id);
    if (!verificationToken) {
      await remove.userById(newUser._id);
      throw createError(500, "An error occurred while generating the token.", {
        expose: false,
        code: "TOKEN_GENERATION_FAILED",
        operation: "generateToken",
        id: newUser._id,
        context: { purpose: "email_verification" },
      });
    }

    const isEmailSent = await sendVerificationEmail(
      email,
      verificationToken,
      "verify-email"
    );
    if (!isEmailSent) {
      await remove.userById(newUser._id);
      throw createError(500, "Failed to send the welcome email.", {
        expose: false,
        code: "EMAIL_SEND_FAILED",
        operation: "sendVerificationEmail",
        id: newUser._id,
        context: {
          emailType: "verify-email",
          recipient: email,
        },
      });
    }

    const isWhatsAppOtpSent = await sendWhatsAppOTP(phone);
    if (!isWhatsAppOtpSent) {
      await remove.userById(newUser._id);
      throw createError(500, "Failed to send OTP", {
        expose: false,
        code: "TWILIO_OTP_SEND_FAILED",
        operation: "send_whatsapp_otp",
        context: {
          phone,
          channel: "whatsapp",
          service: "twilio_verify",
        },
      });
    }

    return {
      success: true,
      message:
        "Account registered successfully. Please verify your email address.",
    };
  },

  signIn: async (data) => {
    const { email, password } = data;

    const user = await read.userByEmail(email);
    if (!user) {
      throw createError(401, "Invalid credentials.", {
        expose: true,
        code: "INVALID_CREDENTIALS",
        field: "email",
        operation: "sign_in",
        headers: { "www-authenticate": "Bearer" },
      });
    }

    if (!user.isEmailVerified) {
      const verificationToken = generateToken(user._id);
      if (!verificationToken) {
        await remove.userById(user._id);
        throw createError(
          500,
          "An error occurred while generating the token.",
          {
            expose: false,
            code: "TOKEN_GENERATION_FAILED",
            operation: "generateToken",
            id: user._id,
            context: { purpose: "email_verification" },
          }
        );
      }

      const isEmailSent = await sendVerificationEmail(
        email,
        verificationToken,
        "verify-email"
      );
      if (!isEmailSent) {
        await remove.userById(user._id);
        throw createError(500, "Failed to send the verification email.", {
          expose: false,
          code: "EMAIL_SEND_FAILED",
          operation: "sendVerificationEmail",
          id: user._id,
          context: {
            emailType: "verify-email",
            recipient: email,
          },
        });
      }

      // Then throw error informing the user
      throw createError(
        403,
        "Email not verified. A new verification link has been sent to your inbox.",
        {
          expose: true,
          code: "EMAIL_NOT_VERIFIED",
          id: user._id,
          operation: "sign_in",
          context: { action: "verify_email" },
        }
      );
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      throw createError(401, "Invalid credentials.", {
        expose: true,
        code: "INVALID_CREDENTIALS",
        field: "password",
        operation: "sign_in",
        headers: { "www-authenticate": "Bearer" },
      });
    }

    const token = generateToken(user._id, user.role);
    if (!token) {
      throw createError(500, "Token generation failed.", {
        expose: false,
        code: "TOKEN_GENERATION_FAILED",
        operation: "generateToken",
        id: user._id,
        context: { role: user.role, purpose: "authentication" },
      });
    }

    return {
      success: true,
      message: "Signed in successfully.",
      data: {
        id: user._id,
        role: user.role,
      },
      token,
    };
  },

  signOut: async (token) => {
    const decodedToken = decodeToken(token);
    if (!decodedToken) {
      throw createError(401, "The provided token is invalid or expired.", {
        expose: true,
        code: "INVALID_TOKEN",
        field: "token",
        operation: "sign_out",
        headers: { "www-authenticate": "Bearer" },
      });
    }

    const id = decodedToken.id;
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1-hour expiration
    const blacklistedToken = await save.blacklistedToken(token, expiresAt, id);
    if (!blacklistedToken) {
      throw createError(
        500,
        "An error occurred while blacklisting the token.",
        {
          expose: false,
          code: "TOKEN_BLACKLIST_FAILED",
          operation: "save.blacklistedToken",
          id,
          context: { expiresAt: expiresAt.toISOString() },
        }
      );
    }

    return {
      success: true,
      message: "Signed out successfully.",
    };
  },

  forgetPassword: async (data) => {
    const { email } = data;

    const existingUser = await read.userByEmail(email);
    if (!existingUser) {
      throw createError(404, "User not found", {
        expose: true,
        code: "USER_NOT_FOUND",
        field: "email",
        operation: "forget_password",
        context: { email },
      });
    }

    const resetToken = generateToken(existingUser._id);
    if (!resetToken) {
      throw createError(500, "Failed to generate reset token", {
        expose: false,
        code: "TOKEN_GENERATION_FAILED",
        operation: "generateToken",
        id: existingUser._id,
        context: { purpose: "password_reset" },
      });
    }

    const isEmailSent = await sendVerificationEmail(
      email,
      resetToken,
      "reset-password"
    );
    if (!isEmailSent) {
      throw createError(500, "Failed to send reset password email", {
        expose: false,
        code: "EMAIL_SEND_FAILED",
        operation: "sendVerificationEmail",
        id: existingUser._id,
        context: {
          emailType: "reset-password",
          recipient: email,
        },
      });
    }

    return {
      success: true,
      message: "Reset password email sent successfully.",
    };
  },

  updatePassword: async (data) => {
    const { password, token } = data;

    const decodedToken = decodeToken(token);
    if (!decodedToken) {
      throw createError(400, "Invalid or expired token", {
        expose: true,
        code: "INVALID_TOKEN",
        field: "token",
        operation: "update_password",
        context: { purpose: "password_reset" },
      });
    }

    const { id } = decodedToken;

    const existingUser = await read.userById(id);
    if (!existingUser) {
      throw createError(404, "User not found", {
        expose: true,
        code: "USER_NOT_FOUND",
        field: "id",
        id,
        operation: "update_password",
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const isPasswordUpdated = await update.userById(id, {
      password: hashedPassword,
    });
    if (!isPasswordUpdated) {
      throw createError(500, "Password update failed", {
        expose: false,
        code: "PASSWORD_UPDATE_FAILED",
        operation: "update.userById",
        id,
        context: { field: "password" },
      });
    }

    return { success: true, message: "Password updated successfully." };
  },
};
