import { useState } from "react";
import { saveDivorceForm } from "../api/case.api";
import SuccessMessage from "../components/SuccessMessage";

const DISCLAIMER_TEXT =
  "This platform facilitates case submission only. Final decisions are made by qualified Islamic authorities in accordance with Islamic law.";

const STEPS = [
  "Personal Details / ذاتی معلومات",
  "Marriage Details / نکاح کی معلومات",
  "Case Details / کیس کی تفصیل",
  "Review & Submit / نظر ثانی اور جمع کریں",
];

export default function DivorceForm({ caseId, onSuccess }) {
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

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const nextStep = () => {
    if (step < STEPS.length - 1) setStep(step + 1);
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
          message="Your case has been submitted for scholarly review. Qualified Islamic authorities will now review your application in detail."
          onClose={handleSuccessClose}
        />
      )}
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-5 sm:p-6 lg:p-8 max-w-2xl mx-auto">
        <div className="mb-6 space-y-2">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800">
            Divorce Application Form / خلع/طلاق فارم
          </h2>
          <p className="text-sm sm:text-base text-gray-600">
            Please provide accurate information with calm and care. This is a formal Islamic judicial
            process, not an instant decision. / براہِ کرم سکون اور ذمہ داری کے ساتھ درست معلومات درج کریں۔
          </p>
          <div className="mt-4">
            <p className="text-xs sm:text-sm font-medium text-islamicGreen mb-1">
              Step {step + 1} of {STEPS.length}: {STEPS[step]}
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
                label="Husband Name / شوہر کا نام"
                name="husbandName"
                value={form.husbandName}
                onChange={handleChange}
              />
              <Input
                label="Wife Name / بیوی کا نام"
                name="wifeName"
                value={form.wifeName}
                onChange={handleChange}
              />
              <Input
                label="CNIC Number / شناختی کارڈ نمبر"
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
                label="Marriage Date / نکاح کی تاریخ"
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
                label="Residential Address / رہائشی پتہ"
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
                  Review Your Case / اپنے کیس کا جائزہ لیں
                </h3>
                <p>
                  Please carefully review all details below before submitting. This will be sent to
                  qualified Islamic scholars for formal review. / براہِ کرم نیچے دی گئی تمام معلومات غور سے
                  دیکھیں، پھر ہی کیس جمع کریں۔
                </p>
              </div>
              <div className="space-y-2 text-sm sm:text-base">
                <ReviewRow label="Husband Name" value={form.husbandName} />
                <ReviewRow label="Wife Name" value={form.wifeName} />
                <ReviewRow label="CNIC" value={form.cnic} />
                <ReviewRow
                  label="Marriage Date"
                  value={form.marriageDate ? new Date(form.marriageDate).toLocaleDateString() : ""}
                />
                <ReviewRow label="Address" value={form.address} />
              </div>
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs sm:text-sm text-amber-800">
                {DISCLAIMER_TEXT}
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
              Previous / پچھلا
            </button>

            {!isReviewStep && (
              <button
                type="button"
                onClick={nextStep}
                className="w-full sm:w-auto bg-islamicGreen text-white px-5 py-2.5 rounded-lg text-sm sm:text-base font-semibold shadow-md hover:bg-teal-700 transition-all"
              >
                Next Step / اگلا مرحلہ
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
                    Submitting...
                  </span>
                ) : (
                  "Submit Case for Scholarly Review / علماء کے جائزے کیلئے کیس جمع کریں"
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

