/**
 * Payment Service - Event Sourcing Version
 */

const axios = require("axios");
const { get_details } = require("./house-service");
const { getRepos } = require("../event-sourcing");
const mongoose = require("mongoose");
require("dotenv").config();

const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET;

function getPaymentRepo() {
  const { paymentEventRepo } = getRepos();
  return paymentEventRepo;
}

async function initializeBank({ email, amount, guest, host, house }) {
  try {
    const houseDetails = await get_details(house);

    if (!houseDetails.avaliable) {
      throw new Error("This house has already been booked");
    }
    console.log(amount);

    const res = await axios.post(
      "https://api.paystack.co/transaction/initialize",
      {
        email,
        amount: amount * 100,
        metadata: {
          guest,
          host,
          email,
          price: houseDetails.price,
          house,
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
    console.error("Paystack initialization error:", error.response?.data || error.message);
    return {
      success: false,
      message: error.response?.data?.message || error.message || "Something went wrong during initialization",
    };
  }
}

async function Payment_webhook(paymentdata) {
  try {
    console.log(paymentdata, "Payment service input");

    if (!paymentdata.guest || !paymentdata.host || !paymentdata.house || !paymentdata.amount || !paymentdata.paymentRef) {
      throw new Error("Missing required payment fields");
    }

    const repo = getPaymentRepo();
    const paymentId = new mongoose.Types.ObjectId().toString();

    // Initiate payment via event sourcing
    await repo.create({
      _id: paymentId,
      host: paymentdata.host,
      guest: paymentdata.guest,
      house: paymentdata.house,
      amount: paymentdata.amount,
      paymentRef: paymentdata.paymentRef,
      method: paymentdata.method || 'paystack',
    });

    // If payment is successful, complete it
    if (paymentdata.status === 'success') {
      await repo.commands.complete(paymentId);
      await repo.handler.runOnce();
    } else {
      await repo.commands.fail(paymentId);
      await repo.handler.runOnce();
    }

    console.log("Payment processed successfully");
    return await repo.findById(paymentId);
  } catch (error) {
    console.error("Payment service error:", error.message);
    throw error;
  }
}

async function get_history(id) {
  const repo = getPaymentRepo();
  return await repo.find({ guest: id });
}

async function refund(reference, amount) {
  try {
    const repo = getPaymentRepo();
    const payments = await repo.find({ paymentRef: reference });
    
    if (payments.length === 0) {
      throw new Error("Payment not found");
    }
    
    const payment = payments[0];
    
    // Request refund
    await repo.commands.requestRefund(payment._id);
    await repo.handler.runOnce();
    
    // Process refund
    await repo.commands.refund(payment._id, { refundAmount: amount });
    await repo.handler.runOnce();

    // Call Paystack refund API
    const res = await axios.post(
      "https://api.paystack.co/refund",
      {
        transaction: reference,
        amount: amount * 100,
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
    throw error;
  }
}

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
    console.error("Error verifying payment:", error.response?.data || error.message);
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
