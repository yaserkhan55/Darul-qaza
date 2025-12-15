import { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import { getMyCases, startCase } from "../api/case.api";
import StatusBadge from "../components/StatusBadge";
import CaseSteps from "../components/CaseSteps";

const STEP_LABELS = {
  STARTED: "Divorce Form / خلع فارم",
  FORM_COMPLETED: "Resolution (Sulh) / صلح کی کوشش",
  RESOLUTION_SUCCESS: "Agreement / معاہدہ",
  RESOLUTION_FAILED: "Agreement / معاہدہ",
  AGREEMENT_DONE: "Affidavits / حلف نامے",
  AFFIDAVITS_DONE: "Under Review / زیرِ جائزہ",
  UNDER_REVIEW: "Under Review / زیرِ جائزہ",
  APPROVED: "Certificate Ready / سرٹیفکیٹ تیار",
};

export default function Dashboard() {
  const location = useLocation();
  const [allCases, setAllCases] = useState([]);
  const [completedCases, setCompletedCases] = useState([]);
  const [activeCase, setActiveCase] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const activeCases = useMemo(
    () => allCases.filter((c) => c.status !== "APPROVED"),
    [allCases]
  );

  const stats = useMemo(
    () => ({
      active: activeCases.length,
      completed: completedCases.length,
      underReview: allCases.filter((c) => c.status === "UNDER_REVIEW").length,
      nextStep: activeCase ? STEP_LABELS[activeCase.status] : "Start a new case",
    }),
    [activeCases.length, completedCases.length, allCases, activeCase]
  );

  const loadCases = async () => {
    try {
      const data = await getMyCases();
      setAllCases(data);
      setErrorMessage("");

      const completed = data.filter((c) => c.status === "APPROVED");
      setCompletedCases(completed);

      const actives = data.filter((c) => c.status !== "APPROVED");
      if (actives.length > 0) {
        if (!activeCase || activeCase.status === "APPROVED") {
          setActiveCase(actives[0]);
        }
      } else if (completed.length > 0 && !activeCase) {
        setActiveCase(completed[0]);
      } else {
        setActiveCase(null);
      }
    } catch (err) {
      console.error("Failed to load cases:", err);
      setErrorMessage("Unable to load cases. براہِ کرم دوبارہ کوشش کریں۔");
    }
  };

  const handleStart = async (divorceType = "TALAQ") => {
    if (activeCases.length > 0) {
      setErrorMessage(
        "براہِ کرم موجودہ کیس مکمل کریں پھر نیا کیس شروع کریں / Complete the current case before starting a new one."
      );
      return;
    }

    setLoading(true);
    try {
      const newCase = await startCase(divorceType);
      setActiveCase(newCase);
      await loadCases();
      setErrorMessage("");
    } catch (err) {
      const message =
        err.response?.data?.error ||
        err.response?.data?.message ||
        "Failed to start case";
      setErrorMessage(message);
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
    <div className="space-y-4 sm:space-y-5">
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-4 sm:p-6 space-y-4">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 space-y-3">
            <h1 className="text-2xl sm:text-3xl font-bold text-islamicGreen">
              My Cases Dashboard / میرا کیس ڈیش بورڈ
            </h1>
            <p className="text-sm sm:text-base text-gray-600">
              Track every step of your Islamic divorce process. / اسلامی طلاق کے تمام مراحل پر نظر رکھیں۔
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
            <StatCard label="Active / جاری" value={stats.active} color="text-emerald-600" />
            <StatCard label="Completed / مکمل" value={stats.completed} color="text-blue-600" />
            <StatCard label="Under Review / زیر جائزہ" value={stats.underReview} color="text-amber-600" />
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="flex-1 w-full">
            <p className="text-sm text-gray-600">
              Next Step / اگلا مرحلہ:{" "}
              <span className="font-semibold text-gray-900">{stats.nextStep}</span>
            </p>
          </div>
          <button
            onClick={() => handleStart("TALAQ")}
            disabled={loading || activeCases.length > 0}
            className="w-full sm:w-auto bg-islamicGreen text-white px-5 py-3 rounded-lg font-semibold shadow-md hover:bg-teal-700 disabled:opacity-40 transition-all"
          >
            {loading ? "Starting..." : "Start New Case / نیا کیس شروع کریں"}
          </button>
        </div>

        {errorMessage && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded text-sm">
            {errorMessage}
          </div>
        )}
      </div>

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
    </div>
  );
}

function StatCard({ label, value, color }) {
  return (
    <div className="flex-1 bg-gradient-to-br from-gray-50 to-white border border-gray-100 rounded-xl px-4 py-3 shadow-sm">
      <p className="text-xs uppercase tracking-wide text-gray-500">{label}</p>
      <p className={`text-2xl font-bold ${color}`}>{value}</p>
    </div>
  );
}
