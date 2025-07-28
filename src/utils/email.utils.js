import { readFile } from "fs/promises";
import createError from "http-errors";
import { join } from "path";

import { env, transporter } from "#config/index.js";
import { viewsDirectory } from "#constants/index.js";

const { USER_EMAIL } = env;

// Template cache for better performance
const templateCache = new Map();

const getEmailTemplate = async (folder, filename) => {
  const cacheKey = `${folder}/${filename}`;

  if (templateCache.has(cacheKey)) {
    return templateCache.get(cacheKey);
  }

  try {
    const filePath = join(viewsDirectory, folder, filename);
    const template = await readFile(filePath, "utf-8");

    // Cache template for future use
    templateCache.set(cacheKey, template);
    return template;
  } catch (error) {
    throw new Error(
      `Failed to read email template: ${cacheKey}. ${error.message}`,
    );
  }
};

const processTemplate = (template, variables) => {
  return Object.entries(variables).reduce(
    (processed, [key, value]) =>
      processed.replace(new RegExp(`\\$\\{${key}\\}`, "g"), value),
    template,
  );
};

const sendMail = async (mailOptions) => {
  try {
    return await transporter.sendMail({
      from: USER_EMAIL,
      ...mailOptions,
    });
  } catch (error) {
    throw new Error(`Failed to send email: ${error.message}`);
  }
};

// options object should contain the following properties:
// - email
// - resetToken
// - verificationToken
// - frontendUrl
// - backendUrl
// - subject
// - rawOTP

export const sendEmail = async (type, options = {}) => {
  const { email, subject, ...rest } = options;
  const template = await getEmailTemplate(type, "index.html");
  const html = processTemplate(template, rest);

  const supportedTypes = [
    "otp-email",
    "verification-email",
    "verification-notification",
    "reset-password",
  ];

  if (!supportedTypes.includes(type)) {
    throw createError(400, "Invalid email type.");
  }

  if (type === "verification-notification") {
    return html;
  } else {
    return sendMail({
      to: email,
      subject,
      html,
    });
  }
};
