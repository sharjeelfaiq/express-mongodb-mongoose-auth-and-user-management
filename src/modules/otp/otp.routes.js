import express from "express";

import { otpControllers } from "./otp.controllers.js";

export const otpRoutes = express.Router();

otpRoutes
  .post("/send", otpControllers.send)
  .post("/verify", otpControllers.verify);
