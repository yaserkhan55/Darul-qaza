import mongoose from "mongoose";
import { v4 as uuidv4 } from "uuid";

export const CASE_TYPES = ["TALAQ", "KHULA"];
export const CASE_STATUSES = [
  "CREATED", // Initial draft state
  "STARTED",
  "DRAFT",
  "FORM_COMPLETED", // Submitted
  "RESOLUTION_SUCCESS",
  "RESOLUTION_FAILED",
  "AGREEMENT_DONE",
  "AFFIDAVITS_DONE",
  "UNDER_REVIEW",
  "APPROVED",
  "REJECTED",
  "COMPLETED",
];

const historyEntrySchema = new mongoose.Schema(
  {
    status: {
      type: String,
      enum: CASE_STATUSES,
      required: true,
    },
    changedBy: {
      type: String, // Clerk userId or admin identifier
      required: true,
    },
    note: String,
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);

const caseSchema = new mongoose.Schema(
  {
    caseId: {
      type: String,
      default: () => uuidv4(),
      unique: true,
    },

    type: {
      type: String,
      enum: CASE_TYPES,
      required: true,
    },

    createdBy: {
      type: String, // Clerk userId
      required: true,
    },

    assignedQazi: {
      type: String, // Clerk admin/Qazi userId
    },

    status: {
      type: String,
      enum: CASE_STATUSES,
      default: "DRAFT",
      required: true,
    },

    details: {
      talaqCount: { type: Number, min: 1, max: 3 },
      husbandName: String,
      wifeName: String,
      cnic: String,
      marriageDate: Date,
      address: String,
      mehr: String,
      iddat: String,
      custody: String,
      maintenance: String,
      consentDocument: String, // URL or ref for consent doc (Khula)
    },

    history: {
      type: [historyEntrySchema],
      default: [],
    },
  },
  { timestamps: true }
);

export default mongoose.model("Case", caseSchema);
