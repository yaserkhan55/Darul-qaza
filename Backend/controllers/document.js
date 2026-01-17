import CaseDocument, { DOCUMENT_STATUSES } from "../models/casedocument.js";
import { CASE_RULES, VALID_STATUSES_FOR_DOCS } from "../config/caserules.js";
import Case from "../models/case.js";

// Helper to get user ID from either Clerk (req.auth.userId) or Legacy (req.user.id)
const getUserId = (req) => req.auth?.userId || req.user?.id || "unknown";

// Statuses that indicate case is finalized (no more uploads allowed)
const FINALIZED_STATUSES = ["CASE_CLOSED", "DECISION_APPROVED"];

/**
 * Check if documents section should be visible for a case
 * Documents are only visible after Darkhast is approved (fileNumber is assigned)
 */
export const isDocumentsSectionVisible = (caseData) => {
    // Requirements:
    // 1. Case exists
    // 2. File Number is assigned (implies Darkhast Approved)
    // 3. Matter Type is selected
    // 4. Status is NOT initial submission phase (Strict Check)
    const hasFileNumber = caseData && caseData.fileNumber && caseData.fileNumber.trim() !== "";
    const hasMatterType = caseData && caseData.type && caseData.type.trim() !== "";

    // Strict status check using centralized list
    const isValidStatus = VALID_STATUSES_FOR_DOCS.includes(caseData.status);

    return hasFileNumber && hasMatterType && isValidStatus;
};

/**
 * Check if uploads are allowed for a case
 * No uploads allowed after case is finalized
 */
export const isUploadAllowed = (caseData) => {
    if (!isDocumentsSectionVisible(caseData)) return false;
    return !FINALIZED_STATUSES.includes(caseData.status);
};

/**
 * GET ALLOWED DOCUMENT TYPES FOR A CASE
 */
export const getAllowedDocumentTypes = async (req, res) => {
    try {
        const { caseId } = req.params;
        const caseData = await Case.findById(caseId);

        if (!caseData) {
            return res.status(404).json({ message: "Case not found" });
        }

        // If documents section not visible, return empty
        if (!isDocumentsSectionVisible(caseData)) {
            return res.json({
                visible: false,
                message: "Documents & affidavits will be enabled after application approval.",
                allowedTypes: [],
                uploadAllowed: false
            });
        }

        const caseType = caseData.type;
        const allowedTypes = CASE_RULES[caseType]?.requiredDocuments || [];

        return res.json({
            visible: true,
            allowedTypes,
            requiredDocuments: allowedTypes, // Alias for frontend clarity
            uploadAllowed: isUploadAllowed(caseData),
            caseType
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

/**
 * GET ALL DOCUMENTS FOR A CASE
 */
export const getDocumentsForCase = async (req, res) => {
    try {
        const { caseId } = req.params;
        const caseData = await Case.findById(caseId);

        if (!caseData) {
            return res.status(404).json({ message: "Case not found" });
        }

        // If documents section not visible, return appropriate message
        if (!isDocumentsSectionVisible(caseData)) {
            return res.json({
                visible: false,
                message: "Documents & affidavits will be enabled after application approval.",
                documents: [],
                uploadAllowed: false
            });
        }

        const documents = await CaseDocument.find({ caseId }).sort({ createdAt: -1 });
        const caseType = caseData.type;
        const allowedTypes = CASE_RULES[caseType]?.requiredDocuments || [];

        return res.json({
            visible: true,
            documents,
            allowedTypes,
            requiredDocuments: allowedTypes, // Alias for frontend clarity
            uploadAllowed: isUploadAllowed(caseData),
            caseType
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

/**
 * UPLOAD DOCUMENT (User)
 */
export const uploadDocument = async (req, res) => {
    try {
        const { caseId } = req.params;
        const { documentType, fileUrl, fileName } = req.body;
        const userId = getUserId(req);

        const caseData = await Case.findById(caseId);

        if (!caseData) {
            return res.status(404).json({ message: "Case not found" });
        }

        // Validate documents section is visible
        if (!isDocumentsSectionVisible(caseData)) {
            return res.status(400).json({
                message: "Documents cannot be uploaded until application is approved and file number is assigned."
            });
        }

        // Validate uploads are allowed (case not finalized)
        if (!isUploadAllowed(caseData)) {
            return res.status(400).json({
                message: "Document uploads are not allowed after case is finalized."
            });
        }

        // Validate document type is allowed for this case type
        const allowedTypes = CASE_RULES[caseData.type]?.requiredDocuments || [];
        if (!allowedTypes.includes(documentType)) {
            return res.status(400).json({
                message: `Document type "${documentType}" is not allowed for ${caseData.type} cases.`
            });
        }

        // Validate required fields
        if (!fileUrl || !fileName) {
            return res.status(400).json({ message: "File URL and file name are required." });
        }

        // Check if document of same type already exists
        const existingDoc = await CaseDocument.findOne({ caseId, documentType });

        if (existingDoc) {
            // Update existing document (re-upload)
            existingDoc.fileUrl = fileUrl;
            existingDoc.fileName = fileName;
            existingDoc.uploadedBy = userId;
            existingDoc.uploadedAt = new Date();
            existingDoc.status = "SUBMITTED"; // Reset status on re-upload
            existingDoc.adminRemarks = null;
            existingDoc.reviewedBy = null;
            existingDoc.reviewedAt = null;

            await existingDoc.save();
            return res.json(existingDoc);
        }

        // Create new document
        const newDocument = new CaseDocument({
            caseId,
            documentType,
            uploadedBy: userId,
            fileUrl,
            fileName,
            status: "SUBMITTED"
        });

        await newDocument.save();
        return res.status(201).json(newDocument);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

/**
 * APPROVE DOCUMENT (Admin)
 */
export const approveDocument = async (req, res) => {
    try {
        const { docId } = req.params;
        const adminId = getUserId(req);

        const document = await CaseDocument.findById(docId);

        if (!document) {
            return res.status(404).json({ message: "Document not found" });
        }

        document.status = "APPROVED";
        document.reviewedBy = adminId;
        document.reviewedAt = new Date();

        await document.save();
        return res.json(document);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

/**
 * REJECT DOCUMENT (Admin)
 */
export const rejectDocument = async (req, res) => {
    try {
        const { docId } = req.params;
        const { reason } = req.body;
        const adminId = getUserId(req);

        // Reason is mandatory for rejection
        if (!reason || reason.trim() === "") {
            return res.status(400).json({ message: "Reason is mandatory for document rejection." });
        }

        const document = await CaseDocument.findById(docId);

        if (!document) {
            return res.status(404).json({ message: "Document not found" });
        }

        document.status = "REJECTED";
        document.adminRemarks = reason.trim();
        document.reviewedBy = adminId;
        document.reviewedAt = new Date();

        await document.save();
        return res.json(document);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

/**
 * VIEW DOCUMENT (Both User and Admin)
 */
export const viewDocument = async (req, res) => {
    try {
        const { docId } = req.params;

        const document = await CaseDocument.findById(docId);

        if (!document) {
            return res.status(404).json({ message: "Document not found" });
        }

        return res.json(document);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
