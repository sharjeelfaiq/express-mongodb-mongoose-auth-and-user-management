import swaggerJSDoc from "swagger-jsdoc";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

import { isProdEnv } from "#constants/index.js";
import { env } from "#config/index.js";

const { BACKEND_BASE_URL_DEV, BACKEND_BASE_URL_PROD } = env;

const __dirname = dirname(fileURLToPath(import.meta.url));

const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Title",
      version: "1.0.0",
      description: "RESTful API",
    },
    servers: [
      {
        url: isProdEnv ? BACKEND_BASE_URL_PROD : BACKEND_BASE_URL_DEV,
        description: "RESTful API",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
  },
  // Paths to API docs are in their dedicated folders, like auth docs in swagger/auth/*.yaml
  apis: [join(__dirname, "../../docs/swagger/**/*.yaml")],
};

export const swaggerSpec = swaggerJSDoc(swaggerOptions);
