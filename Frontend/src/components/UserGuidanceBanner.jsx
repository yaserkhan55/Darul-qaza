export default function UserGuidanceBanner({ status, caseData }) {
  // Determine message and styling based on status
  const getBannerConfig = () => {
    switch (status) {
      case "NEEDS_CORRECTION":
        return {
          message: "Your case has been reviewed and requires corrections. Please update the form below and resubmit.",
          bgColor: "bg-amber-50",
          borderColor: "border-amber-200",
          textColor: "text-amber-900",
          icon: "⚠️"
        };
      case "APPROVED_FOR_CONTINUE":
        return {
          message: "Your case has been reviewed. You may now continue with the next step.",
          bgColor: "bg-emerald-50",
          borderColor: "border-emerald-200",
          textColor: "text-emerald-900",
          icon: "✓"
        };
      case "UNDER_REVIEW":
        return {
          message: "Your case is currently under review by the Qazi. Please check back later for updates.",
          bgColor: "bg-blue-50",
          borderColor: "border-blue-200",
          textColor: "text-blue-900",
          icon: "⏳"
        };
      case "APPROVED":
        return {
          message: "Your case has been approved. You may proceed to the next step.",
          bgColor: "bg-emerald-50",
          borderColor: "border-emerald-200",
          textColor: "text-emerald-900",
          icon: "✓"
        };
      default:
        return null;
    }
  };

  const config = getBannerConfig();
  if (!config) return null;

  return (
    <div className={`${config.bgColor} ${config.borderColor} border-2 rounded-xl p-4 mb-6 shadow-sm`}>
      <div className="flex items-start gap-3">
        <span className="text-2xl flex-shrink-0">{config.icon}</span>
        <p className={`${config.textColor} text-sm font-medium leading-relaxed flex-1`}>
          {config.message}
        </p>
      </div>
    </div>
  );
}

