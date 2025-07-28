import express from "express";
import { Server as SocketIOServer } from "socket.io";
import { createServer } from "http";

import { connectDatabase } from "#config/index.js";
import { applyGlobalMiddleware } from "#middleware/index.js";
import { logger, env } from "#config/index.js";
import { globalUtils } from "#utils/index.js";
import { isProdEnv } from "#constants/index.js";
import appRouter from "#routes/index.js";

const { PORT, BACKEND_BASE_URL_DEV, BACKEND_BASE_URL_PROD } = env;
const { asyncHandler } = globalUtils;

const app = express();
const httpServer = createServer(app);

let io;

export const getIO = () => {
  if (!io) throw new Error("Socket.io not initialized");
  return io;
};

export const startServer = asyncHandler(async () => {
  await connectDatabase();
  applyGlobalMiddleware(app, appRouter);

  io = new SocketIOServer(httpServer, {
    cors: {
      origin: "*",
    },
  });

  io.on("connection", (socket) => {
    logger.info(`✅ Socket connected: ${socket.id}`);

    socket.on("disconnect", () => {
      logger.info(`❌ Socket disconnected: ${socket.id}`);
    });
  });

  httpServer.listen(PORT || 5000, () => {
    logger.info(
      `connected: Server (url: ${isProdEnv ? BACKEND_BASE_URL_PROD : BACKEND_BASE_URL_DEV})`,
    );
  });
});
