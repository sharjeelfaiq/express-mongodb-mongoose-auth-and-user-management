import { OTPModel } from "#models/index.js";

export const otp = {
  read: {
    otp: async (id) => {
      return await OTPModel.find({ id }).sort({ createdAt: -1 }).limit(1);
    },
  },

  write: {
    otp: async ({ otpHash, id, expiresAt }) => {
      return await OTPModel.create({
        otpHash,
        id,
        expiresAt,
      });
    },
  },
};
