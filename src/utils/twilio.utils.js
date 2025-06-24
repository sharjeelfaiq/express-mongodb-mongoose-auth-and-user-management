import { twilioClient, env } from "#config/index.js";

const { TWILIO_VERIFY_SERVICE_SID } = env;

export const sendWhatsAppOTP = async (phone) => {
  return await twilioClient.verify.v2
    .services(TWILIO_VERIFY_SERVICE_SID)
    .verifications.create({
      to: phone,
      channel: "whatsapp",
    });
};

export const verifyWhatsAppOTP = async (phone, code) => {
  return await twilioClient.verify.v2
    .services(TWILIO_VERIFY_SERVICE_SID)
    .verificationChecks.create({
      code,
      to: phone,
    });
};
