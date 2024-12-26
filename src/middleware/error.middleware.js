const { errorResponse } = require("../utils/response.utils");
const statusCodes = require("../utils/statusCodes.utils");

const errorMiddleware = (err, req, res, next) => {
  if (process.env.NODE_ENV === "development") {
    console.error("Error:", err.message || err);
    console.error("Stack:", err.stack);
  }

  if (err.status && err.message) {
    return errorResponse(res, err.status, err.message, err.details || null);
  }

  if (err.name === "ValidationError") {
    return errorResponse(
      res,
      statusCodes.BAD_REQUEST,
      "Validation error",
      err.message
    );
  }

  if (err.name === "CastError" && err.kind === "ObjectId") {
    return errorResponse(
      res,
      statusCodes.BAD_REQUEST,
      "Invalid ID format",
      err.message
    );
  }

  return errorResponse(
    res,
    statusCodes.INTERNAL_SERVER_ERROR,
    "Something went wrong",
    process.env.NODE_ENV === "development" ? err.stack || err.message : null
  );
};

module.exports = errorMiddleware;
