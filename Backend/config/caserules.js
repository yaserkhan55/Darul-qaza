/**
 * Centralized Configuration for Darul Qaza Case Rules
 * Defines all document requirements and workflow constraints.
 */

export const CASE_RULES = {
    // Document requirements by Matter Type
    Talaq: {
        requiredDocuments: [
            "Applicant Statement (Bayan-e-Halafi)",
            "Witness Statement (Gawah Affidavit)",
            "Marriage Certificate (Nikahnama)",
            "Identity Proof (Aadhar/CNIC)"
        ]
    },
    Khula: {
        requiredDocuments: [
            "Applicant Statement (Bayan-e-Halafi)",
            "Marriage Certificate (Nikahnama)",
            "Identity Proof (Aadhar/CNIC)"
        ]
    },
    "Faskh-e-Nikah": {
        requiredDocuments: [
            "Applicant Statement (Bayan-e-Halafi)",
            "Witness Statement (Gawah Affidavit)",
            "Marriage Certificate (Nikahnama)",
            "Supporting Evidence (Suboot)",
            "Identity Proof (Aadhar/CNIC)"
        ]
    },
    "Talaq-e-Zaujiyat": {
        requiredDocuments: [
            "Applicant Statement (Bayan-e-Halafi)",
            "Witness Statement (Gawah Affidavit)",
            "Marriage Certificate (Nikahnama)",
            "Identity Proof (Aadhar/CNIC)"
        ]
    },
    Virasat: {
        requiredDocuments: [
            "Applicant Statement (Bayan-e-Halafi)",
            "Death Certificate (وفات سرٹیفکیٹ)",
            "Inheritance Document (وراثت نامہ)",
            "Identity Proof (Aadhar/CNIC)"
        ]
    },
    "Zauj Nama Dispute": {
        requiredDocuments: [
            "Applicant Statement (Bayan-e-Halafi)",
            "Witness Statement (Gawah Affidavit)",
            "Marriage Certificate (Nikahnama)",
            "Identity Proof (Aadhar/CNIC)"
        ]
    }
};

export const ALL_DOCUMENT_TYPES = [
    "Applicant Statement (Bayan-e-Halafi)",
    "Witness Statement (Gawah Affidavit)",
    "Marriage Certificate (Nikahnama)",
    "Supporting Evidence (Suboot)",
    "Death Certificate (وفات سرٹیفکیٹ)",
    "Inheritance Document (وراثت نامہ)",
    "Identity Proof (Aadhar/CNIC)"
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
