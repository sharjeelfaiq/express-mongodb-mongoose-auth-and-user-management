import { blacklistedTokenDataAccess } from "./blacklisted-token.data-access.js";
import { notificationDataAccess } from "./notification.data-access.js";
import { userDataAccess } from "./user.data-access.js";
import { otpDataAccess } from "./otp.data-access.js";

export const dataAccess = {
  read: {
    ...blacklistedTokenDataAccess.read,
    ...notificationDataAccess.read,
    ...userDataAccess.read,
    ...otpDataAccess.read,
  },

  write: {
    ...blacklistedTokenDataAccess.write,
    ...notificationDataAccess.write,
    ...userDataAccess.write,
    ...otpDataAccess.write,
  },

  update: {
    ...notificationDataAccess.update,
    ...userDataAccess.update,
  },

  remove: {
    ...userDataAccess.remove,
  },
};
