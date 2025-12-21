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

  // ... (keep state) ...

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

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
      setError(t("form.errors.required")); // "Please fill all required fields marked with *."
      return;
    }

    if (!form.witness1Name || !form.witness2Name) {
      setError(t("form.errors.witnesses")); // "Two witnesses are required..."
      return;
    }

    // ... (keep logic) ...
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
            {t("home.divorceTypes.khula.title")} {t("home.steps.application.title")}
          </h2>
          <p className="text-sm sm:text-base text-gray-600">
            {t("home.divorceTypes.khula.description")}
          </p>
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
                  {t("form.wifeCnic")} <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="wifeCnic"
                  value={form.wifeCnic}
                  onChange={handleChange}
                  required
                  className="w-full rounded-lg border border-gray-200 focus:ring-2 focus:ring-islamicGreen focus:border-transparent text-sm p-3"
                  placeholder={t("form.placeholders.aadhar")}
                />
              </div>

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
                  {t("form.husbandCnic")} ({t("common.optional", { defaultValue: "Optional" })})
                </label>
                <input
                  type="text"
                  name="husbandCnic"
                  value={form.husbandCnic}
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

          {/* SECTION: Khula Details */}
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900 border-b pb-2">
              {t("form.khulaDetails")}
            </h3>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t("form.reasonForKhula")} <span className="text-red-500">*</span>
              </label>
              <textarea
                name="reasonForKhula"
                value={form.reasonForKhula}
                onChange={handleChange}
                required
                rows={5}
                className="w-full rounded-lg border border-gray-200 focus:ring-2 focus:ring-islamicGreen focus:border-transparent text-sm p-3"
                placeholder={t("form.placeholders.notes")}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t("form.compensationAmount")} <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="compensationAmount"
                  value={form.compensationAmount}
                  onChange={handleChange}
                  required
                  className="w-full rounded-lg border border-gray-200 focus:ring-2 focus:ring-islamicGreen focus:border-transparent text-sm p-3"
                  placeholder={t("form.placeholders.amount")}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t("form.husbandConsent")} <span className="text-red-500">*</span>
                </label>
                <select
                  name="husbandConsent"
                  value={form.husbandConsent}
                  onChange={handleChange}
                  required
                  className="w-full rounded-lg border border-gray-200 focus:ring-2 focus:ring-islamicGreen focus:border-transparent text-sm p-3"
                >
                  <option value="">{t("common.select", { defaultValue: "Select" })}</option>
                  <option value="YES">{t("common.yes", { defaultValue: "Yes" })}</option>
                  <option value="NO">{t("common.no", { defaultValue: "No" })}</option>
                </select>
              </div>
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
              {loading ? t("common.loading") : t("form.submitKhula")}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}

