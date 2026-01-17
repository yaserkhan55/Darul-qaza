import { useState, useEffect } from "react";
import * as adminApi from "../api/admin.api";
import { sendAdminMessage, getCaseMessages } from "../api/message.api";
import DocumentsSection from "./DocumentsSection";

export default function AdminCaseReview({ caseData, onClose, onUpdate }) {
    const [actionLoading, setActionLoading] = useState(false);
    const [error, setError] = useState("");
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [showHearingScheduler, setShowHearingScheduler] = useState(false);
    const [hearingData, setHearingData] = useState({
        hearingDate: "",
        hearingTime: "",
        hearingMode: "IN_PERSON",
        locationOrLink: "",
        hearingNotes: ""
    });
    const [caseMessages, setCaseMessages] = useState([]);
    const [loadingMessages, setLoadingMessages] = useState(false);
    const [unifiedMessage, setUnifiedMessage] = useState("");

    useEffect(() => {
        if (caseData?._id) {
            fetchMessages();
        }
    }, [caseData?._id]);

    const fetchMessages = async () => {
        setLoadingMessages(true);
        try {
            const messages = await getCaseMessages(caseData._id);
            setCaseMessages(messages);
        } catch (err) {
            console.error("Failed to fetch messages:", err);
        } finally {
            setLoadingMessages(false);
        }
    };

    const handleSendMessage = async () => {
        if (!unifiedMessage.trim()) {
            alert("Please type a message first.");
            return;
        }

        setActionLoading(true);
        setError("");
        try {
            await sendAdminMessage({
                caseId: caseData._id,
                recipientId: caseData.createdBy,
                title: `Message from Dar-ul-Qaza regarding Case #${caseData.caseId?.slice(-6).toUpperCase()}`,
                body: unifiedMessage.trim(),
            });
            alert("Message sent successfully!");
            setUnifiedMessage("");
            fetchMessages();
        } catch (err) {
            setError(err?.response?.data?.message || "Failed to send message.");
        } finally {
            setActionLoading(false);
        }
    };

    // Generate file number in Serial/Year format
    const generateFileNumber = () => {
        const year = new Date().getFullYear();
        const serial = caseData.sequentialId || Math.floor(Math.random() * 9000) + 1000;
        return `${serial}/${year}`;
    };

    const handleApprove = async () => {
        if (!unifiedMessage.trim()) {
            alert("Please provide a decision comment/message in the Communication Center. This is required for all admin actions.");
            return;
        }

        if (!window.confirm("Are you sure you want to APPROVE this case? A file number will be assigned.")) {
            return;
        }

        setActionLoading(true);
        setError("");
        try {
            const fileNumber = generateFileNumber();
            const payload = {
                fileNumber,
                adminMessage: unifiedMessage || `Your case has been approved. File Number: ${fileNumber}`,
                decisionComment: (unifiedMessage || "Case approved").trim()
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
        if (!unifiedMessage.trim()) {
            alert("Please provide a reason/comment in the message box.");
            return;
        }

        setActionLoading(true);
        setError("");
        try {
            const payload = {
                adminMessage: unifiedMessage.trim(),
                decisionComment: unifiedMessage.trim()
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
        if (!unifiedMessage.trim()) {
            if (!window.confirm("No message provided. Continue without sending an explanation to the applicant?")) {
                return;
            }
        }

        setActionLoading(true);
        setError("");
        try {
            const payload = {
                adminMessage: unifiedMessage || "Your case has been returned for correction. Please review and update your form.",
                reasonForCorrection: unifiedMessage || "Details pending correction",
                guidanceForNextStep: "Please update the required fields as described."
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
        if (!unifiedMessage.trim()) {
            alert("Please provide a decision comment/message.");
            return;
        }

        if (!window.confirm("Approve this case for the user to continue with the next step?")) {
            return;
        }

        setActionLoading(true);
        setError("");
        try {
            const payload = {
                adminMessage: unifiedMessage || "Your case has been reviewed. You may now continue with the next step.",
                guidanceForNextStep: unifiedMessage || "You may proceed.",
                decisionComment: unifiedMessage.trim()
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

    const handleScheduleHearing = async () => {
        if (!hearingData.hearingDate || !hearingData.hearingTime || !hearingData.hearingMode) {
            alert("Please provide hearing date, time, and mode.");
            return;
        }

        setActionLoading(true);
        setError("");
        try {
            await adminApi.scheduleHearing(caseData._id, hearingData);
            alert("Hearing scheduled successfully.");
            setShowHearingScheduler(false);
            onUpdate && onUpdate();
        } catch (err) {
            setError(err?.response?.data?.message || err?.response?.data?.error || "Failed to schedule hearing.");
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

                    {/* DOCUMENTS & AFFIDAVITS - Using shared component */}
                    <DocumentsSection caseData={caseData} mode="admin" onUpdate={onUpdate} />

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

                    {/* COMMUNICATION CENTER */}
                    <div className="bg-white border-2 border-emerald-100 rounded-2xl overflow-hidden shadow-sm">
                        <div className="bg-emerald-50 px-6 py-4 border-b border-emerald-100 flex justify-between items-center">
                            <h3 className="text-sm font-black text-islamicGreen uppercase tracking-widest flex items-center gap-2">
                                💬 Communication Center
                            </h3>
                            <span className="text-[10px] font-bold text-emerald-600 bg-white px-2 py-1 rounded-full border border-emerald-200">
                                {caseMessages.length} Messages
                            </span>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 divide-y lg:divide-y-0 lg:divide-x divide-emerald-100">
                            {/* Message History */}
                            <div className="lg:col-span-1 max-h-[400px] overflow-y-auto bg-gray-50/30 p-4 space-y-4">
                                <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest block mb-1">
                                    Message History
                                </label>
                                {loadingMessages ? (
                                    <div className="flex justify-center py-8">
                                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-islamicGreen"></div>
                                    </div>
                                ) : caseMessages.length === 0 ? (
                                    <p className="text-xs text-gray-400 italic text-center py-8">No messages sent yet.</p>
                                ) : (
                                    <div className="space-y-3">
                                        {caseMessages.map((msg, i) => (
                                            <div key={i} className="bg-white p-3 rounded-xl border border-gray-100 shadow-sm text-xs">
                                                <div className="flex justify-between items-start mb-1">
                                                    <span className="font-bold text-islamicGreen">{msg.senderName || "Admin"}</span>
                                                    <span className="text-[9px] text-gray-400">{new Date(msg.createdAt).toLocaleDateString()}</span>
                                                </div>
                                                <p className="text-gray-700 leading-relaxed">{msg.body}</p>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* New Message Input */}
                            <div className="lg:col-span-2 p-6 space-y-4">
                                <div>
                                    <label className="text-[10px] font-black text-emerald-800 uppercase tracking-widest flex justify-between items-center mb-2">
                                        <span>New Message / Decision Comment</span>
                                        <span className="text-red-500 text-[8px] font-bold">* REQUIRED FOR ACTIONS</span>
                                    </label>
                                    <textarea
                                        placeholder="Type your message or decision here..."
                                        value={unifiedMessage}
                                        onChange={e => setUnifiedMessage(e.target.value)}
                                        className="w-full bg-white border-2 border-emerald-100 rounded-xl p-4 text-sm focus:border-islamicGreen outline-none transition-all placeholder:text-gray-300 shadow-inner"
                                        rows="6"
                                    />
                                </div>

                                {/* Smart Suggestions */}
                                <div className="space-y-2">
                                    <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest block">
                                        Smart Suggestions
                                    </label>
                                    <div className="flex flex-wrap gap-2">
                                        {[
                                            "Your application is approved. Please follow the next steps.",
                                            "A hearing has been scheduled. Please ensure your presence.",
                                            "Documents are missing. Please upload the required files.",
                                            "Please visit the Dar-ul-Qaza office for further clarification.",
                                            "Your case is under review. We will notify you shortly."
                                        ].map((text, i) => (
                                            <button
                                                key={i}
                                                onClick={() => setUnifiedMessage(text)}
                                                className="text-[10px] font-bold bg-emerald-50 text-islamicGreen px-3 py-1.5 rounded-lg border border-emerald-100 hover:bg-islamicGreen hover:text-white transition-all"
                                            >
                                                + {text.slice(0, 30)}...
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="flex justify-end pt-2">
                                    <button
                                        onClick={handleSendMessage}
                                        disabled={actionLoading || !unifiedMessage.trim()}
                                        className="bg-islamicGreen text-white px-6 py-2 rounded-xl font-bold text-xs shadow-md hover:bg-emerald-700 transition-all flex items-center gap-2 disabled:opacity-50"
                                    >
                                        <span>📨</span> Send Message Only
                                    </button>
                                </div>
                            </div>
                        </div>
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

                    {/* HEARING SCHEDULER BUTTON */}
                    {(caseData.status === "FORM_COMPLETED" ||
                        caseData.status === "RESOLUTION_FAILED" ||
                        caseData.status === "UNDER_REVIEW" ||
                        caseData.status === "APPROVED" ||
                        caseData.status === "NOTICE_ISSUED" ||
                        caseData.status === "HEARING_SCHEDULED") && (
                            <div className="mt-4 pt-4 border-t border-gray-200">
                                <button
                                    onClick={() => setShowHearingScheduler(true)}
                                    className="w-full bg-indigo-600 text-white py-3 px-6 rounded-xl font-bold uppercase tracking-widest shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all flex items-center justify-center gap-2"
                                >
                                    <span className="text-xl">📅</span>
                                    Schedule / Update Hearing
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

            {/* HEARING SCHEDULER MODAL */}
            {showHearingScheduler && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl p-8 max-w-2xl w-full shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-start">
                            <h3 className="text-xl font-black text-indigo-900 uppercase tracking-tight">
                                Schedule Hearing / Majlis
                            </h3>
                            <button
                                onClick={() => setShowHearingScheduler(false)}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                ✕
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Hearing Date <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="date"
                                    value={hearingData.hearingDate}
                                    onChange={e => setHearingData({ ...hearingData, hearingDate: e.target.value })}
                                    className="w-full bg-white border-2 border-indigo-100 rounded-xl p-3 text-sm focus:border-indigo-500 outline-none"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Hearing Time <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="time"
                                    value={hearingData.hearingTime}
                                    onChange={e => setHearingData({ ...hearingData, hearingTime: e.target.value })}
                                    className="w-full bg-white border-2 border-indigo-100 rounded-xl p-3 text-sm focus:border-indigo-500 outline-none"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Mode <span className="text-red-500">*</span>
                                </label>
                                <select
                                    value={hearingData.hearingMode}
                                    onChange={e => setHearingData({ ...hearingData, hearingMode: e.target.value })}
                                    className="w-full bg-white border-2 border-indigo-100 rounded-xl p-3 text-sm focus:border-indigo-500 outline-none"
                                    required
                                >
                                    <option value="IN_PERSON">In-Person</option>
                                    <option value="ONLINE">Online</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Location / Link
                                </label>
                                <input
                                    type="text"
                                    value={hearingData.locationOrLink}
                                    onChange={e => setHearingData({ ...hearingData, locationOrLink: e.target.value })}
                                    placeholder={hearingData.hearingMode === "ONLINE" ? "Meeting link (Zoom/Google Meet)" : "Physical address"}
                                    className="w-full bg-white border-2 border-indigo-100 rounded-xl p-3 text-sm focus:border-indigo-500 outline-none"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Admin Notes / Instructions
                            </label>
                            <textarea
                                value={hearingData.hearingNotes}
                                onChange={e => setHearingData({ ...hearingData, hearingNotes: e.target.value })}
                                placeholder="Add any instructions or notes for the parties (e.g., bring witnesses, documents)..."
                                className="w-full bg-white border-2 border-indigo-100 rounded-xl p-3 text-sm focus:border-indigo-500 outline-none"
                                rows="3"
                            />
                        </div>
                        <div className="flex gap-3 pt-4 border-t border-gray-100">
                            <button
                                onClick={() => setShowHearingScheduler(false)}
                                className="px-6 py-3 bg-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-300 transition-all"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleScheduleHearing}
                                disabled={actionLoading}
                                className="flex-1 bg-indigo-600 text-white py-3 px-6 rounded-xl font-bold hover:bg-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-indigo-200"
                            >
                                {actionLoading ? "Saving..." : "Save Hearing Details"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

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
                            value={unifiedMessage}
                            onChange={e => setUnifiedMessage(e.target.value)}
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
                                disabled={!unifiedMessage.trim() || actionLoading}
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
