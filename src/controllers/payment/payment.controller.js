const Booking = require("../../models/booking/booking.model");
const Payment = require("../../models/payment/payment.model");
const { initializeKhaltiPayment, verifyKhaltiPayment } = require("../../utils/khalti.utils");

// route to initilize khalti payment gateway
const initiateKhaltiPayment = async (req, res) => {
    try {
        //try catch for error handling
        const { bookingId, totalAmount, website_url } = req.body;

        const bookingData = await Booking.findOne({
            _id: bookingId,
            totalAmount: Number(totalAmount),
        });

        if (!bookingData) {
            return res.status(400).send({
                success: false,
                message: "Booking Data not found",
            });
        }

        const paymentInitate = await initializeKhaltiPayment({
            amount: totalAmount * 100, // amount should be in paisa (Rs * 100)
            purchase_order_id: bookingData._id, // purchase_order_id because we need to verify it later
            purchase_order_name: "abc",
            return_url: `${process.env.BACKEND_URI}/api/complete-khalti-payment`, // it can be even managed from frontedn
            website_url,
        });

        res.json({
            success: true,
            bookingData,
            payment: paymentInitate,
        });
    } catch (error) {
        console.log(error);
        res.json({
            success: false,
            error,
        });
    }
};

// it is our `return url` where we verify the payment done by user
const completeKhaltiPayment = async (req, res) => {
    const {
        pidx,
        txnId,
        amount,
        mobile,
        purchase_order_id,
        purchase_order_name,
        transaction_id,
    } = req.query;

    try {
        const paymentInfo = await verifyKhaltiPayment(pidx);

        // Check if payment is completed and details match
        if (
            paymentInfo?.status !== "Completed" ||
            paymentInfo.transaction_id !== transaction_id ||
            Number(paymentInfo.total_amount) !== Number(amount)
        ) {
            return res.status(400).json({
                success: false,
                message: "Incomplete information",
                paymentInfo,
            });
        }

        // Check if payment done in valid item
        const bookingData = await Booking.find({
            _id: purchase_order_id,
            totalAmount: amount,
        });

        if (!bookingData) {
            return res.status(400).send({
                success: false,
                message: "Purchased data not found",
            });
        }
        // updating purchase record
        await Booking.findByIdAndUpdate(
            purchase_order_id,

            {
                $set: {
                    bookingStatus: "completed",
                },
            }
        );

        // Create a new payment record
        const paymentData = await Payment.create({
            pidx,
            transactionId: transaction_id,
            bookingId: purchase_order_id,
            amount,
            dataFromVerificationReq: paymentInfo,
            apiQueryFromUser: req.query,
            paymentGateway: "khalti",
            status: "success",
        });

        // Send success response
        res.json({
            success: true,
            message: "Payment Successful",
            paymentData,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "An error occurred",
            error,
        });
    }
};

module.exports = { initiateKhaltiPayment, completeKhaltiPayment };
