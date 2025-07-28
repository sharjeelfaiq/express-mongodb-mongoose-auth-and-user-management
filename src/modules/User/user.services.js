import createError from "http-errors";

import { dataAccess } from "#dataAccess/index.js";

const { read, update, remove } = dataAccess;

export const userServices = {
  getAll: async () => {
    const users = await read.users();

    return users;
  },

  getById: async (id) => {
    const user = await read.userById(id);

    if (!user) {
      throw createError(404, "User not found");
    }

    return user;
  },

  updateById: async (id, data) => {
    const existingUser = await read.userById(id);

    if (!existingUser) {
      throw createError(404, "User not found");
    }

    const updatedUser = await update.userById(id, data);

    if (!updatedUser) {
      throw createError(500, "User update failed");
    }

    return updatedUser;
  },

  deleteById: async (id) => {
    const user = await remove.userById(id);

    if (!user) {
      throw createError(404, "User not found");
    }
  },
};
