import mongoose from "mongoose";
import { paymentCmd } from "../es/commands/payment";
import { queryPayments } from "../es/queries";
import { projectionHandlers } from "../es/projection";

interface PaymentData {
  _id?: string;
  host?: string;
  guest?: string;
  house?: string;
  amount?: number;
  price?: number;
  checkIn?: string;
  checkOut?: string;
  paymentRef?: string;
  [key: string]: any;
}

interface ProcessPaymentParams {
  guest: string;
  host: string;
  house: string;
  amount: number;
  price: number;
  checkIn: string;
  checkOut: string;
  paymentRef: string;
}

class payment_repo {
  async find(query: Record<string, any>) {
    if (query.guest) return queryPayments.getByGuest(query.guest);
    if (query.host) return queryPayments.getByHost(query.host);
    if (query.paymentRef) {
      const p = await queryPayments.getByPaymentRef(query.paymentRef);
      return p ? [p] : [];
    }
    return queryPayments.getAll();
  }

  async findOne(query: Record<string, any>) {
    if (query.paymentRef) return queryPayments.getByPaymentRef(query.paymentRef);
    if (query._id) return queryPayments.getByAggregateId(query._id);
    return null;
  }

  async findById(id: string) {
    return queryPayments.getByAggregateId(id);
  }

  async create(data: PaymentData) {
    const paymentId = data._id || new mongoose.Types.ObjectId().toString();
    await paymentCmd.initiate(paymentId, {
      host: data.host || '',
      guest: data.guest || '',
      house: data.house || '',
      amount: data.amount || 0,
      paymentRef: data.paymentRef || '',
      method: data.method || '',
      note: data.note || '',
    });
    await projectionHandlers.payments.runOnce();
    return queryPayments.getByAggregateId(paymentId);
  }

  async processPayment({
    guest,
    host,
    house,
    amount,
    price,
    checkIn,
    checkOut,
    paymentRef,
  }: ProcessPaymentParams) {
    const existingPayment = await queryPayments.getByPaymentRef(paymentRef);
    if (existingPayment) {
      throw new Error("Duplicate payment reference detected");
    }

    const { check_payment, refund } = require("../utility/paystack-utils");

    const checkPayment = await check_payment(paymentRef);
    if (!checkPayment || checkPayment.status !== "success") {
      throw new Error("Payment verification failed");
    }

    const paymentId = new mongoose.Types.ObjectId().toString();

    if (amount === price) {
      await paymentCmd.initiate(paymentId, {
        host, guest, house, amount, paymentRef, method: 'paystack', note: '',
      });
      await paymentCmd.complete(paymentId, {});
      await projectionHandlers.payments.runOnce();
      console.log("✅ Payment processed successfully");
    } else if (amount > price) {
      const refundAmount = amount - price;
      await paymentCmd.initiate(paymentId, {
        host, guest, house, amount, paymentRef, method: 'paystack', note: 'overpaid',
      });
      await paymentCmd.complete(paymentId, {});
      await projectionHandlers.payments.runOnce();
      await refund(paymentRef, refundAmount);
      console.log(`⚠️ Overpayment detected. Refunded ₦${refundAmount}`);
    } else if (amount < price) {
      await paymentCmd.initiate(paymentId, {
        host, guest, house, amount, paymentRef, method: 'paystack', note: 'underpaid',
      });
      await paymentCmd.fail(paymentId, {});
      await projectionHandlers.payments.runOnce();
      await refund(paymentRef, amount);
      throw new Error(`Underpayment detected: Paid ₦${amount}, expected ₦${price}`);
    }

    return queryPayments.getByAggregateId(paymentId);
  }
}

export default payment_repo;
