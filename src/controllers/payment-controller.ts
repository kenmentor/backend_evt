import { Request, Response } from "express";
import crypto from "crypto";
import { response, connectDB } from "../utility";
import { paymentService } from "../service";
import { goodResponse, badResponse } from "../utility/response";
import "dotenv/config";

const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET || "hello";

async function Payment_webhook(req: Request, res: Response) {
  try {
    const hash = crypto
      .createHmac("sha512", PAYSTACK_SECRET)
      .update(JSON.stringify(req.body))
      .digest("hex");
    if (hash !== req.headers["x-paystack-signature"]) {
      return res.status(401).json(badResponse("Invalid signature", 401));
    }

    const event = req.body;
    switch (event.event) {
      case "charge.success":
        {
          const {
            metadata,
            reference,
            amount: rawAmount,
            status: paystackStatus,
          } = event.data;

          const {
            email,
            guest,
            host,
            house,
            price,
            checkIn: metadataCheckIn,
            checkOut: metadataCheckOut,
            note,
            method,
          } = metadata;

          const amount = rawAmount / 100;
          const checkIn = metadataCheckIn ? new Date(metadataCheckIn) : new Date();
          const checkOut = metadataCheckOut
            ? new Date(metadataCheckOut)
            : new Date(new Date(checkIn).setMonth(checkIn.getMonth() + 12));

          const paymentData = {
            host,
            guest,
            house,
            email,
            amount,
            status: paystackStatus || "success",
            paymentStatus: "paid",
            reference: reference,
            paymentRef: reference,
            note: note || "",
            method: method || "card",
            checkIn,
            checkOut,
            price: Number(price),
          };

          const payment = await paymentService.Payment_webhook(paymentData);
          return res.json(goodResponse(payment, "Transaction successful"));
        }
        break;
      default:
        return res.json(goodResponse(null, `Event ${event.event} ignored`));
    }
  } catch (error: any) {
    return res.status(500).json(badResponse(error.message, 500, error));
  }
}

async function initializeBankTransfer(req: Request, res: Response) {
  const { email, amount, guestId, hostId, houseId } = req.body;
  if (!email || !amount || !guestId || !hostId || !houseId) {
    return res.status(400).json(badResponse("Missing required fields", 400));
  }

  try {
    const data = await paymentService.initializeBank({
      email,
      amount: amount,
      guest: guestId,
      host: hostId,
      house: houseId,
    });

    if (data.success) {
      return res.json(goodResponse(data.data));
    }

    return res.status(400).json(badResponse(data.message, 400));
  } catch (error: any) {
    return res.status(500).json(badResponse(error.message, 500, error));
  }
}

async function checkPaymentStatus(req: Request, res: Response) {
  const reference = req.params.reference as string;

  if (!reference) {
    return res.status(400).json(badResponse("Payment reference is required", 400));
  }

  try {
    const data = await paymentService.check_payment(reference);

    if (data.status === "success") {
      return res.json(goodResponse(data, "Payment successful"));
    }

    return res.json(goodResponse(data, "Payment not completed"));
  } catch (error: any) {
    return res.status(500).json(badResponse(error.message, 500, error));
  }
}
async function get_history(req: Request, res: Response) {
  const id = req.params.id as string;
  try {
    const data = await paymentService.get_history(id);
    return res.json(goodResponse(data));
  } catch (error: any) {
    return res.status(500).json(badResponse(error.message, 500, error));
  }
}

export {
  Payment_webhook,
  initializeBankTransfer,
  checkPaymentStatus,
  get_history,
};
