import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema({
    userId: { type: String, required: true, index: true },
    caseId: { type: mongoose.Schema.Types.ObjectId, ref: "Case" },
    message: { type: String, required: true },
    type: { type: String, enum: ["INFO", "SUCCESS", "WARNING", "ERROR"], default: "INFO" },
    read: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now, expires: 60 * 60 * 24 * 30 } // 30 days expiry
});

export default mongoose.model("Notification", notificationSchema);
