import mongoose from "mongoose";

// Document status constants
export const DOCUMENT_STATUSES = [
    "PENDING",      // Document type available but not uploaded
    "SUBMITTED",    // User uploaded, awaiting review
    "APPROVED",     // Admin approved
    "REJECTED"      // Admin rejected
];

// Allowed document types per case type (court-style formal naming)
export const DOCUMENT_TYPES_BY_CASE = {
    "Talaq": [
        "Applicant Affidavit (حلف نامہ)",
        "Witness Affidavit (گواہ حلف نامہ)",
        "Nikahnama Copy (نکاح نامہ)",
        "CNIC/ID Proof"
    ],
    "Khula": [
        "Applicant Affidavit (حلف نامہ)",
        "Witness Affidavit (گواہ حلف نامہ)",
        "Nikahnama Copy (نکاح نامہ)",
        "CNIC/ID Proof"
    ],
    "Faskh-e-Nikah": [
        "Applicant Affidavit (حلف نامہ)",
        "Witness Affidavit (گواہ حلف نامہ)",
        "Nikahnama Copy (نکاح نامہ)",
        "Evidence Document (ثبوت)",
        "CNIC/ID Proof"
    ],
    "Talaq-e-Zaujiyat": [
        "Applicant Affidavit (حلف نامہ)",
        "Witness Affidavit (گواہ حلف نامہ)",
        "Nikahnama Copy (نکاح نامہ)",
        "CNIC/ID Proof"
    ],
    "Virasat": [
        "Applicant Affidavit (حلف نامہ)",
        "Death Certificate (وفات سرٹیفکیٹ)",
        "Inheritance Document (وراثت نامہ)",
        "CNIC/ID Proof"
    ],
    "Zauj Nama Dispute": [
        "Applicant Affidavit (حلف نامہ)",
        "Witness Affidavit (گواہ حلف نامہ)",
        "Nikahnama Copy (نکاح نامہ)",
        "CNIC/ID Proof"
    ]
};

// All unique document types
export const ALL_DOCUMENT_TYPES = [
    "Applicant Affidavit (حلف نامہ)",
    "Witness Affidavit (گواہ حلف نامہ)",
    "Nikahnama Copy (نکاح نامہ)",
    "Evidence Document (ثبوت)",
    "Death Certificate (وفات سرٹیفکیٹ)",
    "Inheritance Document (وراثت نامہ)",
    "CNIC/ID Proof"
];

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
