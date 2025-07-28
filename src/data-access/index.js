import { blacklistedTokenDataAccess } from "./blacklisted-token.data-access.js";
import { notificationDataAccess } from "./notification.data-access.js";
import { userDataAccess } from "./user.data-access.js";

export const dataAccess = {
  read: {
    ...blacklistedTokenDataAccess.read,
    ...notificationDataAccess.read,
    ...userDataAccess.read,
  },

  write: {
    ...blacklistedTokenDataAccess.write,
    ...notificationDataAccess.write,
    ...userDataAccess.write,
  },

  update: {
    ...notificationDataAccess.update,
    ...userDataAccess.update,
  },
};
