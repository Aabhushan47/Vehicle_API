const express = require("express");
const {
  registerVehicle,
  fetchVehicle,
  fetchVehicleById,
  fetchVehicleByOwner,
  deleteVehicle,
  updateVehicle,
} = require("../../controllers/vehicle/vehicle.controller");
const upload = require("../../utils/multer.utils");
const { isVehicleOwner } = require("../../middleware/auth.middleware");
const router = express.Router();

router.post(
  "/vehicle",
  upload.single("vehicleImage"),
  isVehicleOwner,
  registerVehicle
);
router.get("/vehicle", fetchVehicle);
router.get("/vehicle/:id", fetchVehicleById);
router.get("/myvehicle", isVehicleOwner, fetchVehicleByOwner);
router.delete("/vehicle/:id", isVehicleOwner, deleteVehicle);
router.put("/vehicle/:id", isVehicleOwner, updateVehicle);

module.exports = router;
