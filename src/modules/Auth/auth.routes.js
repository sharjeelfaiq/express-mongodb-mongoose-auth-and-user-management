import express from "express";

import {
  signUpDto,
  signInDto,
  forgotPasswordDto,
  updatePasswordDto,
} from "#dtos/index.js";
import { validateDto } from "#middleware/index.js";
import authController from "./auth.controllers.js";

export const authRoutes = express.Router();

authRoutes
  .post("/signup", validateDto(signUpDto), authController.signUp)
  .post("/signin", validateDto(signInDto), authController.signIn)
  .post("/signout", authController.signOut)
  .post(
    "/forgot-password",
    validateDto(forgotPasswordDto),
    authController.forgetPassword
  )
  .patch(
    "/update-password",
    validateDto(updatePasswordDto),
    authController.updatePassword
  );
