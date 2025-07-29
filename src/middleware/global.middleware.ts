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
import { Application, Router } from "express";

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

interface CustomError extends Error {
  statusCode?: number;
  status?: number;
  expose?: boolean;
  headers?: Record<string, string>;
  code?: string;
}

const errorHandler = async (
  err: CustomError,
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  const status = err.statusCode || err.status || 500;
  const message = err.message || "Internal Server Error";
  const stack = err.stack || "No stack trace available";

  const { expose = status < 500, headers = {} } = err;

  const response = {
    success: false,
    message: expose || !isProdEnv ? message : "Internal Server Error",
    status,
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
  const { success, message: clientMessage } = response;

  const result = {
    success,
    message: clientMessage,
  };

  res.status(status).json(result);
};

const invalidRouteHandler = (req: express.Request, res: express.Response) => {
  res.status(404).json({
    success: false,
    message: "Endpoint not found",
    code: "ENDPOINT_NOT_FOUND",
  });
};

export const applyGlobalMiddleware = (app: Application, appRouter: Router) => {
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
