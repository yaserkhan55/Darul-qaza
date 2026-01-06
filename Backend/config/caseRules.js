/**
 * Centralized Configuration for Darul Qaza Case Rules
 * Defines all document requirements and workflow constraints.
 */

export const CASE_RULES = {
    // Document requirements by Matter Type
    Talaq: {
        requiredDocuments: [
            "Applicant Affidavit (حلف نامہ)",
            "Witness Affidavit (گواہ حلف نامہ)",
            "Nikahnama Copy (نکاح نامہ)",
            "CNIC/ID Proof"
        ]
    },
    Khula: {
        requiredDocuments: [
            "Applicant Affidavit (حلف نامہ)",
            "Nikahnama Copy (نکاح نامہ)",
            "CNIC/ID Proof"
        ]
    },
    "Faskh-e-Nikah": {
        requiredDocuments: [
            "Applicant Affidavit (حلف نامہ)",
            "Witness Affidavit (گواہ حلف نامہ)",
            "Nikahnama Copy (نکاح نامہ)",
            "Evidence Document (ثبوت)",
            "CNIC/ID Proof"
        ]
    },
    "Talaq-e-Zaujiyat": {
        requiredDocuments: [
            "Applicant Affidavit (حلف نامہ)",
            "Witness Affidavit (گواہ حلف نامہ)",
            "Nikahnama Copy (نکاح نامہ)",
            "CNIC/ID Proof"
        ]
    },
    Virasat: {
        requiredDocuments: [
            "Applicant Affidavit (حلف نامہ)",
            "Death Certificate (وفات سرٹیفکیٹ)",
            "Inheritance Document (وراثت نامہ)",
            "CNIC/ID Proof"
        ]
    },
    "Zauj Nama Dispute": {
        requiredDocuments: [
            "Applicant Affidavit (حلف نامہ)",
            "Witness Affidavit (گواہ حلف نامہ)",
            "Nikahnama Copy (نکاح نامہ)",
            "CNIC/ID Proof"
        ]
    }
};

export const ALL_DOCUMENT_TYPES = [
    "Applicant Affidavit (حلف نامہ)",
    "Witness Affidavit (گواہ حلف نامہ)",
    "Nikahnama Copy (نکاح نامہ)",
    "Evidence Document (ثبوت)",
    "Death Certificate (وفات سرٹیفکیٹ)",
    "Inheritance Document (وراثت نامہ)",
    "CNIC/ID Proof"
];

export const VALID_STATUSES_FOR_DOCS = [
    "DARKHAST_APPROVED",
    "FORM_COMPLETED",
    "NEEDS_CORRECTION",
    "APPROVED_FOR_CONTINUE",
    "RESOLUTION_PENDING",
    "RESOLUTION_SUCCESS",
    "RESOLUTION_FAILED",
    "UNDER_REVIEW",
    "APPROVED",
    "NOTICE_ISSUED",
    "NOTICE_SENT",
    "HEARING_SCHEDULED",
    "HEARING_IN_PROGRESS",
    "HEARING_COMPLETED",
    "ARBITRATION_IN_PROGRESS",
    "DECISION_PENDING"
];
