import api from "./axios";

/**
 * Get all documents for a case
 * Returns visibility status, documents list, and upload permissions
 */
export const getDocuments = async (caseId) => {
    const res = await api.get(`/documents/case/${caseId}`);
    return res.data;
};

/**
 * Get allowed document types for a case
 */
export const getAllowedDocumentTypes = async (caseId) => {
    const res = await api.get(`/documents/case/${caseId}/allowed`);
    return res.data;
};

/**
 * Upload a document for a case
 */
export const uploadDocument = async (caseId, documentType, fileUrl, fileName) => {
    const res = await api.post(`/documents/case/${caseId}`, {
        documentType,
        fileUrl,
        fileName
    });
    return res.data;
};

/**
 * View a single document
 */
export const viewDocument = async (docId) => {
    const res = await api.get(`/documents/${docId}`);
    return res.data;
};

/**
 * Admin: Approve a document
 */
export const approveDocument = async (docId) => {
    const res = await api.put(`/documents/${docId}/approve`);
    return res.data;
};

/**
 * Admin: Reject a document with mandatory reason
 */
export const rejectDocument = async (docId, reason) => {
    const res = await api.put(`/documents/${docId}/reject`, { reason });
    return res.data;
};
