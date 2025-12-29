import { useState, useEffect } from "react";
import * as adminApi from "../api/admin.api";

export default function AdminCaseReview({ caseData, onClose, onUpdate }) {
    const [actionLoading, setActionLoading] = useState(false);
    const [error, setError] = useState("");
    const [rejectReason, setRejectReason] = useState("");
    const [messageToApplicant, setMessageToApplicant] = useState("");
    const [showRejectModal, setShowRejectModal] = useState(false);

    // Generate file number in Serial/Year format
    const generateFileNumber = () => {
        const year = new Date().getFullYear();
        const serial = caseData.sequentialId || Math.floor(Math.random() * 9000) + 1000;
        return `${serial}/${year}`;
    };

    const handleApprove = async () => {
        if (!window.confirm("Are you sure you want to APPROVE this case? A file number will be assigned.")) {
            return;
        }

        setActionLoading(true);
        setError("");
        try {
            const fileNumber = generateFileNumber();
            const payload = {
                fileNumber,
                adminMessage: messageToApplicant || `Your case has been approved. File Number: ${fileNumber}`
            };

            await adminApi.approveDarkhast(caseData._id, payload);
            alert(`Case approved successfully! File Number: ${fileNumber}`);
            onUpdate && onUpdate();
            onClose && onClose();
        } catch (err) {
            setError(err?.response?.data?.message || "Failed to approve case.");
        } finally {
            setActionLoading(false);
        }
    };

    const handleReject = async () => {
        if (!rejectReason.trim()) {
            alert("Please provide a reason for rejection.");
            return;
        }

        setActionLoading(true);
        setError("");
        try {
            const payload = {
                adminMessage: `Case Rejected: ${rejectReason}`
            };

            await adminApi.rejectDarkhast(caseData._id, payload);
            alert("Case rejected successfully.");
            onUpdate && onUpdate();
            onClose && onClose();
        } catch (err) {
            setError(err?.response?.data?.message || "Failed to reject case.");
        } finally {
            setActionLoading(false);
            setShowRejectModal(false);
        }
    };

    const handleSendBackForCorrection = async () => {
        if (!messageToApplicant.trim()) {
            if (!window.confirm("No message provided. Continue without sending a message to the applicant?")) {
                return;
            }
        }

        setActionLoading(true);
        setError("");
        try {
            const payload = {
                adminMessage: messageToApplicant || "Your case has been returned for correction. Please review and update your form."
            };

            await adminApi.sendBackForCorrection(caseData._id, payload);
            alert("Case sent back for correction successfully.");
            onUpdate && onUpdate();
            onClose && onClose();
        } catch (err) {
            setError(err?.response?.data?.message || "Failed to send back for correction.");
        } finally {
            setActionLoading(false);
        }
    };

    const handleApproveForContinue = async () => {
        if (!window.confirm("Approve this case for the user to continue with the next step?")) {
            return;
        }

        setActionLoading(true);
        setError("");
        try {
            const payload = {
                adminMessage: messageToApplicant || "Your case has been reviewed. You may now continue with the next step."
            };

            await adminApi.approveForContinue(caseData._id, payload);
            alert("Case approved for continue successfully.");
            onUpdate && onUpdate();
            onClose && onClose();
        } catch (err) {
            setError(err?.response?.data?.message || "Failed to approve for continue.");
        } finally {
            setActionLoading(false);
        }
    };

    // Helper to safely display values with proper fallbacks
    const display = (value, fallback = "—") => {
        if (value === null || value === undefined || value === "") return fallback;
        return value;
    };

    // Get applicant name (check multiple fields)
    const getApplicantName = () => {
        return caseData.darkhast?.firstPartyName || 
               caseData.darkhast?.applicantName || 
               caseData.darkhast?.husbandName || 
               caseData.darkhast?.wifeName || 
               "—";
    };

    // Get respondent name (check multiple fields)
    const getRespondentName = () => {
        return caseData.darkhast?.secondPartyName || 
               caseData.darkhast?.respondentName || 
               (caseData.type === "Talaq" ? caseData.darkhast?.wifeName : caseData.darkhast?.husbandName) ||
               "—";
    };

    const darkhast = caseData.darkhast || {};

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-emerald-950/40 backdrop-blur-sm">
            <div className="relative bg-white w-full max-w-6xl max-h-[90vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden">
                {/* Header */}
                <div className="bg-islamicGreen px-8 py-6 flex justify-between items-center text-white shrink-0">
                    <div>
                        <h2 className="text-2xl font-black tracking-tight uppercase">Case Review Panel</h2>
                        <p className="text-emerald-100 text-xs font-bold tracking-widest opacity-80 mt-1">
                            QAZI ADMINISTRATIVE REVIEW • DARUL QAZA NANDED
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="bg-white/10 hover:bg-white/20 p-2 rounded-xl transition-all text-2xl leading-none"
                    >
                        ✕
                    </button>
                </div>

                {/* Legal Disclaimer */}
                <div className="bg-amber-50 border-l-4 border-amber-500 px-6 py-3 text-sm text-amber-900 shrink-0">
                    <p className="font-semibold">⚠️ Legal Notice:</p>
                    <p className="text-xs mt-1">Final decisions are issued by qualified Islamic authorities. All case reviews are subject to Shariah compliance verification.</p>
                </div>

                {/* Scrollable Content */}
                <div className="flex-1 overflow-y-auto p-8 space-y-8">
                    {error && (
                        <div className="bg-red-50 border-2 border-red-200 text-red-800 px-6 py-4 rounded-xl font-bold text-sm">
                            ⚠️ {error}
                        </div>
                    )}

                    {/* CASE INFORMATION HEADER */}
                    <div className="bg-gradient-to-r from-emerald-50 to-emerald-100/50 border-2 border-emerald-200 rounded-2xl p-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <InfoField
                                label="Application (Darkhast) Number"
                                value={display(caseData.displayId || caseData.caseId)}
                                highlight
                            />
                            <InfoField
                                label="File Number"
                                value={caseData.fileNumber || "⏳ Pending Approval"}
                                highlight={!!caseData.fileNumber}
                            />
                            <InfoField
                                label="Matter Type"
                                value={display(caseData.type)}
                                highlight
                            />
                        </div>
                    </div>

                    {/* MAIN DETAILS GRID */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* APPLICANT DETAILS */}
                        <Section title="📋 Applicant Details">
                            <InfoField
                                label="Full Name"
                                value={getApplicantName()}
                            />
                            <InfoField
                                label="Father/Guardian Name"
                                value={display(
                                    darkhast.fatherGuardianName ||
                                    darkhast.firstPartyFatherName
                                )}
                            />
                            <InfoField
                                label="Gender"
                                value={display(darkhast.applicantGender)}
                            />
                            <InfoField
                                label="Age"
                                value={display(darkhast.applicantAge)}
                            />
                            <InfoField
                                label="Mobile Number"
                                value={display(darkhast.applicantMobile)}
                            />
                            <InfoField
                                label="CNIC"
                                value={display(darkhast.cnic)}
                            />
                            <InfoField
                                label="Full Address"
                                value={display(
                                    darkhast.address ||
                                    darkhast.firstPartyResidence
                                )}
                            />
                            <InfoField
                                label="District"
                                value={display(
                                    darkhast.district ||
                                    darkhast.firstPartyDistrict
                                )}
                            />
                            <InfoField
                                label="State"
                                value={display(darkhast.state)}
                            />
                        </Section>

                        {/* RESPONDENT DETAILS */}
                        <Section title="👤 Respondent Details">
                            <InfoField
                                label="Full Name"
                                value={getRespondentName()}
                            />
                            <InfoField
                                label="Father Name"
                                value={display(
                                    darkhast.respondentFatherName ||
                                    darkhast.secondPartyFatherName
                                )}
                            />
                            <InfoField
                                label="Full Address"
                                value={display(
                                    darkhast.respondentAddress ||
                                    darkhast.secondPartyResidence
                                )}
                            />
                            <InfoField
                                label="District"
                                value={display(darkhast.secondPartyDistrict)}
                            />
                        </Section>
                    </div>

                    {/* CASE TYPE SPECIFIC DATA */}
                    {caseData.type === "Talaq" && (
                        <Section title="📝 Talaq Form Details">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <InfoField
                                    label="Husband Name"
                                    value={display(darkhast.husbandName)}
                                />
                                <InfoField
                                    label="Wife Name"
                                    value={display(darkhast.wifeName)}
                                />
                                <InfoField
                                    label="Talaq Count"
                                    value={display(darkhast.talaqCount)}
                                />
                                <InfoField
                                    label="Talaq Intention Confirmed"
                                    value={darkhast.talaqIntentionConfirmed ? "Yes" : "No"}
                                />
                                <InfoField
                                    label="Iddat Acknowledgement"
                                    value={darkhast.iddatAcknowledgement ? "Yes" : "No"}
                                />
                                {darkhast.talaqDeclaration && (
                                    <div className="md:col-span-2">
                                        <InfoField
                                            label="Declaration"
                                            value={darkhast.talaqDeclaration}
                                        />
                                    </div>
                                )}
                            </div>
                        </Section>
                    )}

                    {caseData.type === "Khula" && (
                        <Section title="📝 Khula Form Details">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <InfoField
                                    label="Wife Name"
                                    value={display(darkhast.wifeName)}
                                />
                                <InfoField
                                    label="Husband Name"
                                    value={display(darkhast.husbandName)}
                                />
                                <InfoField
                                    label="Consent Confirmation"
                                    value={darkhast.consentConfirmation ? "Yes" : "No"}
                                />
                                {darkhast.khulaReason && (
                                    <div className="md:col-span-2">
                                        <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest block mb-1">
                                            Reason for Khula
                                        </label>
                                        <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-sm text-gray-700 leading-relaxed">
                                            {darkhast.khulaReason}
                                        </div>
                                    </div>
                                )}
                                {darkhast.mahrReturn && (
                                    <div className="md:col-span-2">
                                        <InfoField
                                            label="Compensation / Mahr Return Details"
                                            value={darkhast.mahrReturn}
                                        />
                                    </div>
                                )}
                                {darkhast.khulaDeclaration && (
                                    <div className="md:col-span-2">
                                        <InfoField
                                            label="Declaration"
                                            value={darkhast.khulaDeclaration}
                                        />
                                    </div>
                                )}
                            </div>
                        </Section>
                    )}

                    {/* CASE DETAILS */}
                    <Section title="⚖️ Case Details">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <InfoField
                                label="Nikah Date"
                                value={darkhast.nikahDate
                                    ? new Date(darkhast.nikahDate).toLocaleDateString()
                                    : "—"
                                }
                            />
                            <InfoField
                                label="Nikah Place"
                                value={display(darkhast.nikahPlace)}
                            />
                            <InfoField
                                label="Nature of Dispute"
                                value={display(darkhast.natureOfDispute || caseData.type)}
                            />
                            <InfoField
                                label="Relief Requested"
                                value={display(darkhast.reliefRequested)}
                            />
                        </div>

                        {darkhast.statement && (
                            <div className="mt-4">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">
                                    Darkhast Written Statement
                                </label>
                                <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-sm text-gray-700 leading-relaxed">
                                    {darkhast.statement}
                                </div>
                            </div>
                        )}
                    </Section>

                    {/* ARBITRATION DATA */}
                    {caseData.arbitration && (
                        <Section title="🤝 Arbitration (Sulh) Details">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <InfoField
                                    label="Date"
                                    value={caseData.arbitration.date
                                        ? new Date(caseData.arbitration.date).toLocaleDateString()
                                        : "—"
                                    }
                                />
                                <InfoField
                                    label="Result"
                                    value={display(caseData.arbitration.result)}
                                />
                                {caseData.arbitration.notes && (
                                    <div className="md:col-span-2">
                                        <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest block mb-1">
                                            Notes
                                        </label>
                                        <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-sm text-gray-700 leading-relaxed">
                                            {caseData.arbitration.notes}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </Section>
                    )}

                    {/* AFFIDAVITS / DOCUMENTS */}
                    {caseData.affidavits && (
                        <Section title="📄 Documents & Affidavits">
                            <div className="space-y-4">
                                {caseData.affidavits.applicantAffidavit?.url && (
                                    <DocumentItem
                                        label="Applicant Affidavit"
                                        url={caseData.affidavits.applicantAffidavit.url}
                                        name={caseData.affidavits.applicantAffidavit.name || "Applicant Affidavit"}
                                    />
                                )}
                                {caseData.affidavits.respondentAffidavit?.url && (
                                    <DocumentItem
                                        label="Respondent Affidavit"
                                        url={caseData.affidavits.respondentAffidavit.url}
                                        name={caseData.affidavits.respondentAffidavit.name || "Respondent Affidavit"}
                                    />
                                )}
                                {caseData.affidavits.nikahnama?.url && (
                                    <DocumentItem
                                        label="Nikahnama"
                                        url={caseData.affidavits.nikahnama.url}
                                        name={caseData.affidavits.nikahnama.name || "Nikahnama"}
                                    />
                                )}
                                {caseData.affidavits.idProof?.url && (
                                    <DocumentItem
                                        label="ID Proof"
                                        url={caseData.affidavits.idProof.url}
                                        name={caseData.affidavits.idProof.name || "ID Proof"}
                                    />
                                )}
                                {caseData.affidavits.witnessAffidavits && caseData.affidavits.witnessAffidavits.length > 0 && (
                                    <div>
                                        <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest block mb-2">
                                            Witness Affidavits
                                        </label>
                                        <div className="space-y-2">
                                            {caseData.affidavits.witnessAffidavits.map((witness, idx) => (
                                                witness.url && (
                                                    <DocumentItem
                                                        key={idx}
                                                        label={`Witness ${idx + 1} Affidavit`}
                                                        url={witness.url}
                                                        name={witness.name || `Witness ${idx + 1} Affidavit`}
                                                    />
                                                )
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </Section>
                    )}

                    {/* ADMINISTRATIVE INFO */}
                    <Section title="🏛️ Administrative Information">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <InfoField
                                label="Current Status"
                                value={display(caseData.status?.replace(/_/g, ' '))}
                            />
                            <InfoField
                                label="Submission Date"
                                value={caseData.createdAt
                                    ? new Date(caseData.createdAt).toLocaleDateString()
                                    : "—"
                                }
                            />
                            <InfoField
                                label="Created By (User ID)"
                                value={display(caseData.createdBy)}
                            />
                        </div>
                    </Section>

                    {/* MESSAGE TO APPLICANT */}
                    <div className="bg-emerald-50/50 border-2 border-emerald-100 rounded-2xl p-6 space-y-3">
                        <label className="text-[10px] font-black text-islamicGreen uppercase tracking-widest">
                            📨 Message to Applicant (Optional)
                        </label>
                        <textarea
                            placeholder="Type a message that will be sent as a notification to the applicant..."
                            value={messageToApplicant}
                            onChange={e => setMessageToApplicant(e.target.value)}
                            className="w-full bg-white border-2 border-emerald-100 rounded-xl p-4 text-sm focus:border-islamicGreen outline-none transition-all placeholder:text-gray-300"
                            rows="3"
                        />
                        <p className="text-[9px] text-emerald-600 italic">
                            This message will appear on the applicant's dashboard as a notification.
                        </p>
                    </div>
                </div>

                {/* ACTION CONTROLS - Fixed at Bottom */}
                <div className="bg-gray-50 border-t-2 border-gray-200 px-8 py-6 shrink-0">
                    {/* Actions for DARKHAST_SUBMITTED */}
                    {caseData.status === "DARKHAST_SUBMITTED" && (
                        <div className="flex flex-col md:flex-row gap-4">
                            <button
                                onClick={handleApprove}
                                disabled={actionLoading}
                                className="flex-1 bg-islamicGreen text-white py-4 px-6 rounded-xl font-bold uppercase tracking-widest shadow-lg shadow-emerald-200 hover:bg-emerald-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                <span className="text-xl">✅</span>
                                {actionLoading ? "Processing..." : "Approve Case & Assign File Number"}
                            </button>

                            <button
                                onClick={() => setShowRejectModal(true)}
                                disabled={actionLoading}
                                className="flex-1 bg-rose-600 text-white py-4 px-6 rounded-xl font-bold uppercase tracking-widest shadow-lg shadow-rose-200 hover:bg-rose-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                <span className="text-xl">❌</span>
                                {actionLoading ? "Processing..." : "Reject / Return Case"}
                            </button>
                        </div>
                    )}

                    {/* Actions for FORM_COMPLETED or UNDER_REVIEW */}
                    {(caseData.status === "FORM_COMPLETED" || caseData.status === "UNDER_REVIEW") && (
                        <div className="flex flex-col md:flex-row gap-4">
                            <button
                                onClick={handleApproveForContinue}
                                disabled={actionLoading}
                                className="flex-1 bg-emerald-600 text-white py-4 px-6 rounded-xl font-bold uppercase tracking-widest shadow-lg shadow-emerald-200 hover:bg-emerald-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                <span className="text-xl">✓</span>
                                {actionLoading ? "Processing..." : "Approve for Continue"}
                            </button>

                            <button
                                onClick={handleSendBackForCorrection}
                                disabled={actionLoading}
                                className="flex-1 bg-amber-600 text-white py-4 px-6 rounded-xl font-bold uppercase tracking-widest shadow-lg shadow-amber-200 hover:bg-amber-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                <span className="text-xl">⚠️</span>
                                {actionLoading ? "Processing..." : "Send Back for Correction"}
                            </button>
                        </div>
                    )}

                    {/* Info message for other statuses */}
                    {caseData.status !== "DARKHAST_SUBMITTED" && 
                     caseData.status !== "FORM_COMPLETED" && 
                     caseData.status !== "UNDER_REVIEW" && (
                        <p className="text-center text-xs text-gray-500 mt-3 italic">
                            Actions are available for cases with status "DARKHAST_SUBMITTED", "FORM_COMPLETED", or "UNDER_REVIEW"
                        </p>
                    )}
                </div>
            </div>

            {/* REJECT MODAL */}
            {showRejectModal && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl space-y-6">
                        <h3 className="text-xl font-black text-rose-600 uppercase tracking-tight">
                            Reject Case
                        </h3>
                        <p className="text-sm text-gray-600">
                            Please provide a mandatory reason for rejecting this case. This will be sent to the applicant.
                        </p>
                        <textarea
                            placeholder="Enter reason for rejection (mandatory)..."
                            value={rejectReason}
                            onChange={e => setRejectReason(e.target.value)}
                            className="w-full border-2 border-rose-100 rounded-xl p-4 text-sm focus:border-rose-500 outline-none transition-all"
                            rows="4"
                            autoFocus
                        />
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowRejectModal(false)}
                                className="flex-1 bg-gray-200 text-gray-700 py-3 px-6 rounded-xl font-bold hover:bg-gray-300 transition-all"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleReject}
                                disabled={!rejectReason.trim() || actionLoading}
                                className="flex-1 bg-rose-600 text-white py-3 px-6 rounded-xl font-bold hover:bg-rose-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {actionLoading ? "Rejecting..." : "Confirm Rejection"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

// Helper Components
function Section({ title, children }) {
    return (
        <div className="bg-white border-2 border-gray-200 rounded-2xl p-6 space-y-4">
            <h3 className="text-sm font-black text-islamicGreen uppercase tracking-widest border-b-2 border-emerald-100 pb-3">
                {title}
            </h3>
            <div className="space-y-4">
                {children}
            </div>
        </div>
    );
}

function InfoField({ label, value, highlight = false }) {
    return (
        <div>
            <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest block mb-1">
                {label}
            </label>
            <div className={`text-sm font-bold ${highlight
                    ? 'text-islamicGreen bg-emerald-50 px-3 py-2 rounded-lg border border-emerald-200'
                    : 'text-gray-900'
                }`}>
                {value || "—"}
            </div>
        </div>
    );
}

function DocumentItem({ label, url, name }) {
    return (
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
            <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest block mb-2">
                {label}
            </label>
            <div className="flex items-center gap-3">
                <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{name}</p>
                    <p className="text-xs text-gray-500 truncate">{url}</p>
                </div>
                <a
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-islamicGreen text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-emerald-700 transition-colors whitespace-nowrap"
                >
                    View Document
                </a>
            </div>
        </div>
    );
}
