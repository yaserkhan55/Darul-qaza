import CertificateView from "@/pages/CertificateView";
import StepProgress from "./StepProgress";
import DarkhastView from "./case-steps/DarkhastView";
import CaseTypeSelection from "./case-steps/CaseTypeSelection";
import TalaqForm from "./case-steps/TalaqForm";
import KhulaForm from "./case-steps/KhulaForm";
import NoticeView from "./case-steps/NoticeView";
import HearingStep from "./case-steps/HearingStep";
import ArbitrationStep from "./case-steps/ArbitrationStep";
import FaislaView from "./case-steps/FaislaView";

export default function CaseSteps({ caseData, onUpdated }) {
  if (!caseData) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No case data available</p>
      </div>
    );
  }

  const rawStatus = caseData.status || "DARKHAST_SUBMITTED";

  const STATUS_ADAPTER = {
    DARKHAST_SUBMITTED: "DARKHAST_SUBMITTED",
    DARKHAST_APPROVED: "DARKHAST_APPROVED",
    FORM_COMPLETED: "FORM_COMPLETED",
    NOTICE_ISSUED: "NOTICE_ISSUED",
    NOTICE_SENT: "NOTICE_SENT",
    HEARING_IN_PROGRESS: "HEARING_IN_PROGRESS",
    ARBITRATION_IN_PROGRESS: "ARBITRATION_IN_PROGRESS",
    DECISION_PENDING: "DECISION_PENDING",
    DECISION_APPROVED: "DECISION_APPROVED",
    CASE_CLOSED: "CASE_CLOSED",
  };

  const effectiveStatus = STATUS_ADAPTER[rawStatus] || rawStatus;

  const renderStepComponent = () => {
    switch (effectiveStatus) {
      case "DARKHAST_SUBMITTED":
        return <DarkhastView caseData={caseData} />;

      case "DARKHAST_APPROVED":
        // Show form if type is selected, otherwise show type selection
        if (caseData.type === "Talaq") {
          return <TalaqForm caseData={caseData} onUpdated={onUpdated} />;
        } else if (caseData.type === "Khula") {
          return <KhulaForm caseData={caseData} onUpdated={onUpdated} />;
        }
        return <CaseTypeSelection caseData={caseData} onUpdated={onUpdated} />;

      case "FORM_COMPLETED":
        return <FormCompletedView caseData={caseData} />;

      case "NOTICE_ISSUED":
      case "NOTICE_SENT":
        return <NoticeView caseData={caseData} />;

      case "HEARING_IN_PROGRESS":
        return <HearingStep caseData={caseData} onUpdated={onUpdated} />;

      case "ARBITRATION_IN_PROGRESS":
        return <ArbitrationStep caseData={caseData} onUpdated={onUpdated} />;

      case "DECISION_PENDING":
        return <DecisionPendingScreen />;

      case "DECISION_APPROVED":
      case "CASE_CLOSED":
        return <FaislaView caseData={caseData} onUpdated={onUpdated} />;

      default:
        return <UnexpectedStatusNotice rawStatus={rawStatus} />;
    }
  };

  return (
    <div className="w-full space-y-4">
      <StepProgress status={effectiveStatus} />
      {renderStepComponent()}
    </div>
  );
}

function DecisionPendingScreen() {
  return (
    <div className="text-center py-8 sm:py-12">
      <div className="bg-slate-50 border-2 border-slate-300 rounded-lg p-6 sm:p-8 max-w-md mx-auto shadow-inner">
        <div className="text-4xl mb-4">⚖️</div>
        <h3 className="text-xl font-bold text-slate-900 mb-2 uppercase tracking-wide font-serif">
          Decision Pending
        </h3>
        <p className="text-slate-700 leading-relaxed font-serif">
          The Qazi is now reviewing the statements and evidence to issue a final Order (Faisla).
          Please check back later for the decision.
        </p>
      </div>
    </div>
  );
}

function FormCompletedView({ caseData }) {
  return (
    <div className="text-center py-8 sm:py-12">
      <div className="bg-emerald-50 border-2 border-emerald-300 rounded-lg p-6 sm:p-8 max-w-md mx-auto shadow-inner">
        <div className="text-4xl mb-4">✓</div>
        <h3 className="text-xl font-bold text-emerald-900 mb-2 uppercase tracking-wide font-serif">
          Form Submitted Successfully
        </h3>
        <p className="text-emerald-800 leading-relaxed font-serif">
          Your {caseData?.type} form has been submitted successfully. The Qazi will review your application and issue a notice. Please check back later for updates.
        </p>
      </div>
    </div>
  );
}

function UnexpectedStatusNotice({ rawStatus }) {
  return (
    <div className="text-gray-700 text-sm sm:text-base p-4 sm:p-6 border border-amber-200 bg-amber-50 rounded-xl space-y-2">
      <p className="font-semibold text-amber-900">
        Status Unknown
      </p>
      <p className="text-amber-800 text-sm">
        Internal status:&nbsp;
        <span className="font-mono bg-white/60 px-1.5 py-0.5 rounded">
          {rawStatus?.replace(/_/g, " ") || "UNKNOWN"}
        </span>
      </p>
    </div>
  );
}

