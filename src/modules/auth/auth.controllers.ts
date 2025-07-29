import { globalUtils } from "#utils/index.js";
import { authServices } from "./auth.services.js";

const { wrapExpressAsync } = globalUtils;

export const authControllers = {
  signUp: wrapExpressAsync(async (req, res) => {
    const { body: reqBody } = req;

    await authServices.signUp(reqBody);

    res.status(201).json({
      success: true,
      message: "Signed up successfully. Please verify your email address.",
    });
  }),

  signIn: wrapExpressAsync(async (req, res) => {
    const { body: reqBody } = req;

    const data = await authServices.signIn(reqBody);

    res.status(200).json({
      success: true,
      message: "Signed in successfully.",
      data,
    });
  }),

  signOut: wrapExpressAsync(async (req, res) => {
    const { headers: reqHeaders } = req;

    await authServices.signOut(reqHeaders);

    res.status(200).json({
      success: true,
      message: "Signed out successfully.",
    });
  }),

  requestPasswordReset: wrapExpressAsync(async (req, res) => {
    const { body: reqBody } = req;

    await authServices.requestPasswordReset(reqBody);

    res.status(200).json({
      success: true,
      message: "Reset password email sent successfully.",
    });
  }),

  updatePassword: wrapExpressAsync(async (req, res) => {
    const { body: reqBody } = req;

    await authServices.updatePassword(reqBody);

    res.status(200).json({
      success: true,
      message: "Password updated successfully.",
    });
  }),
};
