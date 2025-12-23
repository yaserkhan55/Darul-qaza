import { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useUser } from "@clerk/clerk-react";
import { getMyCases, startCase } from "../api/case.api";
import { getMyMessages, markMessageRead } from "../api/message.api";
import StatusBadge from "../components/StatusBadge";
import CaseSteps from "../components/CaseSteps";
import CaseTimeline from "../components/CaseTimeline";
import LoadingSpinner from "../components/LoadingSpinner";
import MandatoryDarkhastForm from "../components/case-steps/MandatoryDarkhastForm";


const STEP_LABELS = {
  DARKHAST_SUBMITTED: "Application / درخواست",
  DARKHAST_APPROVED: "Case Type / قسم کے انتخاب",
  NOTICE_SENT: "Notice Issued / نوٹس کا اجراء",
  HEARING_IN_PROGRESS: "Under Hearing / سماعت جاری",
  ARBITRATION_IN_PROGRESS: "Arbitration / ثالثی (صلح)",
  DECISION_PENDING: "Decision Pending / فیصلے کا انتظار",
  DECISION_APPROVED: "Faisla Issued / فیصلہ جاری",
  CASE_CLOSED: "Completed / مکمل",
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
  const [showDarkhastForm, setShowDarkhastForm] = useState(false);

  const activeCases = useMemo(
    () => allCases.filter((c) => c.status !== "CASE_CLOSED"),
    [allCases]
  );

  const stats = useMemo(
    () => ({
      active: activeCases.length,
      completed: completedCases.length,
      underReview: allCases.filter((c) => c.status === "DARKHAST_SUBMITTED").length,
      nextStep: activeCase ? STEP_LABELS[activeCase.status] || activeCase.status : "Submit Darkhast",
    }),
    [activeCases.length, completedCases.length, allCases, activeCase, t]
  );


  const [selectedType, setSelectedType] = useState("");

  const loadCases = async (shouldUpdateActive = true) => {
    try {
      const data = await getMyCases();
      setAllCases(data);
      setErrorMessage("");

      const completed = data.filter((c) => c.status === "CASE_CLOSED");
      setCompletedCases(completed);

      if (shouldUpdateActive) {
        const actives = data.filter((c) => c.status !== "CASE_CLOSED");
        if (actives.length > 0) {
          setActiveCase(actives[0]);
          setShowDarkhastForm(false);
        } else if (completed.length > 0) {
          setActiveCase(completed[0]);
          setShowDarkhastForm(false);
        } else {
          setActiveCase(null);
        }
      }

      return data;
    } catch (err) {
      console.error("Failed to load cases:", err);
      setErrorMessage(t("dashboard.unableToLoad") || "Unable to load cases");
      return [];
    }
  };

  const handleStart = async (type) => {
    if (activeCases.length > 0) {
      setErrorMessage("Please complete your current case first");
      return;
    }
    setSelectedType(type);
    setShowDarkhastForm(true);
    setActiveCase(null);
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

      {!activeCase && !showDarkhastForm && (
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="bg-islamicGreen p-8 text-center">
            <h2 className="text-3xl font-bold text-white mb-2">{t("dashboard.title")}</h2>
            <p className="text-emerald-50 max-w-2xl mx-auto">
              {t("home.subtitle")}
            </p>
          </div>
          <div className="p-12 flex flex-col items-center justify-center text-center">
            <div className="w-24 h-24 bg-emerald-50 rounded-full flex items-center justify-center text-islamicGreen mb-6">
              <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">{t("dashboard.noActiveCase")}</h3>
            <p className="max-w-xs text-gray-500 mb-8">{t("dashboard.noActiveCaseDesc")}</p>
            <button
              onClick={() => window.location.href = "/"}
              className="bg-islamicGreen text-white px-8 py-3 rounded-xl font-bold hover:bg-emerald-700 transition shadow-lg shadow-emerald-100"
            >
              Start New Application
            </button>
          </div>
        </div>
      )}

      {activeCase && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center text-amber-700">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div>
              <h4 className="font-bold text-amber-900">{t("dashboard.activeCaseWarn")}</h4>
              <p className="text-sm text-amber-700">{t("dashboard.activeCaseWarnDesc")}</p>
            </div>
          </div>
          <button
            onClick={() => {
              const el = document.querySelector("#case-steps-section");
              if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
            }}
            className="bg-amber-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-amber-700 transition shadow-md"
          >
            {t("dashboard.resumeCase")}
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT PANEL: HISTORY & TIMELINE */}
        <div className="lg:col-span-1 space-y-6">
          {/* Timeline component */}
          <div className="bg-white p-6 rounded-2xl shadow-xl border border-gray-100">
            <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
              <svg className="w-5 h-5 text-islamicGreen" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              {t("dashboard.timelineTitle")}
            </h3>
            <div className="space-y-6 relative before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-100">
              <TimelineItem label={t("dashboard.timeline.application")} day="Day 1" active={activeCase?.status === "DARKHAST_SUBMITTED"} />
              <TimelineItem label={t("dashboard.timeline.review")} day="Day 2-3" active={activeCase?.status === "DARKHAST_APPROVED"} />
              <TimelineItem label={t("dashboard.timeline.hearing")} day="Day 5-10" active={activeCase?.status === "NOTICE_SENT" || activeCase?.status === "HEARING_IN_PROGRESS"} />
              <TimelineItem label={t("dashboard.timeline.arbitration")} day="Day 12" active={activeCase?.status === "ARBITRATION_IN_PROGRESS"} />
              <TimelineItem label={t("dashboard.timeline.decision")} day="Day 15" active={activeCase?.status === "DECISION_PENDING"} />
              <TimelineItem label={t("dashboard.timeline.certificate")} day="Day 30+" active={activeCase?.status === "DECISION_APPROVED" || activeCase?.status === "CASE_CLOSED"} />
            </div>
            <p className="mt-8 text-xs text-gray-400 italic leading-relaxed border-t pt-4">
              <strong className="text-islamicGreen font-black mr-1">Islamic Guidance:</strong> {t("dashboard.timelineGuidance")}
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-xl text-gray-800">{t("dashboard.closedRecords")}</h2>
              <span className="text-sm font-black text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100">
                {completedCases.length}
              </span>
            </div>

            <div className="space-y-3 max-h-[40vh] overflow-y-auto pr-2 custom-scrollbar">
              {completedCases.map((c) => (
                <div
                  key={c._id}
                  onClick={() => {
                    setActiveCase(c);
                    setShowDarkhastForm(false);
                  }}
                  className={`p-4 border-2 rounded-xl cursor-pointer transition-all duration-300 ${activeCase?._id === c._id
                    ? "bg-emerald-50 border-islamicGreen shadow-md"
                    : "border-gray-50 bg-gray-50/50 hover:border-emerald-200 hover:bg-white hover:shadow-lg"
                    }`}
                >
                  <div className="flex justify-between items-start gap-4">
                    <div>
                      <span className="font-bold text-gray-900 block mb-1">{c.type || c.divorceType}</span>
                      <span className="text-xs font-medium text-gray-400 font-mono tracking-tighter">
                        {new Date(c.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <StatusBadge status={c.status} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT PANEL: CASE STEPS */}
        <div
          id="case-steps-section"
          className="lg:col-span-2 bg-white p-6 sm:p-8 rounded-2xl shadow-2xl border border-gray-100 min-h-[500px]"
        >
          {showDarkhastForm ? (
            <MandatoryDarkhastForm
              onSubmitted={() => loadCases(true)}
              onCancel={() => setShowDarkhastForm(false)}
            />
          ) : activeCase ? (
            <CaseSteps caseData={activeCase} onUpdated={loadCases} />
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center py-20 opacity-40">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center text-4xl mb-6">
                <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">{t("dashboard.noActiveCase")}</h3>
              <p className="max-w-xs text-gray-500">{t("dashboard.noActiveCaseDesc")}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


function TimelineItem({ label, day, active }) {
  return (
    <div className={`flex items-start gap-4 relative z-10 ${active ? 'opacity-100Scale-105' : 'opacity-40'}`}>
      <div className={`w-[22px] h-[22px] rounded-full border-4 ${active ? 'bg-islamicGreen border-emerald-100 ring-2 ring-islamicGreen/20 shadow-lg' : 'bg-white border-slate-200'} transition-all shrink-0`} />
      <div className="flex-1">
        <p className={`text-sm font-bold ${active ? 'text-islamicGreen' : 'text-gray-600'}`}>{label}</p>
        <p className="text-[10px] uppercase font-black tracking-widest text-gray-400 mt-0.5">{day}</p>
      </div>
    </div>
  );
}

function StatCard({ label, value, color, icon, accent = "from-gray-50 to-white" }) {
  const iconMap = {
    active: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l3 3" />
        <circle cx="12" cy="12" r="9" />
      </svg>
    ),
    completed: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="m5 13 4 4L19 7" />
        <circle cx="12" cy="12" r="9" />
      </svg>
    ),
    review: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l2.5 2.5" />
        <circle cx="12" cy="12" r="9" />
      </svg>
    ),
  };

  return (
    <div className={`flex-1 bg-gradient-to-br ${accent} border border-gray-100 rounded-2xl p-5 shadow-lg transition-transform hover:scale-105`}>
      <div className="flex items-center gap-3 text-gray-600 mb-3">
        <div className={`p-2.5 rounded-xl bg-white shadow-sm ${color}`}>
          {iconMap[icon] || null}
        </div>
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">{label}</p>
      </div>
      <p className={`text-4xl font-black ${color} tracking-tighter`}>{value}</p>
    </div>
  );
}

