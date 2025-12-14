import { useState } from "react";
import { saveDivorceForm } from "../api/case.api";
import SuccessMessage from "../components/SuccessMessage";

export default function DivorceForm({ caseId, onSuccess }) {
  const [form, setForm] = useState({
    husbandName: "",
    wifeName: "",
    cnic: "",
    marriageDate: "",
    address: "",
  });

  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await saveDivorceForm(caseId, form);
      setShowSuccess(true);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to submit form");
    } finally {
      setLoading(false);
    }
  };

  const handleSuccessClose = () => {
    setShowSuccess(false);
    onSuccess(); // refresh dashboard
  };

  return (
    <>
      {showSuccess && (
        <SuccessMessage
          message="Your divorce application has been submitted successfully. You can now proceed to the resolution step."
          onClose={handleSuccessClose}
        />
      )}
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-5 sm:p-6 lg:p-8 max-w-2xl mx-auto">
        <div className="mb-6">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2">
            Divorce Application Form
          </h2>
          <p className="text-sm sm:text-base text-gray-600">
            Please fill the details carefully as per Nikahnama.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
        <Input
          label="Husband Name"
          name="husbandName"
          value={form.husbandName}
          onChange={handleChange}
        />

        <Input
          label="Wife Name"
          name="wifeName"
          value={form.wifeName}
          onChange={handleChange}
        />

        <Input
          label="CNIC Number"
          name="cnic"
          placeholder="35201-XXXXXXX-X"
          value={form.cnic}
          onChange={handleChange}
        />

        <Input
          label="Marriage Date"
          type="date"
          name="marriageDate"
          value={form.marriageDate}
          onChange={handleChange}
        />

        <Textarea
          label="Residential Address"
          name="address"
          value={form.address}
          onChange={handleChange}
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
            "Submit Divorce Form"
          )}
        </button>
      </form>
      </div>
    </>
  );
}

/* ---------- Small Reusable Inputs ---------- */

function Input({ label, ...props }) {
  return (
    <div>
      <label className="block text-sm sm:text-base font-semibold text-gray-700 mb-2">
        {label} <span className="text-red-500">*</span>
      </label>
      <input
        {...props}
        required
        className="w-full border-2 border-gray-200 rounded-lg px-4 py-2.5 sm:py-3 text-sm sm:text-base focus:outline-none focus:border-islamicGreen focus:ring-2 focus:ring-islamicGreen/20 transition-all duration-200 hover:border-gray-300"
      />
    </div>
  );
}

function Textarea({ label, ...props }) {
  return (
    <div>
      <label className="block text-sm sm:text-base font-semibold text-gray-700 mb-2">
        {label} <span className="text-red-500">*</span>
      </label>
      <textarea
        {...props}
        required
        rows="4"
        className="w-full border-2 border-gray-200 rounded-lg px-4 py-2.5 sm:py-3 text-sm sm:text-base focus:outline-none focus:border-islamicGreen focus:ring-2 focus:ring-islamicGreen/20 transition-all duration-200 hover:border-gray-300 resize-y"
      />
    </div>
  );
}

