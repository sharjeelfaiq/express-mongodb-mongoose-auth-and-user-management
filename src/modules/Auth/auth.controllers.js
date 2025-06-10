import { asyncHandler, getCookieOptions } from "#utils/index.js";
import { env } from "#config/index.js";
import authService from "./auth.services.js";

const { COOKIE_NAME } = env;

const authController = {
  signUp: asyncHandler(async (req, res) => {
    const payload = req.body;
    const result = await authService.signUp(payload);
    res.status(201).json(result);
  }),

  signIn: asyncHandler(async (req, res) => {
    const payload = req.body;
    const result = await authService.signIn(payload);
    const { token } = result;

    res
      .status(200)
      .header("Authorization", `Bearer ${token}`)
      .header("Access-Control-Expose-Headers", "Authorization")
      .json(result);
  }),

  signOut: asyncHandler(async (req, res) => {
    const authHeader = req.headers.authorization;
    const token = authHeader ? authHeader.replace("Bearer ", "") : null;

    if (!token) {
      return res.status(400).json({ message: "No token found" });
    }

    const result = await authService.signOut(token);

    const options = getCookieOptions(false);
    res.clearCookie(COOKIE_NAME, {
      ...options,
      maxAge: undefined,
    });

    res.status(200).json(result);
  }),

  forgetPassword: asyncHandler(async (req, res) => {
    const payload = req.body;
    const result = await authService.forgetPassword(payload);
    res.status(200).json(result);
  }),

  updatePassword: asyncHandler(async (req, res) => {
    const payload = req.body;
    const result = await authService.updatePassword(payload);
    res.status(200).json(result);
  }),
};

export default authController;
