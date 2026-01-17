import { useState } from "react";
import { useTranslation } from "react-i18next";
import { saveAffidavits } from "../api/case.api";

export default function AffidavitsForm({ caseId, onSuccess }) {
  const { t } = useTranslation();
  const [form, setForm] = useState({
    applicantAffidavit: false,
    witnessAffidavit: false,
    supportAffidavit: false,
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.checked });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate at least one affidavit is checked
    if (!form.applicantAffidavit && !form.witnessAffidavit && !form.supportAffidavit) {
      alert(t("form.errors.required"));
      return;
    }

    setLoading(true);

    try {
      await saveAffidavits(caseId, form);
      onSuccess();
    } catch (err) {
      alert(err.response?.data?.message || t("common.error"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-5 sm:p-6 lg:p-8 max-w-2xl mx-auto">
      <div className="mb-6">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2">
          {t("home.steps.affidavits.title")} Confirmation
        </h2>
        <p className="text-sm sm:text-base text-gray-600">
          {t("home.steps.affidavits.description")}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
        <AffidavitCheckbox
          name="applicantAffidavit"
          label={t("documents.labels.applicant")}
          description="Official sworn statement (Bayan-e-Halafi) submitted by the applicant."
          checked={form.applicantAffidavit}
          onChange={handleChange}
        />

        <AffidavitCheckbox
          name="witnessAffidavit"
          label={t("documents.labels.witness")}
          description="Statements provided and signed by the case witnesses."
          checked={form.witnessAffidavit}
          onChange={handleChange}
        />

        <AffidavitCheckbox
          name="supportAffidavit"
          label={t("documents.labels.evidence")}
          description="Additional supporting documents and physical evidence for the case."
          checked={form.supportAffidavit}
          onChange={handleChange}
        />

        <div className="bg-blue-50 border border-blue-200 rounded p-3 sm:p-4 text-xs sm:text-sm text-blue-800">
          <p className="font-medium mb-1">Important Note / اہم اطلاع:</p>
          <p>
            {t("documents.secureNote")} All statements must be verified by the Darul Qaza registry.
          </p>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-islamicGreen text-white py-3 sm:py-3.5 rounded-lg hover:bg-teal-700 transition-all duration-200 disabled:opacity-50 text-sm sm:text-base font-semibold shadow-md hover:shadow-lg transform hover:-translate-y-0.5 disabled:transform-none"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <span className="animate-spin">⏳</span>
              {t("common.loading")}
            </span>
          ) : (
            t("common.save")
          )}
        </button>
      </form>
      <p className="mt-3 text-[11px] sm:text-xs text-gray-500 leading-relaxed">
        This platform facilitates case submission only. All records are processed by qualified Islamic authorities at Darul Qaza.
      </p>
    </div>
  );
}

function AffidavitCheckbox({ name, label, description, checked, onChange }) {
  return (
    <div className="flex items-start gap-3 sm:gap-4 p-3 sm:p-4 border-2 border-gray-200 rounded-lg hover:bg-gray-50 hover:border-teal-300 transition-all duration-200">
      <input
        type="checkbox"
        name={name}
        id={name}
        checked={checked}
        onChange={onChange}
        className="mt-1 w-5 h-5 sm:w-6 sm:h-6 text-islamicGreen border-2 border-gray-300 rounded focus:ring-2 focus:ring-islamicGreen focus:ring-offset-2 cursor-pointer"
      />
      <label htmlFor={name} className="flex-1 cursor-pointer">
        <div className="font-semibold text-sm sm:text-base text-gray-900 mb-1">{label}</div>
        <div className="text-xs sm:text-sm text-gray-600 leading-relaxed">{description}</div>
      </label>
    </div>
  );
}

