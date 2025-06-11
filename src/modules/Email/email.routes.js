import express from "express";

import { emailControllers } from "./email.controllers.js";

export const emailRoutes = express.Router();

emailRoutes
  .get("/check-verification-token/:verificationToken", emailControllers.check)
  .post("/send-verification-token", emailControllers.send);
