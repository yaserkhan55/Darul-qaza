import DivorceForm from "@/pages/DivorceForm";
import CertificateView from "@/pages/CertificateView";
import StepProgress from "./StepProgress";
import ResolutionStep from "./case-steps/ResolutionStep";
import AgreementStep from "./case-steps/AgreementStep";
import AffidavitStep from "./case-steps/AffidavitStep";

export default function CaseSteps({ caseData, onUpdated }) {
  if (!caseData) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No case data available</p>
      </div>
    );
  }

  const renderStepForm = () => {
    switch (caseData.status) {
      // New workflow: STARTED/DRAFT -> application
      case "STARTED":
      case "DRAFT":
        return <DivorceForm caseId={caseData._id} caseType={caseData.type || caseData.divorceType} onSuccess={onUpdated} />;

      case "FORM_COMPLETED":
        return <ResolutionStep caseId={caseData._id} onUpdated={onUpdated} />;

      case "RESOLUTION_SUCCESS":
      case "RESOLUTION_FAILED":
        return <AgreementStep caseId={caseData._id} caseType={caseData.type || caseData.divorceType} onUpdated={onUpdated} />;

      case "AGREEMENT_DONE":
        return <AffidavitStep caseId={caseData._id} onUpdated={onUpdated} />;

      case "AFFIDAVITS_DONE":
      case "UNDER_REVIEW":
        return (
          <div className="text-center py-8 sm:py-12">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 sm:p-8 max-w-md mx-auto">
              <div className="text-4xl mb-4">⏳</div>
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">
                Under Qazi Review
              </h3>
              <p className="text-sm sm:text-base text-gray-600">
                Your case is currently being reviewed by the Qazi. 
                Please wait for the decision.
              </p>
            </div>
          </div>
        );

      case "APPROVED":
        return <CertificateView caseData={caseData} />;

      default:
        return (
          <div className="text-gray-600 text-sm sm:text-base p-4 sm:p-6">
            <p className="font-medium mb-2">Current Status:</p>
            <p className="text-lg sm:text-xl">{caseData.status?.replace(/_/g, " ")}</p>
          </div>
        );
    }
  };

  return (
    <div className="w-full">
      <StepProgress status={caseData.status} />
      {renderStepForm()}
    </div>
  );
}
