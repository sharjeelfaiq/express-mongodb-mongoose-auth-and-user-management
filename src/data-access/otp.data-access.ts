import { OTPModel } from "#models/index.js";

export const otpDataAccess = {
  read: {
    otp: async (id: string) => {
      return await OTPModel.find({ id }).sort({ createdAt: -1 }).limit(1);
    },
  },

  write: {
    otp: async ({ otpHash, id, expiresAt }: { otpHash: string; id: string; expiresAt: Date }) => {
      return await OTPModel.create({
        otpHash,
        id,
        expiresAt,
      });
    },
  },
};
