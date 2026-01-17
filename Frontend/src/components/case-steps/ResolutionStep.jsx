import { useState, useEffect } from "react";
import { saveResolution } from "../../api/case.api";

export default function ResolutionStep({ caseData, caseId, onUpdated }) {
  const [resolutionNotes, setResolutionNotes] = useState("");
  const [resolutionOutcome, setResolutionOutcome] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const effectiveCaseId = caseData?._id || caseId;

  // Load existing resolution data if available
  useEffect(() => {
    if (caseData?.resolution) {
      setResolutionNotes(caseData.resolution.resolutionNotes || "");
      setResolutionOutcome(caseData.resolution.resolutionOutcome || "");
    }
  }, [caseData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!resolutionNotes.trim()) {
      setError("Please provide a summary of the Sulh attempt.");
      return;
    }
    if (!resolutionOutcome) {
      setError("Please select the resolution outcome.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      await saveResolution(effectiveCaseId, {
        resolutionNotes: resolutionNotes.trim(),
        resolutionOutcome,
      });
      onUpdated?.();
    } catch (err) {
      setError(err?.response?.data?.message || "Unable to save resolution. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const isReadOnly = caseData?.status === "RESOLUTION_SUCCESS" || caseData?.status === "RESOLUTION_FAILED";

  return (
    <div className="bg-white rounded-xl shadow-md border border-gray-100 p-4 sm:p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Resolution / Sulh (Mandatory Step)</h2>
        <p className="text-sm text-gray-600 mb-4">
          {isReadOnly 
            ? "View your Resolution (Sulh) attempt details below."
            : "You must complete the Resolution (Sulh) step before proceeding. This step records reconciliation attempts between the parties."}
        </p>
        <div className="bg-emerald-50 border-2 border-emerald-200 rounded-lg p-4 text-sm text-emerald-900">
          <strong className="block mb-2">📿 Islamic Guidance:</strong>
          <p className="leading-relaxed">
            Sulh (reconciliation) is strongly encouraged in Islam before proceeding with divorce. 
            The Quran emphasizes reconciliation between spouses as a preferred path. 
            Please provide a summary of any reconciliation attempts made.
          </p>
        </div>
        {isReadOnly && caseData?.resolution?.resolutionOutcome === "RESOLUTION_SUCCESS" && (
          <div className="mt-4 bg-green-50 border-2 border-green-300 rounded-lg p-4 text-sm text-green-900">
            <strong>✓ Reconciliation Achieved:</strong> Your case has been resolved through Sulh. 
            The Qazi will review and finalize the resolution.
          </div>
        )}
      </div>

      {caseData?.decisionComment?.comment && (
        <div className="mb-6 bg-blue-50 border-l-4 border-blue-500 p-4 rounded-lg">
          <h3 className="font-semibold text-blue-900 mb-2">Message from Qazi</h3>
          <p className="text-sm text-blue-800 leading-relaxed">{caseData.decisionComment.comment}</p>
          <p className="text-xs text-blue-600 mt-2 italic">
            Final decisions are issued by qualified Islamic authorities.
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Summary of Sulh Attempt <span className="text-red-500">*</span>
          </label>
          <textarea
            className={`w-full rounded-lg border border-gray-300 focus:ring-2 focus:ring-islamicGreen focus:border-transparent text-sm p-3 ${isReadOnly ? 'bg-gray-50 cursor-not-allowed opacity-70' : ''}`}
            rows={6}
            value={resolutionNotes}
            onChange={(e) => setResolutionNotes(e.target.value)}
            placeholder="Detail the steps taken for reconciliation (Sulh) between the parties..."
            required
            disabled={isReadOnly}
          />
          <p className="text-xs text-gray-500 mt-1">
            Describe any reconciliation attempts, mediation efforts, or discussions that took place.
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Resolution Outcome <span className="text-red-500">*</span>
          </label>
          <select
            className={`w-full rounded-lg border border-gray-300 focus:ring-2 focus:ring-islamicGreen focus:border-transparent text-sm p-3 ${isReadOnly ? 'bg-gray-50 cursor-not-allowed opacity-70' : ''}`}
            value={resolutionOutcome}
            onChange={(e) => setResolutionOutcome(e.target.value)}
            required
            disabled={isReadOnly}
          >
            <option value="">Select outcome</option>
            <option value="RESOLUTION_SUCCESS">Success - Reconciliation Achieved</option>
            <option value="RESOLUTION_FAILED">Failed - Proceeding with Divorce</option>
          </select>
          <p className="text-xs text-gray-500 mt-1">
            If reconciliation was successful, the case will be resolved. If failed, you may proceed to the next step.
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        {!isReadOnly && (
          <div className="flex justify-end pt-4 border-t">
            <button
              type="submit"
              disabled={loading}
              className="bg-islamicGreen text-white px-8 py-3 rounded-lg text-sm font-semibold shadow-sm hover:bg-teal-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? "Submitting..." : "Submit Resolution"}
            </button>
          </div>
        )}
      </form>
    </div>
  );
}

