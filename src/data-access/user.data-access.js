import createError from "http-errors";
import mongoose from "mongoose";

import { UserModel } from "#models/index.js";

const { isValidObjectId } = mongoose;

export const user = {
  save: {
    user: async (phone, email, password, role) => {
      return await UserModel.create({
        phone,
        email,
        password,
        role,
      });
    },
  },

  read: {
    allUsers: async () => {
      return await UserModel.find();
    },

    userByEmail: async (email) => {
      return await UserModel.findOne({
        email,
      });
    },

    userById: async (id) => {
      if (!isValidObjectId(id)) {
        throw createError(400, "Invalid user ID format.");
      }

      return await UserModel.findById(id);
    },
  },

  update: {
    userById: async (id, userData) => {
      if (!isValidObjectId(id)) {
        throw createError(400, "Invalid user ID format.");
      }

      return await UserModel.findByIdAndUpdate(id, userData, {
        new: true,
        upsert: true,
      });
    },

    userByEmail: async (email, userData) => {
      return await UserModel.findOneAndUpdate({ email }, userData, {
        new: true,
        upsert: true,
      });
    },

    forgottenPassword: async (email, password) => {
      return await UserModel.findOneAndUpdate(
        { email },
        { password },
        { new: true, upsert: true }
      );
    },
  },

  remove: {
    userById: async (id) => {
      if (!isValidObjectId(id)) {
        throw createError(400, "Invalid user ID format.");
      }

      return await UserModel.findByIdAndDelete(id);
    },
  },
};
