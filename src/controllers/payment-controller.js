const crypto = require("crypto");
const { response, connectDB } = require("../utility");
const { paymentService } = require("../service");

const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET || "hello";

/**
 * Paystack Webhook Handler
 * Verifies signature & processes events
 */
async function Payment_webhook(req, res) {
  try {
    const hash = crypto
      .createHmac("sha512", PAYSTACK_SECRET)
      .update(JSON.stringify(req.body))
      .digest("hex");

    if (hash !== req.headers["x-paystack-signature"]) {
      return res.status(401).json({
        status: "error",
        message: "Invalid signature",
      });
    }

    const event = req.body;

    switch (event.event) {
      case "charge.success":
        if (event.data.channel === "bank_transfer") {
          const { email, guest, host, house, price, checkIn, checkOut } =
            event.data.metadata;

          const PaymentRef = event.data.reference;
          const amount = event.data.amount;

          await paymentService.Payment_webhook({
            email,
            guest,
            host,
            house,
            price,
            amount,
            checkIn,
            checkOut,
            PaymentRef,
          });

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

  if (!email || !amount || !guestId || !hostId || !houseId) {
    return res.status(400).json({
      status: "error",
      message: "Missing required fields",
    });
  }

  try {
    const data = await paymentService.initializeBank({
      email,
      price: amount,
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

module.exports = {
  Payment_webhook,
  initializeBankTransfer,
  checkPaymentStatus,
};
