import Message from "../models/message.js";
import Case from "../models/case.js";

/**
 * ADMIN: Send message to a user (usually related to a case)
 * Body: { caseId, recipientId, recipientEmail, title, body, senderId, senderName }
 */
export const sendMessage = async (req, res) => {
  try {
    const {
      caseId,
      recipientId,
      recipientEmail,
      title,
      body,
      senderId,
      senderName,
    } = req.body;

    if (!recipientId || !title || !body) {
      return res
        .status(400)
        .json({ message: "recipientId, title and body are required" });
    }

    // Optional: validate case exists
    let caseDoc = null;
    if (caseId) {
      caseDoc = await Case.findById(caseId).select("_id createdBy");
    }

    const message = await Message.create({
      caseId: caseDoc?._id,
      recipientId,
      recipientEmail,
      title,
      body,
      senderId: senderId || req.user?.id || "admin",
      senderName: senderName || "Dar-ul-Qaza Admin",
    });

    res.status(201).json(message);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * USER: Get my messages
 * Query: userId (Clerk userId) - since we don't have server-side auth here
 */
export const getMyMessages = async (req, res) => {
  try {
    const recipientId = req.user?.id || req.query.userId;
    if (!recipientId) {
      return res.status(400).json({ message: "userId is required" });
    }

    const messages = await Message.find({ recipientId })
      .sort({ createdAt: -1 })
      .limit(50);

    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * USER: Mark a message as read
 */
export const markAsRead = async (req, res) => {
  try {
    const id = req.params.id;
    const message = await Message.findById(id);
    if (!message) return res.status(404).json({ message: "Message not found" });

    message.read = true;
    await message.save();

    res.json(message);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * ADMIN: Get messages for a case (for quick review in admin panel)
 */
export const getCaseMessages = async (req, res) => {
  try {
    const { caseId } = req.params;
    const messages = await Message.find({ caseId }).sort({ createdAt: -1 });
    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


