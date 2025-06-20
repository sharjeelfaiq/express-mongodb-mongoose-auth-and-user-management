import createError from "http-errors";
import bcrypt from "bcryptjs";

import { generateOtp, sendOtpEmail } from "#utils/index.js";
import { dataAccess } from "#dataAccess/index.js";

const { save, read } = dataAccess;

export const otpServices = {
  send: async ({ email }) => {
    const existingUser = await read.userByEmail(email);
    if (!existingUser) {
      throw createError(404, "User not found.");
    }

    const { rawOtp, hashedOtp, expiresAt } = await generateOtp();

    const isOtpSaved = await save.otp({
      otpHash: hashedOtp,
      userId: existingUser._id,
      expiresAt,
    });

    if (!isOtpSaved) {
      throw createError(500, "Failed to save OTP.");
    }

    await sendOtpEmail(email, rawOtp);

    return { success: true, message: "OTP sent successfully" };
  },

  verify: async ({ email, otp }) => {
    const existingUser = await read.userByEmail(email);
    if (!existingUser) {
      throw createError(404, "User not found.");
    }

    const existingOtps = await read.otp(existingUser._id);

    if (!existingOtps || !existingOtps.length) {
      throw createError(400, "Invalid OTP");
    }

    const comparisonResults = await Promise.all(
      existingOtps.map((existingOtp) =>
        bcrypt.compare(otp, existingOtp.otpHash)
      )
    );

    const isOtpValid = comparisonResults.some((result) => result === true);

    if (!isOtpValid) {
      throw createError(400, "Invalid OTP");
    }

    return { success: true, message: "OTP Verified" };
  },
};