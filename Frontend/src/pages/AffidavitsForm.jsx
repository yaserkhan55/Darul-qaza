import { useState } from "react";
import { saveAffidavits } from "../api/case.api";

export default function AffidavitsForm({ caseId, onSuccess }) {
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
      alert("Please confirm at least one affidavit");
      return;
    }

    setLoading(true);

    try {
      await saveAffidavits(caseId, form);
      onSuccess();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to submit affidavits");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-5 sm:p-6 lg:p-8 max-w-2xl mx-auto">
      <div className="mb-6">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2">
          Affidavits Confirmation / حلف ناموں کی تصدیق
        </h2>
        <p className="text-sm sm:text-base text-gray-600">
          Confirm that all required sworn statements (affidavits) have been submitted and verified. /
          تصدیق کریں کہ تمام حلف نامے جمع اور جانچ لیے گئے ہیں۔
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
        <AffidavitCheckbox
          name="applicantAffidavit"
          label="Applicant Affidavit / درخواست گزار کا حلف نامہ"
          description="Sworn statement from the applicant / درخواست گزار کا تحریری بیان"
          checked={form.applicantAffidavit}
          onChange={handleChange}
        />

        <AffidavitCheckbox
          name="witnessAffidavit"
          label="Witness Affidavit / گواہان کے حلف نامے"
          description="Sworn statement from witnesses / گواہوں کے تحریری بیانات"
          checked={form.witnessAffidavit}
          onChange={handleChange}
        />

        <AffidavitCheckbox
          name="supportAffidavit"
          label="Supporting Affidavit / معاون دستاویزات"
          description="Additional supporting documents and statements / اضافی دستاویزات اور بیانات"
          checked={form.supportAffidavit}
          onChange={handleChange}
        />

        <div className="bg-blue-50 border border-blue-200 rounded p-3 sm:p-4 text-xs sm:text-sm text-blue-800">
          <p className="font-medium mb-1">Note:</p>
          <p>
            All affidavits must be properly notarized and submitted to the court before proceeding to Qazi review. /
            تمام حلف نامے تصدیق شدہ ہو کر قاضی کے جائزے سے پہلے جمع کروائیں۔
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
              Submitting...
            </span>
          ) : (
            "Confirm Affidavits"
          )}
        </button>
      </form>
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

