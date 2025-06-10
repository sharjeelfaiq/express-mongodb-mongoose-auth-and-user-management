import fs from "fs";
import path from "path";

import { logger, env, transporter } from "#config/index.js";
import { viewsDirectory, backendUrl, frontendUrl } from "#constants/index.js";

const { USER_EMAIL } = env;

const readEmailTemplate = (folder, filename) => {
  const filePath = path.join(viewsDirectory, folder, filename);
  return fs.readFileSync(filePath, "utf-8");
};

export const sendVerificationEmail = async (
  email,
  verificationToken,
  purpose,
) => {
  let emailHtml, mailOptions;

  switch (purpose) {
    case "verify-email":
      emailHtml = readEmailTemplate("verification-email", "index.html")
        .replace(/\$\{backendUrl\}/g, backendUrl)
        .replace(/\$\{verificationToken\}/g, verificationToken);

      mailOptions = {
        from: USER_EMAIL,
        to: email,
        subject: "Welcome to Romulus - Verify your email",
        html: emailHtml,
      };
      break;
    case "reset-password":
      mailOptions = {
        from: USER_EMAIL,
        to: email,
        subject: "Romulus - Reset your password",
        html: `<h1>Reset Your Password</h1>
                <p>Click on the following link to reset your password:</p>
                <a href="${frontendUrl}/update-password?token=${verificationToken}">${frontendUrl}/update-password?token=${verificationToken}</a>
                <p>If you didn't request a password reset, please ignore this email.</p>`,
      };
      break;
    default:
      throw new Error("Invalid email purpose");
  }

  await transporter.sendMail(mailOptions);

  logger.info(`Verification email sent to ${email}`);

  return true;
};

export const sendOtpEmail = async (email, otpCode) => {
  const emailHtml = readEmailTemplate("otp-email", "index.html").replace(
    /\$\{otpCode\}/g,
    otpCode,
  );

  const mailOptions = {
    from: USER_EMAIL,
    to: email,
    subject: "Romulus - Password Reset Code",
    html: emailHtml,
  };

  await transporter.sendMail(mailOptions);

  logger.info(`OTP email sent to ${email}`);

  return true;
};

export const sendVerificationNotification = () => {
  return readEmailTemplate("verification-notification", "index.html").replace(
    /\$\{frontendUrl\}/g,
    frontendUrl + "/login",
  );
};
