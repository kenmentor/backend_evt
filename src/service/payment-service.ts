import axios from "axios";
import { get_details } from "./house-service";
import mongoose from "mongoose";
import dotenv from "dotenv";
import { paymentCmd } from "../es/commands/payment";
import { queryPayments } from "../es/queries";
import { projectionHandlers } from "../es/projection";
dotenv.config();

const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET;

export async function initializeBank({ email, amount, guest, host, house }: {
  email: string;
  amount: number;
  guest: string;
  host: string;
  house: string;
}) {
  try {
    const houseDetails: any = await get_details(house);

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
  } catch (error: any) {
    console.error("Paystack initialization error:", error.response?.data || error.message);
    return {
      success: false,
      message: error.response?.data?.message || error.message || "Something went wrong during initialization",
    };
  }
}

export async function Payment_webhook(paymentdata: any) {
  try {
    console.log(paymentdata, "Payment service input");

    if (!paymentdata.guest || !paymentdata.host || !paymentdata.house || !paymentdata.amount || !paymentdata.paymentRef) {
      throw new Error("Missing required payment fields");
    }

    const paymentId = new mongoose.Types.ObjectId().toString();

    await paymentCmd.initiate(paymentId, {
      host: paymentdata.host,
      guest: paymentdata.guest,
      house: paymentdata.house,
      amount: paymentdata.amount,
      paymentRef: paymentdata.paymentRef,
      method: paymentdata.method || "paystack",
      note: paymentdata.note || '',
    });

    if (paymentdata.status === "success") {
      await paymentCmd.complete(paymentId, {});
    } else {
      await paymentCmd.fail(paymentId, {});
    }

    await projectionHandlers.payments.runOnce();
    console.log("Payment processed successfully");
    return await queryPayments.getByAggregateId(paymentId);
  } catch (error: any) {
    console.error("Payment service error:", error.message);
    throw error;
  }
}

export async function get_history(id: string) {
  return await queryPayments.getByGuest(id);
}

export async function refund(reference: string, amount: number) {
  try {
    const payments = await queryPayments.getByPaymentRef(reference);

    if (!payments) {
      throw new Error("Payment not found");
    }

    await paymentCmd.requestRefund(payments.paymentId, {});
    await projectionHandlers.payments.runOnce();

    await paymentCmd.refund(payments.paymentId, { refundAmount: amount });
    await projectionHandlers.payments.runOnce();

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
  } catch (error: any) {
    console.error("Refund failed:", error.response?.data || error.message);
    throw error;
  }
}

export async function check_payment(reference: string) {
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
  } catch (error: any) {
    console.error("Error verifying payment:", error.response?.data || error.message);
    throw new Error("Failed to verify payment");
  }
}
