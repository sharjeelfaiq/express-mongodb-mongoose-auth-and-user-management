import twilio from "twilio";

import { env } from "#config/index.js";

const { TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN } = env;

export const twilioClient = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);
