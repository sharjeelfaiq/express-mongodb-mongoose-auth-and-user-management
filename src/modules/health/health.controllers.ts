import { globalUtils } from "#utils/index.js";
import { healthServices } from "./health.services.js";

const { wrapExpressAsync } = globalUtils;

export const healthControllers = {
  checkHealth: wrapExpressAsync(async (_, res) => {
    const data = await healthServices.checkHealth();

    const isHealthy = data.status === "healthy" ? 200 : 503;

    res.status(200).json({
      success: true,
      message: isHealthy ? "System operational" : "System degraded",
      data,
    });
  }),

  checkDetailedHealth: wrapExpressAsync(async (_, res) => {
    const data = await healthServices.checkDetailedHealth();

    const isHealthy = data.status === "healthy" ? 200 : 503;

    res.status(isHealthy ? 200 : 503).json({
      success: true,
      message: isHealthy ? "System operational" : "System degraded",
      data,
    });
  }),
};
