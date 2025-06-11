import { asyncHandler } from "#utils/index.js";
import { emailServices } from "./email.services.js";

export const emailControllers = {
  check: asyncHandler(async (req, res) => {
    const { verificationToken } = req.params;
    const result = await emailServices.check(verificationToken);
    res.status(200).send(result);
  }),

  send: asyncHandler(async (req, res) => {
    const { email } = req.body;
    const result = await emailServices.send(email);
    res.status(200).json(result);
  }),
};
