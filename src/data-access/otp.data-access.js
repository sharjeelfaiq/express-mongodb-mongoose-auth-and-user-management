import { OtpModel } from "#models/index.js";

export const otp = {
  save: {
    otp: async ({ otpHash, id, expiresAt }) => {
      return await OtpModel.create({
        otpHash,
        id,
        expiresAt,
      });
    },
  },

  read: {
    otp: async (id) => {
      return await OtpModel.find({ id }).sort({ createdAt: -1 }).limit(1);
    },
  },
};
