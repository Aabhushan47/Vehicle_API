const Vehicle = require("../../models/vehicle/vehicle.model");
const cloudinary = require("../../utils/cloudinary.utils");
const { successResponse } = require("../../utils/response.utils");
const statusCodes = require("../../utils/statusCodes.utils");
const mongoose = require("mongoose");

const registerVehicle = async (req, res, next) => {
  try {
    const { path } = req.file;

    const {
      vehicleBrand,
      vehicleModel,
      vehicleNumber,
      vehicleType,
      availability,
      price,
    } = req.body;

    const existingVehicle = await Vehicle.findOne({ vehicleNumber });
    if (existingVehicle) {
      return next({
        status: statusCodes.BAD_REQUEST,
        message: `Vehicle with number ${vehicleNumber} already exists`,
      });
    }

    const uploadResult = await cloudinary.uploader.upload(path);

    const vehicleImage = {
      public_id: uploadResult.public_id,
      url: uploadResult.secure_url,
    };

    const vehicleOwner = req.user._id;

    const vehicle = await Vehicle.create({
      vehicleBrand,
      vehicleModel,
      vehicleNumber,
      vehicleType,
      vehicleImage,
      availability,
      price,
      vehicleOwner,
    });
    return successResponse(res, "Vehicle registered successfully", vehicle);

    // console.log(uploadResult.secure_url);
    // console.log(uploadResult);
  } catch (error) {
    // console.log(error);
    if (error.code === 11000) {
      const duplicateField = Object.keys(error.keyValue)[0];
      return next({
        status: statusCodes.BAD_REQUEST,
        message: `${duplicateField}: ${error.keyValue[duplicateField]} already exists`,
        details: error.details,
      });
    }
    return next(error);
  }
};

const fetchVehicle = async (req, res, next) => {
  try {
    const vehicles = await Vehicle.find();

    return successResponse(res, "Vehicle fetched Successfully", vehicles);
  } catch (error) {
    console.log(error);
    return next({
      status: statusCodes.INTERNAL_SERVER_ERROR,
      message: "Error fetching vehicle",
    });
  }
};

const fetchVehicleById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!id) {
      return next({
        status: statusCodes.BAD_REQUEST,
        message: "Vehicle id is required",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return next({
        status: statusCodes.BAD_REQUEST,
        message: "Invalid user ID",
      });
    }

    const vehicle = await Vehicle.findById(id);

    return successResponse(res, "Vehicle fetched Successfully", vehicle);
  } catch (error) {
    console.log(error);
    return next({
      status: statusCodes.INTERNAL_SERVER_ERROR,
      message: "Error fetching vehicle",
    });
  }
};

const fetchVehicleByOwner = async (req, res, next) => {
  try {
    const { _id } = req.user;

    const vehicle = await Vehicle.find({ vehicleOwner: _id });
    if (!vehicle) {
      return next({
        status: statusCodes.NOT_FOUND,
        message: "Vehicle not found",
      });
    }

    return successResponse(res, "Vehicle fetched Successfully", vehicle);
  } catch (error) {
    console.log(error);
    return next({
      status: statusCodes.INTERNAL_SERVER_ERROR,
      message: "Error fetching vehicle",
    });
  }
};

const updateVehicle = async (req, res, next) => {
  try {
    const { _id } = req.user;
    const { id } = req.params;

    const vehicle = await Vehicle.findById(id);

    if (!vehicle) {
      return next({
        status: statusCodes.NOT_FOUND,
        message: "Vehicle not found",
      });
    }

    if (vehicle.vehicleOwner.toString() !== _id.toString()) {
      return next({
        status: statusCodes.UNAUTHORIZED,
        message: "You are not authorized to update this vehicle",
      });
    }

    const updatedVehicle = await Vehicle.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });

    return successResponse(res, "Vehicle updated successfully", updatedVehicle);
  } catch (error) {
    console.log(error);
    return next({
      status: statusCodes.INTERNAL_SERVER_ERROR,
      message: "Error updating vehicle",
    });
  }
};

const deleteVehicle = async (req, res, next) => {
  try {
    const { _id } = req.user;

    const { id } = req.params;

    const vehicle = await Vehicle.findById(id);

    if (!vehicle) {
      return next({
        status: statusCodes.NOT_FOUND,
        message: "Vehicle not found",
      });
    }

    if (vehicle.vehicleOwner.toString() !== _id.toString()) {
      return next({
        status: statusCodes.UNAUTHORIZED,
        message: "You are not authorized to delete this vehicle",
      });
    }

    await vehicle.deleteOne();
    return successResponse(res, "Vehicle deleted successfully");
  } catch (error) {
    console.log(error);
    return next({
      status: statusCodes.INTERNAL_SERVER_ERROR,
      message: "Error deleting vehicle",
    });
  }
};

module.exports = {
  registerVehicle,
  fetchVehicle,
  fetchVehicleById,
  fetchVehicleByOwner,
  deleteVehicle,
  updateVehicle,
};
