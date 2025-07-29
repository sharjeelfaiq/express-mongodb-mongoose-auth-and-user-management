import { BlacklistedTokenModel } from "#models/index.js";

export const blacklistedTokenDataAccess = {
  read: {
    blacklistedToken: (token: string) => {
      return BlacklistedTokenModel.findOne({ token }).exec();
    },
  },

  write: {
    blacklistedToken: (token: string, id: string, expiresAt: number) => {
      return BlacklistedTokenModel.create({
        token,
        userId: id,
        expiresAt,
      });
    },
  },
};
