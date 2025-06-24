import mongoose from "mongoose";

import { env } from "#config/index.js";

const {
  NODE_ENV,
  PORT,
  JWT_SECRET_KEY,
  DATABASE_URI,
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
    const startTime = Date.now();
    const memoryUsage = process.memoryUsage();
    const memoryUsedMB = Math.round(memoryUsage.heapUsed / 1024 / 1024);

    // Database health check
    let dbStatus = "disconnected";
    let dbResponseTime = null;

    if (mongoose.connection.readyState === 1) {
      const dbStart = Date.now();
      await mongoose.connection.db.admin().ping();
      dbResponseTime = Date.now() - dbStart;
      dbStatus = dbResponseTime < 1000 ? "healthy" : "slow";
    }

    // Services check
    const cloudinaryConfigured = !!(
      CLOUDINARY_CLOUD_NAME &&
      CLOUDINARY_API_KEY &&
      CLOUDINARY_API_SECRET
    );
    const emailConfigured = !!(USER_EMAIL && USER_PASSWORD);

    // Overall health determination
    const isHealthy = dbStatus === "healthy" && memoryUsedMB < 500; // 500MB threshold
    const overallStatus = isHealthy
      ? "healthy"
      : dbStatus === "disconnected"
        ? "unhealthy"
        : "degraded";

    // Base health data
    const healthData = {
      status: overallStatus,
      timestamp: new Date().toISOString(),
      responseTime: `${Date.now() - startTime}ms`,

      database: {
        status: dbStatus,
        responseTime: dbResponseTime ? `${dbResponseTime}ms` : null,
      },

      system: {
        environment: NODE_ENV,
        uptime: `${Math.floor(process.uptime())}s`,
        memory: `${memoryUsedMB}MB`,
      },

      services: {
        cloudinary: cloudinaryConfigured,
        email: emailConfigured,
      },
    };

    healthData.development = {
      port: PORT || "unknown",
      nodeVersion: process.version,
      platform: process.platform,
      database: {
        name: mongoose.connection.name || "unknown",
        host: mongoose.connection.host || "unknown",
      },
      configuration: {
        jwt: !!JWT_SECRET_KEY,
        database: !!DATABASE_URI,
        cloudinary: cloudinaryConfigured,
        email: emailConfigured,
      },
      urls: {
        backend: BACKEND_BASE_URL_DEV,
        frontend: FRONTEND_BASE_URL_DEV,
      },
    };

    // Add production monitoring info
    if (NODE_ENV === "production") {
      const issues = [];
      if (dbStatus === "disconnected") issues.push("Database disconnected");
      if (dbStatus === "slow") issues.push("Database slow");
      if (memoryUsedMB > 500) issues.push("High memory usage");
      if (!cloudinaryConfigured) issues.push("Cloudinary not configured");
      if (!emailConfigured) issues.push("Email not configured");

      healthData.monitoring = {
        totalChecks: 5,
        passing: 5 - issues.length,
        issues,
        urls: {
          backend: BACKEND_BASE_URL_PROD,
          frontend: FRONTEND_BASE_URL_PROD,
        },
      };
    }

    return {
      success: true,
      message:
        overallStatus === "healthy"
          ? "All systems operational"
          : overallStatus === "degraded"
            ? "System operational with issues"
            : "System experiencing problems",
      data: healthData,
    };
  },
};
