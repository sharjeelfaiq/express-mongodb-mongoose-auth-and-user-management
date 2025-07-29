import { readFile } from "fs/promises";
import createError from "http-errors";
import { join } from "path";

import { env, transporter } from "#config/index.js";
import { viewsDirectory } from "#constants/index.js";

const { USER_EMAIL } = env;

// Template cache for better performance
const templateCache = new Map();

const getEmailTemplate = async (folder: string, filename: string) => {
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
  } catch (error: unknown) {
    throw createError(
      500,
      `Failed to read email template: ${(error as Error).message}`
    );
  }
};

interface TemplateVariables {
  [key: string]: string;
}

const processTemplate = (template: string, variables: TemplateVariables) => {
  return Object.entries(variables).reduce(
    (processed, [key, value]) =>
      processed.replace(new RegExp(`\\$\\{${key}\\}`, "g"), value),
    template
  );
};

interface MailOptions {
  to: string;
  subject: string;
  html: string;
}

const sendMail = async (mailOptions: MailOptions) => {
  try {
    return await transporter.sendMail({
      from: USER_EMAIL,
      ...mailOptions,
    });
  } catch (error) {
    throw createError(500, `Failed to send email: ${(error as Error).message}`);
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

interface Options {
  [key: string]: string;
}

export const sendEmail = async (type: string, options: Options) => {
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
