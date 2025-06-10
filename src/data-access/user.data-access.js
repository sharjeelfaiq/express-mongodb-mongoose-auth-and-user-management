import { UserModel } from "#models/index.js";

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
      return await UserModel.find().select("-password");
    },

    userByEmail: async (email) => {
      return await UserModel.findOne({
        email,
      });
    },

    userById: async (id) => {
      return await UserModel.findById(id).select("-password");
    },
  },

  update: {
    userById: async (id, userData) => {
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
      return await UserModel.findByIdAndDelete(id);
    },
  },
};
