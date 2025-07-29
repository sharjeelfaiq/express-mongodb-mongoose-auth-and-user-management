import { Schema } from "joi";
import express from "express";
import createError from "http-errors";

import { globalUtils, jwtUtils } from "#utils/index.js";

const { wrapExpressAsync } = globalUtils;

interface DecodedToken {
  id: string;
  role: string;
  iat: number;
  exp: number;
}

declare module "express" {
  interface Request {
    user?: DecodedToken;
  }
}

export const validate = {
  dto: (schema: Schema) =>
    wrapExpressAsync(
      async (
        req: express.Request,
        _: express.Response,
        next: express.NextFunction
      ) => {
        const { value, error } = schema.validate(req.body, {
          abortEarly: false,
        });

        if (error) {
          const errorMessages = error.details.map(({ message }) => message);
          throw createError(
            400,
            `Validation failed: ${errorMessages.join(", ")}`
          );
        }

        req.body = value;
        next();
      }
    ),

  accessToken: wrapExpressAsync(
    async (
      req: express.Request,
      _: express.Response,
      next: express.NextFunction
    ) => {
      const authHeader = req.headers.authorization;

      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        throw createError(401, "Authorization token missing or malformed.");
      }

      const accessToken = authHeader.split(" ")[1]; // Get token after 'Bearer '

      const decodedToken = jwtUtils.verify(accessToken);

      req.user = decodedToken;
      next();
    }
  ),

  authRole: (authorizedRole: string) =>
    wrapExpressAsync(
      async (
        req: express.Request,
        _: express.Response,
        next: express.NextFunction
      ) => {
        if (!req.user) {
          throw createError(401, "Authentication required.");
        }

        if (req.user.role !== authorizedRole) {
          throw createError(
            403,
            `Access denied: ${authorizedRole} role required.`
          );
        }
        next();
      }
    ),
};
