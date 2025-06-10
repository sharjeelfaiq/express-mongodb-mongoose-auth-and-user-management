import createError from "http-errors";
import bcrypt from "bcryptjs";

import {
  generateToken,
  decodeToken,
  sendVerificationEmail,
} from "#utils/index.js";
import { dataAccess } from "#dataAccess/index.js";

const { save, read, remove, update } = dataAccess;

const authService = {
  signUp: async ({ phone, email, password, role }) => {
    const existingUser = await read.userByEmail(email);
    if (existingUser) {
      throw createError(400, "A user with this email already exists.");
    }

    if (role === "educator" && !phone) {
      throw createError(400, "Phone number is required for educators.");
    } else if (role === "admin" || (role === "organization" && phone)) {
      phone = undefined; // Phone number is not required for admin or organization roles
    }

    const newUser = await save.user(phone, email, password, role);
    if (!newUser) {
      throw createError(500, "Failed to create a new user.");
    }

    const verificationToken = generateToken(newUser._id);
    if (!verificationToken) {
      await remove.userById(newUser._id);
      throw createError(500, "An error occurred while generating the token.");
    }

    const isEmailSent = await sendVerificationEmail(
      email,
      verificationToken,
      "verify-email"
    );
    if (!isEmailSent) {
      await remove.userById(newUser._id);
      throw createError(500, "Failed to send the welcome email.");
    }

    return {
      success: true,
      message:
        "Account registered successfully. Please verify your email address.",
    };
  },

  signIn: async ({ email, password }) => {
    const user = await read.userByEmail(email);
    if (!user) {
      throw createError(401, "Invalid email or password.");
    }

    if (!user.isEmailVerified) {
      throw createError(403, "Email not verified. Please check your inbox.");
    }

    if (user.role === "educator" && !user.isPhoneVerified) {
      throw createError(
        403,
        "Phone number not verified. Educators must verify their phone numbers."
      );
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      throw createError(401, "Invalid password.");
    }

    const token = generateToken(user._id, user.role);
    if (!token) {
      throw createError(500, "Token generation failed.");
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
    const decoded = decodeToken(token);
    if (!decoded) {
      throw createError(401, "The provided token is invalid or expired.");
    }

    const id = decoded.id;
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1-hour expiration
    const blacklistedToken = await save.blacklistedToken(token, expiresAt, id);
    if (!blacklistedToken) {
      throw createError(500, "An error occurred while blacklisting the token.");
    }

    return {
      success: true,
      message: "Signed out successfully.",
    };
  },

  forgetPassword: async ({ email }) => {
    const existingUser = await read.userByEmail(email);
    if (!existingUser) {
      throw createError(404, "User not found");
    }

    const resetToken = generateToken(existingUser._id);
    if (!resetToken) {
      throw createError(500, "Failed to generate reset token");
    }

    const isEmailSent = await sendVerificationEmail(
      email,
      resetToken,
      "reset-password"
    );
    if (!isEmailSent) {
      throw createError(500, "Failed to send reset password email");
    }

    return {
      success: true,
      message: "Reset password email sent successfully.",
    };
  },

  updatePassword: async ({ password, token }) => {
    const decodedToken = decodeToken(token);
    if (!decodedToken) {
      throw createError(400, "Invalid or expired token");
    }

    const { userId } = decodedToken;
    if (!userId) {
      throw createError(400, "Invalid token payload");
    }

    const existingUser = await read.userById(userId);
    if (!existingUser) {
      throw createError(404, "User not found");
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const isPasswordUpdated = await update.userById(userId, {
      password: hashedPassword,
    });
    if (!isPasswordUpdated) {
      throw createError(500, "Password update failed");
    }

    return { success: true, message: "Password updated successfully." };
  },
};

export default authService;
