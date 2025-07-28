import createError from "http-errors";
import mongoose from "mongoose";
import { UserModel } from "#models/index.js";

const { isValidObjectId } = mongoose;

export const userDataAccess = {
  read: {
    users: () => {
      return UserModel.find().exec(); // ✅ ensure native Promise
    },

    userByEmail: (email) => {
      return UserModel.findOne({ email }).exec(); // ✅ safer
    },

    userById: (id) => {
      if (!isValidObjectId(id)) {
        throw createError(400, "Invalid user ID format.");
      }

      return UserModel.findById(id).exec(); // ✅ native Promise
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
      }); // ✅ native Promise already
    },
  },
};
