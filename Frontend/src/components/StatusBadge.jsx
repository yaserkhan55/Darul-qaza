export default function StatusBadge({ status }) {
  const colors = {
    DARKHAST_SUBMITTED: "bg-blue-100 text-blue-700",
    DARKHAST_APPROVED: "bg-emerald-100 text-emerald-700",
    DARKHAST_REJECTED: "bg-rose-100 text-rose-600",
    NEEDS_CORRECTION: "bg-amber-100 text-amber-700",
    APPROVED_FOR_CONTINUE: "bg-emerald-100 text-emerald-700",
    RESOLUTION_PENDING: "bg-yellow-100 text-yellow-700",
    RESOLUTION_SUCCESS: "bg-green-500 text-white",
    RESOLUTION_FAILED: "bg-orange-100 text-orange-700",
    UNDER_REVIEW: "bg-blue-100 text-blue-700",
    APPROVED: "bg-emerald-500 text-white",
    FORM_COMPLETED: "bg-indigo-100 text-indigo-700",
    NOTICE_ISSUED: "bg-indigo-100 text-indigo-700",
    NOTICE_SENT: "bg-indigo-100 text-indigo-700",
    HEARING_SCHEDULED: "bg-amber-100 text-amber-700",
    HEARING_IN_PROGRESS: "bg-amber-100 text-amber-700",
    HEARING_COMPLETED: "bg-purple-100 text-purple-700",
    ARBITRATION_IN_PROGRESS: "bg-purple-100 text-purple-700",
    DECISION_PENDING: "bg-rose-100 text-rose-700",
    DECISION_APPROVED: "bg-emerald-500 text-white",
    CASE_CLOSED: "bg-gray-800 text-white",
  };

  const labels = {
    DARKHAST_SUBMITTED: "Application received",
    DARKHAST_APPROVED: "Application approved",
    DARKHAST_REJECTED: "Returned for correction",
    NEEDS_CORRECTION: "Correction required",
    APPROVED_FOR_CONTINUE: "Continue to next step",
    UNDER_REVIEW: "Under Qazi review",
    APPROVED: "Approved by Qazi",
    FORM_COMPLETED: "Form submitted",
    NOTICE_ISSUED: "Notice prepared",
    NOTICE_SENT: "Notice sent",
    HEARING_SCHEDULED: "Hearing scheduled",
    HEARING_IN_PROGRESS: "Hearing in progress",
    HEARING_COMPLETED: "Hearing completed",
    ARBITRATION_IN_PROGRESS: "Arbitration in progress",
    DECISION_PENDING: "Decision pending",
    DECISION_APPROVED: "Decision approved",
    CASE_CLOSED: "Case closed",
  };

  return (
    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${colors[status] || "bg-gray-100 text-gray-400"}`}>
      {labels[status] || status?.replace(/_/g, " ")}
    </span>
  );
}