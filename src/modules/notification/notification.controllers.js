import { globalUtils } from "#utils/index.js";
import { notificationServices } from "./notification.services.js";

const { asyncHandler } = globalUtils;

export const notificationControllers = {
  read: asyncHandler(async (req, res) => {
    const { userId } = req.params;

    const data = await notificationServices.read(userId);

    res.status(200).json({
      success: true,
      message: "Notifications retrieved successfully",
      data,
    });
  }),

  updateById: asyncHandler(async (req, res) => {
    const { notiId } = req.params;

    const data = await notificationServices.updateById(notiId);

    res.status(200).json({
      success: true,
      message: "Notification updated successfully",
      data,
    });
  }),
};
