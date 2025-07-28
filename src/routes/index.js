import express from "express";

import {
  authRoutes,
  emailRoutes,
  healthRoutes,
  notificationRoutes,
  otpRoutes,
  userRoutes,
} from "#modules/index.js";
import { validate } from "#middleware/index.js";

// Parent router
const appRouter = express.Router();

// Health routes
appRouter.use("/health", healthRoutes);

// V1 router
const v1Router = express.Router();

appRouter.use("/api/v1", v1Router);

// V1 routes
v1Router.use("/auth", authRoutes);
v1Router.use("/email", emailRoutes);
v1Router.use("/notifications", validate.accessToken, notificationRoutes);
v1Router.use("/otp", otpRoutes);
v1Router.use("/users", validate.accessToken, userRoutes);

export default appRouter;
