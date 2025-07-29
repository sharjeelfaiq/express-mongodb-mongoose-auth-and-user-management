import createError from "http-errors";
import express from "express";

import { dataAccess } from "#data-access/index.js";

const { read, update, remove } = dataAccess;

export const userServices = {
  getAll: async () => {
    const users = await read.users();

    return users;
  },

  getById: async (pathParams: express.Request["params"]) => {
    const { id } = pathParams;

    const user = await read.userById(id);

    if (!user) {
      throw createError(404, "User not found");
    }

    return user;
  },

  updateById: async (
    pathParams: express.Request["params"],
    reqBody: express.Request["body"],
    reqFiles: express.Request["files"]
  ) => {
    const { id } = pathParams;
    const data = { ...reqBody, ...reqFiles };

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

  deleteById: async (pathParams: express.Request["params"]) => {
    const { id } = pathParams;

    const user = await remove.userById(id);

    if (!user) {
      throw createError(404, "User not found");
    }
  },
};
