import morgan from "morgan";
import cors from "cors";
import express from "express";
import swaggerUi from "swagger-ui-express";
import colors from "colors";
import helmet from "helmet";

import { logger, swaggerSpec } from "#config/index.js";
import { isProdEnv } from "#constants/index.js";

colors.setTheme({
  database: ["green", "bold"],
  server: ["white", "bold"],
  service: ["brightMagenta", "bold"],
  error: ["red", "bold"],
  success: ["brightGreen", "bold"],
  warning: ["yellow", "bold"],
  info: ["brightCyan", "bold"],
});

const corsOptions = {
  origin: true,
  credentials: true,
};

// eslint-disable-next-line no-unused-vars
const errorHandler = async (err, req, res, next) => {
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

  const response = {
    success: false,
    message: expose || !isProdEnv ? message : "Internal Server Error",
    ...(code && { code }),
    ...(field && { field }),
    ...(operation && expose && { operation }),
    // Internal use only (will not be sent to client)
    status,
    ...(userId && { userId }),
    ...(operation && !expose && { operation }),
    ...(context && { context }),
    requestInfo: {
      method: req.method,
      url: req.originalUrl,
      ip: req.ip,
      userAgent: req.get("User-Agent"),
      timestamp: new Date().toISOString(),
    },
    ...(isProdEnv ? {} : { stack }),
  };

  if (Object.keys(headers).length) res.set(headers);

  // Log the full response
  const logMethod = status >= 500 ? "error" : status >= 400 ? "warn" : "info";
  logger[logMethod](JSON.stringify(response, null, 2));

  // Send only safe fields to client
  const {
    success,
    message: clientMessage,
    code: clientCode,
    field: clientField,
    operation: clientOperation,
  } = response;

  const result = {
    success,
    message: clientMessage,
    ...(clientCode && { code: clientCode }),
    ...(clientField && { field: clientField }),
    ...(clientOperation && { operation: clientOperation }),
  };

  res.status(status).json(result);
};

const invalidRouteHandler = (req, res) => {
  res.status(404).json({
    success: false,
    message: "Endpoint not found",
    code: "ENDPOINT_NOT_FOUND",
  });
};

export const applyGlobalMiddleware = (app, appRouter) => {
  app.use(morgan("dev"));
  app.use(helmet());
  app.use(cors(corsOptions));
  app.use(express.json({ limit: "10mb" }));
  app.use(express.urlencoded({ extended: true, limit: "10mb" }));
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
  app.use(appRouter);
  app.use(invalidRouteHandler);
  app.use(errorHandler);
};
