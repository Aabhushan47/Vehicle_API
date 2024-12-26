const express = require("express");
const { isAuthorized } = require("../../middleware/auth.middleware");
const {
    completeKhaltiPayment,
    initiateKhaltiPayment,
} = require("../../controllers/payment/payment.controller");
const router = express.Router();

router.post("/initialize-khalti", isAuthorized, initiateKhaltiPayment);
router.get("/complete-khalti-payment", completeKhaltiPayment);

module.exports = router;
