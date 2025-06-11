import { asyncHandler } from "#utils/index.js";
import { otpServices } from "./otp.services.js";

export const otpControllers = {
  send: asyncHandler(async (req, res) => {
    const payload = req.body;
    const result = await otpServices.send(payload);
    res.status(200).json(result);
  }),

  verify: asyncHandler(async (req, res) => {
    const payload = req.body;
    const result = await otpServices.verify(payload);
    res.status(200).json(result);
  }),
};
