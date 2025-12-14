export default function StatusBadge({ status }) {
    const colors = {
      STARTED: "bg-gray-200 text-gray-700",
      FORM_COMPLETED: "bg-blue-100 text-blue-700",
      RESOLUTION_FAILED: "bg-yellow-100 text-yellow-800",
      UNDER_REVIEW: "bg-purple-100 text-purple-700",
      APPROVED: "bg-green-100 text-green-700",
    };
  
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${colors[status]}`}>
        {status.replace("_", " ")}
      </span>
    );
  }
  