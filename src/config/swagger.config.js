import swaggerJSDoc from "swagger-jsdoc";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));

const isDevelopment = process.env.NODE_ENV !== "production";

const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Romulus",
      version: "1.0.0",
      description: "RESTful API for Romulus Backend",
    },
    servers: [
      {
        url: isDevelopment
          ? "http://localhost:5000"
          : "https://romulus-backend.onrender.com",
        description: isDevelopment ? "Development" : "Production",
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
  apis: [join(__dirname, "../../docs/swagger/*.yaml")],
};

export const swaggerSpec = swaggerJSDoc(swaggerOptions);
