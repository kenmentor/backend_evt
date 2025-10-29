const axios = require("axios");
const { get_details } = require("./house-service");
const { connectDB } = require("../utility");
const { paymentDB, bookingDB, resourceDB } = require("../modules/");
const { crudRepository } = require("../repositories");
const mongoose = require("mongoose");
const payment = require("../modules/payment");
const payment_repo = require("../repositories/payment_repo");
require("dotenv").config();
const Payment = new payment_repo(paymentDB);

const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET;

/**
 * Initialize Bank Transfer
 */
async function initializeBank({ email, amount, guest, host, house }) {
  try {
    // ✅ Get house details by house ID, not host
    const houseDetails = await get_details(house);

    if (!houseDetails.avaliable) {
      throw new Error("This house has already been booked");
    }
    console.log(amount);

    // ✅ Initialize Paystack transaction
    const res = await axios.post(
      "https://api.paystack.co/transaction/initialize",
      {
        email,
        amount: amount * 100,
        // channels: ["bank_transfer"],
        metadata: {
          guest,
          host,
          email,
          price: houseDetails.price, // store as naira, Paystack expects *100 already
          house,
          checkIn: houseDetails.checkIn,
          checkOut: houseDetails.checkOut,
        },
      },
      {
        headers: {
          Authorization: `Bearer ${PAYSTACK_SECRET}`,
          "Content-Type": "application/json",
        },
      }
    );

    return {
      success: true,
      data: {
        authorization_url: res.data.data.authorization_url,
        access_code: res.data.data.access_code,
        reference: res.data.data.reference,
        bankDetails: res.data.data.bank || null,
      },
    };
  } catch (error) {
    console.error(
      "Paystack initialization error:",
      error.response?.data || error.message
    );

    return {
      success: false,
      message:
        error.response?.data?.message ||
        error.message ||
        "Something went wrong during initialization",
    };
  }
}

/**
 * Webhook Processing
 */

async function Payment_webhook({
  guest,
  host,
  house,
  amount,
  price,
  checkIn,
  checkOut,
  PaymentRef,
}) {
  // Start a session from mongoose
  try {
    console.log(
      {
        guest,
        host,
        house,
        amount,
        price,
        checkIn,
        checkOut,
        PaymentRef,
      },
      "service"
    );
    const data = await Payment.processPayment({
      guest,
      host,
      house,
      amount,
      price,
      checkIn,
      checkOut,
      PaymentRef,
    });
    return data;
  } catch (error) {
    throw error;
  }
}

/**
 * Call Paystack Refund API
 */
async function get_history(id) {
  const data = await payment.findById(id);
  return data;
}
async function refund(reference, amount) {
  try {
    const res = await axios.post(
      "https://api.paystack.co/refund",
      {
        transaction: reference,
        amount: amount * 100, // Paystack expects kobo
      },
      {
        headers: {
          Authorization: `Bearer ${PAYSTACK_SECRET}`,
          "Content-Type": "application/json",
        },
      }
    );

    console.log("Refund processed:", res.data);
    return res.data;
  } catch (error) {
    console.error("Refund failed:", error.response?.data || error.message);
  }
}

/**
 * Check Payment Verification
 */
async function check_payment(reference) {
  try {
    const paystackRes = await axios.get(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        headers: {
          Authorization: `Bearer ${PAYSTACK_SECRET}`,
          "Content-Type": "application/json",
        },
      }
    );

    const { data } = paystackRes.data;

    return {
      amount: data.amount / 100,
      email: data.customer.email,
      status: data.status,
      reference: data.reference,
    };
  } catch (error) {
    console.error(
      "Error verifying payment:",
      error.response?.data || error.message
    );
    throw new Error("Failed to verify payment");
  }
}

module.exports = {
  initializeBank,
  get_history,
  refund,
  Payment_webhook,
  check_payment,
};
