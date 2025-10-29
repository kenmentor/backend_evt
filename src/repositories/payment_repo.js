const mongoose = require("mongoose");
const crud = require("./CRUD");
const House = require("./house-repository");
const Booking = require("./booking-repository");
const { check_payment, refund } = require("../utility/paystack-utils"); // hypothetical utility for Paystack

class payment_repo extends crud {
  constructor(module) {
    super(module);
    this.now = new Date();
    this.twelveMonthsLater = new Date();
    this.twelveMonthsLater.setMonth(this.now.getMonth() + 12);
  }

  /**
   * Process a payment and handle all cases:
   * - ✅ Normal payment (exact amount)
   * - ⚠️ Overpayment (refund extra)
   * - ❌ Underpayment (reject booking)
   * - 🔁 Duplicate payment reference
   * - 🧩 Full DB transaction rollback on error
   */

  async processPayment({
    guest,
    host,
    house,
    amount,
    price,
    checkIn = this.now,
    checkOut = this.twelveMonthsLater,
    PaymentRef,
  }) {
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
      "controller"
    );
    const session = await mongoose.startSession();

    try {
      await session.withTransaction(async () => {
        // 1️⃣ Prevent duplicate payment references
        const existingPayment = await this.module.findOne(
          { paymentRef: PaymentRef },
          null,
          { session }
        );
        if (existingPayment) {
          throw new Error("Duplicate payment reference detected");
        }

        // 2️⃣ Verify payment status from Paystack
        const checkPayment = await check_payment(PaymentRef);
        if (!checkPayment || checkPayment.status !== "success") {
          throw new Error("Payment verification failed");
        }

        // 3️⃣ Convert amount (kobo → naira)
        const paidAmount = amount / 100;
        console.log("💰 Paid:", paidAmount, "| Expected:", price);

        // 4️⃣ CASE: Exact Payment

        if (paidAmount === price) {
          await this.module.create(
            [
              {
                host,
                guest,
                house,
                amount: paidAmount,
                status: "success",
                paymentStatus: "paid",
                paymentRef: PaymentRef,
              },
            ],
            { session }
          );

          await Booking.create(
            [
              {
                host,
                guest,
                house,
                amount: paidAmount,
                status: "confirmed",
                platformFee: paidAmount * 0.05,
                paymentId: PaymentRef,
                checkIn,
                checkOut,
              },
            ],
            { session }
          );

          await House.updateOne(
            { _id: house },
            { available: false },
            { session }
          );

          console.log("✅ Payment processed successfully");
        }

        // 5️⃣ CASE: Overpayment (refund extra)
        else if (paidAmount > price) {
          const refundAmount = paidAmount - price;

          await this.module.create(
            [
              {
                host,
                guest,
                house,
                amount: paidAmount,
                refund: refundAmount,
                status: "success",
                paymentStatus: "overpaid",
                paymentRef: PaymentRef,
              },
            ],
            { session }
          );

          await Booking.create(
            [
              {
                host,
                guest,
                house,
                amount: paidAmount,
                status: "confirmed",
                platformFee: price * 0.05,
                paymentId: PaymentRef,
                checkIn,
                checkOut,
              },
            ],
            { session }
          );

          await House.updateOne(
            { _id: house },
            { available: false },
            { session }
          );

          await refund(PaymentRef, refundAmount);
          console.log(`⚠️ Overpayment detected. Refunded ₦${refundAmount}`);
        }

        // 6️⃣ CASE: Underpayment (reject)
        else if (paidAmount < price) {
          await this.module.create(
            [
              {
                host,
                guest,
                house,
                amount: paidAmount,
                status: "failed",
                paymentStatus: "underpaid",
                paymentRef: PaymentRef,
              },
            ],
            { session }
          );
          await refund(PaymentRef, paidAmount);
          throw new Error(
            `Underpayment detected: Paid ₦${paidAmount}, expected ₦${price}`
          );
        } else {
          this.create(
            [
              {
                host,
                guest,
                house,
                amount: paidAmount,
                status: "failed",
                paymentStatus: "underpaid",
                paymentRef: PaymentRef,
              },
            ],
            {
              session,
            }
          );
        }
        // ✅ If we reach here, all is well
      });
    } catch (err) {
      console.error("❌ Payment transaction error:", err.message);
      throw err;
    } finally {
      session.endSession();
    }
  }
}

module.exports = payment_repo;
