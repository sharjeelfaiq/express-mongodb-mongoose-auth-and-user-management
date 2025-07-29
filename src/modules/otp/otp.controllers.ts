import { globalUtils } from "#utils/index.js";
import { otpServices } from "./otp.services.js";

const { wrapExpressAsync } = globalUtils;

export const otpControllers = {
  send: wrapExpressAsync(async (req, res) => {
    const { body: reqBody } = req;

    await otpServices.send(reqBody);

    res.status(200).json({ success: true, message: "OTP sent successfully" });
  }),

  verify: wrapExpressAsync(async (req, res) => {
    const { body: reqBody } = req;

    await otpServices.verify(reqBody);

    res
      .status(200)
      .json({ success: true, message: "OTP verified successfully" });
  }),
};
