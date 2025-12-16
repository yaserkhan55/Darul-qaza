import { useState } from "react";
import { useTranslation } from "react-i18next";
import { saveDivorceForm, transitionCase } from "../../api/case.api";
import SuccessMessage from "../SuccessMessage";

export default function KhulaForm({ caseId, onSuccess }) {
  const { t } = useTranslation();
  const [form, setForm] = useState({
    wifeName: "",
    husbandName: "",
    nikahDate: "",
    nikahPlace: "",
    reasonForKhula: "",
    compensationAmount: "",
    husbandConsent: "",
  });
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.wifeName || !form.husbandName || !form.nikahDate || !form.nikahPlace) {
      setError("Please fill all required personal information fields.");
      return;
    }

    if (!form.reasonForKhula.trim()) {
      setError("Reason for Khula is mandatory. Please provide a clear explanation.");
      return;
    }

    if (!form.compensationAmount.trim()) {
      setError("Compensation / Mahr return amount is mandatory for Khula.");
      return;
    }

    if (!form.husbandConsent) {
      setError("Please indicate husband's consent status.");
      return;
    }

    setLoading(true);
    try {
      await saveDivorceForm(caseId, {
        ...form,
        divorceType: "KHULA",
      });
      // Transition to FORM_COMPLETED
      await transitionCase(caseId, { nextStatus: "FORM_COMPLETED" });
      setShowSuccess(true);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to submit form. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSuccessClose = () => {
    setShowSuccess(false);
    onSuccess?.();
  };

  return (
    <>
      {showSuccess && (
        <SuccessMessage
          message="Khula form submitted successfully. Case status updated to FORM_COMPLETED."
          onClose={handleSuccessClose}
        />
      )}
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-5 sm:p-6 lg:p-8 max-w-2xl mx-auto">
        <div className="mb-6 space-y-2">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800">
            Khula Application Form
          </h2>
          <p className="text-sm sm:text-base text-gray-600">
            This form is for divorce initiated by the wife with mutual consent. Please provide accurate information with care and respect.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
              Reason for Khula <span className="text-red-500">*</span>
            </label>
            <textarea
              name="reasonForKhula"
              value={form.reasonForKhula}
              onChange={handleChange}
              required
              rows={5}
              className="w-full rounded-lg border border-gray-200 focus:ring-2 focus:ring-islamicGreen focus:border-transparent text-sm p-3"
              placeholder="Please provide a clear and respectful explanation of the reasons for seeking Khula..."
            />
            <p className="text-xs text-gray-500 mt-1">
              This information is required for the Qazi's review.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Compensation / Mahr Return Amount <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="compensationAmount"
              value={form.compensationAmount}
              onChange={handleChange}
              required
              className="w-full rounded-lg border border-gray-200 focus:ring-2 focus:ring-islamicGreen focus:border-transparent text-sm p-3"
              placeholder="e.g., 500,000 PKR"
            />
            <p className="text-xs text-gray-500 mt-1">
              Amount agreed to be returned to the husband as compensation for Khula.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Husband Consent <span className="text-red-500">*</span>
            </label>
            <select
              name="husbandConsent"
              value={form.husbandConsent}
              onChange={handleChange}
              required
              className="w-full rounded-lg border border-gray-200 focus:ring-2 focus:ring-islamicGreen focus:border-transparent text-sm p-3"
            >
              <option value="">Select consent status</option>
              <option value="YES">Yes - Husband has consented</option>
              <option value="NO">No - Husband has not consented</option>
              <option value="UNKNOWN">Unknown - Consent status unclear</option>
            </select>
            <p className="text-xs text-gray-500 mt-1">
              Indicate whether the husband has consented to the Khula proceeding.
            </p>
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
              {loading ? "Submitting..." : "Submit Khula Form"}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}

