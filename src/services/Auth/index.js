import env from "#env/index.js";
import utility from "#utility/index.js";
import { dataAccess } from "#dataAccess/index.js";
import { createError } from "#packages/index.js";
import { sendVerificationEmail } from "./helpers.js";

const {
  generateToken,
  generateAuthToken,
  generateVerificationToken,
  checkEmailVerification,
  decodeToken,
  transporter,
} = utility;
const { USER_EMAIL } = env;
const { save, fetch } = dataAccess;

export const AuthService = {
  signUp: async ({ name, email, password }) => {
    const existingUser = await fetch.userByEmail(email);
    if (existingUser) {
      throw createError(400, "A user with this email already exists.");
    }

    const newUser = await save.user(name, email, password);
    if (!newUser) {
      throw createError(500, "Failed to create a new user.");
    }

    const verificationToken = generateVerificationToken(newUser.id);
    if (!verificationToken) {
      throw createError(500, "An error occurred while generating the token.");
    }

    const isEmailSent = await sendVerificationEmail(email, verificationToken);
    if (!isEmailSent) {
      throw createError(500, "Failed to send the welcome email.");
    }

    return "User created successfully";
  },
  signIn: async ({ email, password, isRemembered }) => {
    const existingUser = await fetch.userByEmail(email);
    if (!existingUser) {
      throw createError(401, "Invalid email or password.");
    }

    const isEmailVerified = await checkEmailVerification(email);
    if (!isEmailVerified) {
      throw createError(401, "Please verify your email before signing in.");
    }

    const isValid = await user.comparePassword(password);
    if (!isValid) {
      throw createError(401, "Invalid email or password.");
    }

    const token = generateToken(
      isRemembered,
      existingUser.role,
      existingUser.id,
    );
    if (!token) {
      throw createError(500, "An error occurred while generating the token.");
    }

    return {
      message: "Sign-in successful",
      user: {
        name: existingUser.name,
      },
      token,
    };
  },
  signOut: async (token) => {
    const decoded = await decodeToken(token);
    if (!decoded) {
      throw createError(401, "The provided token is invalid or expired.");
    }

    const userId = decoded.userId;
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1-hour expiration
    const blacklistedToken = await save.blacklistedToken(
      token,
      expiresAt,
      userId,
    );

    if (!blacklistedToken) {
      throw createError(500, "An error occurred while blacklisting the token.");
    }

    return "Sign-out successful. The token has been invalidated.";
  },

  forgotPassword: async (email, password) => {
    const existingUser = await fetch.userByEmail(email);
    if (!existingUser) {
      throw createError(400, "A user with this email does not exist.");
    }

    const verificationToken = generateVerificationToken(existingUser.id);
    if (!verificationToken) {
      throw createError(500, "An error occurred while generating the token.");
    }

    const isEmailSent = await sendVerificationEmail(email, verificationToken);
    if (!isEmailSent) {
      throw createError(500, "Failed to send the welcome email.");
    }

    const updatedUser = await update.forgottenPassword(email, hashedPassword);
    if (!updatedUser) {
      throw createError(404, "User not found or update failed");
    }

    const hashedPassword = await hashPassword(password);
    if (!hashedPassword) {
      throw createError(500, "An error occurred while hashing the password.");
    }

    return "Password updated successfully";
  },
};
