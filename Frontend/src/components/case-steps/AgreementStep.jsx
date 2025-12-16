import { useState } from "react";
import { saveAgreement, transitionCase } from "@/api/case.api";

export default function AgreementStep({ caseId, onUpdated }) {
  const [mahr, setMahr] = useState("");
  const [maintenance, setMaintenance] = useState("");
  const [custody, setCustody] = useState("");
  const [conditions, setConditions] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!mahr || !maintenance || !custody) {
      setError("Mahr, maintenance/iddat terms, and custody details are required.");
      return;
    }
    if (!agreed) {
      setError("Please confirm that both parties agree to the terms.");
      return;
    }

    setError("");
    setLoading(true);
    try {
      await saveAgreement(caseId, {
        mahr,
        maintenance,
        custody,
        conditions,
      });
      await transitionCase(caseId, { nextStatus: "AGREEMENT_DONE" });
      onUpdated?.();
    } catch (err) {
      setError(err?.response?.data?.message || "Unable to save agreement. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-md border border-gray-100 p-4 sm:p-6">
      <div className="mb-4">
        <h2 className="text-xl font-semibold text-gray-900">Agreement Terms</h2>
        <p className="text-sm text-gray-600">Document the mutually agreed terms as per Islamic law.</p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Mahr amount</label>
            <input
              type="text"
              className="w-full rounded-lg border border-gray-200 focus:ring-2 focus:ring-islamicGreen focus:border-transparent text-sm p-3"
              value={mahr}
              onChange={(e) => setMahr(e.target.value)}
              placeholder="e.g., 500,000 PKR"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Maintenance / Iddat terms</label>
            <input
              type="text"
              className="w-full rounded-lg border border-gray-200 focus:ring-2 focus:ring-islamicGreen focus:border-transparent text-sm p-3"
              value={maintenance}
              onChange={(e) => setMaintenance(e.target.value)}
              placeholder="Specify iddat duration, maintenance, etc."
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Child custody details</label>
          <input
            type="text"
            className="w-full rounded-lg border border-gray-200 focus:ring-2 focus:ring-islamicGreen focus:border-transparent text-sm p-3"
            value={custody}
            onChange={(e) => setCustody(e.target.value)}
            placeholder="Custody arrangement, visitation, support"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Additional conditions</label>
          <textarea
            className="w-full rounded-lg border border-gray-200 focus:ring-2 focus:ring-islamicGreen focus:border-transparent text-sm p-3"
            rows={4}
            value={conditions}
            onChange={(e) => setConditions(e.target.value)}
            placeholder="Any other mutually agreed conditions..."
          />
        </div>

        <div className="flex items-start gap-2">
          <input
            id="agreeTerms"
            type="checkbox"
            className="mt-1 h-4 w-4 rounded border-gray-300 text-islamicGreen focus:ring-islamicGreen"
            checked={agreed}
            onChange={(e) => setAgreed(e.target.checked)}
          />
          <label htmlFor="agreeTerms" className="text-sm text-gray-700">
            Both parties agree to the above terms
          </label>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded text-sm">
            {error}
          </div>
        )}

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="bg-islamicGreen text-white px-5 py-2.5 rounded-lg text-sm font-semibold shadow-sm hover:bg-teal-700 disabled:opacity-60 transition"
          >
            {loading ? "Saving..." : "Submit Agreement"}
          </button>
        </div>
      </form>
    </div>
  );
}

