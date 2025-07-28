import express from "express";

import { healthControllers } from "./health.controllers.js";
import { validate } from "#middleware/index.js";

export const healthRoutes = express.Router();

healthRoutes
  .get("/public", healthControllers.checkHealth)
  .get("/private", validate.accessToken, healthControllers.checkDetailedHealth);
