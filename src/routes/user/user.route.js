const express = require("express");
const zodValidation = require("../../middleware/zodValidation.middleware");
const { userSchema } = require("../../validations/user.validation");
const {
  registerUser,
  fetchUsers,
  getUserById,
  updateUser,
  deleteUser,
  loginUser,
} = require("../../controllers/user/userController");
const router = express.Router();
const { isAuthorized } = require("../../middleware/auth.middleware");

router.post("/register", zodValidation(userSchema), registerUser);
router.get("/users", fetchUsers);
router.get("/user", isAuthorized, getUserById);
router.put("/user", isAuthorized, updateUser);
router.delete("/user", isAuthorized, deleteUser);
router.post("/login", loginUser);

module.exports = router;
