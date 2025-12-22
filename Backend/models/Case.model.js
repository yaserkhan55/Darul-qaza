import mongoose from "mongoose";
import { v4 as uuidv4 } from "uuid";

export const CASE_TYPES = [
  "Talaq",
  "Khula",
  "Faskh-e-Nikah",
  "Talaq-e-Zaujiyat",
  "Wifa Sat",
  "Zawal Nama"
];

export const CASE_STATUSES = [
  "DARKHAST_SUBMITTED",
  "DARKHAST_APPROVED",
  "NOTICE_SENT",
  "HEARING_IN_PROGRESS",
  "ARBITRATION_IN_PROGRESS",
  "DECISION_PENDING",
  "DECISION_APPROVED",
  "CASE_CLOSED"
];

const hazriSchema = new mongoose.Schema({
  date: { type: Date, default: Date.now },
  applicantPresent: { type: Boolean, default: false },
  respondentPresent: { type: Boolean, default: false },
  qaziRemarks: String,
  signatureHash: String // Text-based confirmation
}, { _id: false });

const hearingStatementSchema = new mongoose.Schema({
  date: { type: Date, default: Date.now },
  applicantStatement: String,
  respondentStatement: String,
  qaziNotes: String
}, { _id: false });

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
      // Required only after DARKHAST_APPROVED
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
      default: "DARKHAST_SUBMITTED",
      required: true,
    },
    darkhast: {
      applicantName: String,
      fatherHusbandName: String,
      cnic: String,
      address: String,
      respondentName: String,
      respondentAddress: String,
      nikahDate: Date,
      nikahPlace: String,
      natureOfDispute: String,
      reliefRequested: String,
      statement: String,
    },
    notice: {
      issuedAt: Date,
      hearingDate: Date,
      notes: String
    },
    attendance: [hazriSchema],
    hearingStatements: [hearingStatementSchema],
    arbitration: {
      date: Date,
      result: { type: String, enum: ["SUCCESS", "FAILED"] },
      notes: String
    },
    faisla: {
      decisionDate: Date,
      finalOrderText: String,
      qaziSignature: String,
      courtSealRef: String,
      decisionType: String
    },
    faskhDetails: {
      grounds: [String],
      evidence: [String] // URLs
    },
    history: {
      type: [historyEntrySchema],
      default: [],
    },
  },
  { timestamps: true }
);

export default mongoose.model("Case", caseSchema);

