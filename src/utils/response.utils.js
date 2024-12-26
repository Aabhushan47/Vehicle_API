const successResponse = (res, message, data, statusCode = 200, meta = null) => {
  res.status(statusCode).json({
    success: true,
    message: message || "Request processed successfully",
    data: data || null,
    timestamp: new Date().toISOString(),
  });
};

const errorResponse = (res, statusCode = 500, message, error = null) => {
  res.status(statusCode).json({
    success: false,
    message: message || "Error processing request",
    error: process.env.NODE_ENV === "development" ? error : undefined,
    timestamp: new Date().toISOString(),
  });
};

module.exports = { successResponse, errorResponse };
