import { asyncHandler } from "#utils/index.js";
import emailService from "./email.services.js";

const emailController = {
  check: asyncHandler(async (req, res) => {
    const { verificationToken } = req.params;
    const result = await emailService.check(verificationToken);
    res.status(200).send(result);
  }),

  send: asyncHandler(async (req, res) => {
    const { email } = req.body;
    const result = await emailService.sendFile(email);
    res.status(200).json(result);
  }),
};

export default emailController;
