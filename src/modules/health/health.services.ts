import mongoose from "mongoose";

import { env, logger } from "#config/index.js";
import { isProdEnv } from "#constants/index.js";

const {
  PORT,
  DATABASE_URI,
  JWT_SECRET_KEY,
  CLOUDINARY_CLOUD_NAME,
  CLOUDINARY_API_KEY,
  CLOUDINARY_API_SECRET,
  USER_EMAIL,
  USER_PASSWORD,
  BACKEND_BASE_URL_PROD,
  BACKEND_BASE_URL_DEV,
  FRONTEND_BASE_URL_PROD,
  FRONTEND_BASE_URL_DEV,
} = env;

export const healthServices = {
  checkHealth: async () => {
    let dbStatus = "disconnected";

    try {
      if (mongoose.connection.readyState === 1) {
        await mongoose.connection.db?.admin().ping();
        dbStatus = "healthy";
      }
    } catch (error) {
      logger.error(`Database health check failed: ${error}`);
      dbStatus = "error";
    }

    // Memory check
    const memoryMB = Math.round(process.memoryUsage().heapUsed / 1024 / 1024);
    const memoryStatus = memoryMB > 500 ? "high" : "normal";

    // Overall system status
    const isHealthy = dbStatus === "healthy" && memoryStatus === "normal";
    const status = isHealthy ? "healthy" : "degraded";

    const data = {
      status,
      timestamp: new Date().toISOString(),
    };

    return data;
  },

  checkDetailedHealth: async () => {
    const startTime = Date.now();

    // Database health check
    let dbStatus = "disconnected";
    let dbResponseTime = null;

    try {
      if (mongoose.connection.readyState === 1) {
        const dbStart = Date.now();
        await mongoose.connection.db?.admin().ping();
        dbResponseTime = Date.now() - dbStart;
        dbStatus = "healthy";
      }
    } catch (error) {
      logger.error(`Database health check failed: ${error}`);
      dbStatus = "error";
    }

    // Memory check
    const memoryMB = Math.round(process.memoryUsage().heapUsed / 1024 / 1024);
    const memoryStatus = memoryMB > 500 ? "high" : "normal";

    // Overall system status
    const isHealthy = dbStatus === "healthy" && memoryStatus === "normal";
    const status = isHealthy ? "healthy" : "degraded";

    const data = {
      status,
      timestamp: new Date().toISOString(),
      responseTime: `${Date.now() - startTime}ms`,
      database: {
        status: dbStatus,
        responseTime: dbResponseTime ? `${dbResponseTime}ms` : null,
      },
      memory: {
        usage: `${memoryMB}MB`,
        status: memoryStatus,
      },
      environment: isProdEnv ? "Production" : "Development",
      port: PORT,
      uptime: `${Math.floor(process.uptime())}s`,
      urls: {
        backend: isProdEnv ? BACKEND_BASE_URL_PROD : BACKEND_BASE_URL_DEV,
        frontend: isProdEnv ? FRONTEND_BASE_URL_PROD : FRONTEND_BASE_URL_DEV,
      },
      configured: {
        database: !!DATABASE_URI,
        jwt: !!JWT_SECRET_KEY,
        cloudinary: !!(
          CLOUDINARY_CLOUD_NAME &&
          CLOUDINARY_API_KEY &&
          CLOUDINARY_API_SECRET
        ),
        email: !!(USER_EMAIL && USER_PASSWORD),
      },
    };

    return data;
  },
};
