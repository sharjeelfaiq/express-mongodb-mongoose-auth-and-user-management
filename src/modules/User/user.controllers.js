import { globalUtils } from "#utils/index.js";
import { userServices } from "./user.services.js";

const { asyncHandler } = globalUtils;

export const userControllers = {
  getAll: asyncHandler(async (_, res) => {
    const data = await userServices.getAll();

    res.status(200).json({
      success: true,
      message: "Users retrieved successfully",
      data,
    });
  }),

  getById: asyncHandler(async (req, res) => {
    const { id } = req.params;

    const data = await userServices.getById(id);

    res.status(200).json({
      success: true,
      message: "User retrieved successfully",
      data,
    });
  }),

  updateById: asyncHandler(async (req, res) => {
    const { id } = req.params;
    const reqBody = req.body;
    const files = req.files;

    const data = await userServices.updateById(id, { ...reqBody, ...files });

    res.status(200).json({
      success: true,
      message: "User updated successfully",
      data,
    });
  }),

  deleteById: asyncHandler(async (req, res) => {
    const { id } = req.params;

    await userServices.deleteById(id);

    res.status(204).json({
      success: true,
      message: "User deleted successfully",
    });
  }),
};
