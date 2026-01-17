import Notification from "../models/notification.js";

// Helper to create notification
export const createNotification = async (userId, message, type = "INFO", caseId = null) => {
    try {
        await Notification.create({ userId, message, type, caseId });
    } catch (err) {
        console.error("Failed to create notification:", err);
    }
};

export const getMyNotifications = async (req, res) => {
    try {
        const userId = req.auth?.userId || req.user?.id || "anonymous";
        const notifications = await Notification.find({ userId }).sort({ createdAt: -1 }).limit(20);
        res.json(notifications);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const markRead = async (req, res) => {
    try {
        await Notification.findByIdAndUpdate(req.params.id, { read: true });
        res.status(200).json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
