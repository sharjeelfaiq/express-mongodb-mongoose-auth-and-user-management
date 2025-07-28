import { randomInt } from "crypto";
import bcrypt from "bcryptjs";

export async function generateOTP() {
  const rawOTP = randomInt(100000, 999999).toString();

  const salt = await bcrypt.genSalt(10);
  const hashedOTP = await bcrypt.hash(rawOTP, salt);

  const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

  return { rawOTP, hashedOTP, expiresAt };
}
