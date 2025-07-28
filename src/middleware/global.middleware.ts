import morgan from "morgan";
import cors from "cors";
import express from "express";
import swaggerUi from "swagger-ui-express";
import colors from "colors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import compression from "compression";
import xss from "xss-clean";
import mongoSanitize from "express-mongo-sanitize";

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

const apiRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many requests. Please try again later.",
  },
});

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
  app.use(morgan("dev")); // Logs incoming HTTP requests (method, URL, status) for debugging

  app.use(helmet()); // Sets secure HTTP headers to protect against common web vulnerabilities

  app.use(xss()); // Sanitizes user input to prevent XSS (Cross-site scripting) attacks

  app.use(mongoSanitize()); // Prevents NoSQL injection by removing MongoDB operator characters

  app.use(compression()); // Compresses response bodies to improve performance

  app.use(apiRateLimiter); // Limits repeated requests from the same IP to prevent abuse (rate limiting)

  app.use(cors(corsOptions)); // Enables CORS with the specified options (cross-origin requests support)

  app.use(express.json({ limit: "10mb" })); // Parses incoming JSON payloads (with a size limit)

  app.use(express.urlencoded({ extended: true, limit: "10mb" })); // Parses URL-encoded payloads (form data)

  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec)); // Serves Swagger UI for API documentation

  app.use(appRouter); // Mounts the main application router (your routes go here)

  app.use(invalidRouteHandler); // Handles undefined routes (404 Not Found)

  app.use(errorHandler); // Global error handler to catch and format all errors
};
