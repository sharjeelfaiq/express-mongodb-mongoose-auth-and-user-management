import express from "express";

import otpController from "./otp.controllers.js";

export const otpRoutes = express.Router();

otpRoutes
  .post("/send", otpController.send)
  .post("/verify", otpController.verify);
