const axios = require("axios");
const { get_details } = require("./house-service");
const { connectDB } = require("../utility");
const { house_service } = require(".");
require("dotenv").config();
const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET;
async function initializeBank({ email, amount, guest, host, house }) {
  console.log({ email, amount, guest, host, house });
  try {
    const houseDetails = await get_details(host);
    if (!houseDetails.available) {
      throw {
        message: "this house have booked",
      };
    }
    const res = await axios.post(
      "https://api.paystack.co/transaction/initialize",
      {
        email,
        amount: amount * 100,
        channels: ["bank_transfer"],
        metadata: {
          guest,
          host,
          email,
          price: houseDetails.amount * 100,
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

    const bankDetails = res.data.data.bank || null;
    const houseUpDate = await house_service.update_house({
      where: { id: house }, // assuming house id here
      data: { available: false },
    });

    return {
      success: true,
      data: {
        authorization_url: res.data.data.authorization_url,
        access_code: res.data.data.access_code,
        reference: res.data.data.reference,
        bankDetails,
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
        error.message ||
        error.response?.data?.message ||
        "Something went wrong during initialization",
    };
  }
}
async function Payment_webhook(object) {
  const { guest, host, house, amount, price, checkIn, checkOut, PaymentRef } =
    object;
  const checkPayment = await check_payment();
  const db = await connectDB();
  const paid = checkPayment.status === "success";

  try {
    if (amount / 100 === price && paid) {
      const status = "success";
      await db.$transaction(async (tx) => {
        // Save payment
        await tx.payment.payment.create({
          host,
          guest,
          house,
          amount: amount / 100, // convert to actual currency
          status: "success",
          paymentStatus: "paid",

          paymentRef: PaymentRef,
        });

        // Create booking
        await tx.booking.create({
          host,
          guest,
          amount: amount / 100,
          house,
          status,
          platformFee: (amount / 100) * 0.05,
          paymentId: PaymentRef,
          checkIn: checkIn, // Add actual data if available
          checkOut: checkOut, // Add actual data if available
        });

        // Update resource availability
      });
    }
    if (amount / 100 > price && paid) {
      const refund_amount = amount / 100 - price;
      const status = "success";
      await db.$transaction(async (tx) => {
        // Save payment
        await tx.payment.payment.create({
          host,
          guest,
          house,
          amount: amount / 100, // convert to actual currency
          status: "success",
          paymentStatus: "paid",
          refund: refund_amount,
          paymentRef: PaymentRef,
        });

        // Create booking
        await tx.booking.create({
          host,
          guest,
          amount: amount / 100,
          house,
          status,
          platformFee: (amount / 100) * 0.05,
          paymentId: PaymentRef,
          checkIn: checkIn, // Add actual data if available
          checkOut: checkOut, // Add actual data if available
        });
      });
    }
    if (amount / 100 < price && paid) {
      refund();
      const refund_amount = amount;
      const status = "success";

      // Save payment
      await tx.payment.payment.create({
        host,
        guest,
        house,
        amount: amount / 100, // convert to actual currency
        status: status,
        paymentStatus: "refuned",
        refund: refund_amount,
        paymentRef: PaymentRef,
      });
      throw new Error({ message: "insufficient fund" });
    }

    return null;
  } catch (error) {
    await tx.resource.update({
      where: { id: house },
      data: { available: true },
    });
    console.log(error);
    throw error;
  }
}
function refund() {
  console.log("you have been refouned ");
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

    if (data.status === "success") {
      return {
        amount: data.amount / 100,
        email: data.customer.email,
        status: data.status,
        reference: data.reference,
      };
    } else {
      return {
        status: data.status,
        reference: data.reference,
      };
    }
  } catch (error) {
    throw new Error({ message: "insufficient fund" });
  }
}

module.exports = { initializeBank, refund, Payment_webhook, check_payment };
("");
