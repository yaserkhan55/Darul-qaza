import CertificateView from "@/pages/CertificateView";
import StepProgress from "./StepProgress";
import DarkhastView from "./case-steps/DarkhastView";
import CaseTypeSelection from "./case-steps/CaseTypeSelection";
import TalaqForm from "./case-steps/TalaqForm";
import KhulaForm from "./case-steps/KhulaForm";
import ResolutionStep from "./case-steps/ResolutionStep";
import AffidavitStep from "./case-steps/AffidavitStep";
import NoticeView from "./case-steps/NoticeView";
import HearingStep from "./case-steps/HearingStep";
import ArbitrationStep from "./case-steps/ArbitrationStep";
import FaislaView from "./case-steps/FaislaView";
import UserGuidanceBanner from "./UserGuidanceBanner";
import DocumentsSection from "./DocumentsSection";

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
    DARKHAST_REJECTED: "DARKHAST_REJECTED",
    FORM_COMPLETED: "FORM_COMPLETED",
    NEEDS_CORRECTION: "NEEDS_CORRECTION",
    APPROVED_FOR_CONTINUE: "APPROVED_FOR_CONTINUE",
    RESOLUTION_PENDING: "RESOLUTION_PENDING",
    RESOLUTION_SUCCESS: "RESOLUTION_SUCCESS",
    RESOLUTION_FAILED: "RESOLUTION_FAILED",
    UNDER_REVIEW: "UNDER_REVIEW",
    APPROVED: "APPROVED",
    NOTICE_ISSUED: "NOTICE_ISSUED",
    NOTICE_SENT: "NOTICE_SENT",
    HEARING_SCHEDULED: "HEARING_SCHEDULED",
    HEARING_IN_PROGRESS: "HEARING_IN_PROGRESS",
    HEARING_COMPLETED: "HEARING_COMPLETED",
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

      case "DARKHAST_REJECTED":
        return <DarkhastRejectedView caseData={caseData} />;

      case "DARKHAST_APPROVED":
        // Show form if type is selected, otherwise show type selection
        if (caseData.type === "Talaq") {
          return <TalaqForm caseData={caseData} onUpdated={onUpdated} />;
        } else if (caseData.type === "Khula") {
          return <KhulaForm caseData={caseData} onUpdated={onUpdated} />;
        }
        return <CaseTypeSelection caseData={caseData} onUpdated={onUpdated} />;

      case "NEEDS_CORRECTION":
        // Show form for correction - editable
        if (caseData.type === "Talaq") {
          return <TalaqForm caseData={caseData} onUpdated={onUpdated} isEditable={true} />;
        } else if (caseData.type === "Khula") {
          return <KhulaForm caseData={caseData} onUpdated={onUpdated} isEditable={true} />;
        }
        // If no type selected, show type selection
        return <CaseTypeSelection caseData={caseData} onUpdated={onUpdated} />;

      case "APPROVED_FOR_CONTINUE":
        // Show form for continuation - editable
        if (caseData.type === "Talaq") {
          return <TalaqForm caseData={caseData} onUpdated={onUpdated} isEditable={true} />;
        } else if (caseData.type === "Khula") {
          return <KhulaForm caseData={caseData} onUpdated={onUpdated} isEditable={true} />;
        }
        // If no type selected, show type selection
        return <CaseTypeSelection caseData={caseData} onUpdated={onUpdated} />;

      case "UNDER_REVIEW":
        // Show form in read-only mode
        if (caseData.type === "Talaq") {
          return <TalaqForm caseData={caseData} onUpdated={onUpdated} isEditable={false} />;
        } else if (caseData.type === "Khula") {
          return <KhulaForm caseData={caseData} onUpdated={onUpdated} isEditable={false} />;
        }
        return <FormCompletedView caseData={caseData} />;

      case "APPROVED":
        // Show next step (Notice view or form if needed)
        if (caseData.type === "Talaq") {
          return <TalaqForm caseData={caseData} onUpdated={onUpdated} isEditable={false} />;
        } else if (caseData.type === "Khula") {
          return <KhulaForm caseData={caseData} onUpdated={onUpdated} isEditable={false} />;
        }
        return <NoticeView caseData={caseData} />;

      case "FORM_COMPLETED":
        return <FormCompletedView caseData={caseData} />;

      case "RESOLUTION_PENDING":
      case "RESOLUTION_SUCCESS":
      case "RESOLUTION_FAILED":
        // Show Resolution step, or Affidavit step if resolution failed
        if (caseData.status === "RESOLUTION_FAILED") {
          return <AffidavitStep caseData={caseData} onUpdated={onUpdated} />;
        }
        return <ResolutionStep caseData={caseData} onUpdated={onUpdated} />;

      case "NOTICE_ISSUED":
      case "NOTICE_SENT":
        return <NoticeView caseData={caseData} />;

      case "HEARING_SCHEDULED":
      case "HEARING_IN_PROGRESS":
      case "HEARING_COMPLETED":
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
      {/* Show guidance banner for specific statuses */}
      {(effectiveStatus === "NEEDS_CORRECTION" ||
        effectiveStatus === "APPROVED_FOR_CONTINUE" ||
        effectiveStatus === "UNDER_REVIEW" ||
        effectiveStatus === "APPROVED") && (
          <UserGuidanceBanner status={effectiveStatus} caseData={caseData} />
        )}
      {renderStepComponent()}

      {/* Persistent Hearing Banner: Show if hearing is scheduled but user is NOT on HearingStep (to avoid double render) */}
      {caseData.hearing && caseData.hearing.hearingDate && effectiveStatus !== "HEARING_SCHEDULED" && effectiveStatus !== "HEARING_IN_PROGRESS" && effectiveStatus !== "HEARING_COMPLETED" && (
        <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-6 shadow-sm">
          <div className="flex items-start gap-4">
            <div className="text-2xl">📅</div>
            <div>
              <h4 className="font-bold text-indigo-900 uppercase text-sm tracking-wide mb-1">Upcoming Hearing Scheduled</h4>
              <p className="text-indigo-700 text-xs">
                Date: <strong>{new Date(caseData.hearing.hearingDate).toLocaleDateString()}</strong> at <strong>{caseData.hearing.hearingTime}</strong>
                <br />
                Mode: {caseData.hearing.hearingMode === 'ONLINE' ? 'Online' : 'In-Person'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Documents Section - shown after Darkhast approval (driven by backend fileNumber) */}
      <DocumentsSection caseData={caseData} mode="user" onUpdate={onUpdated} />
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

function DarkhastRejectedView({ caseData }) {
  return (
    <div className="text-center py-8 sm:py-12">
      <div className="bg-rose-50 border-2 border-rose-300 rounded-lg p-6 sm:p-8 max-w-md mx-auto shadow-inner">
        <div className="text-4xl mb-4">⚠️</div>
        <h3 className="text-xl font-bold text-rose-900 mb-2 uppercase tracking-wide font-serif">
          Application Returned for Correction
        </h3>
        <p className="text-rose-800 leading-relaxed font-serif mb-4">
          Your application has been returned by the Qazi for correction. Please check your messages for details.
        </p>
        <p className="text-sm text-rose-700 italic">
          Please review the feedback and resubmit your application with the necessary corrections.
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

