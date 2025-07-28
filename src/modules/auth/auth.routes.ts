import express from "express";

import { authDto } from "#dtos/index.js";
import { validate } from "#middleware/index.js";
import { authControllers } from "./auth.controllers.js";

export const authRoutes = express.Router();

authRoutes
  .post("/signup", validate.dto(authDto.signUpDto), authControllers.signUp)
  .post("/signin", validate.dto(authDto.signInDto), authControllers.signIn)
  .post("/signout", validate.accessToken, authControllers.signOut)
  .post(
    "/request-password-reset",
    validate.dto(authDto.passwordResetRequestDto),
    authControllers.requestPasswordReset,
  )
  .patch(
    "/update-password",
    validate.dto(authDto.passwordUpdateDto),
    authControllers.updatePassword,
  );
