import { dataAccess } from "#dataAccess/index.js";

const { read, update } = dataAccess;

export const notificationServices = {
  read: async (pathParams) => {
    const { userId } = pathParams;

    const data = await read.notificationByUserId(userId);

    if (!data) {
      throw createError(500, "Notification retrieval failed");
    }

    return data;
  },

  updateById: async (pathParams) => {
    const { notiId } = pathParams;

    const data = await update.notificationById(notiId);

    if (!data) {
      throw createError(500, "Notification update failed");
    }

    return data;
  },
};
