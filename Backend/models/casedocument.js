import mongoose from "mongoose";

import { ALL_DOCUMENT_TYPES } from "../config/caserules.js";

export const DOCUMENT_STATUSES = [
    "PENDING",      // Document type available but not uploaded
    "SUBMITTED",    // User uploaded, awaiting review
    "APPROVED",     // Admin approved
    "REJECTED"      // Admin rejected
];

// Re-export for compatibility if needed, but prefer using config directly
export { ALL_DOCUMENT_TYPES };

const caseDocumentSchema = new mongoose.Schema(
    {
        caseId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Case",
            required: true,
            index: true
        },
        documentType: {
            type: String,
            enum: ALL_DOCUMENT_TYPES,
            required: true
        },
        uploadedBy: {
            type: String,
            required: true
        },
        uploadedAt: {
            type: Date,
            default: Date.now
        },
        fileUrl: {
            type: String,
            required: true
        },
        fileName: {
            type: String,
            required: true
        },
        status: {
            type: String,
            enum: DOCUMENT_STATUSES,
            default: "SUBMITTED"
        },
        adminRemarks: {
            type: String,
            default: null
        },
        reviewedBy: {
            type: String,
            default: null
        },
        reviewedAt: {
            type: Date,
            default: null
        }
    },
    { timestamps: true }
);

// Compound index for efficient queries
caseDocumentSchema.index({ caseId: 1, documentType: 1 });

export default mongoose.model("CaseDocument", caseDocumentSchema);
