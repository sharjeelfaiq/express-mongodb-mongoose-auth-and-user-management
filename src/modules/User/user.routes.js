import express from "express";

import { uploadMiddleware, verifyAuthRole } from "#middleware/index.js";
import { userControllers } from "./user.controllers.js";

export const userRoutes = express.Router();

userRoutes
  .get("/", userControllers.getAll)
  .get("/:id", userControllers.getById)
  .patch("/:id", uploadMiddleware, userControllers.updateById)
  .delete("/:id", verifyAuthRole("admin"), userControllers.deleteById);
