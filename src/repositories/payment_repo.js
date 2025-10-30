const mongoose = require("mongoose");
const crud = require("./CRUD");
const House = require("./house-repository");
const Booking = require("../modules/booking");
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
    checkIn,
    checkOut,
    paymentRef,
  }) {
    console.log("Booking value type:", typeof Booking);
    console.log("Booking keys:", Object.keys(Booking || {}));
    console.log(
      {
        guest,
        host,
        house,
        amount,
        price,
        checkIn,
        checkOut,
        paymentRef,
      },
      "controller"
    );
    const session = await mongoose.startSession();

    try {
      await session.withTransaction(async () => {
        // 1️⃣ Prevent duplicate payment references
        const existingPayment = await this.module.findOne(
          { paymentRef: paymentRef },
          null,
          { session }
        );
        if (existingPayment) {
          throw new Error("Duplicate payment reference detected");
        }

        // 2️⃣ Verify payment status from Paystack
        const checkPayment = await check_payment(paymentRef);
        if (!checkPayment || checkPayment.status !== "success") {
          throw new Error("Payment verification failed");
        }

        // 3️⃣ Convert amount (kobo → naira)

        console.log("💰 Paid:", amount, "| Expected:", price);

        // 4️⃣ CASE: Exact Payment
        console.log(
          "/////////////////////////////////////////////////////////////////////////////////does it matchMedia",
          amount === price,
          "///////////////////////////////////////////////////////////////"
        );
        console.log();
        if (amount === price) {
          await this.module.create(
            [
              {
                guest,

                price,
                checkIn,
                checkOut,

                host,
                guest,
                house,
                amount: amount,
                status: "success",
                paymentStatus: "paid",
                paymentRef: paymentRef,
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
                amount: amount,
                status: "confirmed",
                platformFee: amount * 0.05,
                paymentId: paymentRef,
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
        else if (amount > price) {
          const refundAmount = amount - price;

          await this.module.create(
            [
              {
                host,
                guest,
                house,
                amount: amount,
                refund: refundAmount,
                status: "success",
                paymentStatus: "overpaid",
                paymentRef: paymentRef,
                checkIn,
                checkOut,
                price,
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
                amount: amount,
                status: "confirmed",
                platformFee: price * 0.05,
                paymentId: paymentRef,
                checkIn,
                checkOut,

                price,
              },
            ],

            { session }
          );

          await House.updateOne(
            { _id: house },
            { available: false },
            { session }
          );

          await refund(paymentRef, refundAmount);
          console.log(`⚠️ Overpayment detected. Refunded ₦${refundAmount}`);
        }

        // 6️⃣ CASE: Underpayment (reject)
        else if (amount < price) {
          await this.module.create(
            [
              {
                host,
                guest,
                house,
                amount: amount,
                status: "failed",
                paymentStatus: "underpaid",
                paymentRef: paymentRef,
                checkIn,
                checkOut,
                price,
              },
            ],
            { session }
          );
          await refund(paymentRef, amount);
          throw new Error(
            `Underpayment detected: Paid ₦${amount}, expected ₦${price}`
          );
        } else {
          this.create(
            [
              {
                host,
                guest,
                house,
                amount: amount,
                status: "failed",
                paymentStatus: "undefined",
                paymentRef: paymentRef,
                checkIn,
                checkOut,
                price,
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
