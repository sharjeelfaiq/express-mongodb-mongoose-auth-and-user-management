import { asyncHandler } from "#utils/index.js";
import { healthServices } from "./health.services.js";

export const healthControllers = {
  checkHealth: asyncHandler(async (req, res) => {
    const result = await healthServices.checkHealth();

    const statusCode = result.data.status === "healthy" ? 200 : 503;

    res.status(statusCode).json(result);
  }),
};
