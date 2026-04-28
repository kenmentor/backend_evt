import { Router } from "express";
import { payout_controller } from "../../controllers";

const router = Router();

router.post("/", payout_controller.createPayout);

router.get("/:id", payout_controller.getPayoutById);

router.get("/agent/:agentId", payout_controller.getPayoutsByAgent);

router.get("/host/:hostId", payout_controller.getPayoutsByHost);

router.get("/agent/:agentId/pending", payout_controller.getPendingPayouts);

router.get("/agent/:agentId/total-pending", payout_controller.getTotalPending);

router.put("/:id/paid", payout_controller.markAsPaid);

router.put("/:id", payout_controller.updatePayout);

export default router;
