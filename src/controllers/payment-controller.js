const crypto = require("crypto");
const { response, connectDB } = require("../utility");
const { paymentService } = require("../service");
const { goodResponse } = require("../utility/response");
require("dotenv").config();

const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET || "hello";

/**
 * Paystack Webhook Handler
 * Verifies signature & processes events
 */
async function Payment_webhook(req, res) {
  try {
    await console.log("Received Paystack webhook");
    await console.log("Received Paystack webhook");
    const hash = crypto
      .createHmac("sha512", PAYSTACK_SECRET)
      .update(JSON.stringify(req.body))
      .digest("hex");
    console.log("Received Paystack webhook");
    console.log("payment hash ", hash);
    if (hash !== req.headers["x-paystack-signature"]) {
      console.error("Invalid Paystack signature");
      return res.status(401).json({
        status: "error",
        message: "Invalid signature",
      });
    }

    const event = req.body;
    console.log("Received Paystack webhook");
    switch (event.event) {
      case "charge.success":
        {
          console.log("Received Paystack webhook");

          // Extract metadata
          const {
            metadata,
            reference,
            amount: rawAmount,
            status: paystackStatus,
          } = event.data;

          const {
            email,
            guest,
            host,
            house,
            price,
            checkIn: metadataCheckIn,
            checkOut: metadataCheckOut,
            note,
            method,
          } = metadata;

          // Convert amount from kobo to naira
          const amount = rawAmount / 100;

          // Generate check-in and check-out dates if not provided
          const checkIn = metadataCheckIn
            ? new Date(metadataCheckIn)
            : new Date();
          const checkOut = metadataCheckOut
            ? new Date(metadataCheckOut)
            : new Date(new Date(checkIn).setMonth(checkIn.getMonth() + 12));

          // Build payment data object fully compatible with your schema
          const paymentData = {
            host, // Required
            guest, // Required
            house, // Required
            email, // Optional, useful for reference
            amount, // Required
            status: paystackStatus || "success", // Required
            paymentStatus: "paid", // Set default to paid on success
            reference: reference, // Required
            paymentRef: reference, // Required
            note: note || "",
            method: method || "card", // or "bank_transfer" depending on your integration
            checkIn,
            checkOut,
            price, // Optional, useful for verification
          };

          console.log("Extracted Payment Data:", paymentData);

          // Call your service to process/save
          const payment = await paymentService.Payment_webhook(paymentData);

          console.log("Payment processed:", payment);

          return res.json({
            status: "success",
            message: "Transaction successful",
          });
        }
        break;

      default:
        return res.json({
          status: "ignored",
          message: `Event ${event.event} ignored`,
        });
    }
  } catch (error) {
    console.error("Webhook processing error:", error);
    return res.status(500).json({
      status: "error",
      message: "Failed to process webhook",
    });
  }
}

/**
 * Initialize Bank Transfer
 */
async function initializeBankTransfer(req, res) {
  const { email, amount, guestId, hostId, houseId } = req.body;
  console.log(req.body);
  if (!email || !amount || !guestId || !hostId || !houseId) {
    return res.status(400).json({
      status: "error",
      message: "Missing required fields",
    });
  }

  try {
    const data = await paymentService.initializeBank({
      email,
      amount: amount,
      guest: guestId,
      host: hostId,
      house: houseId,
    });

    if (data.success) {
      return res.json({
        status: "success",
        data: data.data,
      });
    }

    return res.status(400).json({
      status: "error",
      message: data.message,
    });
  } catch (error) {
    console.error("Error initializing bank transfer:", error);
    return res.status(500).json({
      status: "error",
      message: "Error occurred while initializing transaction",
    });
  }
}

/**
 * Check Payment Status
 */
async function checkPaymentStatus(req, res) {
  const { reference } = req.params;

  if (!reference) {
    return res.status(400).json({
      status: "error",
      message: "Payment reference is required",
    });
  }

  try {
    const data = await paymentService.checkPayment(reference);

    if (data.status === "success") {
      return res.json({
        status: "success",
        message: "Payment successful",
        data,
      });
    }

    return res.json({
      status: "pending",
      message: "Payment not completed",
      data,
    });
  } catch (error) {
    console.error(
      "Error verifying payment:",
      error.response?.data || error.message
    );
    return res.status(500).json({
      status: "error",
      message: "Failed to verify payment",
    });
  }
}
async function get_history(req, res) {
  const { id } = req.params;
  const data = await paymentService.get_history(id);
  return res.json({
    ...goodResponse,
    data: data,
  });
}

module.exports = {
  Payment_webhook,
  initializeBankTransfer,
  checkPaymentStatus,
  get_history,
};
