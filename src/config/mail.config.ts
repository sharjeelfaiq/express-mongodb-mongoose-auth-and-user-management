import nodemailer from "nodemailer";

import { env } from "#config/env.config.js";
import { logger } from "#config/logger.config.js";
import SMTPTransport from "nodemailer/lib/smtp-transport";

const { EMAIL_HOST, EMAIL_PORT, USER_EMAIL, USER_PASSWORD } = env;

const createTransporter = () => {
  const transporter = nodemailer.createTransport({
    host: EMAIL_HOST,
    port: Number(EMAIL_PORT),
    secure: false, // Set true for SSL (465), false for TLS (587)
    auth: { user: USER_EMAIL, pass: USER_PASSWORD },
    connectionTimeout: 60000,
    greetingTimeout: 30000,
    sendTimeout: 30000,
  } as SMTPTransport.Options);

  transporter.verify((error) => {
    if (error) {
      logger.error(
        (`Connection Failed: Nodemailer\nerror: ${error.message}` as any).error
      );
    } else {
      logger.info(
        (`connected: Email Service (email: ${USER_EMAIL})` as any).service
      );
    }
  });

  return transporter;
};

export const transporter = createTransporter();
