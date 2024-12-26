const jwt = require("jsonwebtoken");
const statusCodes = require("../utils/statusCodes.utils");
const User = require("../models/user/userModel");
const { errorResponse } = require("../utils/response.utils");

const verifiedToken = async (req) => {
  const token =
    req.cookies.token || req.headers["authorization"]?.split(" ")[1];
  if (!token) {
    return errorResponse(res, statusCodes.UNAUTHORIZED, "Unauthorized");
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    return await User.findById(decoded.id).select("-password");
  } catch (error) {
    throw new Error("Invalid or expired token");
  }
};

const isAuthorized = async (req, res, next) => {
  try {
    req.user = await verifiedToken(req);

    next();
  } catch (error) {
    return errorResponse(res, statusCodes.UNAUTHORIZED, "Unauthorized");
  }
};

const isVehicleOwner = async (req, res, next) => {
  try {
    const user = await verifiedToken(req);

    if (user.role !== "vehicleOwner")
      return errorResponse(
        res,
        statusCodes.UNAUTHORIZED,
        "Not a vehicle Owner"
      );

    req.user = user;

    next();
  } catch (error) {
    return errorResponse(res, statusCodes.UNAUTHORIZED, "Unauthorized");
  }
};

module.exports = { isAuthorized, isVehicleOwner };
