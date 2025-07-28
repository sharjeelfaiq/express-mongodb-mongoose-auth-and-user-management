import createError from "http-errors";
import bcrypt from "bcryptjs";

import { generateOTP, sendEmail } from "#utils/index.js";
import { dataAccess } from "#dataAccess/index.js";

const { write, read } = dataAccess;

export const otpServices = {
  send: async ({ email }) => {
    const existingUser = await read.userByEmail(email);
    if (!existingUser) {
      throw createError(404, "User not found.");
    }

    const { rawOTP, hashedOTP, expiresAt } = await generateOTP();

    const isOTPSaved = await write.otp({
      otpHash: hashedOTP,
      id: existingUser._id,
      expiresAt,
    });

    if (!isOTPSaved) {
      throw createError(500, "Failed to save OTP.");
    }

    const sentEmail = await sendEmail("otp-email", {
      email,
      subject: "Here's your OTP",
      rawOTP,
    });

    if (!sentEmail) {
      throw createError(500, "Failed to send email.");
    }
  },

  verify: async ({ email, otp }) => {
    const existingUser = await read.userByEmail(email);
    if (!existingUser) {
      throw createError(404, "User not found.");
    }

    const existingOTPs = await read.otp(existingUser._id);

    if (!existingOTPs || !existingOTPs.length) {
      throw createError(400, "Invalid OTP");
    }

    const comparisonResults = await Promise.all(
      existingOTPs.map((existingOTP) =>
        bcrypt.compare(otp, existingOTP.otpHash),
      ),
    );

    const isOTPValid = comparisonResults.some((result) => result === true);

    if (!isOTPValid) {
      throw createError(400, "Invalid OTP");
    }
  },
};
