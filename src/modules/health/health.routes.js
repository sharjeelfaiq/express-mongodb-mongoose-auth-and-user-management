import express from "express";

import { healthControllers } from "./health.controllers.js";

export const healthRoutes = express.Router();

healthRoutes.get("/", healthControllers.checkHealth);
