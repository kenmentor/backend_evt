const { getRepos } = require("../event-sourcing");

class payment_repo {
  constructor() {
    this._repo = null;
  }

  get repo() {
    if (!this._repo) {
      const { paymentEventRepo } = getRepos();
      this._repo = paymentEventRepo;
    }
    return this._repo;
  }

  async find(query) {
    return this.repo.find(query);
  }

  async findOne(query) {
    return this.repo.findOne(query);
  }

  async findById(id) {
    return this.repo.findById(id);
  }

  async create(data) {
    const paymentId = data._id || new (require("mongoose").Types.ObjectId)().toString();
    await this.repo.create({ _id: paymentId, ...data });
    return this.repo.findById(paymentId);
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
  }) {
    const existingPayment = await this.repo.findOne({ paymentRef });
    if (existingPayment) {
      throw new Error("Duplicate payment reference detected");
    }

    const paymentId = new (require("mongoose").Types.ObjectId)().toString();
    const { check_payment, refund } = require("../utility/paystack-utils");

    const checkPayment = await check_payment(paymentRef);
    if (!checkPayment || checkPayment.status !== "success") {
      throw new Error("Payment verification failed");
    }

    if (amount === price) {
      await this.repo.create({
        _id: paymentId,
        host,
        guest,
        house,
        amount,
        price,
        checkIn,
        checkOut,
        paymentRef,
        status: "success",
        paymentStatus: "paid",
      });
      await this.repo.commands.complete(paymentId);
      await this.repo.handler.runOnce();
      console.log("✅ Payment processed successfully");
    } else if (amount > price) {
      const refundAmount = amount - price;
      await this.repo.create({
        _id: paymentId,
        host,
        guest,
        house,
        amount,
        refund: refundAmount,
        price,
        checkIn,
        checkOut,
        paymentRef,
        status: "success",
        paymentStatus: "overpaid",
      });
      await this.repo.commands.complete(paymentId);
      await this.repo.handler.runOnce();
      await refund(paymentRef, refundAmount);
      console.log(`⚠️ Overpayment detected. Refunded ₦${refundAmount}`);
    } else if (amount < price) {
      await this.repo.create({
        _id: paymentId,
        host,
        guest,
        house,
        amount,
        price,
        checkIn,
        checkOut,
        paymentRef,
        status: "failed",
        paymentStatus: "underpaid",
      });
      await this.repo.commands.fail(paymentId);
      await this.repo.handler.runOnce();
      await refund(paymentRef, amount);
      throw new Error(`Underpayment detected: Paid ₦${amount}, expected ₦${price}`);
    }

    return this.repo.findById(paymentId);
  }
}

module.exports = payment_repo;
