import express from "express";
import { createServer } from "http";

import { connectDatabase } from "#config/index.js";
import { applyGlobalMiddleware } from "#middleware/index.js";
import { logger, env } from "#config/index.js";
import { globalUtils } from "#utils/index.js";
import { isProdEnv } from "#constants/index.js";
import appRouter from "#routes/index.js";

const { PORT, BACKEND_BASE_URL_DEV, BACKEND_BASE_URL_PROD } = env;
const { wrapGeneralAsync } = globalUtils;

const app = express();
const httpServer = createServer(app);

export const startServer = wrapGeneralAsync(async () => {
  await connectDatabase();
  applyGlobalMiddleware(app, appRouter);

  httpServer.listen(PORT || 5000, () => {
    logger.info(
      `connected: Server (url: ${isProdEnv ? BACKEND_BASE_URL_PROD : BACKEND_BASE_URL_DEV})`
    );
  });
});
