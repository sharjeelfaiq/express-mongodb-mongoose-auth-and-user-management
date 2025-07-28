import path, { dirname } from "path";
import { fileURLToPath } from "url";

import { env } from "#config/index.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const viewsDirectory = path.join(__dirname, "../views");

const {
  NODE_ENV,
  BACKEND_BASE_URL_DEV,
  BACKEND_BASE_URL_PROD,
  FRONTEND_BASE_URL_DEV,
  FRONTEND_BASE_URL_PROD,
} = env;

const isProdEnv = NODE_ENV === "production";

const backendUrl = isProdEnv ? BACKEND_BASE_URL_PROD : BACKEND_BASE_URL_DEV;

const frontendUrl = isProdEnv ? FRONTEND_BASE_URL_PROD : FRONTEND_BASE_URL_DEV;

export { viewsDirectory, backendUrl, frontendUrl, isProdEnv };
