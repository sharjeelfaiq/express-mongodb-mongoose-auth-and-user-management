import mongoose from "mongoose";

import { logger } from "./logger.config.js";
import { env } from "./env.config.js";

let isConnected = false;

const { DATABASE_URI } = env;

export const connectDatabase = async () => {
  if (isConnected) {
    logger.warn("Using existing MongoDB connection".warning);
    return;
  }

  try {
    const connection = await mongoose.connect(DATABASE_URI, {
      serverSelectionTimeoutMS: 5000,
    });

    isConnected = !!connection.connections[0].readyState;
    logger.info(`connected: Database (url: ${DATABASE_URI})`.database);

    const db = mongoose.connection;

    db.on("error", (err) => {
      logger.error(`Connection Failed: MongoDB\nerror: ${err.message}`.error);
    });

    db.on("disconnected", () => {
      logger.error("MongoDB disconnected".error);
      isConnected = false;
    });

    process.on("SIGINT", async () => {
      await db.close();
      logger.info("MongoDB connection closed".info);
      process.exit(0);
    });
  } catch (error) {
    logger.error(`Failed to connect to MongoDB: ${error.message}`.error);
    process.exit(1);
  }
};
