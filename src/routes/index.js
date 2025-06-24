import express from "express";

import {
  authRoutes,
  emailRoutes,
  otpRoutes,
  userRoutes,
  healthRoutes,
  twilioRoutes,
} from "#modules/index.js";
import { verifyAuthToken } from "#middleware/index.js";

const appRouter = express.Router();
const v1Router = express.Router();

appRouter.use("/api/v1", v1Router);
appRouter.use("/health", healthRoutes);

v1Router.use("/auth", authRoutes);
v1Router.use("/email", emailRoutes);
v1Router.use("/otp", otpRoutes);
v1Router.use("/users", verifyAuthToken, userRoutes);
v1Router.use("/twilio", twilioRoutes);

export default appRouter;
