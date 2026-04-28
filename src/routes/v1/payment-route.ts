import express, { Router } from "express";
import { payment_control } from "../../controllers";
import dotenv from "dotenv";
dotenv.config();

const router = Router();

router.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  payment_control.Payment_webhook
);

router.post(
  "/initialize-bank-transfer",
  express.json(),
  payment_control.initializeBankTransfer
);

router.get("/check-payment/:reference", payment_control.checkPaymentStatus);

router.get("/:id", payment_control.get_history);

export default router;
