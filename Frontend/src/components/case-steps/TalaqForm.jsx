import { useState, useEffect } from "react";
import { saveFormData } from "../../api/case.api";
import UserGuidanceBanner from "../UserGuidanceBanner";

function QaziMessageBanner({ adminNotes }) {
  if (!adminNotes?.reasonForCorrection && !adminNotes?.guidanceForNextStep) return null;

  return (
    <div className="mb-4 rounded-xl border border-emerald-100 bg-emerald-50/60 p-4">
      <p className="text-[11px] font-black uppercase tracking-[0.18em] text-emerald-700 mb-2">
        Message from Qazi
      </p>
      {adminNotes.reasonForCorrection && (
        <div className="mb-2">
          <p className="text-[11px] font-semibold text-emerald-800">
            Reason for correction
          </p>
          <p className="text-xs text-emerald-900 leading-relaxed">
            {adminNotes.reasonForCorrection}
          </p>
        </div>
      )}
      {adminNotes.guidanceForNextStep && (
        <div>
          <p className="text-[11px] font-semibold text-emerald-800">
            Guidance for next step
          </p>
          <p className="text-xs text-emerald-900 leading-relaxed">
            {adminNotes.guidanceForNextStep}
          </p>
        </div>
      )}
      <p className="mt-3 text-[10px] text-emerald-700/80 italic">
        Final decisions are issued by qualified Islamic authorities.
      </p>
    </div>
  );
}

export default function TalaqForm({ caseData, onUpdated, isEditable = true }) {
  const effectiveCaseId = caseData?._id;

  const [form, setForm] = useState({
    husbandName: caseData?.darkhast?.husbandName || "",
    wifeName: caseData?.darkhast?.wifeName || "",
    dateOfNikah: caseData?.darkhast?.nikahDate ? new Date(caseData.darkhast.nikahDate).toISOString().split('T')[0] : "",
    placeOfNikah: caseData?.darkhast?.nikahPlace || "",
    talaqIntentionConfirmed: false,
    talaqCount: "",
    iddatAcknowledgement: false,
    talaqDeclaration: "I declare this Talaq in accordance with Islamic law"
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Load existing form data if available
  useEffect(() => {
    if (caseData?.darkhast) {
      const darkhast = caseData.darkhast;
      setForm(prev => ({
        ...prev,
        husbandName: darkhast.husbandName || prev.husbandName,
        wifeName: darkhast.wifeName || prev.wifeName,
        dateOfNikah: darkhast.nikahDate ? new Date(darkhast.nikahDate).toISOString().split('T')[0] : prev.dateOfNikah,
        placeOfNikah: darkhast.nikahPlace || prev.placeOfNikah,
        talaqCount: darkhast.talaqCount?.toString() || prev.talaqCount,
        talaqIntentionConfirmed: darkhast.talaqIntentionConfirmed || false,
        iddatAcknowledgement: darkhast.iddatAcknowledgement || false,
        talaqDeclaration: darkhast.talaqDeclaration || prev.talaqDeclaration
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
    if (!form.husbandName.trim()) {
      setError("Husband full name is required");
      return;
    }
    if (!form.wifeName.trim()) {
      setError("Wife full name is required");
      return;
    }
    if (!form.dateOfNikah) {
      setError("Date of Nikah is required");
      return;
    }
    if (!form.placeOfNikah.trim()) {
      setError("Place of Nikah is required");
      return;
    }
    if (!form.talaqIntentionConfirmed) {
      setError("Please confirm your Talaq intention");
      return;
    }
    if (!form.talaqCount) {
      setError("Please select the Talaq pronouncement count");
      return;
    }
    if (!form.iddatAcknowledgement) {
      setError("Please acknowledge the Iddat period");
      return;
    }

    setLoading(true);
    try {
      await saveFormData(effectiveCaseId, {
        husbandName: form.husbandName.trim(),
        wifeName: form.wifeName.trim(),
        nikahDate: form.dateOfNikah,
        nikahPlace: form.placeOfNikah.trim(),
        talaqIntentionConfirmed: form.talaqIntentionConfirmed,
        talaqCount: parseInt(form.talaqCount),
        iddatAcknowledgement: form.iddatAcknowledgement,
        talaqDeclaration: form.talaqDeclaration
      });
      onUpdated?.();
    } catch (err) {
      setError(err?.response?.data?.message || "Unable to save form. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const isReadOnly = !isEditable || caseData?.status === "UNDER_REVIEW" || caseData?.status === "APPROVED";

  return (
    <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6 sm:p-8 max-w-3xl mx-auto">
      {/* Structured guidance from Qazi */}
      {caseData?.adminNotes && <QaziMessageBanner adminNotes={caseData.adminNotes} />}

      {/* Show status-based helper text */}
      {(caseData?.status === "NEEDS_CORRECTION" ||
        caseData?.status === "APPROVED_FOR_CONTINUE" ||
        caseData?.status === "UNDER_REVIEW" ||
        caseData?.status === "APPROVED") && (
        <UserGuidanceBanner status={caseData.status} caseData={caseData} />
      )}

      <div className="mb-6 space-y-2">
        <h2 className="text-2xl font-bold text-gray-900">Talaq Form (Husband-initiated)</h2>
        <p className="text-sm text-gray-600">
          {isReadOnly 
            ? "View your Talaq form details below."
            : "Please fill out all required fields to proceed with your Talaq application."}
        </p>
        {isReadOnly && (
          <p className="text-xs text-amber-600 italic mt-2">
            ✔ This step has been completed and is now 🔒 locked while the Qazi reviews your case.
          </p>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
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
            disabled={isReadOnly}
            className={`w-full rounded-lg border border-gray-300 focus:ring-2 focus:ring-islamicGreen focus:border-transparent px-4 py-2 text-sm ${isReadOnly ? 'bg-gray-50 cursor-not-allowed opacity-70' : ''}`}
            placeholder="Enter husband's full name"
          />
        </div>

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
            disabled={isReadOnly}
            className={`w-full rounded-lg border border-gray-300 focus:ring-2 focus:ring-islamicGreen focus:border-transparent px-4 py-2 text-sm ${isReadOnly ? 'bg-gray-50 cursor-not-allowed opacity-70' : ''}`}
            placeholder="Enter wife's full name"
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
            disabled={isReadOnly}
            max={new Date().toISOString().split('T')[0]}
            className={`w-full rounded-lg border border-gray-300 focus:ring-2 focus:ring-islamicGreen focus:border-transparent px-4 py-2 text-sm ${isReadOnly ? 'bg-gray-50 cursor-not-allowed opacity-70' : ''}`}
          />
        </div>

        {/* Place of Nikah */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Place of Nikah <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="placeOfNikah"
            value={form.placeOfNikah}
            onChange={handleChange}
            required
            disabled={isReadOnly}
            className={`w-full rounded-lg border border-gray-300 focus:ring-2 focus:ring-islamicGreen focus:border-transparent px-4 py-2 text-sm ${isReadOnly ? 'bg-gray-50 cursor-not-allowed opacity-70' : ''}`}
            placeholder="Enter place of Nikah"
          />
        </div>

        {/* Talaq Intention Confirmation */}
        <div className="bg-amber-50 border-2 border-amber-200 rounded-lg p-4">
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              name="talaqIntentionConfirmed"
              checked={form.talaqIntentionConfirmed}
              onChange={handleChange}
              required
              disabled={isReadOnly}
              className={`mt-1 h-5 w-5 rounded border-gray-300 text-islamicGreen focus:ring-islamicGreen ${isReadOnly ? 'cursor-not-allowed opacity-70' : ''}`}
            />
            <div className="flex-1">
              <span className="block text-sm font-semibold text-gray-900 mb-1">
                Talaq Intention Confirmation <span className="text-red-500">*</span>
              </span>
              <p className="text-xs text-amber-900">
                <strong>Islamic Warning:</strong> Talaq is a serious matter in Islam. By checking this box, you confirm that you have made a deliberate and considered decision to pronounce Talaq. Please ensure you have exhausted all avenues of reconciliation as encouraged by Islamic teachings.
              </p>
            </div>
          </label>
        </div>

        {/* Talaq Pronouncement Count */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Talaq Pronouncement Count <span className="text-red-500">*</span>
          </label>
          <select
            name="talaqCount"
            value={form.talaqCount}
            onChange={handleChange}
            required
            disabled={isReadOnly}
            className={`w-full rounded-lg border border-gray-300 focus:ring-2 focus:ring-islamicGreen focus:border-transparent px-4 py-2 text-sm ${isReadOnly ? 'bg-gray-50 cursor-not-allowed opacity-70' : ''}`}
          >
            <option value="">Select count</option>
            <option value="1">1 (First pronouncement)</option>
            <option value="2">2 (Second pronouncement)</option>
            <option value="3">3 (Third pronouncement - Final)</option>
          </select>
        </div>

        {/* Iddat Acknowledgement */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              name="iddatAcknowledgement"
              checked={form.iddatAcknowledgement}
              onChange={handleChange}
              required
              disabled={isReadOnly}
              className={`mt-1 h-5 w-5 rounded border-gray-300 text-islamicGreen focus:ring-islamicGreen ${isReadOnly ? 'cursor-not-allowed opacity-70' : ''}`}
            />
            <div className="flex-1">
              <span className="block text-sm font-semibold text-gray-900 mb-1">
                Iddat Acknowledgement <span className="text-red-500">*</span>
              </span>
              <p className="text-xs text-gray-700">
                I acknowledge that the wife must observe the Iddat period as per Islamic law following the pronouncement of Talaq.
              </p>
            </div>
          </label>
        </div>

        {/* Declaration */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <p className="text-sm text-gray-700 font-medium italic">
            "{form.talaqDeclaration}"
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        {!isReadOnly && (
          <div className="flex justify-end gap-3 pt-4 border-t">
            <button
              type="submit"
              disabled={loading}
              className="bg-islamicGreen text-white px-8 py-3 rounded-lg text-sm font-semibold shadow-sm hover:bg-teal-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? "Submitting..." : caseData?.status === "NEEDS_CORRECTION" ? "Update & Resubmit Form" : "Submit Form"}
            </button>
          </div>
        )}
      </form>
    </div>
  );
}
