import { Router } from "express";
import { feedback_controller } from "../../controllers";

const router = Router();

router.get("/", feedback_controller.get_feedback);

router.post("/", feedback_controller.create_feedback);

export default router;
