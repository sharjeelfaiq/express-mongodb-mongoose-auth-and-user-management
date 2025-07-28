import { globalUtils } from "#utils/index.js";
import { otpServices } from "./otp.services.js";

const { asyncHandler } = globalUtils;

export const otpControllers = {
  send: asyncHandler(async (req, res) => {
    const payload = req.body;

    await otpServices.send(payload);

    res.status(200).json({ success: true, message: "OTP sent successfully" });
  }),

  verify: asyncHandler(async (req, res) => {
    const payload = req.body;

    await otpServices.verify(payload);

    res
      .status(200)
      .json({ success: true, message: "OTP verified successfully" });
  }),
};
