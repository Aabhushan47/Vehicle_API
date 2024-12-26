const { date } = require("zod");
const User = require("../../models/user/userModel");
const generateAuthToken = require("../../utils/createJWT.utils");
// const { successResponse, errorResponse } = require("../../utils/reponse.utils");
// const statusCodes = require("../../utils/statusCodes.utils");

const mongoose = require("mongoose");
const {
  successResponse,
  errorResponse,
} = require("../../utils/response.utils");
const statusCodes = require("../../utils/statusCodes.utils");

// register user

const registerUser = async (req, res, next) => {
  try {
    const {
      firstName,
      lastName,
      email,
      username,
      password,
      phoneNumber,
      role,
    } = req.body;

    if (role === "admin") {
      const existingAdmin = await User.findOne({ role: "admin" });
      if (existingAdmin) {
        return next({
          status: statusCodes.BAD_REQUEST,
          message: "Admin already exists",
        });
      }
    }

    const user = await User.create({
      firstName,
      lastName,
      email,
      username,
      password,
      phoneNumber,
      role,
    });
    return successResponse(res, "User registered Successfully", {
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      username: user.username,
      role: user.role,
      id: user.id,
    });
  } catch (error) {
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

//login
const loginUser = async (req, res, next) => {
  try {
    const { username, password } = req.body;

    const user = await User.findOne({ username });
    if (!user) {
      return errorResponse(res, statusCodes.UNAUTHORIZED, "User not found");
    }
    const validPassword = await user.comparePassword(password);
    if (!validPassword) {
      return errorResponse(
        res,
        statusCodes.UNAUTHORIZED,
        "Invalid credentials"
      );
    }

    const token = generateAuthToken(user.id, user.role);

    // console.log(token)

    res.cookie("token", token, {
      httpOnly: true,
      secure: true,
      expire: "1d",
    });

    return successResponse(res, "User logged in successfully", {
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      username: user.username,
      role: user.role,
      id: user.id,
      token,
    });

    // console.log(user);
  } catch (error) {
    console.log(error);
  }
};

//fetch users
const fetchUsers = async (req, res, next) => {
  try {
    const users = await User.find({}).select("-password");

    return successResponse(res, "Users fetched successfully", users);
  } catch (error) {
    next({
      status: statusCodes.INTERNAL_SERVER_ERROR,
      message: "Error fetching users",
    });
  }
};

// fetch user by id
const getUserById = async (req, res, next) => {
  try {
    const user = req.user;
    if (!user) {
      return next({
        status: statusCodes.NOT_FOUND,
        message: "User not found",
      });
    }

    return successResponse(res, "User fetched successfully", user);
  } catch (error) {
    next({
      status: statusCodes.INTERNAL_SERVER_ERROR,
      message: `Unable to fetch user: ${error.message}`,
    });
  }
};

// update user

const updateUser = async (req, res, next) => {
  const userId = req.user._id;
  const updateData = req.body;

  try {
    const user = await User.findByIdAndUpdate(userId, updateData, {
      new: true,
      runValidators: true,
    });

    if (!user) {
      return errorResponse(res, statusCodes.NOT_FOUND, "User not found");
    }

    return successResponse(res, "User updated successfully", user);
  } catch (error) {
    next({
      status: statusCodes.INTERNAL_SERVER_ERROR,
      message: "Unable to update user",
    });
  }
};

//delete user
const deleteUser = async (req, res, next) => {
  try {
    // const { id } = req.params;
    const userId = req.user._id;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return next({
        status: statusCodes.BAD_REQUEST,
        message: "Invalid user ID",
      });
    }
    const deletedUser = await User.findByIdAndDelete(userId);

    if (!deletedUser) {
      return next({
        status: statusCodes.NOT_FOUND,
        message: " User not found",
      });
    }
    return successResponse(res, "User deleted successfully", deletedUser);
  } catch (error) {
    next({
      status: statusCodes.INTERNAL_SERVER_ERROR,
      message: `Unable to delete user: ${error.message}`,
    });
  }
};

module.exports = {
  registerUser,
  fetchUsers,
  getUserById,
  updateUser,
  deleteUser,
  loginUser,
};
