const express = require("express");
const router = express.Router();
const chatController = require("../../controllers/chat-controller");

router.post("/send", chatController.send_message);
router.get("/:userId", chatController.get_conversations);
router.get("/:userId1/:userId2", chatController.get_messages);
router.put("/read", chatController.mark_read);

module.exports = router;