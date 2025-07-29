import createError from "http-errors";
import express from "express";

import { jwtUtils, sendEmail, bcryptUtils } from "#utils/index.js";
import { dataAccess } from "#data-access/index.js";
import { backendUrl } from "#constants/index.js";

const { write, read, update } = dataAccess;

export const authServices = {
  signUp: async (reqBody: express.Request["body"]) => {
    const { email, password, role } = reqBody;

    const existingEmail = await read.userByEmail(email);

    if (existingEmail) {
      throw createError(400, "A user with this email already exists.", {
        expose: true,
        code: "EMAIL_EXISTS",
        field: "email",
        operation: "sign_up",
        context: { email, role },
      });
    }

    const hashedPassword = await bcryptUtils.hash(password, { rounds: 12 });

    const newUser = await write.user({
      email,
      password: hashedPassword,
      role,
    });

    if (!newUser) {
      throw createError(500, "Failed to create a new user.", {
        expose: false,
        code: "USER_CREATION_FAILED",
        operation: "write.user",
        context: { email, role },
      });
    }

    const verificationToken = jwtUtils.generate(
      { id: newUser._id },
      "verificationToken"
    );

    if (!verificationToken) {
      throw createError(500, "An error occurred while generating the token.", {
        expose: false,
        code: "TOKEN_GENERATION_FAILED",
        operation: "Account Verification",
        id: newUser._id,
        context: { purpose: "email_verification" },
      });
    }

    if (!backendUrl) {
      throw createError(500, "Backend URL is not defined.", {
        expose: false,
        code: "BACKEND_URL_NOT_DEFINED",
        operation: "Account Verification",
        id: newUser._id,
        context: { purpose: "email_verification" },
      });
    }

    const sentEmail = await sendEmail("verification-email", {
      email,
      subject: "Welcome - Verify your email",
      backendUrl,
      verificationToken,
    });

    if (!sentEmail) {
      throw createError(500, "Failed to send the welcome email.", {
        expose: false,
        code: "EMAIL_SEND_FAILED",
        operation: "Sending Verification Email",
        id: newUser._id,
        context: {
          emailType: "verify-email",
          recipient: email,
        },
      });
    }
  },

  signIn: async (reqBody: express.Request["body"]) => {
    const { email, password } = reqBody;

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

    const userId = user._id;

    if (!user.isEmailVerified) {
      // Generate new verification token
      const verificationToken = jwtUtils.generate(
        { id: userId },
        "verificationToken"
      );

      if (!verificationToken) {
        throw createError(
          500,
          "An error occurred while generating the token.",
          {
            expose: false,
            code: "TOKEN_GENERATION_FAILED",
            operation: "jwtUtils.generate",
            id: userId,
            context: { purpose: "email_verification" },
          }
        );
      }

      // Send verification email
      const sentEmail = await sendEmail("verification-email", {
        email,
        subject: "Welcome - Verify your email",
        verificationToken,
      });

      if (!sentEmail) {
        throw createError(500, "Failed to send the verification email.", {
          expose: false,
          code: "EMAIL_SEND_FAILED",
          operation: "sendEmail",
          id: userId,
          context: {
            emailType: "verification-email",
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
          id: userId,
          operation: "sign_in",
          context: { action: "verify_email" },
        }
      );
    }

    const isPasswordValid = await bcryptUtils.compare(password, user.password);

    if (!isPasswordValid) {
      throw createError(401, "Invalid credentials.", {
        expose: true,
        code: "INVALID_CREDENTIALS",
        field: "password",
        operation: "sign_in",
        headers: { "www-authenticate": "Bearer" },
      });
    }

    const accessToken = jwtUtils.generate(
      { id: userId, role: user.role },
      "accessToken"
    );

    if (!accessToken) {
      throw createError(500, "Token generation failed.", {
        expose: false,
        code: "TOKEN_GENERATION_FAILED",
        operation: "jwtUtils.generate",
        id: userId,
        context: { role: user.role, purpose: "authentication" },
      });
    }

    const data = {
      id: userId,
      role: user.role,
      accessToken,
    };

    return data;
  },

  signOut: async (reqHeaders: express.Request["headers"]) => {
    const { authorization } = reqHeaders;

    const accessToken: string = authorization
      ? authorization.replace("Bearer ", "")
      : "";

    const existingBlacklistedToken = await read.blacklistedToken(accessToken);

    if (existingBlacklistedToken) {
      throw createError(400, "Token is already blacklisted.", {
        expose: true,
        code: "TOKEN_BLACKLISTED",
        operation: "read.blacklistedToken",
        context: { accessToken },
      });
    }

    const decodedToken = jwtUtils.verify(accessToken);
    const { id } = decodedToken;

    const expiresAt: number = new Date(Date.now() + 60 * 60 * 1000).getTime(); // 1-hour expiration

    const blacklistedToken = await write.blacklistedToken(
      accessToken,
      id,
      expiresAt
    );

    if (!blacklistedToken) {
      throw createError(
        500,
        "An error occurred while blacklisting the accessToken.",
        {
          expose: false,
          code: "TOKEN_BLACKLIST_FAILED",
          operation: "write.blacklistedToken",
          id,
          context: { expiresAt: expiresAt.toString() },
        }
      );
    }
  },

  requestPasswordReset: async (reqBody: express.Request["body"]) => {
    const { email } = reqBody;

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

    const resetToken = jwtUtils.generate(
      { id: existingUser._id },
      "passwordResetToken"
    );

    if (!resetToken) {
      throw createError(500, "Failed to generate reset token", {
        expose: false,
        code: "TOKEN_GENERATION_FAILED",
        operation: "jwtUtils.generate",
        id: existingUser._id,
        context: { purpose: "password_reset" },
      });
    }

    const sentEmail = await sendEmail("reset-password", {
      email,
      subject: "Reset your password",
      resetToken,
    });

    if (!sentEmail) {
      throw createError(500, "Failed to send reset password email", {
        expose: false,
        code: "EMAIL_SEND_FAILED",
        operation: "sendEmail",
        id: existingUser._id,
        context: {
          emailType: "reset-password",
          recipient: email,
        },
      });
    }
  },

  updatePassword: async (reqBody: express.Request["body"]) => {
    const { password, resetToken } = reqBody;

    const decodedToken = jwtUtils.verify(resetToken);

    const { id } = decodedToken;

    const existingUser = await read.userById(id);

    if (!existingUser) {
      throw createError(404, "User not found", {
        expose: true,
        code: "USER_NOT_FOUND",
        field: "userId",
        id,
        operation: "update_password",
      });
    }

    const hashedPassword = await bcryptUtils.hash(password, { rounds: 12 });

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
  },
};
