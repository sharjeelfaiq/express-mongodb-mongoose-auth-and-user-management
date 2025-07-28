import createError from "http-errors";

import { tokenUtils, sendEmail } from "#utils/index.js";
import { dataAccess } from "#dataAccess/index.js";
import { frontendUrl } from "#constants/index.js";

const { read, update, remove } = dataAccess;

export const emailServices = {
  checkVerificationToken: async (verificationToken) => {
    const decodedToken = tokenUtils.decode(verificationToken);

    const { id } = decodedToken;

    if (!id) {
      throw createError(400, "Token does not contain the user id", {
        expose: true,
        code: "INVALID_TOKEN_PAYLOAD",
        field: "verificationToken",
        operation: "email_verification",
        context: { tokenDecoded: !!decoded },
      });
    }

    const isUserUpdated = await update.userById(id, {
      isEmailVerified: true,
    });

    if (!isUserUpdated) {
      throw createError(500, "An error occurred while verifying the email", {
        expose: false,
        code: "EMAIL_VERIFICATION_FAILED",
        operation: "update.userById",
        userId: id,
        context: { field: "isEmailVerified" },
      });
    }

    const sentEmail = await sendEmail("verification-notification", {
      frontendUrl,
    });

    if (!sentEmail) {
      throw createError(500, "Failed to send the verification email.", {
        expose: false,
        code: "EMAIL_SEND_FAILED",
        operation: "sendEmail",
        context: { type: "verification-notification" },
      });
    }

    return sentEmail;
  },

  sendVerificationToken: async ({ email }) => {
    const user = await read.userByEmail(email);

    if (!user) {
      throw createError(404, "User not found", {
        expose: true,
        code: "USER_NOT_FOUND",
        field: "email",
        operation: "send_verification_email",
        context: { email },
      });
    }

    const verificationToken = tokenUtils.generate(
      { id: user._id },
      "verificationToken",
    );

    if (!verificationToken) {
      await remove.userById(user._id);
      throw createError(500, "An error occurred while generating the token.", {
        expose: false,
        code: "TOKEN_GENERATION_FAILED",
        operation: "tokenUtils.generate",
        userId: user._id,
        context: { purpose: "email_verification", resend: true },
      });
    }

    const sentEmail = await sendEmail("verification-email", {
      email,
      subject: "Welcome - Verify your email",
      verificationToken,
    });

    if (!sentEmail) {
      await remove.userById(user._id);
      throw createError(500, "Failed to send the welcome email.", {
        expose: false,
        code: "EMAIL_SEND_FAILED",
        operation: "sendEmail",
        userId: user._id,
        context: {
          emailType: "verification",
          recipient: email,
          resend: true,
        },
      });
    }
  },
};
