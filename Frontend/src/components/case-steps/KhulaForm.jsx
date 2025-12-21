import { useState } from "react";
import { useTranslation } from "react-i18next";
import { saveDivorceForm, transitionCase } from "../../api/case.api";
import SuccessMessage from "../SuccessMessage";

export default function KhulaForm({ caseData, caseId, onSuccess, onUpdated }) {
  const { t } = useTranslation();
  const [form, setForm] = useState({
    wifeName: "",
    wifeCnic: "",
    husbandName: "",
    husbandCnic: "",
    nikahDate: "",
    nikahPlace: "",
    nikahRegistrationNo: "",
    numChildren: "0",
    reasonForKhula: "",
    compensationAmount: "",
    husbandConsent: "",
    witness1Name: "",
    witness1Id: "",
    witness2Name: "",
    witness2Id: "",
  });
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

    // Basic required fields validation
    if (
      !form.wifeName ||
      !form.wifeCnic ||
      !form.husbandName ||
      !form.nikahDate ||
      !form.nikahPlace ||
      !form.reasonForKhula ||
      !form.compensationAmount ||
      !form.husbandConsent
    ) {
      setError("Please fill all required fields marked with *.");
      return;
    }

    if (!form.witness1Name || !form.witness2Name) {
      setError("Two witnesses are required for the Khula application.");
      return;
    }

    setLoading(true);
    try {
      await saveDivorceForm(effectiveCaseId, {
        ...form,
        divorceType: "KHULA",
      });
      // Transition to FORM_COMPLETED
      await transitionCase(effectiveCaseId, { nextStatus: "FORM_COMPLETED" });
      setShowSuccess(true);
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to submit form. Please try again."
      );
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
          message="Khula form submitted successfully. Case status updated to FORM_COMPLETED."
          onClose={handleSuccessClose}
        />
      )}
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-5 sm:p-6 lg:p-8 max-w-3xl mx-auto">
        <div className="mb-6 space-y-2">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800">
            Khula Application Form
          </h2>
          <p className="text-sm sm:text-base text-gray-600">
            This form is for divorce initiated by the wife with mutual consent. Please provide accurate information with care and respect.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* SECTION: Personal Details */}
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-100 space-y-4">
            <h3 className="font-semibold text-gray-900 border-b pb-2">
              Personal Details
            </h3>
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
                  Wife CNIC / Aadhar <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="wifeCnic"
                  value={form.wifeCnic}
                  onChange={handleChange}
                  required
                  className="w-full rounded-lg border border-gray-200 focus:ring-2 focus:ring-islamicGreen focus:border-transparent text-sm p-3"
                  placeholder="ID Number"
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
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Husband CNIC / Aadhar (Optional)
                </label>
                <input
                  type="text"
                  name="husbandCnic"
                  value={form.husbandCnic}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-gray-200 focus:ring-2 focus:ring-islamicGreen focus:border-transparent text-sm p-3"
                  placeholder="ID Number if available"
                />
              </div>
            </div>
          </div>

          {/* SECTION: Marriage Details */}
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-100 space-y-4">
            <h3 className="font-semibold text-gray-900 border-b pb-2">
              Marriage Details
            </h3>
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

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nikah Registration No. (Optional)
                </label>
                <input
                  type="text"
                  name="nikahRegistrationNo"
                  value={form.nikahRegistrationNo}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-gray-200 focus:ring-2 focus:ring-islamicGreen focus:border-transparent text-sm p-3"
                  placeholder="Registration / Certificate No"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Number of Children
                </label>
                <input
                  type="number"
                  name="numChildren"
                  min="0"
                  value={form.numChildren}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-gray-200 focus:ring-2 focus:ring-islamicGreen focus:border-transparent text-sm p-3"
                />
              </div>
            </div>
          </div>

          {/* SECTION: Khula Details */}
          <div className="space-y-4">
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
                placeholder="Please provide a clear and respectful explanation..."
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                  placeholder="e.g., 500,000 INR"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Amount agreed to be returned to the husband.
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
                </select>
              </div>
            </div>
          </div>

          {/* SECTION: Witness Details */}
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-100 space-y-4">
            <h3 className="font-semibold text-gray-900 border-b pb-2">
              Witnesses
            </h3>
            <p className="text-xs text-gray-500 -mt-2">Two witnesses are required.</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Witness 1 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Witness 1 Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="witness1Name"
                  value={form.witness1Name}
                  onChange={handleChange}
                  required
                  className="w-full rounded-lg border border-gray-200 focus:ring-2 focus:ring-islamicGreen focus:border-transparent text-sm p-3"
                  placeholder="Name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Witness 1 ID/Contact <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="witness1Id"
                  value={form.witness1Id}
                  onChange={handleChange}
                  required
                  className="w-full rounded-lg border border-gray-200 focus:ring-2 focus:ring-islamicGreen focus:border-transparent text-sm p-3"
                  placeholder="ID No or Phone"
                />
              </div>

              {/* Witness 2 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Witness 2 Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="witness2Name"
                  value={form.witness2Name}
                  onChange={handleChange}
                  required
                  className="w-full rounded-lg border border-gray-200 focus:ring-2 focus:ring-islamicGreen focus:border-transparent text-sm p-3"
                  placeholder="Name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Witness 2 ID/Contact <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="witness2Id"
                  value={form.witness2Id}
                  onChange={handleChange}
                  required
                  className="w-full rounded-lg border border-gray-200 focus:ring-2 focus:ring-islamicGreen focus:border-transparent text-sm p-3"
                  placeholder="ID No or Phone"
                />
              </div>
            </div>
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
              {loading ? "Submitting..." : "Submit Khula Application"}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}

