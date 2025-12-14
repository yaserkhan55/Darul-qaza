import StatusBadge from "./StatusBadge";

export default function CaseCard({ caseData, onClick, active }) {
  return (
    <div
      onClick={onClick}
      className={`
        p-3 sm:p-4 rounded-xl cursor-pointer border transition
        ${active ? "border-islamicGreen bg-emerald-50" : "hover:bg-gray-50"}
      `}
    >
      <div className="flex justify-between items-center gap-2">
        <h3 className="font-semibold text-xs sm:text-sm">
          {caseData.divorceType}
        </h3>
        <StatusBadge status={caseData.status} />
      </div>

      <p className="text-xs text-gray-500 mt-2">
        Case ID: {caseData._id.slice(-6).toUpperCase()}
      </p>

      <p className="text-xs text-gray-400 mt-1">
        {new Date(caseData.createdAt).toLocaleDateString()}
      </p>
    </div>
  );
}
