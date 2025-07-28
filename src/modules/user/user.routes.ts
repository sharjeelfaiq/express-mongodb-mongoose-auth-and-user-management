import express from "express";

import { upload, validate } from "#middleware/index.js";
import { userControllers } from "./user.controllers.js";

export const userRoutes = express.Router();

userRoutes
  .get("/", userControllers.getAll)
  .get("/:id", userControllers.getById)
  .patch("/:id", upload, userControllers.updateById)
  .delete("/:id", validate.authRole("admin"), userControllers.deleteById);
