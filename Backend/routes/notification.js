import express from "express";
import { getMyNotifications, markRead } from "../controllers/notification.js";
import { protect } from "../middlewares/auth.js";

const router = express.Router();

router.use(protect);

router.get("/my", getMyNotifications);
router.patch("/:id/read", markRead);

export default router;
