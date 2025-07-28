import { globalUtils } from "#utils/index.js";
import { emailServices } from "./email.services.js";

const { asyncHandler } = globalUtils;

export const emailControllers = {
  checkVerificationToken: asyncHandler(async (req, res) => {
    const { verificationToken } = req.query;

    const emailHtml =
      await emailServices.checkVerificationToken(verificationToken);

    res.status(200).send(emailHtml);
  }),

  sendVerificationToken: asyncHandler(async (req, res) => {
    const payload = req.body;

    await emailServices.sendVerificationToken(payload);

    res.status(200).json({
      success: true,
      message: "Verification email sent successfully",
    });
  }),
};
