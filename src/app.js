const express = require("express");
const connectDB = require("./config/db");
const userRoute = require("./routes/user/user.route");
const vehicleRoute = require("./routes/vehicle/vehicle.route");
const bookingRoute = require("./routes/booking/booking.route");
const paymentRoute = require("./routes/payment/payment.route");

const errorMiddleware = require("./middleware/error.middleware");
const app = express();
const cookieParser = require("cookie-parser");

connectDB();

app.use(cookieParser());

app.use(express.json());

app.use("/api", userRoute);
app.use("/api", vehicleRoute);
app.use("/api", bookingRoute);
app.use("/api", paymentRoute);

app.use(errorMiddleware);

app.get("/", (req, res) => {
  res.send("Vehicle System API");
});

module.exports = app;
