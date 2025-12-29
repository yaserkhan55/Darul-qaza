import { useState, useEffect } from "react";
import { saveFormData } from "../../api/case.api";

export default function KhulaForm({ caseData, onUpdated }) {
  const effectiveCaseId = caseData?._id;

  const [form, setForm] = useState({
    wifeName: caseData?.darkhast?.wifeName || "",
    husbandName: caseData?.darkhast?.husbandName || "",
    dateOfNikah: caseData?.darkhast?.nikahDate ? new Date(caseData.darkhast.nikahDate).toISOString().split('T')[0] : "",
    reasonForKhula: caseData?.darkhast?.khulaReason || "",
    compensationMahrReturn: caseData?.darkhast?.mahrReturn || "",
    consentConfirmation: false,
    khulaDeclaration: "I seek Khula in accordance with Islamic principles"
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Load existing form data if available
  useEffect(() => {
    if (caseData?.darkhast) {
      const darkhast = caseData.darkhast;
      setForm(prev => ({
        ...prev,
        wifeName: darkhast.wifeName || prev.wifeName,
        husbandName: darkhast.husbandName || prev.husbandName,
        dateOfNikah: darkhast.nikahDate ? new Date(darkhast.nikahDate).toISOString().split('T')[0] : prev.dateOfNikah,
        reasonForKhula: darkhast.khulaReason || prev.reasonForKhula,
        compensationMahrReturn: darkhast.mahrReturn || prev.compensationMahrReturn,
        consentConfirmation: darkhast.consentConfirmation || false,
        khulaDeclaration: darkhast.khulaDeclaration || prev.khulaDeclaration
      }));
    }
  }, [caseData]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Validation
    if (!form.wifeName.trim()) {
      setError("Wife full name is required");
      return;
    }
    if (!form.husbandName.trim()) {
      setError("Husband full name is required");
      return;
    }
    if (!form.dateOfNikah) {
      setError("Date of Nikah is required");
      return;
    }
    if (!form.reasonForKhula.trim()) {
      setError("Reason for Khula is required");
      return;
    }
    if (!form.compensationMahrReturn.trim()) {
      setError("Compensation / Mahr return details are required");
      return;
    }
    if (!form.consentConfirmation) {
      setError("Please confirm your consent");
      return;
    }

    setLoading(true);
    try {
      await saveFormData(effectiveCaseId, {
        wifeName: form.wifeName.trim(),
        husbandName: form.husbandName.trim(),
        nikahDate: form.dateOfNikah,
        reasonForKhula: form.reasonForKhula.trim(),
        compensationMahrReturn: form.compensationMahrReturn.trim(),
        consentConfirmation: form.consentConfirmation,
        khulaDeclaration: form.khulaDeclaration
      });
      onUpdated?.();
    } catch (err) {
      setError(err?.response?.data?.message || "Unable to save form. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6 sm:p-8 max-w-3xl mx-auto">
      <div className="mb-6 space-y-2">
        <h2 className="text-2xl font-bold text-gray-900">Khula Form (Wife-initiated)</h2>
        <p className="text-sm text-gray-600">
          Please fill out all required fields to proceed with your Khula application.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Wife Full Name */}
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
            className="w-full rounded-lg border border-gray-300 focus:ring-2 focus:ring-islamicGreen focus:border-transparent px-4 py-2 text-sm"
            placeholder="Enter wife's full name"
          />
        </div>

        {/* Husband Full Name */}
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
            className="w-full rounded-lg border border-gray-300 focus:ring-2 focus:ring-islamicGreen focus:border-transparent px-4 py-2 text-sm"
            placeholder="Enter husband's full name"
          />
        </div>

        {/* Date of Nikah */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Date of Nikah <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            name="dateOfNikah"
            value={form.dateOfNikah}
            onChange={handleChange}
            required
            max={new Date().toISOString().split('T')[0]}
            className="w-full rounded-lg border border-gray-300 focus:ring-2 focus:ring-islamicGreen focus:border-transparent px-4 py-2 text-sm"
          />
        </div>

        {/* Reason for Khula */}
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
            className="w-full rounded-lg border border-gray-300 focus:ring-2 focus:ring-islamicGreen focus:border-transparent px-4 py-2 text-sm"
            placeholder="Please provide detailed reasons for seeking Khula..."
          />
          <p className="text-xs text-gray-500 mt-1">
            Please provide a clear and detailed explanation of your reasons for seeking Khula.
          </p>
        </div>

        {/* Compensation / Mahr Return Details */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Compensation / Mahr Return Details <span className="text-red-500">*</span>
          </label>
          <textarea
            name="compensationMahrReturn"
            value={form.compensationMahrReturn}
            onChange={handleChange}
            required
            rows={4}
            className="w-full rounded-lg border border-gray-300 focus:ring-2 focus:ring-islamicGreen focus:border-transparent px-4 py-2 text-sm"
            placeholder="Please provide details about compensation or Mahr return arrangements..."
          />
          <p className="text-xs text-gray-500 mt-1">
            Please specify the compensation amount or Mahr return details as agreed upon.
          </p>
        </div>

        {/* Consent Confirmation */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              name="consentConfirmation"
              checked={form.consentConfirmation}
              onChange={handleChange}
              required
              className="mt-1 h-5 w-5 rounded border-gray-300 text-islamicGreen focus:ring-islamicGreen"
            />
            <div className="flex-1">
              <span className="block text-sm font-semibold text-gray-900 mb-1">
                Consent Confirmation <span className="text-red-500">*</span>
              </span>
              <p className="text-xs text-gray-700">
                I confirm that I have made a deliberate and considered decision to seek Khula, and I understand the implications as per Islamic law.
              </p>
            </div>
          </label>
        </div>

        {/* Declaration */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <p className="text-sm text-gray-700 font-medium italic">
            "{form.khulaDeclaration}"
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        <div className="flex justify-end gap-3 pt-4 border-t">
          <button
            type="submit"
            disabled={loading}
            className="bg-islamicGreen text-white px-8 py-3 rounded-lg text-sm font-semibold shadow-sm hover:bg-teal-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? "Submitting..." : "Submit Form"}
          </button>
        </div>
      </form>
    </div>
  );
}
