import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { saveDivorceForm, transitionCase, saveDraft } from "../../api/case.api";
import SuccessMessage from "../SuccessMessage";
import DraftStatus from "../DraftStatus";

export default function TalaqForm({ caseData, caseId, onSuccess, onUpdated }) {
  const { t } = useTranslation();
  const [form, setForm] = useState({
    husbandName: "",
    husbandCnic: "",
    wifeName: "",
    wifeCnic: "",
    nikahDate: "",
    nikahPlace: "",
    nikahRegistrationNo: "",
    numChildren: "0",
    mahrAmount: "",
    talaqIntention: "",
    reconciliationStatus: "",
    witness1Name: "",
    witness1Id: "",
    witness2Name: "",
    witness2Id: "",
  });
  const [intentConfirmed, setIntentConfirmed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState(caseData?.updatedAt);

  // Auto-save effect
  useEffect(() => {
    const timer = setTimeout(async () => {
      // Don't auto-save if empty or submitted
      if (Object.values(form).every(x => !x) || showSuccess) return;
      if (caseData.status !== "DRAFT" && caseData.status !== "STARTED" && caseData.status !== "CREATED") return;

      setSaving(true);
      try {
        await saveDraft(effectiveCaseId, { details: form });
        setLastSaved(new Date().toISOString());
      } catch (err) {
        console.error("Auto-save failed", err);
      } finally {
        setSaving(false);
      }
    }, 2000); // Debounce 2s

    return () => clearTimeout(timer);
  }, [form, effectiveCaseId, showSuccess, caseData.status]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const effectiveCaseId = caseData?._id || caseId;


  // ... (keep state) ...

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (
      !form.husbandName ||
      !form.husbandCnic ||
      !form.wifeName ||
      !form.nikahDate ||
      !form.nikahPlace ||
      !form.mahrAmount
    ) {
      setError(t("form.errors.required")); // "Please fill all required details marked with *."
      return;
    }

    if (!form.witness1Name || !form.witness2Name) {
      setError(t("form.errors.witnesses")); // "Two witnesses are required..."
      return;
    }

    if (!intentConfirmed) {
      setError(t("form.errors.required")); // Reusing generic required message for simplicity
      return;
    }

    if (!form.talaqIntention.trim()) {
      setError(t("form.errors.required"));
      return;
    }

    // ... (keep logic) ...
  };

  return (
    <>
      {showSuccess && (
        <SuccessMessage
          message="Talaq form submitted successfully. Case status updated to FORM_COMPLETED."
          onClose={handleSuccessClose}
        />
      )}
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-5 sm:p-6 lg:p-8 max-w-3xl mx-auto">
        <div className="mb-6 space-y-2">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800">
            {t("home.divorceTypes.talaq.title")} {t("home.steps.application.title")}
          </h2>
          <p className="text-sm sm:text-base text-gray-600">
            {t("home.divorceTypes.talaq.description")}
          </p>
        </div>

        <div className="flex justify-end mb-4">
          <DraftStatus lastSaved={lastSaved} isSaving={saving} />
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* SECTION: Personal Details */}
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-100 space-y-4">
            <h3 className="font-semibold text-gray-900 border-b pb-2">
              {t("form.personalDetails")}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t("form.husbandName")} <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="husbandName"
                  value={form.husbandName}
                  onChange={handleChange}
                  required
                  className="w-full rounded-lg border border-gray-200 focus:ring-2 focus:ring-islamicGreen focus:border-transparent text-sm p-3"
                  placeholder={t("form.placeholders.name")}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t("form.husbandCnic")} <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="husbandCnic"
                  value={form.husbandCnic}
                  onChange={handleChange}
                  required
                  className="w-full rounded-lg border border-gray-200 focus:ring-2 focus:ring-islamicGreen focus:border-transparent text-sm p-3"
                  placeholder={t("form.placeholders.aadhar")}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t("form.wifeName")} <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="wifeName"
                  value={form.wifeName}
                  onChange={handleChange}
                  required
                  className="w-full rounded-lg border border-gray-200 focus:ring-2 focus:ring-islamicGreen focus:border-transparent text-sm p-3"
                  placeholder={t("form.placeholders.name")}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t("form.wifeCnic")} ({t("common.optional", { defaultValue: "Optional" })})
                </label>
                <input
                  type="text"
                  name="wifeCnic"
                  value={form.wifeCnic}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-gray-200 focus:ring-2 focus:ring-islamicGreen focus:border-transparent text-sm p-3"
                  placeholder={t("form.placeholders.aadhar")}
                />
              </div>
            </div>
          </div>

          {/* SECTION: Marriage Details */}
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-100 space-y-4">
            <h3 className="font-semibold text-gray-900 border-b pb-2">
              {t("form.marriageDetails")}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t("form.nikahDate")} <span className="text-red-500">*</span>
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
                  {t("form.nikahPlace")} <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="nikahPlace"
                  value={form.nikahPlace}
                  onChange={handleChange}
                  required
                  className="w-full rounded-lg border border-gray-200 focus:ring-2 focus:ring-islamicGreen focus:border-transparent text-sm p-3"
                  placeholder={t("form.placeholders.city")}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t("form.nikahRegNo")}
                </label>
                <input
                  type="text"
                  name="nikahRegistrationNo"
                  value={form.nikahRegistrationNo}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-gray-200 focus:ring-2 focus:ring-islamicGreen focus:border-transparent text-sm p-3"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t("form.numChildren")}
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

          {/* SECTION: Talaq & Mahr Details */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t("form.mahrAmount")} <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="mahrAmount"
                value={form.mahrAmount}
                onChange={handleChange}
                required
                className="w-full rounded-lg border border-gray-200 focus:ring-2 focus:ring-islamicGreen focus:border-transparent text-sm p-3"
                placeholder={t("form.placeholders.amount")}
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
                    {t("form.talaqIntention")} <span className="text-red-500">*</span>
                  </span>
                  <span className="text-xs text-gray-600">
                    {t("form.talaqConfirmation")}
                  </span>
                </div>
              </label>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t("form.talaqIntention")} (Declaration) <span className="text-red-500">*</span>
              </label>
              <textarea
                name="talaqIntention"
                value={form.talaqIntention}
                onChange={handleChange}
                required
                rows={4}
                className="w-full rounded-lg border border-gray-200 focus:ring-2 focus:ring-islamicGreen focus:border-transparent text-sm p-3"
                placeholder={t("form.placeholders.notes")}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t("form.reconciliationStatus")}
              </label>
              <textarea
                name="reconciliationStatus"
                value={form.reconciliationStatus}
                onChange={handleChange}
                rows={3}
                className="w-full rounded-lg border border-gray-200 focus:ring-2 focus:ring-islamicGreen focus:border-transparent text-sm p-3"
                placeholder={t("form.reconciliationPlaceholder")}
              />
            </div>
          </div>

          {/* SECTION: Witness Details */}
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-100 space-y-4">
            <h3 className="font-semibold text-gray-900 border-b pb-2">
              {t("form.witnessDetails")}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Witness 1 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t("form.witnessName")} 1 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="witness1Name"
                  value={form.witness1Name}
                  onChange={handleChange}
                  required
                  className="w-full rounded-lg border border-gray-200 focus:ring-2 focus:ring-islamicGreen focus:border-transparent text-sm p-3"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t("form.witnessId")} 1 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="witness1Id"
                  value={form.witness1Id}
                  onChange={handleChange}
                  required
                  className="w-full rounded-lg border border-gray-200 focus:ring-2 focus:ring-islamicGreen focus:border-transparent text-sm p-3"
                />
              </div>

              {/* Witness 2 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t("form.witnessName")} 2 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="witness2Name"
                  value={form.witness2Name}
                  onChange={handleChange}
                  required
                  className="w-full rounded-lg border border-gray-200 focus:ring-2 focus:ring-islamicGreen focus:border-transparent text-sm p-3"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t("form.witnessId")} 2 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="witness2Id"
                  value={form.witness2Id}
                  onChange={handleChange}
                  required
                  className="w-full rounded-lg border border-gray-200 focus:ring-2 focus:ring-islamicGreen focus:border-transparent text-sm p-3"
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
              {loading ? t("common.loading") : t("form.submitTalaq")}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
