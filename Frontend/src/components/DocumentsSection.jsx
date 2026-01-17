import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import * as documentApi from "../api/document.api";

/**
 * DocumentsSection - Shared component for User Dashboard and Admin Panel
 * 
 * Props:
 * - caseData: Case object with fileNumber, type, status
 * - mode: "user" | "admin"
 * - onUpdate: Callback after document action
 */
export default function DocumentsSection({ caseData, mode = "user", onUpdate }) {
    const { t } = useTranslation();
    const [loading, setLoading] = useState(true);
    const [documents, setDocuments] = useState([]);
    const [allowedTypes, setAllowedTypes] = useState([]);
    const [visible, setVisible] = useState(false);
    const [uploadAllowed, setUploadAllowed] = useState(false);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    // Modal state for rejection reason
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [rejectDocId, setRejectDocId] = useState(null);
    const [rejectReason, setRejectReason] = useState("");
    const [actionLoading, setActionLoading] = useState(false);

    // Document type labels mapping
    const getDocLabel = (docType) => {
        const mapping = {
            "Applicant Statement (Bayan-e-Halafi)": t("documents.labels.applicant"),
            "Witness Statement (Gawah Affidavit)": t("documents.labels.witness"),
            "Marriage Certificate (Nikahnama)": t("documents.labels.nikahnama"),
            "Identity Proof (Aadhar/CNIC)": t("documents.labels.idProof"),
            "Supporting Evidence (Suboot)": t("documents.labels.evidence"),
            "Death Certificate (وفات سرٹیفکیٹ)": t("documents.labels.deathCert"),
            "Inheritance Document (وراثت نامہ)": t("documents.labels.inheritanceDoc")
        };
        return mapping[docType] || docType;
    };

    // Upload state
    const [uploadingType, setUploadingType] = useState(null);

    const loadDocuments = async () => {
        if (!caseData?._id) return;

        try {
            setLoading(true);
            const data = await documentApi.getDocuments(caseData._id);

            setVisible(data.visible);
            setDocuments(data.documents || []);
            setAllowedTypes(data.allowedTypes || []);
            setUploadAllowed(data.uploadAllowed || false);
            setMessage(data.message || "");
            setError("");
        } catch (err) {
            setError("Failed to load documents");
            console.error("Load documents error:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadDocuments();
    }, [caseData?._id, caseData?.fileNumber]);

    // Get status badge style
    const getStatusBadge = (status) => {
        const styles = {
            PENDING: "bg-yellow-100 text-yellow-800 border-yellow-300",
            SUBMITTED: "bg-blue-100 text-blue-800 border-blue-300",
            APPROVED: "bg-green-100 text-green-800 border-green-300",
            REJECTED: "bg-red-100 text-red-800 border-red-300"
        };
        return styles[status] || styles.PENDING;
    };

    // Get status label
    const getStatusLabel = (status) => {
        const labels = {
            PENDING: "Pending",
            SUBMITTED: "Submitted",
            APPROVED: "Approved",
            REJECTED: "Rejected"
        };
        return labels[status] || status;
    };

    // Handle file upload (simulated - in real app would use file upload service)
    const handleUpload = async (documentType, file) => {
        try {
            setUploadingType(documentType);
            setError("");

            // In a real implementation, you would upload the file to a storage service
            // and get back a URL. For now, we'll create a mock URL.
            const fileUrl = URL.createObjectURL(file);
            const fileName = file.name;

            await documentApi.uploadDocument(caseData._id, documentType, fileUrl, fileName);
            await loadDocuments();
            if (onUpdate) onUpdate();
        } catch (err) {
            setError(err.response?.data?.message || "Failed to upload document");
        } finally {
            setUploadingType(null);
        }
    };

    // Handle file input change
    const handleFileSelect = (documentType) => (e) => {
        const file = e.target.files?.[0];
        if (file) {
            handleUpload(documentType, file);
        }
        e.target.value = ""; // Reset input
    };

    // Admin: Approve document
    const handleApprove = async (docId) => {
        try {
            setActionLoading(true);
            await documentApi.approveDocument(docId);
            await loadDocuments();
            if (onUpdate) onUpdate();
        } catch (err) {
            setError(err.response?.data?.message || "Failed to approve document");
        } finally {
            setActionLoading(false);
        }
    };

    // Admin: Open reject modal
    const openRejectModal = (docId) => {
        setRejectDocId(docId);
        setRejectReason("");
        setShowRejectModal(true);
    };

    // Admin: Submit rejection
    const handleReject = async () => {
        if (!rejectReason.trim()) {
            setError("Reason is mandatory for rejection");
            return;
        }

        try {
            setActionLoading(true);
            await documentApi.rejectDocument(rejectDocId, rejectReason.trim());
            setShowRejectModal(false);
            setRejectDocId(null);
            setRejectReason("");
            await loadDocuments();
            if (onUpdate) onUpdate();
        } catch (err) {
            setError(err.response?.data?.message || "Failed to reject document");
        } finally {
            setActionLoading(false);
        }
    };

    // Get document by type
    const getDocumentByType = (docType) => {
        return documents.find(d => d.documentType === docType);
    };

    if (loading) {
        return (
            <div className="p-6 text-center">
                <div className="animate-spin w-6 h-6 border-2 border-islamicGreen border-t-transparent rounded-full mx-auto"></div>
                <p className="text-sm text-gray-500 mt-2">Loading documents...</p>
            </div>
        );
    }

    // If documents section should not be visible
    if (!visible) {
        return (
            <div className="text-center py-4 opacity-60">
                <p className="text-sm text-gray-500 italic">
                    {message || "Documents will be required after application approval."}
                </p>
            </div>
        );
    }

    return (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-islamicGreen to-emerald-700 px-6 py-4">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Documents & Affidavits / دستاویزات و حلف نامے
                </h3>
                <p className="text-emerald-100 text-sm mt-1">
                    {mode === "admin" ? "Review and approve uploaded documents" : "Upload required documents for your case"}
                </p>
            </div>

            {/* Error display */}
            {error && (
                <div className="mx-6 mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-800 text-sm">
                    {error}
                    <button onClick={() => setError("")} className="ml-2 text-red-600 hover:text-red-800">✕</button>
                </div>
            )}

            {/* Documents list */}
            <div className="p-6 space-y-4">
                {allowedTypes.length === 0 ? (
                    <p className="text-gray-500 text-center py-4">No document types defined for this case type.</p>
                ) : (
                    allowedTypes.map((docType) => {
                        const doc = getDocumentByType(docType);
                        const isUploading = uploadingType === docType;

                        return (
                            <div
                                key={docType}
                                className={`border rounded-lg p-4 transition-all ${doc ? "border-gray-200 bg-gray-50" : "border-dashed border-gray-300 bg-white"
                                    }`}
                            >
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                    {/* Document type name */}
                                    <div className="flex-1">
                                        <h4 className="font-semibold text-gray-900">{getDocLabel(docType)}</h4>
                                        {doc && (
                                            <div className="mt-1 space-y-1">
                                                <p className="text-xs text-gray-500">
                                                    <span className="font-medium">File:</span> {doc.fileName}
                                                </p>
                                                <p className="text-xs text-gray-500">
                                                    <span className="font-medium">Uploaded:</span> {new Date(doc.uploadedAt).toLocaleDateString()}
                                                </p>
                                                {doc.status === "REJECTED" && doc.adminRemarks && (
                                                    <p className="text-xs text-red-600 mt-1">
                                                        <span className="font-medium">Rejection Reason:</span> {doc.adminRemarks}
                                                    </p>
                                                )}
                                            </div>
                                        )}
                                    </div>

                                    {/* Status and actions */}
                                    <div className="flex items-center gap-3">
                                        {/* Status badge */}
                                        {doc && (
                                            <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusBadge(doc.status)}`}>
                                                {getStatusLabel(doc.status)}
                                            </span>
                                        )}

                                        {/* Actions based on mode */}
                                        {mode === "user" && (
                                            <>
                                                {uploadAllowed && (!doc || doc.status === "REJECTED") && (
                                                    <label className={`cursor-pointer px-4 py-2 rounded-lg text-sm font-medium transition ${isUploading
                                                        ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                                                        : "bg-islamicGreen text-white hover:bg-emerald-700"
                                                        }`}>
                                                        {isUploading ? (
                                                            <span className="flex items-center gap-2">
                                                                <span className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></span>
                                                                Uploading...
                                                            </span>
                                                        ) : doc ? "Re-upload" : "Upload"}
                                                        <input
                                                            type="file"
                                                            className="hidden"
                                                            onChange={handleFileSelect(docType)}
                                                            disabled={isUploading}
                                                            accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                                                        />
                                                    </label>
                                                )}
                                                {doc && (
                                                    <a
                                                        href={doc.fileUrl}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-100 transition"
                                                    >
                                                        View
                                                    </a>
                                                )}
                                            </>
                                        )}

                                        {mode === "admin" && doc && (
                                            <div className="flex items-center gap-2">
                                                <a
                                                    href={doc.fileUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-100 transition"
                                                >
                                                    View
                                                </a>
                                                {doc.status === "SUBMITTED" && (
                                                    <>
                                                        <button
                                                            onClick={() => handleApprove(doc._id)}
                                                            disabled={actionLoading}
                                                            className="px-3 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition disabled:opacity-50"
                                                        >
                                                            Approve
                                                        </button>
                                                        <button
                                                            onClick={() => openRejectModal(doc._id)}
                                                            disabled={actionLoading}
                                                            className="px-3 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition disabled:opacity-50"
                                                        >
                                                            Reject
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}

                {/* Upload not allowed message */}
                {mode === "user" && !uploadAllowed && documents.length > 0 && (
                    <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-800 text-sm text-center">
                        Document uploads are disabled as this case has been finalized.
                    </div>
                )}
            </div>

            {/* Reject Modal */}
            {showRejectModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
                    <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 space-y-4">
                        <h3 className="text-lg font-bold text-gray-900">Reject Document</h3>
                        <p className="text-sm text-gray-600">Please provide a reason for rejection (mandatory):</p>
                        <textarea
                            value={rejectReason}
                            onChange={(e) => setRejectReason(e.target.value)}
                            placeholder="Enter rejection reason..."
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 resize-none"
                            rows={3}
                        />
                        <div className="flex gap-3 justify-end">
                            <button
                                onClick={() => {
                                    setShowRejectModal(false);
                                    setRejectDocId(null);
                                    setRejectReason("");
                                }}
                                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleReject}
                                disabled={actionLoading || !rejectReason.trim()}
                                className="px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition disabled:opacity-50"
                            >
                                {actionLoading ? "Rejecting..." : "Reject Document"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
