import mongoose from "mongoose";
import createError from "http-errors";

import { UserModel } from "#models/index.js";

const { isValidObjectId } = mongoose;

interface User {
  email: string;
  password: string;
  role: string;
  isEmailVerified: boolean;
}

export const userDataAccess = {
  read: {
    users: () => {
      return UserModel.find().exec();
    },

    userByEmail: (email: string) => {
      return UserModel.findOne({ email }).exec();
    },

    userById: (id: string) => {
      if (!isValidObjectId(id)) {
        throw createError(400, "Invalid user ID format.");
      }

      return UserModel.findById(id).exec();
    },
  },

  write: {
    user: ({
      email,
      password,
      role,
    }: Pick<User, "email" | "password" | "role">) => {
      return UserModel.create({
        email,
        password,
        role,
      });
    },
  },

  update: {
    userById: (id: string, userData: Partial<User>) => {
      if (!isValidObjectId(id)) {
        throw createError(400, "Invalid user ID format.");
      }

      return UserModel.findByIdAndUpdate(id, userData, {
        new: true,
        upsert: true,
      });
    },
  },

  remove: {
    userById: (id: string) => {
      if (!isValidObjectId(id)) {
        throw createError(400, "Invalid user ID format.");
      }

      return UserModel.findByIdAndDelete(id).exec();
    },
  },
};
