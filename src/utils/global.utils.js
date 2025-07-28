export const globalUtils = {
  asyncHandler: (fn) => async (req, res, next) => {
    try {
      await fn(req, res, next);
    } catch (error) {
      next(error);
    }
  },
  parseDelimitedString: (input) => {
    return Array.isArray(input)
      ? input
      : input?.split(",").map((s) => s.trim());
  },
};
