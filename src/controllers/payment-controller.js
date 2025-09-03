const crypto = require("crypto");
const { response, connectDB } = require("../utility");
const { paymentService } = require("../service");

const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET || "hello";

// Webhook handler
async function Payment_webhook(req, res) {
  const db = await connectDB();
  const hash = crypto
    .createHmac("sha512", PAYSTACK_SECRET)
    .update(JSON.stringify(req.body))
    .digest("hex");

  // Verify signature
  if (hash !== req.headers["x-paystack-signature"]) {
    const { badResponse } = response;
    badResponse.message = "Invalid signature";
    return res.status(401).json(badResponse);
  }

  const event = req.body;
  const resTemplate = response;

  // Handle successful bank transfer
  if (
    event.event === "charge.success" &&
    event.data.channel === "bank_transfer"
  ) {
    const { email, guest, host, house, price, checkIn, checkOut } =
      event.data.metadata;
    const PaymentRef = event.data.reference;
    const amount = event.data.amount;
    try {
      await paymentService.Payment_webhook({
        email,
        guest,
        host,
        house,
        price,
        amount,
        checkIn,
        checkOut,
        PaymentRef,
      });

      const { goodResponse } = resTemplate;
      goodResponse.message = "Transaction successful";
      return res.json(goodResponse);
    } catch (error) {
      console.error("Transaction failed:", error);
      const { badResponse } = resTemplate;
      badResponse.message = error.message || "Transaction failed";
      return res.status(500).json(badResponse);
    }
  } else {
    // Not a bank transfer or irrelevant event
    const { goodResponse } = resTemplate;
    goodResponse.message = "Event ignored";
    return res.json(goodResponse);
  }
}

// Initialize bank transfer 
async function initilializeBank(req, res) {
  const { email, amount, guestId, hostId, houseId } = req.body;
  const resTemplate = response;

  try {
    const data = await paymentService.initializeBank({
      email,
      price: amount,
      guest: guestId,
      host: hostId,
      house: houseId,
    });

    if (data.success) {
      const { goodResponse } = resTemplate;
      goodResponse.data = data.data;
      return res.json(goodResponse);
    } else {
      const { badResponse } = resTemplate;
      badResponse.message = data.message;
      badResponse.status = 400;
      return res.status(badResponse.status).json(badResponse);
    }
  } catch (error) {
    console.error("Error initializing bank transfer:", error);
    const { badResponse } = resTemplate;
    badResponse.message = "Error occurred while initializing transaction";
    return res.status().json(badResponse);
  }
}

async function checkPayment(req, res) {
  const { reference } = req.params; // Get reference from URL
  const resTemplate = response;

  if (!reference) {
    const { badResponse } = resTemplate;
    badResponse.message = "Payment reference is required";
    return res.status(400).json(badResponse);
  }

  try {
    const data = await paymentService.check_payment(reference);

    if (data.status === "success") {
      const { goodResponse } = resTemplate;
      goodResponse.message = "Payment successful";
      goodResponse.data = data;
      return res.json(goodResponse);
    } else {
      const { goodResponse } = resTemplate;
      goodResponse.message = "Payment not completed";
      goodResponse.data = data;
      return res.json(goodResponse);
    }
  } catch (error) {
    console.error(
      "Error verifying payment:",
      error.response?.data || error.message
    );
    const { badResponse } = resTemplate;
    badResponse.message = "Failed to verify payment";
    return res.status(500).json(badResponse);
  }
}

module.exports = {
  Payment_webhook,
  initilializeBank,
  checkPayment, // export new function
};
