import { useState } from "react";
import { saveAgreement } from "../api/case.api";

export default function AgreementForm({ caseId, onSuccess }) {
  const [form, setForm] = useState({
    mehr: "",
    iddat: "",
    custody: "",
    maintenance: "",
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await saveAgreement(caseId, form);
      onSuccess();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to submit agreement");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-5 sm:p-6 lg:p-8 max-w-2xl mx-auto">
      <div className="mb-6">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2">
          Divorce Agreement Terms / معاہدہ طلاق کی شرائط
        </h2>
        <p className="text-sm sm:text-base text-gray-600">
          Define the terms of separation as per Islamic law and mutual agreement. /
          اسلامی اصولوں کے مطابق علیحدگی کی شرائط درج کریں۔
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
        <Textarea
          label="Mahr (Dower) Settlement / مہر کی ادائیگی"
          name="mehr"
          value={form.mehr}
          onChange={handleChange}
          placeholder="Details about mahr payment and settlement..."
          required
        />

        <Textarea
          label="Iddat Period / عدت کی مدت"
          name="iddat"
          value={form.iddat}
          onChange={handleChange}
          placeholder="Iddat period details and conditions..."
          required
        />

        <Textarea
          label="Child Custody Arrangement / بچوں کی کفالت"
          name="custody"
          value={form.custody}
          onChange={handleChange}
          placeholder="Custody arrangements for children (if applicable)..."
        />

        <Textarea
          label="Maintenance (Nafaqah) / نان و نفقہ"
          name="maintenance"
          value={form.maintenance}
          onChange={handleChange}
          placeholder="Maintenance terms during iddat and beyond..."
        />

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
            "Submit Agreement / معاہدہ جمع کریں"
          )}
        </button>
        <p className="mt-3 text-[11px] sm:text-xs text-gray-500 leading-relaxed">
          This platform facilitates case submission only. Final decisions are made by qualified
          Islamic authorities in accordance with Islamic law.
        </p>
      </form>
    </div>
  );
}

function Textarea({ label, ...props }) {
  return (
    <div>
      <label className="block text-sm sm:text-base font-semibold text-gray-700 mb-2">
        {label} {props.required && <span className="text-red-500">*</span>}
      </label>
      <textarea
        {...props}
        rows="4"
        className="w-full border-2 border-gray-200 rounded-lg px-4 py-2.5 sm:py-3 text-sm sm:text-base focus:outline-none focus:border-islamicGreen focus:ring-2 focus:ring-islamicGreen/20 transition-all duration-200 hover:border-gray-300 resize-y"
      />
    </div>
  );
}

