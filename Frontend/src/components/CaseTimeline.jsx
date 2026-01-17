import { useTranslation } from "react-i18next";

export default function CaseTimeline({ currentStatus }) {
    const { t } = useTranslation();

    const STEPS = [
        { id: "STARTED", label: "Application", time: "Day 1" },
        { id: "FORM_COMPLETED", label: "Review", time: "Day 2-3" },
        { id: "RESOLUTION_SUCCESS", label: "Resolution", time: "Day 5-10" },
        { id: "AGREEMENT_DONE", label: "Agreement", time: "Day 12" },
        { id: "AFFIDAVITS_DONE", label: "Affidavits", time: "Day 15" },
        { id: "APPROVED", label: "Certificate", time: "Day 30+" } // Iddat dependent
    ];

    const currentIndex = STEPS.findIndex(s => s.id === currentStatus) || 0;

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 mt-4">
            <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <span>📅</span> Estimated Timeline
            </h3>

            <div className="relative border-l-2 border-gray-100 ml-3 space-y-6">
                {STEPS.map((step, idx) => {
                    const isCompleted = idx < currentIndex;
                    const isCurrent = idx === currentIndex;

                    return (
                        <div key={step.id} className="relative pl-6">
                            {/* Dot */}
                            <div
                                className={`absolute -left-[9px] top-1.5 w-4 h-4 rounded-full border-2 
                  ${isCompleted ? "bg-islamicGreen border-islamicGreen" :
                                        isCurrent ? "bg-white border-islamicGreen animate-pulse" : "bg-white border-gray-300"}`}
                            />

                            <div className="flex justify-between items-start">
                                <div>
                                    <p className={`text-sm font-medium ${isCurrent ? "text-islamicGreen" : "text-gray-700"}`}>
                                        {step.label}
                                    </p>
                                    <p className="text-xs text-gray-500">{step.time}</p>
                                </div>
                                {isCurrent && (
                                    <span className="text-[10px] bg-green-50 text-green-700 px-2 py-0.5 rounded-full font-medium">
                                        Current Step
                                    </span>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="mt-6 pt-4 border-t border-gray-50 text-xs text-gray-500 leading-relaxed">
                <strong>Islamic Guidance:</strong> This process follows the step-by-step specific approach to ensure fairness and time for reflection (Iddat), avoiding hasty decisions.
            </div>
        </div>
    );
}
