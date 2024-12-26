const express = require("express");
const {
  createBooking,
} = require("../../controllers/booking/booking.controller");
const { isAuthorized } = require("../../middleware/auth.middleware");
const router = express.Router();

router.post("/booking", isAuthorized, createBooking);

module.exports = router;
