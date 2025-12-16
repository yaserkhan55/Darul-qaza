import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    caseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Case",
    },
    recipientId: {
      // Clerk userId of the recipient (applicant)
      type: String,
      required: true,
    },
    recipientEmail: String,
    senderId: String, // admin / qazi identifier
    senderName: String,
    title: {
      type: String,
      required: true,
      trim: true,
    },
    body: {
      type: String,
      required: true,
      trim: true,
    },
    read: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Message", messageSchema);


