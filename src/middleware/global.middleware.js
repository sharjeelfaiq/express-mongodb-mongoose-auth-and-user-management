import morgan from "morgan";
import cors from "cors";
import express from "express";
import swaggerUi from "swagger-ui-express";
// eslint-disable-next-line no-unused-vars
import colors from "colors";

import { logger, swaggerSpec } from "#config/index.js";
import { uploadDirectory } from "#constants/index.js";

const corsOptions = {
  origin: true,
  credentials: true,
};

// eslint-disable-next-line no-unused-vars
const error_handler = async (err, req, res, next) => {
  const isProduction = process.env.NODE_ENV === "production";
  const status = err.statusCode || 500;
  const message = err.message || "Internal Server Error";
  const stack = isProduction
    ? undefined
    : err.stack || "No stack trace available";

  const errorResponse = {
    success: false,
    message,
  };

  logger.error(JSON.stringify({ ...errorResponse, stack }, null, 2));
  res.status(status).json(errorResponse);
};

const invalidRouteHandler = (req, res) => {
  res.status(404).json({ message: "Endpoint not found" });
};

const applyGlobalMiddleware = (app, rootRouter) => {
  app.use(morgan("dev"));
  app.use(cors(corsOptions));
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use("/uploads", express.static(uploadDirectory));
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
  app.use(rootRouter);
  app.use(invalidRouteHandler);
  app.use(error_handler);
};

export { applyGlobalMiddleware };
