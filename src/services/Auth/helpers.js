import env from "#env/index.js";
import utility from "#utility/index.js";
import { dataAccess } from "#dataAccess/index.js";
import {
  nodemailer,
  fs,
  path,
  fileURLToPath,
  dirname,
  createError,
} from "#packages/index.js";

const { USER_EMAIL, JWT_VERIFICATION_LINK_EXPIRATION_TIME } = env;
const { transporter, logger } = utility;
const { fetch } = dataAccess;

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export const sendVerificationEmail = async (toEmail, verificationToken) => {
  try {
    let verificationEmailHtml = fs.readFileSync(
      path.join(__dirname, "../../public/VerificationEmail", "index.html"),
      "utf-8",
    );

    verificationEmailHtml = verificationEmailHtml.replace(
      "${verificationToken}",
      verificationToken,
    );

    const mailOptions = {
      from: USER_EMAIL,
      to: toEmail,
      subject: "Welcome to Our Platform 🙌",
      html: verificationEmailHtml,
    };

    const info = await transporter.sendMail(mailOptions);
    logger.info(`Email sent: ${info.response}`);
    return true;
  } catch (error) {
    logger.error(`Error sending email: ${error.message}`);
    throw createError(
      500,
      `Failed to send the welcome email. Details: ${error.message}`,
    );
  }
};
