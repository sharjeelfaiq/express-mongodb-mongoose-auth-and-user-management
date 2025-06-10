import path, { dirname } from "path";
import { fileURLToPath } from "url";

import { env } from "#config/index.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const uploadDirectory = path.join(__dirname, "../../public/uploads");
const viewsDirectory = path.join(__dirname, "../views");

const {
  NODE_ENV,
  BACKEND_BASE_URL_LOCAL,
  BACKEND_BASE_URL_PRODUCTION,
  FRONTEND_BASE_URL_LOCAL,
  FRONTEND_BASE_URL_PRODUCTION,
} = env;

const backendUrl =
  NODE_ENV === "production"
    ? BACKEND_BASE_URL_PRODUCTION
    : BACKEND_BASE_URL_LOCAL;

const frontendUrl =
  NODE_ENV === "production"
    ? FRONTEND_BASE_URL_PRODUCTION
    : FRONTEND_BASE_URL_LOCAL;

export { uploadDirectory, viewsDirectory, backendUrl, frontendUrl };
