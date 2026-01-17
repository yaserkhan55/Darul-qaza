import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { saveDivorceForm } from "../api/case.api";
import SuccessMessage from "../components/SuccessMessage";
import TalaqForm from "../components/case-steps/TalaqForm";
import KhulaForm from "../components/case-steps/KhulaForm";
import { getMyCases } from "../api/case.api";

export default function DivorceForm({ caseId, caseType, onSuccess }) {
  const { t } = useTranslation();
  const [detectedType, setDetectedType] = useState(caseType || null);
  const [loading, setLoading] = useState(true);

  // If caseType not provided, fetch from API
  useEffect(() => {
    const fetchCaseType = async () => {
      if (detectedType) {
        setLoading(false);
        return;
      }
      try {
        const cases = await getMyCases();
        const currentCase = cases.find((c) => c._id === caseId);
        if (currentCase) {
          setDetectedType(currentCase.type || currentCase.divorceType);
        }
      } catch (err) {
        console.error("Failed to fetch case type", err);
      } finally {
        setLoading(false);
      }
    };
    fetchCaseType();
  }, [caseId, detectedType]);

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-8 text-center">
        <p className="text-gray-600">Loading form...</p>
      </div>
    );
  }

  // Render appropriate form based on type
  if (detectedType === "TALAQ") {
    return <TalaqForm caseId={caseId} onSuccess={onSuccess} />;
  }

  if (detectedType === "KHULA") {
    return <KhulaForm caseId={caseId} onSuccess={onSuccess} />;
  }

  // Fallback to generic form if type unknown (legacy support)
  return <GenericDivorceForm caseId={caseId} onSuccess={onSuccess} />;
}

function GenericDivorceForm({ caseId, onSuccess }) {
  const { t } = useTranslation();
  const [form, setForm] = useState({
    husbandName: "",
    wifeName: "",
    cnic: "",
    marriageDate: "",
    address: "",
  });

  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const STEPS = [
    t("form.divorceForm.steps.personal"),
    t("form.divorceForm.steps.marriage"),
    t("form.divorceForm.steps.case"),
    t("form.divorceForm.steps.review"),
  ];

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const nextStep = () => {
    const stepsLength = STEPS.length;
    if (step < stepsLength - 1) setStep(step + 1);
  };

  const prevStep = () => {
    if (step > 0) setStep(step - 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await saveDivorceForm(caseId, form);
      setShowSuccess(true);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to submit form");
    } finally {
      setLoading(false);
    }
  };

  const handleSuccessClose = () => {
    setShowSuccess(false);
    onSuccess();
  };

  const isReviewStep = step === STEPS.length - 1;

  return (
    <>
      {showSuccess && (
        <SuccessMessage
          message={t("success.caseSubmitted")}
          onClose={handleSuccessClose}
        />
      )}
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-5 sm:p-6 lg:p-8 max-w-2xl mx-auto">
        <div className="mb-6 space-y-2">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800">
            {t("form.divorceForm.title")}
          </h2>
          <p className="text-sm sm:text-base text-gray-600">
            {t("form.divorceForm.subtitle")}
          </p>
          <div className="mt-4">
            <p className="text-xs sm:text-sm font-medium text-islamicGreen mb-1">
              {t("form.divorceForm.step", { current: step + 1, total: STEPS.length })}: {STEPS[step]}
            </p>
            <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-islamicGreen transition-all duration-300"
                style={{ width: `${((step + 1) / STEPS.length) * 100}%` }}
              />
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
          {step === 0 && (
            <div className="space-y-4 sm:space-y-5">
              <Input
                label={t("form.divorceForm.fields.husbandName")}
                name="husbandName"
                value={form.husbandName}
                onChange={handleChange}
              />
              <Input
                label={t("form.divorceForm.fields.wifeName")}
                name="wifeName"
                value={form.wifeName}
                onChange={handleChange}
              />
              <Input
                label={t("form.divorceForm.fields.cnic")}
                name="cnic"
                placeholder="35201-XXXXXXX-X"
                value={form.cnic}
                onChange={handleChange}
              />
            </div>
          )}

          {step === 1 && (
            <div className="space-y-4 sm:space-y-5">
              <Input
                label={t("form.divorceForm.fields.marriageDate")}
                type="date"
                name="marriageDate"
                value={form.marriageDate}
                onChange={handleChange}
              />
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4 sm:space-y-5">
              <Textarea
                label={t("form.divorceForm.fields.address")}
                name="address"
                value={form.address}
                onChange={handleChange}
              />
            </div>
          )}

          {isReviewStep && (
            <div className="space-y-4 sm:space-y-5">
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-sm sm:text-base text-gray-700 space-y-2">
                <h3 className="font-semibold text-gray-800 mb-1">
                  {t("form.divorceForm.reviewTitle")}
                </h3>
                <p>
                  {t("form.divorceForm.reviewText")}
                </p>
              </div>
              <div className="space-y-2 text-sm sm:text-base">
                <ReviewRow label={t("form.divorceForm.fields.husbandName")} value={form.husbandName} />
                <ReviewRow label={t("form.divorceForm.fields.wifeName")} value={form.wifeName} />
                <ReviewRow label={t("form.divorceForm.fields.cnic")} value={form.cnic} />
                <ReviewRow
                  label={t("form.divorceForm.fields.marriageDate")}
                  value={form.marriageDate ? new Date(form.marriageDate).toLocaleDateString() : ""}
                />
                <ReviewRow label={t("form.divorceForm.fields.address")} value={form.address} />
              </div>
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs sm:text-sm text-amber-800">
                {t("legalDisclaimer.text")}
              </div>
            </div>
          )}

          <div className="flex flex-col sm:flex-row justify-between gap-3 pt-2">
            <button
              type="button"
              onClick={prevStep}
              disabled={step === 0}
              className="w-full sm:w-auto px-4 py-2.5 rounded-lg border border-gray-300 text-sm sm:text-base text-gray-700 hover:bg-gray-50 disabled:opacity-40"
            >
              {t("common.previous")}
            </button>

            {!isReviewStep && (
              <button
                type="button"
                onClick={nextStep}
                className="w-full sm:w-auto bg-islamicGreen text-white px-5 py-2.5 rounded-lg text-sm sm:text-base font-semibold shadow-md hover:bg-teal-700 transition-all"
              >
                {t("common.next")}
              </button>
            )}

            {isReviewStep && (
              <button
                type="submit"
                disabled={loading}
                className="w-full sm:w-auto bg-islamicGreen text-white px-5 py-2.5 rounded-lg text-sm sm:text-base font-semibold shadow-md hover:bg-teal-700 transition-all disabled:opacity-50"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="animate-spin">⏳</span>
                    {t("form.divorceForm.submitting")}
                  </span>
                ) : (
                  t("form.divorceForm.submitButton")
                )}
              </button>
            )}
          </div>
        </form>
      </div>
    </>
  );
}

/* ---------- Small Reusable Inputs ---------- */

function Input({ label, ...props }) {
  return (
    <div>
      <label className="block text-sm sm:text-base font-semibold text-gray-700 mb-2">
        {label} <span className="text-red-500">*</span>
      </label>
      <input
        {...props}
        required
        className="w-full border-2 border-gray-200 rounded-lg px-4 py-2.5 sm:py-3 text-sm sm:text-base focus:outline-none focus:border-islamicGreen focus:ring-2 focus:ring-islamicGreen/20 transition-all duration-200 hover:border-gray-300"
      />
    </div>
  );
}

function Textarea({ label, ...props }) {
  return (
    <div>
      <label className="block text-sm sm:text-base font-semibold text-gray-700 mb-2">
        {label} <span className="text-red-500">*</span>
      </label>
      <textarea
        {...props}
        required
        rows="4"
        className="w-full border-2 border-gray-200 rounded-lg px-4 py-2.5 sm:py-3 text-sm sm:text-base focus:outline-none focus:border-islamicGreen focus:ring-2 focus:ring-islamicGreen/20 transition-all duration-200 hover:border-gray-300 resize-y"
      />
    </div>
  );
}

function ReviewRow({ label, value }) {
  if (!value) return null;
  return (
    <div className="flex justify-between gap-4 border-b border-gray-100 pb-1">
      <span className="text-gray-500 text-xs sm:text-sm">{label}</span>
      <span className="text-gray-800 text-xs sm:text-sm font-medium text-right break-words max-w-[60%]">
        {value}
      </span>
    </div>
  );
}

