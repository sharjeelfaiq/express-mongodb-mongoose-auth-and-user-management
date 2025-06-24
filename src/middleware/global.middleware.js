import morgan from "morgan";
import cors from "cors";
import express from "express";
import swaggerUi from "swagger-ui-express";
// eslint-disable-next-line no-unused-vars
import colors from "colors";

import { logger, swaggerSpec } from "#config/index.js";

const corsOptions = {
  origin: true,
  credentials: true,
};

// eslint-disable-next-line no-unused-vars
const errorHandler = async (err, req, res, next) => {
  const isProduction = process.env.NODE_ENV === "production";
  const status = err.statusCode || err.status || 500;
  const message = err.message || "Internal Server Error";
  const stack = err.stack || "No stack trace available";

  const {
    expose = status < 500,
    code,
    field,
    userId,
    operation,
    context,
    headers = {},
  } = err;

  const baseResponse = {
    success: false,
    message: expose || !isProduction ? message : "Internal Server Error",
    ...(code && { code }),
    ...(field && { field }),
    ...(operation && expose && { operation }),
  };

  const logResponse = {
    success: false,
    message,
    status,
    ...(userId && { userId }),
    ...(operation && !expose && { operation }), // Log operation even if not exposed
    ...(context && { context }),
    requestInfo: {
      method: req.method,
      url: req.originalUrl,
      ip: req.ip,
      userAgent: req.get("User-Agent"),
      timestamp: new Date().toISOString(),
    },
    stack: isProduction ? undefined : stack,
  };

  Object.keys(headers).length && res.set(headers);

  // Log with appropriate level
  const logMethod = status >= 500 ? "error" : status >= 400 ? "warn" : "info";
  logger[logMethod](JSON.stringify(logResponse, null, 2));

  res.status(status).json(baseResponse);
};

const invalidRouteHandler = (req, res) => {
  res.status(404).json({
    success: false,
    message: "Endpoint not found",
    code: "ENDPOINT_NOT_FOUND",
  });
};

const applyGlobalMiddleware = (app, rootRouter) => {
  app.use(morgan("dev"));
  app.use(cors(corsOptions));
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
  app.use(rootRouter);
  app.use(invalidRouteHandler);
  app.use(errorHandler);
};

export { applyGlobalMiddleware };
