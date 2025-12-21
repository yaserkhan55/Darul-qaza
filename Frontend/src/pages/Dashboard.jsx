import { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useUser } from "@clerk/clerk-react";
import { getMyCases, startCase } from "../api/case.api";
import { getMyMessages, markMessageRead } from "../api/message.api";
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
  const { user } = useUser();
  const { t } = useTranslation();
  const [allCases, setAllCases] = useState([]);
  const [completedCases, setCompletedCases] = useState([]);
  const [activeCase, setActiveCase] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [latestMessage, setLatestMessage] = useState(null);
  const [showMessageModal, setShowMessageModal] = useState(false);

  const activeCases = useMemo(
    () => allCases.filter((c) => c.status !== "APPROVED"),
    [allCases]
  );

  const stats = useMemo(
    () => ({
      active: activeCases.length,
      completed: completedCases.length,
      underReview: allCases.filter((c) => c.status === "UNDER_REVIEW").length,
      nextStep: activeCase ? STEP_LABELS[activeCase.status] || activeCase.status : t("dashboard.startNewCase"),
    }),
    [activeCases.length, completedCases.length, allCases, activeCase, t]
  );

  const loadCases = async (shouldUpdateActive = true) => {
    try {
      const data = await getMyCases();
      setAllCases(data);
      setErrorMessage("");

      const completed = data.filter((c) => c.status === "APPROVED");
      setCompletedCases(completed);

      if (shouldUpdateActive) {
        const actives = data.filter((c) => c.status !== "APPROVED");
        if (actives.length > 0) {
          // Always prefer the latest active case from fresh data
          setActiveCase(actives[0]);
        } else if (completed.length > 0) {
          // Fall back to the most recent completed case
          setActiveCase(completed[0]);
        } else {
          setActiveCase(null);
        }
      }

      return data;
    } catch (err) {
      console.error("Failed to load cases:", err);
      setErrorMessage(t("dashboard.unableToLoad"));
      return [];
    }
  };

  const handleStart = async (divorceType = "TALAQ") => {
    setLoading(true);
    try {
      const newCase = await startCase(divorceType, user?.id);

      // Update local state immediately to ensure UI feels responsive
      setAllCases((prev) => [newCase, ...prev]);
      setActiveCase(newCase);

      // Refresh data in background without overriding the user's current selection
      await loadCases(false);

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
      loadCases(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Load latest unread message for popup
  useEffect(() => {
    const loadMessages = async () => {
      if (!user) return;
      try {
        const msgs = await getMyMessages(user.id);
        const unread = (msgs || []).filter((m) => !m.read);
        if (unread.length > 0) {
          // Show the most recent unread
          const latest = unread.sort(
            (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
          )[0];
          setLatestMessage(latest);
          setShowMessageModal(true);
        }
      } catch (err) {
        console.error("Failed to load messages", err);
      }
    };
    loadMessages();
  }, [user]);


  return (
    <div className="space-y-4 sm:space-y-5">
      {showMessageModal && latestMessage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-8">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full p-6 space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs text-gray-500">
                  {new Date(latestMessage.createdAt).toLocaleString()}
                </p>
                <h3 className="text-lg font-semibold text-gray-900">
                  {latestMessage.title}
                </h3>
              </div>
              <button
                onClick={async () => {
                  setShowMessageModal(false);
                  try {
                    await markMessageRead(latestMessage._id);
                  } catch (err) {
                    console.error("mark read failed", err);
                  }
                }}
                className="text-gray-500 hover:text-gray-800"
                aria-label="Close"
              >
                ✕
              </button>
            </div>
            <p className="text-sm text-gray-700 leading-relaxed">
              {latestMessage.body}
            </p>
            <div className="flex justify-end">
              <button
                onClick={async () => {
                  setShowMessageModal(false);
                  try {
                    await markMessageRead(latestMessage._id);
                  } catch (err) {
                    console.error("mark read failed", err);
                  }
                }}
                className="bg-islamicGreen text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-teal-700 transition"
              >
                Got it
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Greeting card */}
      {user && (
        <div className="bg-gradient-to-r from-islamicGreen/90 to-emerald-700 text-white rounded-xl shadow-lg p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/15 flex items-center justify-center text-lg font-bold">
              {(user.firstName || user.fullName || "U")[0]}
            </div>
            <div>
              <p className="text-sm sm:text-base font-semibold">
                {t("dashboard.greeting", { name: user.firstName || user.fullName || "" })}
              </p>
              <p className="text-xs sm:text-sm text-emerald-100">
                {t("dashboard.greetingSubtitle")}
              </p>
            </div>
          </div>
          <div className="sm:ml-auto text-xs sm:text-sm text-emerald-100">
            {t("dashboard.nextStep")}:{" "}
            <span className="font-semibold text-white">{stats.nextStep}</span>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-4 sm:p-6 space-y-4">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 space-y-3">
            <h1 className="text-2xl sm:text-3xl font-bold text-islamicGreen">
              {t("dashboard.title")}
            </h1>
            <p className="text-sm sm:text-base text-gray-600">
              {t("dashboard.subtitle")}
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
            <StatCard
              label={t("dashboard.active")}
              value={stats.active}
              color="text-emerald-700"
              icon="active"
              accent="from-emerald-50 to-white"
            />
            <StatCard
              label={t("dashboard.completed")}
              value={stats.completed}
              color="text-blue-700"
              icon="completed"
              accent="from-blue-50 to-white"
            />
            <StatCard
              label={t("dashboard.underReview")}
              value={stats.underReview}
              color="text-amber-700"
              icon="review"
              accent="from-amber-50 to-white"
            />
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="flex-1 w-full">
            <p className="text-sm text-gray-600">
              {t("dashboard.nextStep")}:{" "}
              <span className="font-semibold text-gray-900">{stats.nextStep}</span>
            </p>
          </div>
          <button
            onClick={() => handleStart("TALAQ")}
            disabled={loading || activeCases.length > 0}
            className="w-full sm:w-auto bg-islamicGreen text-white px-5 py-3 rounded-lg font-semibold shadow-md hover:bg-teal-700 disabled:opacity-40 transition-all"
          >
            {loading ? t("dashboard.starting") : t("dashboard.startNewCase")}
          </button>
        </div>

        {errorMessage && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded text-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <span>{errorMessage}</span>
            {activeCases.length > 0 && (
              <button
                type="button"
                onClick={async () => {
                  // Explicitly reload latest case data before resuming
                  const freshCases = await loadCases();
                  const freshActives = freshCases.filter((c) => c.status !== "APPROVED");
                  if (freshActives.length > 0) {
                    setActiveCase(freshActives[0]);
                  }

                  // Clear message once they choose to resume
                  setErrorMessage("");

                  // Scroll down to the case steps area (do not rely on scroll for logic)
                  const el = document.querySelector("#case-steps-section");
                  if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
                }}
                className="mt-1 sm:mt-0 inline-flex items-center justify-center px-3 py-1.5 rounded-lg text-xs font-semibold bg-islamicGreen text-white hover:bg-teal-700 transition"
              >
                {t("dashboard.resumeCurrentCase") || "Resume current case"}
              </button>
            )}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* LEFT PANEL */}
        <div className="bg-white p-3 sm:p-4 lg:p-5 rounded-xl shadow-lg border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-lg sm:text-xl text-gray-800">{t("dashboard.completedCases")}</h2>
            <span className="text-xs sm:text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">
              {completedCases.length}
            </span>
          </div>

          {completedCases.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-sm text-gray-500 mb-4">{t("dashboard.noCasesYet")}</p>
              <button
                onClick={() => handleStart("TALAQ")}
                disabled={loading}
                className="w-full bg-islamicGreen text-white py-2.5 rounded-lg hover:bg-teal-700 transition-all duration-200 disabled:opacity-50 text-sm font-medium shadow-md hover:shadow-lg"
              >
                {loading ? t("dashboard.starting") : t("dashboard.startFirstCase")}
              </button>
            </div>
          ) : (
            <>
              <div className="space-y-2 max-h-[50vh] lg:max-h-[65vh] overflow-y-auto pr-2">
                {completedCases.map((c) => (
                  <div
                    key={c._id}
                    onClick={() => setActiveCase(c)}
                    className={`p-3 sm:p-4 border-2 rounded-lg cursor-pointer transition-all duration-200 ${activeCase?._id === c._id
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
                {loading ? t("dashboard.starting") : t("dashboard.startNewCase")}
              </button>
            </>
          )}
        </div>

        {/* RIGHT PANEL */}
        <div
          id="case-steps-section"
          className="col-span-1 lg:col-span-2 bg-white p-3 sm:p-4 lg:p-6 xl:p-8 rounded-xl shadow-lg border border-gray-100 min-h-[400px]"
        >
          {activeCase ? (
            <CaseSteps caseData={activeCase} onUpdated={loadCases} />
          ) : (
            <div className="text-center py-12 sm:py-16">
              <div className="text-5xl sm:text-6xl mb-4">📋</div>
              <h3 className="text-lg sm:text-xl font-semibold text-gray-700 mb-2">
                {t("dashboard.noActiveCase")}
              </h3>
              <p className="text-sm sm:text-base text-gray-500 mb-6">
                {allCases.length === 0
                  ? t("dashboard.noActiveCaseDesc1")
                  : t("dashboard.noActiveCaseDesc2")}
              </p>
              <button
                onClick={() => handleStart("TALAQ")}
                disabled={loading}
                className="w-full sm:w-auto bg-islamicGreen ..."
              >
                {loading ? t("dashboard.starting") : t("dashboard.startNewCase")}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, color, icon, accent = "from-gray-50 to-white" }) {
  const iconMap = {
    active: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l3 3" />
        <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8" />
      </svg>
    ),
    completed: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="m5 13 4 4L19 7" />
        <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8" />
      </svg>
    ),
    review: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l2.5 2.5" />
        <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8" />
      </svg>
    ),
  };

  return (
    <div className={`flex-1 bg-gradient-to-br ${accent} border border-gray-100 rounded-xl px-4 py-3 shadow-sm`}>
      <div className="flex items-center gap-2 text-gray-600">
        <div className={`p-2 rounded-lg bg-white/70 ${color.replace("text", "text")}`}>
          {iconMap[icon] || null}
        </div>
        <p className="text-xs uppercase tracking-wide text-gray-500">{label}</p>
      </div>
      <p className={`text-2xl font-bold ${color} mt-2`}>{value}</p>
    </div>
  );
}
