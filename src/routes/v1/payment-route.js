const express = require("express");
const router = express.Router();
const { payment_control } = require("../../controllers");
require("dotenv").config();

/**
 * Paystack Webhook
 * Paystack sends raw JSON (important for signature verification)
 */
router.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  payment_control.Payment_webhook
);

/**
 * Initialize Bank Transfer
 * Expects JSON body with { email, amount, propertyId }
 */
router.post(
  "/initialize-bank-transfer",
  express.json(),
  payment_control.initializeBankTransfer
);

/**
 * Check Payment Status
 * GET /check-payment/:reference
 * Used by frontend to verify transaction status
 */
router.get("/check-payment/:reference", payment_control.checkPaymentStatus);
//this is for getting user payment history
router.get("/:id", payment_control.get_history);

module.exports = router;
