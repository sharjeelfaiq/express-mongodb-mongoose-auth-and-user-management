import { BlacklistedTokenModel } from "#models/index.js";

export const blacklistedTokenDataAccess = {
  read: {
    blacklistedToken: (token) => {
      return BlacklistedTokenModel.findOne({ token }).exec();
    },
  },

  write: {
    blacklistedToken: (token, id, expiresAt) => {
      return BlacklistedTokenModel.create({
        token,
        userId: id,
        expiresAt,
      });
    },
  },
};
