import { useState } from "react";
import { useTranslation } from "react-i18next";
import { saveDivorceForm, transitionCase } from "../../api/case.api";
import SuccessMessage from "../SuccessMessage";

export default function TalaqForm({ caseData, caseId, onSuccess, onUpdated }) {
  const { t } = useTranslation();
  const [form, setForm] = useState({
    husbandName: "",
    wifeName: "",
    nikahDate: "",
    nikahPlace: "",
    mahrAmount: "",
    talaqIntention: "",
    reconciliationStatus: "",
  });
  const [intentConfirmed, setIntentConfirmed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const effectiveCaseId = caseData?._id || caseId;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.husbandName || !form.wifeName || !form.nikahDate || !form.nikahPlace || !form.mahrAmount) {
      setError("Please fill all required fields.");
      return;
    }

    if (!intentConfirmed) {
      setError("You must confirm your intention to proceed with Talaq.");
      return;
    }

    if (!form.talaqIntention.trim()) {
      setError("Please provide your Talaq intention declaration.");
      return;
    }

    setLoading(true);
    try {
      await saveDivorceForm(effectiveCaseId, {
        ...form,
        divorceType: "TALAQ",
        intentConfirmed: true,
      });
      // Transition to FORM_COMPLETED
      await transitionCase(effectiveCaseId, { nextStatus: "FORM_COMPLETED" });
      setShowSuccess(true);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to submit form. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSuccessClose = () => {
    setShowSuccess(false);
    if (onUpdated) {
      onUpdated();
    } else {
      onSuccess?.();
    }
  };

  return (
    <>
      {showSuccess && (
        <SuccessMessage
          message="Talaq form submitted successfully. Case status updated to FORM_COMPLETED."
          onClose={handleSuccessClose}
        />
      )}
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-5 sm:p-6 lg:p-8 max-w-2xl mx-auto">
        <div className="mb-6 space-y-2">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800">
            Talaq Application Form
          </h2>
          <p className="text-sm sm:text-base text-gray-600">
            This form is for divorce initiated by the husband according to Islamic law. Please provide accurate information with care and respect.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Husband Full Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="husbandName"
                value={form.husbandName}
                onChange={handleChange}
                required
                className="w-full rounded-lg border border-gray-200 focus:ring-2 focus:ring-islamicGreen focus:border-transparent text-sm p-3"
                placeholder="Enter husband's full name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Wife Full Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="wifeName"
                value={form.wifeName}
                onChange={handleChange}
                required
                className="w-full rounded-lg border border-gray-200 focus:ring-2 focus:ring-islamicGreen focus:border-transparent text-sm p-3"
                placeholder="Enter wife's full name"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nikah Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="nikahDate"
                value={form.nikahDate}
                onChange={handleChange}
                required
                className="w-full rounded-lg border border-gray-200 focus:ring-2 focus:ring-islamicGreen focus:border-transparent text-sm p-3"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nikah Place <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="nikahPlace"
                value={form.nikahPlace}
                onChange={handleChange}
                required
                className="w-full rounded-lg border border-gray-200 focus:ring-2 focus:ring-islamicGreen focus:border-transparent text-sm p-3"
                placeholder="City, Country"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Mahr Amount <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="mahrAmount"
              value={form.mahrAmount}
              onChange={handleChange}
              required
              className="w-full rounded-lg border border-gray-200 focus:ring-2 focus:ring-islamicGreen focus:border-transparent text-sm p-3"
              placeholder="e.g., 500,000 PKR"
            />
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={intentConfirmed}
                onChange={(e) => setIntentConfirmed(e.target.checked)}
                className="mt-1 h-4 w-4 rounded border-gray-300 text-islamicGreen focus:ring-islamicGreen"
                required
              />
              <div className="flex-1">
                <span className="text-sm font-semibold text-gray-800 block mb-1">
                  Talaq Intention Confirmation <span className="text-red-500">*</span>
                </span>
                <span className="text-xs text-gray-600">
                  I confirm that I understand the gravity of Talaq and wish to proceed with this divorce proceeding.
                </span>
              </div>
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Talaq Intention Declaration <span className="text-red-500">*</span>
            </label>
            <textarea
              name="talaqIntention"
              value={form.talaqIntention}
              onChange={handleChange}
              required
              rows={4}
              className="w-full rounded-lg border border-gray-200 focus:ring-2 focus:ring-islamicGreen focus:border-transparent text-sm p-3"
              placeholder="Please state your intention for Talaq clearly and respectfully..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Current Reconciliation Status (Optional)
            </label>
            <textarea
              name="reconciliationStatus"
              value={form.reconciliationStatus}
              onChange={handleChange}
              rows={3}
              className="w-full rounded-lg border border-gray-200 focus:ring-2 focus:ring-islamicGreen focus:border-transparent text-sm p-3"
              placeholder="Any notes about current reconciliation attempts or status..."
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded text-sm">
              {error}
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4 border-t">
            <button
              type="submit"
              disabled={loading}
              className="bg-islamicGreen text-white px-6 py-3 rounded-lg text-sm font-semibold shadow-sm hover:bg-teal-700 disabled:opacity-60 transition"
            >
              {loading ? "Submitting..." : "Submit Talaq Form"}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}

