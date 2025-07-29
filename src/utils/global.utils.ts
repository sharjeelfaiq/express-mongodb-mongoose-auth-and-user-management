import createError from "http-errors";
import express from "express";

export const globalUtils = {
  // 🟡 For Express middleware or route handlers
  wrapExpressAsync:
    (
      fn: (
        req: express.Request,
        res: express.Response,
        next: express.NextFunction
      ) => Promise<void> | void
    ) =>
    async (
      req: express.Request,
      res: express.Response,
      next: express.NextFunction
    ) => {
      try {
        await fn(req, res, next);
      } catch (error) {
        next(error);
      }
    },

  // 🔵 For general top-level async functions
  wrapGeneralAsync:
    (fn: (...args: any[]) => Promise<any>) =>
    async (...args: unknown[]) => {
      try {
        await fn(...args);
      } catch (err) {
        throw createError(500, (err as Error).message);
      }
    },

  // 🟢 For parsing string query params or env values
  parseDelimitedString: (input: string) => {
    return Array.isArray(input)
      ? input
      : input?.split(",").map((s) => s.trim());
  },
};
