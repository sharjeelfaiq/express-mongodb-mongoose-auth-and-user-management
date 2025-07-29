import { globalUtils } from "#utils/index.js";
import { emailServices } from "./email.services.js";

const { wrapExpressAsync } = globalUtils;

export const emailControllers = {
  checkVerificationToken: wrapExpressAsync(async (req, res) => {
    const { query: queryParams } = req;

    const emailHtml = await emailServices.checkVerificationToken(queryParams);

    res.status(200).send(emailHtml);
  }),

  sendVerificationToken: wrapExpressAsync(async (req, res) => {
    const { body: reqBody } = req;

    await emailServices.sendVerificationToken(reqBody);

    res.status(200).json({
      success: true,
      message: "Verification email sent successfully",
    });
  }),
};
