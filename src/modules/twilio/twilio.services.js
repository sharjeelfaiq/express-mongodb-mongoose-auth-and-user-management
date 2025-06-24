import createError from "http-errors";

import { sendWhatsAppOTP, verifyWhatsAppOTP } from "#utils/twilio.utils.js";
import { dataAccess } from "#dataAccess/index.js";

const { update } = dataAccess;

export const twilioServices = {
  sendOTP: async (data) => {
    const { phone } = data;

    const isWhatsAppOtpSent = await sendWhatsAppOTP(phone);
    if (!isWhatsAppOtpSent) {
      throw createError(500, "Failed to send OTP", {
        expose: false,
        code: "TWILIO_OTP_SEND_FAILED",
        operation: "send_whatsapp_otp",
        context: {
          phone,
          channel: "whatsapp",
          service: "twilio_verify",
        },
      });
    }

    return { success: true, message: "OTP sent successfully" };
  },

  verifyOTP: async (data) => {
    const { phone, code } = data;

    const isWhatsAppOtpVerified = await verifyWhatsAppOTP(phone, code);

    if (!isWhatsAppOtpVerified || isWhatsAppOtpVerified.status !== "approved") {
      throw createError(400, "Invalid OTP", {
        expose: true,
        code: "OTP_VERIFICATION_FAILED",
        field: "code",
        operation: "verify_whatsapp_otp",
        context: {
          phone,
          verificationStatus: isWhatsAppOtpVerified?.status,
          channel: "whatsapp",
          providedCodeLength: code?.length,
        },
      });
    }

    await update.userByPhone(phone, {
      isPhoneVerified: true,
    });

    return { success: true, message: "OTP verified successfully" };
  },
};
