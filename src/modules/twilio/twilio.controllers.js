import { asyncHandler } from "#utils/index.js";
import { twilioServices } from "./twilio.services.js";

export const twilioControllers = {
  sendOTP: asyncHandler(async (req, res) => {
    const payload = req.body;
    const result = await twilioServices.sendOTP(payload);

    res.status(200).json(result);
  }),

  verifyOTP: asyncHandler(async (req, res) => {
    const payload = req.body;
    const result = await twilioServices.verifyOTP(payload);

    res.status(200).json(result);
  }),
};
