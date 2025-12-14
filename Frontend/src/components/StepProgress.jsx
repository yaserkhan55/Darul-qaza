const steps = [
    "Application",
    "Resolution",
    "Agreement",
    "Affidavits",
    "Review",
    "Approved",
  ];
  
  export default function StepProgress({ status }) {
    // Map status to step index - handles all possible statuses
    const getStepIndex = (status) => {
      switch (status) {
        case "STARTED":
          return 0;
        case "FORM_COMPLETED":
          return 1;
        case "RESOLUTION_SUCCESS":
        case "RESOLUTION_FAILED":
          return 2;
        case "AGREEMENT_DONE":
          return 3;
        case "AFFIDAVITS_DONE":
          return 4;
        case "UNDER_REVIEW":
          return 5;
        case "APPROVED":
          return 6;
        default:
          return 0;
      }
    };
  
    const current = getStepIndex(status);
  
    return (
      <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6 overflow-x-auto pb-2">
        {steps.map((step, index) => (
          <div key={step} className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
            <div
              className={`w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center text-xs font-bold
                ${
                  index <= current
                    ? "bg-islamicGreen text-white"
                    : "bg-gray-200 text-gray-400"
                }
              `}
            >
              {index + 1}
            </div>
            <span className="text-xs hidden sm:block whitespace-nowrap">{step}</span>
            {index !== steps.length - 1 && (
              <div className="w-4 sm:w-6 h-px bg-gray-300" />
            )}
          </div>
        ))}
      </div>
    );
  }
  