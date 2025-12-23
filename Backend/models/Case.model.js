import mongoose from "mongoose";
import { v4 as uuidv4 } from "uuid";

export const CASE_TYPES = [
  "Talaq",
  "Khula",
  "Faskh-e-Nikah",
  "Talaq-e-Zaujiyat",
  "Virasat",
  "Zauj Nama Dispute"
];

export const CASE_STATUSES = [
  "DARKHAST_SUBMITTED",
  "DARKHAST_APPROVED",
  "DARKHAST_REJECTED",
  "NOTICE_ISSUED",
  "HEARING_SCHEDULED",
  "HEARING_COMPLETED",
  "ARBITRATION_IN_PROGRESS",
  "DECISION_PENDING",
  "CASE_CLOSED"
];

const hazriSchema = new mongoose.Schema({
  date: { type: Date, default: Date.now },
  presentParties: [String], // Names of present parties
  signatures: String, // Text-based confirmation/signatures
  qaziRemarks: String
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
      type: String,
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
      unique: true,
    },
    sequentialId: Number, // For annual reset logic
    year: Number,        // For annual reset logic
    displayId: String,   // e.g. DQ/2024/001
    type: {
      type: String,
      enum: CASE_TYPES,
    },
    createdBy: {
      type: String,
      required: true,
    },
    assignedQazi: {
      type: String,
    },
    status: {
      type: String,
      enum: CASE_STATUSES,
      default: "DARKHAST_SUBMITTED",
      required: true,
    },
    darkhast: {
      // Simplified Darkhast Form Fields (New)
      date: Date,
      firstPartyName: String,
      firstPartyFatherName: String,
      firstPartyResidence: String,
      firstPartyDistrict: String,
      secondPartyName: String,
      secondPartyFatherName: String,
      secondPartyResidence: String,
      secondPartyDistrict: String,

      // Legacy Darkhast Form Fields (Old - kept for backward compatibility)
      applicantName: String,
      fatherGuardianName: String,
      applicantGender: String,
      applicantAge: Number,
      applicantMobile: String,
      address: String,
      district: String,
      state: String,
      cnic: String,
      respondentName: String,
      respondentFatherName: String,
      respondentAddress: String,
      nikahDate: Date,
      nikahPlace: String,
      natureOfDispute: String,
      reliefRequested: String,
      statement: String,
      // Specialized fields (for later case-type specific forms)
      talaqDate: Date,
      talaqCount: Number,
      mahrStatus: String,
      khulaReason: String,
      mahrReturn: String,
      maintenanceAmount: String,
      residenceStatus: String,
      nikahRegNo: String,
      correctionRequired: String
    },
    fileNumber: {
      type: String,
      default: null // Assigned after Qazi approval
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
      decisionType: {
        type: String,
        enum: ["Talaq confirmed", "Khula granted", "Faskh-e-Nikah granted", "Case dismissed"]
      }
    },
    faskhDetails: {
      grounds: {
        type: String,
        enum: ["Husband missing", "No maintenance", "Cruelty", "Impotence", "Long absence", "Other valid Shariah reason"]
      },
      evidenceUrl: String // Reference to uploaded evidence
    },
    history: {
      type: [historyEntrySchema],
      default: [],
    },
  },
  { timestamps: true }
);

export default mongoose.model("Case", caseSchema);

