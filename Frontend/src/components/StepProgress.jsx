import { useTranslation } from "react-i18next";

export default function StepProgress({ status }) {
  const { t } = useTranslation();

  const steps = [
    { id: "STARTED", label: "Application" },
    { id: "FORM_COMPLETED", label: "Review" },
    { id: "RESOLUTION_SUCCESS", label: "Resolution" },
    { id: "AGREEMENT_DONE", label: "Agreement" },
    { id: "AFFIDAVITS_DONE", label: "Affidavits" },
    { id: "APPROVED", label: "Certificate" },
  ];

  // Map status to step index - handles all possible statuses
  const getStepIndex = (status) => {
    switch (status) {
      case "STARTED":
      case "CREATED":
      case "DRAFT":
        return 0;
      case "FORM_COMPLETED":
      case "SUBMITTED":
        return 1;
      case "RESOLUTION_SUCCESS":
      case "RESOLUTION_FAILED":
        return 2;
      case "AGREEMENT_DONE":
        return 3;
      case "AFFIDAVITS_DONE":
        return 4;
      case "UNDER_REVIEW":
      case "PENDING_REVIEW":
      case "PENDING_HUSBAND_CONSENT":
      case "ARBITRATION":
        return 5;
      case "APPROVED":
      case "COMPLETED":
        return 6;
      default:
        return 0;
    }
  };

  const current = getStepIndex(status);

  return (
    <div className="w-full mb-8">
      <div className="flex items-center justify-between relative px-2">
        {/* Connector Line Background */}
        <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-full h-1 bg-gray-100 -z-10 rounded-full" />

        {/* Active Connector Line */}
        <div
          className="absolute left-0 top-1/2 transform -translate-y-1/2 h-1 bg-islamicGreen -z-10 rounded-full transition-all duration-500 ease-out"
          style={{ width: `${(current / (steps.length - 1)) * 100}%` }}
        />

        {steps.map((step, index) => {
          const isActive = index <= current;
          const isCurrent = index === current;

          return (
            <div key={step.id} className="flex flex-col items-center group cursor-default">
              <div
                className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-xs sm:text-sm font-bold border-2 transition-all duration-300
                  ${isActive
                    ? "bg-islamicGreen border-islamicGreen text-white shadow-md scale-105"
                    : "bg-white border-gray-300 text-gray-400"
                  }
                  ${isCurrent ? "ring-4 ring-green-100 ring-opacity-50" : ""}
                `}
              >
                {isActive ? "✓" : index + 1}
              </div>
              <span
                className={`absolute top-10 sm:top-12 text-[10px] sm:text-xs font-medium whitespace-nowrap transition-colors duration-300
                  ${isActive ? "text-islamicGreen" : "text-gray-400"}
                  ${isCurrent ? "font-bold scale-105" : ""}
                `}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
      <div className="h-6 sm:h-8" /> {/* Spacer for labels */}
    </div>
  );
}
