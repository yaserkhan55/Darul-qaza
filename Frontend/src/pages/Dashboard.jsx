  import { useEffect, useState } from "react";
  import { useLocation } from "react-router-dom";
  import { getMyCases, startCase } from "../api/case.api";
  import StatusBadge from "../components/StatusBadge";
  import CaseSteps from "../components/CaseSteps";

export default function Dashboard() {
  const location = useLocation();
  const [allCases, setAllCases] = useState([]);
  const [completedCases, setCompletedCases] = useState([]);
  const [activeCase, setActiveCase] = useState(null);
  const [loading, setLoading] = useState(false);

  const loadCases = async () => {
    try {
      const data = await getMyCases();
      setAllCases(data);
      // Show only completed/approved cases in "My Cases" list
      const completed = data.filter(c => c.status === "APPROVED");
      setCompletedCases(completed);
      
      // Auto-select the first active (non-completed) case if available for workflow
      const activeCases = data.filter(c => c.status !== "APPROVED");
      if (activeCases.length > 0) {
        // Always show active cases in the workflow panel
        if (!activeCase || activeCase.status === "APPROVED") {
          setActiveCase(activeCases[0]);
        }
      } else if (completed.length > 0 && !activeCase) {
        setActiveCase(completed[0]);
      }
    } catch (err) {
      console.error("Failed to load cases:", err);
      alert("Failed to load cases. Please check your connection.");
    }
  };

  const handleStart = async (divorceType = "TALAQ") => {
    setLoading(true);
    try {
      const newCase = await startCase(divorceType);
      setActiveCase(newCase);
      await loadCases();
    } catch (err) {
      alert(err.response?.data?.error || "Failed to start case");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Check if user came from Home page with a selected type
    const startType = location.state?.startType;
    if (startType) {
      handleStart(startType);
    } else {
      loadCases();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);


  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
      {/* LEFT PANEL */}
      <div className="bg-white p-3 sm:p-4 lg:p-5 rounded-xl shadow-lg border border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-lg sm:text-xl text-gray-800">Completed Cases</h2>
          <span className="text-xs sm:text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">
            {completedCases.length}
          </span>
        </div>

        {completedCases.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-sm text-gray-500 mb-4">No cases yet</p>
            <button
              onClick={() => handleStart("TALAQ")}
              disabled={loading}
              className="w-full bg-islamicGreen text-white py-2.5 rounded-lg hover:bg-teal-700 transition-all duration-200 disabled:opacity-50 text-sm font-medium shadow-md hover:shadow-lg"
            >
              {loading ? "Starting..." : "Start Your First Case"}
            </button>
          </div>
        ) : (
          <>
            <div className="space-y-2 max-h-[50vh] lg:max-h-[65vh] overflow-y-auto pr-2">
              {completedCases.map((c) => (
                <div
                  key={c._id}
                  onClick={() => setActiveCase(c)}
                  className={`p-3 sm:p-4 border-2 rounded-lg cursor-pointer transition-all duration-200 ${
                    activeCase?._id === c._id
                      ? "bg-teal-50 border-islamicGreen shadow-md"
                      : "border-gray-200 hover:border-teal-300 hover:bg-gray-50 hover:shadow-sm"
                  }`}
                >
                  <div className="flex justify-between items-start gap-2">
                    <div className="flex-1">
                      <span className="font-semibold text-sm sm:text-base text-gray-800 block mb-1">
                        {c.divorceType}
                      </span>
                      <span className="text-xs text-gray-500">
                        {new Date(c.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <StatusBadge status={c.status} />
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={() => handleStart("TALAQ")}
              disabled={loading}
              className="w-full mt-4 bg-islamicGreen text-white py-2.5 sm:py-3 rounded-lg hover:bg-teal-700 transition-all duration-200 disabled:opacity-50 text-sm sm:text-base font-medium shadow-md hover:shadow-lg"
            >
              {loading ? "Starting..." : "Start New Case"}
            </button>
          </>
        )}
      </div>

      {/* RIGHT PANEL */}
      <div className="col-span-1 lg:col-span-2 bg-white p-3 sm:p-4 lg:p-6 xl:p-8 rounded-xl shadow-lg border border-gray-100 min-h-[400px]">
        {activeCase ? (
          <CaseSteps caseData={activeCase} onUpdated={loadCases} />
        ) : (
          <div className="text-center py-12 sm:py-16">
            <div className="text-5xl sm:text-6xl mb-4">📋</div>
            <h3 className="text-lg sm:text-xl font-semibold text-gray-700 mb-2">
              No Active Case
            </h3>
            <p className="text-sm sm:text-base text-gray-500 mb-6">
              {allCases.length === 0 
                ? "Start your first case to begin the process"
                : "You have no active cases. Start a new case or view completed cases."}
            </p>
            <button
              onClick={() => handleStart("TALAQ")}
              disabled={loading}
              className="bg-islamicGreen text-white px-6 py-2.5 rounded-lg hover:bg-teal-700 transition-all duration-200 disabled:opacity-50 text-sm font-medium shadow-md hover:shadow-lg"
            >
              {loading ? "Starting..." : "Start New Case"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
