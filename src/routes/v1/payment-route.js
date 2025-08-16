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
router.post("/transfer", async (req, res) => {
  try {
    const { amount, recipient_code, reason } = req.body;

    // hit paystack API
    const response = await axios.post(
      "https://api.paystack.co/transfer",
      {
        source: "balance",
        reason: reason || "Test transfer",
        amount: amount * 100, // convert Naira to Kobo
        recipient: recipient_code, // from Paystack dashboard/test recipient
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET}`, // put your secret key in .env
          "Content-Type": "application/json",
        },
      }
    );

    res.json(response.data);
  } catch (error) {
    console.error(error.response?.data || error.message);
    res.status(500).json({ error: error.response?.data || error.message });
  }
});

module.exports = router;
