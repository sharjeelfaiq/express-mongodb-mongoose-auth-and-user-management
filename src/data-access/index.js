import { blacklistedToken } from "./blacklisted-token.data-access.js";
import { otp } from "./otp.data-access.js";
import { user } from "./user.data-access.js";

export const dataAccess = {
  save: {
    ...blacklistedToken.save,
    ...otp.save,
    ...user.save,
  },

  read: {
    ...blacklistedToken.read,
    ...otp.read,
    ...user.read,
  },

  update: {
    ...user.update,
  },

  remove: {
    ...user.remove,
  },
};
