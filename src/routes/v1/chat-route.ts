import { Router } from "express";
import * as chatController from "../../controllers/chat-controller";

const router = Router();

router.post("/send", chatController.send_message);
router.get("/:userId", chatController.get_conversations);
router.get("/:userId1/:userId2", chatController.get_messages);
router.put("/read", chatController.mark_read);

export default router;
