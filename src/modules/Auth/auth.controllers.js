import { asyncHandler } from "#utils/index.js";
import { authServices } from "./auth.services.js";

export const authControllers = {
  signUp: asyncHandler(async (req, res) => {
    const payload = req.body;
    const result = await authServices.signUp(payload);
    res.status(201).json(result);
  }),

  signIn: asyncHandler(async (req, res) => {
    const payload = req.body;
    const result = await authServices.signIn(payload);

    res.status(200).json(result);
  }),

  signOut: asyncHandler(async (req, res) => {
    const authHeader = req.headers.authorization;
    const token = authHeader ? authHeader.replace("Bearer ", "") : null;

    if (!token) {
      return res.status(400).json({ message: "No token found" });
    }

    const result = await authServices.signOut(token);

    res.status(200).json(result);
  }),

  forgetPassword: asyncHandler(async (req, res) => {
    const payload = req.body;
    const result = await authServices.forgetPassword(payload);
    res.status(200).json(result);
  }),

  updatePassword: asyncHandler(async (req, res) => {
    const payload = req.body;
    const result = await authServices.updatePassword(payload);
    res.status(200).json(result);
  }),
};
