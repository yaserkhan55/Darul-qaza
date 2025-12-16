import { useState } from "react";
import { saveResolution, transitionCase } from "@/api/case.api";

export default function ResolutionStep({ caseId, onUpdated }) {
  const [description, setDescription] = useState("");
  const [attemptDate, setAttemptDate] = useState("");
  const [outcome, setOutcome] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!description || !attemptDate || !outcome) {
      setError("Please fill all required fields.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      await saveResolution(caseId, {
        description,
        attemptDate,
        outcome,
      });

      const nextStatus = outcome === "SUCCESS" ? "RESOLUTION_SUCCESS" : "RESOLUTION_FAILED";
      await transitionCase(caseId, { nextStatus });
      onUpdated?.();
    } catch (err) {
      setError(err?.response?.data?.message || "Unable to save resolution. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-md border border-gray-100 p-4 sm:p-6">
      <div className="mb-4">
        <h2 className="text-xl font-semibold text-gray-900">Resolution (Sulh)</h2>
        <p className="text-sm text-gray-600">
          Record the reconciliation (Sulh) attempt between the parties.
        </p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Describe reconciliation (Sulh) attempts
          </label>
          <textarea
            className="w-full rounded-lg border border-gray-200 focus:ring-2 focus:ring-islamicGreen focus:border-transparent text-sm p-3"
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Detail the steps taken for reconciliation..."
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date of resolution attempt
            </label>
            <input
              type="date"
              className="w-full rounded-lg border border-gray-200 focus:ring-2 focus:ring-islamicGreen focus:border-transparent text-sm p-3"
              value={attemptDate}
              onChange={(e) => setAttemptDate(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Outcome
            </label>
            <select
              className="w-full rounded-lg border border-gray-200 focus:ring-2 focus:ring-islamicGreen focus:border-transparent text-sm p-3"
              value={outcome}
              onChange={(e) => setOutcome(e.target.value)}
            >
              <option value="">Select outcome</option>
              <option value="SUCCESS">Successful</option>
              <option value="FAILED">Failed</option>
            </select>
          </div>
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
            {loading ? "Saving..." : "Submit Resolution"}
          </button>
        </div>
      </form>
    </div>
  );
}

