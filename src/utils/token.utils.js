import createError from "http-errors";
import jwt from "jsonwebtoken";

import { env } from "#config/index.js";

const { JWT_SECRET_KEY } = env;

export const tokenUtils = {
  generate: (payload, tokenType) => {
    const options = {
      expiresIn: null,
      algorithm: "HS256",
    };

    switch (tokenType) {
      case "verificationToken":
        options.expiresIn = "10m";
        break;
      case "accessToken":
        options.expiresIn = "30h";
        break;
      case "refreshToken":
        options.expiresIn = "7d";
        break;
      case "passwordResetToken":
        options.expiresIn = "15m";
        break;
      default:
        throw createError(400, "Invalid token type specified.");
    }

    return jwt.sign(payload, JWT_SECRET_KEY, options);
  },

  verify: (token) => {
    return jwt.verify(token, JWT_SECRET_KEY);
  },

  decode: (token) => {
    return jwt.decode(token); // Use only for inspection/debug
  },
};
