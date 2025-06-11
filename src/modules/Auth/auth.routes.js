import express from "express";

import {
  signUpDto,
  signInDto,
  forgotPasswordDto,
  updatePasswordDto,
} from "#dtos/index.js";
import { validateDto } from "#middleware/index.js";
import { authControllers } from "./auth.controllers.js";

export const authRoutes = express.Router();

authRoutes
  .post("/signup", validateDto(signUpDto), authControllers.signUp)
  .post("/signin", validateDto(signInDto), authControllers.signIn)
  .post("/signout", authControllers.signOut)
  .post(
    "/forgot-password",
    validateDto(forgotPasswordDto),
    authControllers.forgetPassword
  )
  .patch(
    "/update-password",
    validateDto(updatePasswordDto),
    authControllers.updatePassword
  );
