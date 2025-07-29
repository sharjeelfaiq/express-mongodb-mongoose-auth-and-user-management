import createError from "http-errors";
import mongoose from "mongoose";

import { logger } from "./logger.config.js";
import { env } from "./env.config.js";

let isConnected = false;

const { DATABASE_URI } = env;

export const connectDatabase = async () => {
  if (isConnected) {
    logger.warn(("Using existing MongoDB connection" as any).warning);
    return;
  }

  try {
    if (!DATABASE_URI) {
      throw createError(500, "Database URI is not defined.");
    }

    const connection = await mongoose.connect(DATABASE_URI, {
      serverSelectionTimeoutMS: 5000,
    });

    isConnected = !!connection.connections[0].readyState;
    logger.info((`connected: Database (url: ${DATABASE_URI})` as any).database);

    const db = mongoose.connection;

    db.on("error", (err) => {
      logger.error(
        (`Connection Failed: MongoDB\nerror: ${err.message}` as any).error
      );
    });

    db.on("disconnected", () => {
      logger.error(("MongoDB disconnected" as any).error);
      isConnected = false;
    });

    process.on("SIGINT", async () => {
      await db.close();
      logger.info(("MongoDB connection closed" as any).info);
      process.exit(0);
    });
  } catch (error: unknown) {
    logger.error(
      (`Failed to connect to MongoDB: ${(error as Error).message}` as any).error
    );
    process.exit(1);
  }
};
