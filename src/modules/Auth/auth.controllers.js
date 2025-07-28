import { globalUtils } from "#utils/index.js";
import { authServices } from "./auth.services.js";

const { asyncHandler } = globalUtils;

export const authControllers = {
  signUp: asyncHandler(async (req, res) => {
    const reqBody = req.body;

    await authServices.signUp(reqBody);

    res.status(201).json({
      success: true,
      message: "Signed up successfully. Please verify your email address.",
    });
  }),

  signIn: asyncHandler(async (req, res) => {
    const reqBody = req.body;

    const data = await authServices.signIn(reqBody);

    res.status(200).json({
      success: true,
      message: "Signed in successfully.",
      data,
    });
  }),

  signOut: asyncHandler(async (req, res) => {
    const authHeader = req.headers.authorization;
    const token = authHeader ? authHeader.replace("Bearer ", "") : null;

    await authServices.signOut(token);

    res.status(200).json({
      success: true,
      message: "Signed out successfully.",
    });
  }),

  requestPasswordReset: asyncHandler(async (req, res) => {
    const reqBody = req.body;

    await authServices.requestPasswordReset(reqBody);

    res.status(200).json({
      success: true,
      message: "Reset password email sent successfully.",
    });
  }),

  updatePassword: asyncHandler(async (req, res) => {
    const reqBody = req.body;

    await authServices.updatePassword(reqBody);

    res.status(200).json({
      success: true,
      message: "Password updated successfully.",
    });
  }),
};
