import { globalUtils } from "#utils/index.js";
import { userServices } from "./user.services.js";

const { wrapExpressAsync } = globalUtils;

export const userControllers = {
  getAll: wrapExpressAsync(async (_, res) => {
    const data = await userServices.getAll();

    res.status(200).json({
      success: true,
      message: "Users retrieved successfully",
      data,
    });
  }),

  getById: wrapExpressAsync(async (req, res) => {
    const { params: pathParams } = req;

    const data = await userServices.getById(pathParams);

    res.status(200).json({
      success: true,
      message: "User retrieved successfully",
      data,
    });
  }),

  updateById: wrapExpressAsync(async (req, res) => {
    const { params: pathParams, body: reqBody, files: reqFiles } = req;

    const data = await userServices.updateById(pathParams, reqBody, reqFiles);

    res.status(200).json({
      success: true,
      message: "User updated successfully",
      data,
    });
  }),

  deleteById: wrapExpressAsync(async (req, res) => {
    const { params: pathParams } = req;

    await userServices.deleteById(pathParams);

    res.status(204).json({
      success: true,
      message: "User deleted successfully",
    });
  }),
};
