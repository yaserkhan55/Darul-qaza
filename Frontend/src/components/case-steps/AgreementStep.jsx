import { useState, useEffect } from "react";
import { saveAgreement, transitionCase, getMyCases } from "@/api/case.api";

export default function AgreementStep({ caseData, caseId, caseType, onUpdated }) {
  const [detectedType, setDetectedType] = useState(caseType || caseData?.type || caseData?.divorceType || null);
  const [iddat, setIddat] = useState("");
  const [mahrSettlement, setMahrSettlement] = useState("");
  const [mahrReturn, setMahrReturn] = useState("");
  const [maintenance, setMaintenance] = useState("");
  const [custody, setCustody] = useState("");
  const [conditions, setConditions] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchCaseType = async () => {
      if (detectedType || !caseId) return;
      try {
        const cases = await getMyCases();
        const currentCase = cases.find((c) => c._id === caseId);
        if (currentCase) {
          setDetectedType(currentCase.type || currentCase.divorceType);
        }
      } catch (err) {
        console.error("Failed to fetch case type", err);
      }
    };
    fetchCaseType();
  }, [caseId, detectedType]);

  const effectiveCaseId = caseData?._id || caseId;

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (detectedType === "TALAQ") {
      if (!mahrSettlement || !iddat) {
        setError("Mahr settlement and Iddat period are required for Talaq.");
        return;
      }
    } else if (detectedType === "KHULA") {
      if (!mahrReturn || !iddat) {
        setError("Mahr return amount and Iddat period are required for Khula.");
        return;
      }
    } else {
      if (!iddat) {
        setError("Iddat period is required.");
        return;
      }
    }

    if (!agreed) {
      setError("Please confirm that both parties agree to the terms.");
      return;
    }

    setError("");
    setLoading(true);
    try {
      await saveAgreement(effectiveCaseId, {
        iddat,
        mahrSettlement: detectedType === "TALAQ" ? mahrSettlement : undefined,
        mahrReturn: detectedType === "KHULA" ? mahrReturn : undefined,
        maintenance,
        custody,
        conditions,
        divorceType: detectedType,
      });
      await transitionCase(effectiveCaseId, { nextStatus: "AGREEMENT_DONE" });
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
          {detectedType === "TALAQ" && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mahr Settlement <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                className="w-full rounded-lg border border-gray-200 focus:ring-2 focus:ring-islamicGreen focus:border-transparent text-sm p-3"
                value={mahrSettlement}
                onChange={(e) => setMahrSettlement(e.target.value)}
                placeholder="e.g., 500,000 PKR"
                required
              />
              <p className="text-xs text-gray-500 mt-1">Mahr settlement terms for Talaq</p>
            </div>
          )}
          
          {detectedType === "KHULA" && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mahr Return / Compensation <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                className="w-full rounded-lg border border-gray-200 focus:ring-2 focus:ring-islamicGreen focus:border-transparent text-sm p-3"
                value={mahrReturn}
                onChange={(e) => setMahrReturn(e.target.value)}
                placeholder="e.g., 500,000 PKR"
                required
              />
              <p className="text-xs text-gray-500 mt-1">Amount to be returned to husband for Khula</p>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Iddat Period <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              className="w-full rounded-lg border border-gray-200 focus:ring-2 focus:ring-islamicGreen focus:border-transparent text-sm p-3"
              value={iddat}
              onChange={(e) => setIddat(e.target.value)}
              placeholder="e.g., 3 months / 90 days"
              required
            />
            <p className="text-xs text-gray-500 mt-1">Waiting period as per Islamic law</p>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Maintenance (Nafaqah)
          </label>
          <input
            type="text"
            className="w-full rounded-lg border border-gray-200 focus:ring-2 focus:ring-islamicGreen focus:border-transparent text-sm p-3"
            value={maintenance}
            onChange={(e) => setMaintenance(e.target.value)}
            placeholder="Monthly maintenance amount during iddat"
          />
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

