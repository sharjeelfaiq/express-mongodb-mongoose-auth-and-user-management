import { globalUtils } from "#utils/index.js";
import { healthServices } from "./health.services.js";

const { asyncHandler } = globalUtils;

export const healthControllers = {
  checkHealth: asyncHandler(async (req, res) => {
    const data = await healthServices.checkHealth();

    const isHealthy = data.status === "healthy" ? 200 : 503;

    res.status(200).json({
      success: true,
      message: isHealthy ? "System operational" : "System degraded",
      data,
    });
  }),

  checkDetailedHealth: asyncHandler(async (req, res) => {
    const data = await healthServices.checkDetailedHealth();

    const isHealthy = data.status === "healthy" ? 200 : 503;

    res.status(isHealthy ? 200 : 503).json({
      success: true,
      message: isHealthy ? "System operational" : "System degraded",
      data,
    });
  }),
};
