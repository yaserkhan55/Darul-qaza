import CertificateView from "@/pages/CertificateView";
import StepProgress from "./StepProgress";
import ResolutionStep from "./case-steps/ResolutionStep";
import AgreementStep from "./case-steps/AgreementStep";
import AffidavitStep from "./case-steps/AffidavitStep";
import TalaqForm from "./case-steps/TalaqForm";
import KhulaForm from "./case-steps/KhulaForm";

export default function CaseSteps({ caseData, onUpdated }) {
  if (!caseData) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No case data available</p>
      </div>
    );
  }

  const rawStatus = caseData.status || "STARTED";

  // Map any backend/internal statuses into the strict frontend flow
  const STATUS_ADAPTER = {
    DRAFT: "STARTED",
    SUBMITTED: "FORM_COMPLETED",
    PENDING_REVIEW: "UNDER_REVIEW",
    PENDING_HUSBAND_CONSENT: "UNDER_REVIEW",
    ARBITRATION: "UNDER_REVIEW",
    COMPLETED: "APPROVED",
  };

  const effectiveStatus = STATUS_ADAPTER[rawStatus] || rawStatus;
  const caseType = caseData.type || caseData.divorceType || "TALAQ";

  // 🔑 IMPORTANT FIX:
  // Normalize status so forms work correctly when backend sends DRAFT
  const normalizedCaseData =
    rawStatus === "DRAFT"
      ? { ...caseData, status: "STARTED" }
      : caseData;

  const renderStepComponent = () => {
    switch (effectiveStatus) {
      // STARTED → TalaqForm OR KhulaForm
      case "STARTED":
        return caseType === "KHULA" ? (
          <KhulaForm caseData={normalizedCaseData} onUpdated={onUpdated} />
        ) : (
          <TalaqForm caseData={normalizedCaseData} onUpdated={onUpdated} />
        );

      // FORM_COMPLETED → ResolutionStep
      case "FORM_COMPLETED":
        return <ResolutionStep caseData={caseData} onUpdated={onUpdated} />;

      // RESOLUTION_SUCCESS / RESOLUTION_FAILED → AgreementStep
      case "RESOLUTION_SUCCESS":
      case "RESOLUTION_FAILED":
        return (
          <AgreementStep caseData={caseData} onUpdated={onUpdated} />
        );

      // AGREEMENT_DONE → AffidavitUploadStep
      case "AGREEMENT_DONE":
        return <AffidavitStep caseData={caseData} onUpdated={onUpdated} />;

      // AFFIDAVITS_DONE / UNDER_REVIEW → ReviewPendingScreen
      case "AFFIDAVITS_DONE":
      case "UNDER_REVIEW":
        return <ReviewPendingScreen />;

      // APPROVED → CertificateView
      case "APPROVED":
        return <CertificateView caseData={caseData} />;

      // REJECTED → RejectionReasonView
      case "REJECTED":
        return <RejectionReasonView caseData={caseData} />;

      default:
        return <UnexpectedStatusNotice rawStatus={rawStatus} />;
    }
  };

  return (
    <div className="w-full space-y-4">
      <StepProgress status={effectiveStatus} />
      {renderStepComponent()}
      <DocumentsSection caseData={caseData} />
    </div>
  );
}

function UnexpectedStatusNotice({ rawStatus }) {
  return (
    <div className="text-gray-700 text-sm sm:text-base p-4 sm:p-6 border border-amber-200 bg-amber-50 rounded-xl space-y-2">
      <p className="font-semibold text-amber-900">
        Complete previous step first
      </p>
      <p className="text-amber-800 text-sm">
        Your case is currently in an internal status that does not match the expected user steps.
        Please make sure you have fully completed the previous step or wait for the Qazi/admin to
        update your case.
      </p>
      <p className="text-xs text-amber-900/80">
        Internal status:&nbsp;
        <span className="font-mono bg-white/60 px-1.5 py-0.5 rounded">
          {rawStatus?.replace(/_/g, " ") || "UNKNOWN"}
        </span>
      </p>
    </div>
  );
}

function ReviewPendingScreen() {
  return (
    <div className="text-center py-8 sm:py-12">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 sm:p-8 max-w-md mx-auto">
        <div className="text-4xl mb-4">⏳</div>
        <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">
          Under Qazi Review
        </h3>
        <p className="text-sm sm:text-base text-gray-600">
          Your case is currently being reviewed by the Qazi. Please wait for the
          decision.
        </p>
      </div>
    </div>
  );
}

function RejectionReasonView({ caseData }) {
  const latestRejection =
    Array.isArray(caseData.history) &&
    [...caseData.history].reverse().find((h) => h.status === "REJECTED");

  const note = latestRejection?.note || caseData.rejectionReason;

  return (
    <div className="bg-red-50 border border-red-200 rounded-xl p-5 sm:p-6 space-y-3">
      <h3 className="text-lg sm:text-xl font-semibold text-red-800">
        Application Requires Attention
      </h3>
      <p className="text-sm sm:text-base text-red-700">
        Your case has been marked as REJECTED by the Qazi. Please review the
        feedback below and, if allowed, submit a corrected application.
      </p>
      {note ? (
        <div className="bg-white border border-red-200 rounded-lg p-3 text-sm text-red-800">
          <p className="font-semibold mb-1">Reason provided:</p>
          <p>{note}</p>
        </div>
      ) : (
        <p className="text-sm text-red-700">
          No specific reason was provided. Please contact support for details.
        </p>
      )}
    </div>
  );
}

function DocumentsSection({ caseData }) {
  const affidavits =
    caseData.affidavits ||
    caseData.details?.affidavits ||
    null;

  if (!affidavits) return null;

  const flattenDocs = () => {
    const items = [];

    const pushDoc = (key, label, value) => {
      if (!value) return;
      if (Array.isArray(value)) {
        value.forEach((v, idx) =>
          pushDoc(`${key}-${idx + 1}`, `${label} #${idx + 1}`, v)
        );
        return;
      }
      const url = typeof value === "string" ? value : value.url;
      if (!url) return;
      const filename =
        (typeof value === "object" && value.filename) ||
        url.split("/").pop();
      const uploadedAt =
        typeof value === "object" && value.uploadedAt
          ? new Date(value.uploadedAt)
          : null;
      items.push({ id: key, label, url, filename, uploadedAt });
    };

    pushDoc("applicantAffidavit", "Applicant affidavit", affidavits.applicantAffidavit);
    pushDoc("respondentAffidavit", "Respondent affidavit", affidavits.respondentAffidavit);
    pushDoc("witnessAffidavits", "Witness affidavit", affidavits.witnessAffidavits);
    pushDoc("nikahnama", "Nikahnama", affidavits.nikahnama);
    pushDoc("idProof", "ID proof", affidavits.idProof);

    return items;
  };

  const docs = flattenDocs();
  if (!docs.length) return null;

  return (
    <section className="mt-4 border-t border-gray-100 pt-4 space-y-2">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-800">
          Uploaded Documents
        </h3>
        <span className="text-[11px] text-gray-500">
          Stored securely via Cloudinary
        </span>
      </div>
      <div className="space-y-2">
        {docs.map((doc) => (
          <a
            key={doc.id}
            href={doc.url}
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-between text-xs text-islamicGreen hover:text-teal-700 underline"
          >
            <span>{doc.label}</span>
            <span className="ml-2 flex-1 truncate text-gray-600">
              {doc.filename || doc.url}
            </span>
            {doc.uploadedAt && (
              <span className="ml-2 text-[11px] text-gray-500">
                {doc.uploadedAt.toLocaleDateString()}
              </span>
            )}
          </a>
        ))}
      </div>
    </section>
  );
}
