import createError from "http-errors";
import jwt from "jsonwebtoken";

import { env } from "#config/index.js";

const { JWT_SECRET_KEY } = env;

interface DecodedToken {
  id: string;
  role: string;
  iat: number;
  exp: number;
}

export const jwtUtils = {
  generate: (
    payload: string | object | Buffer<ArrayBufferLike>,
    tokenType: string
  ) => {
    const options: jwt.SignOptions = {
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

    if (!JWT_SECRET_KEY) {
      throw createError(500, "JWT secret key is not defined");
    }

    return jwt.sign(payload, JWT_SECRET_KEY, options);
  },

  verify: (token: string): DecodedToken => {
    if (!JWT_SECRET_KEY) {
      throw createError(500, "JWT secret key is not defined");
    }

    const decoded = jwt.verify(token, JWT_SECRET_KEY);

    if (!decoded || typeof decoded !== "object" || !("id" in decoded)) {
      throw new Error("Invalid token format");
    }

    return decoded as DecodedToken;
  },

  decode: (token: string): DecodedToken => {
    const decoded = jwt.decode(token);

    if (!decoded || typeof decoded !== "object" || !("id" in decoded)) {
      throw new Error("Invalid token format");
    }

    return decoded as DecodedToken;
  },
};
