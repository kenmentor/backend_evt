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
    const { email, guest, host, house, amount } = event.data.metadata;
    const PaymentRef = event.data.reference;
    const status = "success";

    try {
      await db.$transaction(async (tx) => {
        // Save payment
        await tx.payment.payment.create({
          host,
          guest,
          house,
          amount: amount / 100, // convert to actual currency
          status: "success",
          paymentStatus: "paid",
          platformFee: (amount / 100) * 0.05, // 5% fee
          paymentRef: PaymentRef,
        });

        // Create booking
        await tx.booking.create({
          host,
          guest,
          amount: amount / 100,
          house,
          status,
          paymentId: PaymentRef,
          checkIn: null, // Add actual data if available
          checkOut: null, // Add actual data if available
        });

        // Update resource availability
        await tx.resource.update({
          where: { id: house }, // assuming house id here
          data: { available: false },
        });
      });

      const { goodResponse } = resTemplate;
      goodResponse.message = "Transaction successful";
      return res.json(goodResponse);
    } catch (error) {
      console.error("Transaction failed:", error);
      const { badResponse } = resTemplate;
      badResponse.message = "Transaction failed";
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
      amount,
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
      return res.status(400).json(badResponse);
    }
  } catch (error) {
    console.error("Error initializing bank transfer:", error);
    const { badResponse } = resTemplate;
    badResponse.message = "Error occurred while initializing transaction";
    return res.status(500).json(badResponse);
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
      const { goodResponse } = resTemplate;
      goodResponse.message = "Payment successful";
      goodResponse.data = {
        amount: data.amount / 100,
        email: data.customer.email,
        status: data.status,
        reference: data.reference,
      };
      return res.json(goodResponse);
    } else {
      const { goodResponse } = resTemplate;
      goodResponse.message = "Payment not completed";
      goodResponse.data = {
        status: data.status,
        reference: data.reference,
      };
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
