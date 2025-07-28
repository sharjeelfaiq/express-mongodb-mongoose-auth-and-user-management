import express from "express";

import { emailControllers } from "./email.controllers.js";

export const emailRoutes = express.Router();

emailRoutes
  .get("/check-verification-token", emailControllers.checkVerificationToken)
  .post("/send-verification-token", emailControllers.sendVerificationToken);
