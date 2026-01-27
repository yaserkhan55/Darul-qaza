export default function StatusBadge({ status }) {
  const colors = {
    DARKHAST_SUBMITTED: "bg-blue-50 text-blue-600 border border-blue-100",
    DARKHAST_APPROVED: "bg-emerald-50 text-emerald-600 border border-emerald-100",
    DARKHAST_REJECTED: "bg-rose-100 text-rose-600",
    NEEDS_CORRECTION: "bg-amber-100 text-amber-700",
    APPROVED_FOR_CONTINUE: "bg-cyan-50 text-cyan-600 border border-cyan-100",
    RESOLUTION_PENDING: "bg-yellow-100 text-yellow-700",
    RESOLUTION_SUCCESS: "bg-green-500 text-white",
    RESOLUTION_FAILED: "bg-orange-100 text-orange-700",
    UNDER_REVIEW: "bg-indigo-50 text-indigo-600 border border-indigo-100",
    APPROVED: "bg-emerald-600 text-white shadow-sm",
    FORM_COMPLETED: "bg-indigo-100 text-indigo-700",
    NOTICE_ISSUED: "bg-purple-100 text-purple-700",
    NOTICE_SENT: "bg-purple-100 text-purple-700",
    HEARING_SCHEDULED: "bg-amber-100 text-amber-700",
    HEARING_IN_PROGRESS: "bg-amber-100 text-amber-700",
    HEARING_COMPLETED: "bg-purple-100 text-purple-700",
    ARBITRATION_IN_PROGRESS: "bg-purple-100 text-purple-700",
    DECISION_PENDING: "bg-rose-100 text-rose-700",
    DECISION_APPROVED: "bg-emerald-600 text-white",
    CASE_CLOSED: "bg-gray-800 text-white",
  };

  const labels = {
    DARKHAST_SUBMITTED: "Application Pending Review",
    DARKHAST_APPROVED: "Application Accepted (File Opened)",
    DARKHAST_REJECTED: "Returned for Correction",
    NEEDS_CORRECTION: "Review Correction Required",
    APPROVED_FOR_CONTINUE: "Review Passed (Proceed)",
    UNDER_REVIEW: "Detailed Verification by Qazi",
    APPROVED: "Case Verified & Ready",
    FORM_COMPLETED: "Detailed Form Submitted",
    NOTICE_ISSUED: "Notice Prepared",
    NOTICE_SENT: "Notice Dispatched",
    HEARING_SCHEDULED: "Hearing Scheduled",
    HEARING_IN_PROGRESS: "Hearing in Progress",
    HEARING_COMPLETED: "Hearing Completed",
    ARBITRATION_IN_PROGRESS: "Arbitration in Progress",
    DECISION_PENDING: "Final Decision Pending",
    DECISION_APPROVED: "Final Order Issued",
    CASE_CLOSED: "Case Finalized / Closed",
  };

  return (
    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${colors[status] || "bg-gray-100 text-gray-400"}`}>
      {labels[status] || status?.replace(/_/g, " ")}
    </span>
  );
}