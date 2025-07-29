import express from 'express';
import { dataAccess } from "#data-access/index.js";
import createError from "http-errors";

const { read, update } = dataAccess;

export const notificationServices = {
  read: async (pathParams: express.Request["params"]) => {
    const { userId } = pathParams;

    const data = await read.notificationByUserId(userId);

    if (!data) {
      throw createError(500, "Notification retrieval failed");
    }

    return data;
  },

  updateById: async (pathParams: express.Request["params"]) => {
    const { notiId } = pathParams;

    const data = await update.notificationById(notiId);

    if (!data) {
      throw createError(500, "Notification update failed");
    }

    return data;
  },
};
