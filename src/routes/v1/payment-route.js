const express = require("express");
const router = express.Router();
const { payment_control } = require("../../controllers");
const axios = require("axios");
require("dotenv").config();

// Webhook route — Paystack sends raw JSON
router.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  payment_control.Payment_webhook
);

// Initialize bank transfer — expects JSON body
router.post(
  "/initialize-bank-transfer",
  express.json(),
  payment_control.initilializeBank
);

// Check payment status by reference — frontend polls this
router.get("/check-payment/:reference", payment_control.checkPayment);
// routes/paystackTransfer.ts

// create transfer

module.exports = router;
