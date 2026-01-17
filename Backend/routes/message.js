import express from "express";
import {
  sendMessage,
  getMyMessages,
  markAsRead,
  getCaseMessages,
} from "../controllers/message.js";

const router = express.Router();

// Admin send message to a user (optionally linked to a case)
router.post("/admin/send", sendMessage);

// User fetch own messages
router.get("/my", getMyMessages);

// User mark message as read
router.patch("/:id/read", markAsRead);

// Admin: get messages for a specific case
router.get("/case/:caseId", getCaseMessages);

export default router;
