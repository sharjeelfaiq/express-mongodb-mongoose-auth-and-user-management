import mongoose from "mongoose";
import createError from "http-errors";

import { UserModel } from "#models/index.js";

const { isValidObjectId } = mongoose;

export const userDataAccess = {
  read: {
    users: () => {
      return UserModel.find().exec();
    },

    userByEmail: (email) => {
      return UserModel.findOne({ email }).exec();
    },

    userById: (id) => {
      if (!isValidObjectId(id)) {
        throw createError(400, "Invalid user ID format.");
      }

      return UserModel.findById(id).exec();
    },
  },

  write: {
    user: ({ email, password, role }) => {
      return UserModel.create({
        email,
        password,
        role,
      });
    },
  },

  update: {
    userById: (id, userData) => {
      if (!isValidObjectId(id)) {
        throw createError(400, "Invalid user ID format.");
      }

      return UserModel.findByIdAndUpdate(id, userData, {
        new: true,
        upsert: true,
      });
    },
  },
};
