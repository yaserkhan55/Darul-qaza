import { useTranslation } from "react-i18next";

export default function StepProgress({ status }) {
  const { t } = useTranslation();

  const steps = [
    { id: "DARKHAST_SUBMITTED", label: "Darkhast" },
    { id: "FORM_COMPLETED", label: "Form" },
    { id: "NOTICE_SENT", label: "Notice" },
    { id: "HEARING_IN_PROGRESS", label: "Hearing" },
    { id: "ARBITRATION_IN_PROGRESS", label: "Arbitration" },
    { id: "DECISION_PENDING", label: "Decision" },
    { id: "CASE_CLOSED", label: "Certificate" },
  ];

  // Map status to step index - handles all possible statuses
  const getStepIndex = (status) => {
    switch (status) {
      case "DARKHAST_SUBMITTED":
      case "DARKHAST_APPROVED":
        return 0;
      case "FORM_COMPLETED":
        return 1;
      case "NOTICE_ISSUED":
      case "NOTICE_SENT":
        return 2;
      case "HEARING_IN_PROGRESS":
      case "HEARING_SCHEDULED":
      case "HEARING_COMPLETED":
        return 3;
      case "ARBITRATION_IN_PROGRESS":
        return 4;
      case "DECISION_PENDING":
        return 5;
      case "DECISION_APPROVED":
      case "CASE_CLOSED":
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
