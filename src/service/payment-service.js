const axios = require("axios");
require("dotenv").config();
const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET;

async function initializeBank({ email, amount, guest, host, house }) {
  console.log({ email, amount, guest, host, house });
  try {
    const res = await axios.post(
      "https://api.paystack.co/transaction/initialize",
      {
        email,
        amount: amount * 100,
        channels: ["bank_transfer"],
        metadata: { guest, host, email, amount, house },
      },
      {
        headers: {
          Authorization: `Bearer ${PAYSTACK_SECRET}`,
          "Content-Type": "application/json",
        },
      }
    );

    const bankDetails = res.data.data.bank || null;

    return {
      success: true,
      data: {
        authorization_url: res.data.data.authorization_url,
        access_code: res.data.data.access_code,
        reference: res.data.data.reference,
        bankDetails, // <-- this is what you need
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
        "Something went wrong during initialization",
    };
  }
}

module.exports = { initializeBank };
