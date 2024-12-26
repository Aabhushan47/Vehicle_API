const { mongoose } = require("mongoose");
const Vehicle = require("../../models/vehicle/vehicle.model");
const statusCodes = require("../../utils/statusCodes.utils");
const moment = require("moment");
const Booking = require("../../models/booking/booking.model");
const {
  successResponse,
  errorResponse,
} = require("../../utils/response.utils");

const createBooking = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { startDate, endDate, vehicleId, bookingStatus } = req.body;

    if (!mongoose.Types.ObjectId.isValid(vehicleId)) {
      return next({
        status: statusCodes.BAD_REQUEST,
        message: "Invalid vehicle ID",
      });
    }
    const vehicle = await Vehicle.findById(vehicleId);
    if (!vehicle) {
      return next({
        status: statusCodes.NOT_FOUND,
        message: "Vehicle Not Found",
      });
    }
    if (!vehicle.availability) {
      return next({
        status: statusCodes.FORBIDDEN,
        message: "Vehicle Not Available for booking",
      });
    }
    // Check vehicle availability
    const conflictingBookings = await Booking.find({
      vehicle: vehicleId,
      bookingStatus: { $in: ["pending", "confirmed"] },
      $or: [{ startDate: { $lte: endDate }, endDate: { $gte: startDate } }],
    });

    if (conflictingBookings.length > 0) {
      return errorResponse(
        res,
        statusCodes.NOT_FOUND,
        "Vehicle is not available for the selected dates"
      );
    }

    // Calculate booking duration in days
    const start = new Date(startDate);
    const end = new Date(endDate);
    const durationInDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24));

    if (durationInDays <= 0) {
      return errorResponse(
        res,
        statusCodes.FORBIDDEN,
        "End date must be after the start date"
      );
    }

    // Calculate total amount
    const totalAmount = durationInDays * vehicle.price;

    const booking = await Booking.create({
      vehicle: vehicleId,
      user: userId,
      startDate: start,
      endDate: end,
      bookingStatus,
      totalAmount: totalAmount,
    });

    vehicle.availability = false;
    await vehicle.save();
    return successResponse(
      res,
      "Succesfully Booked. Please pay for confirmation",
      booking
    );
  } catch (err) {
    console.log(err);
    if (err.code === 11000) {
      const duplicateField = Object.keys(err.keyValue)[0];
      return next({
        status: statusCodes.BAD_REQUEST,
        message: `${duplicateField}: ${err.keyValue[duplicateField]} already exists`,
        details: err.details,
      });
    }
    return next(err);
  }
};

module.exports = { createBooking };
