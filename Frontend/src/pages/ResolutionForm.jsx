import { useState } from "react";
import { saveResolution } from "../api/case.api";

export default function ResolutionForm({ caseId, onSuccess }) {
  const [form, setForm] = useState({
    mediatorName: "",
    result: "",
    notes: "",
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await saveResolution(caseId, form);
      onSuccess();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to submit resolution");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-5 sm:p-6 lg:p-8 max-w-2xl mx-auto">
      <div className="mb-6">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2">
          Islamic Resolution (Sulh) Attempt / صلح کی کوشش
        </h2>
        <p className="text-sm sm:text-base text-gray-600">
          Record the outcome of the reconciliation attempt between the parties. /
          فریقین کے درمیان صلح کی کوشش کا نتیجہ درج کریں۔
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
        <Input
          label="Mediator Name / ثالث کا نام"
          name="mediatorName"
          value={form.mediatorName}
          onChange={handleChange}
          placeholder="Name of the mediator/Qazi"
        />

        <div>
          <label className="block text-sm sm:text-base font-semibold text-gray-700 mb-2">
            Resolution Result / صلح کا نتیجہ <span className="text-red-500">*</span>
          </label>
          <select
            name="result"
            value={form.result}
            onChange={handleChange}
            required
            className="w-full border-2 border-gray-200 rounded-lg px-4 py-2.5 sm:py-3 text-sm sm:text-base focus:outline-none focus:border-islamicGreen focus:ring-2 focus:ring-islamicGreen/20 transition-all duration-200 hover:border-gray-300"
          >
            <option value="">Select result / نتیجہ منتخب کریں</option>
            <option value="SUCCESS">Success - Reconciliation Achieved / کامیاب صلح</option>
            <option value="FAILED">Failed - Proceeding with Divorce / صلح ناکام</option>
          </select>
        </div>

        <Textarea
          label="Notes / نوٹس"
          name="notes"
          value={form.notes}
          onChange={handleChange}
          placeholder="Details about the resolution attempt..."
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
            "Submit Resolution / صلح کا نتیجہ جمع کریں"
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

function Input({ label, ...props }) {
  return (
    <div>
      <label className="block text-sm sm:text-base font-semibold text-gray-700 mb-2">
        {label}
      </label>
      <input
        {...props}
        className="w-full border-2 border-gray-200 rounded-lg px-4 py-2.5 sm:py-3 text-sm sm:text-base focus:outline-none focus:border-islamicGreen focus:ring-2 focus:ring-islamicGreen/20 transition-all duration-200 hover:border-gray-300"
      />
    </div>
  );
}

function Textarea({ label, ...props }) {
  return (
    <div>
      <label className="block text-sm sm:text-base font-semibold text-gray-700 mb-2">
        {label}
      </label>
      <textarea
        {...props}
        rows="4"
        className="w-full border-2 border-gray-200 rounded-lg px-4 py-2.5 sm:py-3 text-sm sm:text-base focus:outline-none focus:border-islamicGreen focus:ring-2 focus:ring-islamicGreen/20 transition-all duration-200 hover:border-gray-300 resize-y"
      />
    </div>
  );
}

