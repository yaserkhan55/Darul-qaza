import { useEffect, useMemo, useState } from "react";
import { useUser } from "@clerk/clerk-react";
import * as adminApi from "../api/admin.api";
import { sendAdminMessage } from "../api/message.api";
import StatusBadge from "../components/StatusBadge";
import { useTranslation } from "react-i18next";

export default function AdminDashboard() {
  const { t } = useTranslation();
  const { user } = useUser();
  const [cases, setCases] = useState([]);
  const [selectedCase, setSelectedCase] = useState(null);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState("ALL");
  const [searchTerm, setSearchTerm] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState("");
  const [authChecked, setAuthChecked] = useState(false);
  const [authCode, setAuthCode] = useState("");

  // Form states
  const [noticeData, setNoticeData] = useState({ hearingDate: "", notes: "" });
  const [hazriData, setHazriData] = useState({ applicantPresent: true, respondentPresent: true, qaziRemarks: "" });
  const [statementData, setStatementData] = useState({ applicantStatement: "", respondentStatement: "", qaziNotes: "" });
  const [arbitrationData, setArbitrationData] = useState({ result: "FAILED", notes: "" });
  const [faislaData, setFaislaData] = useState({ finalOrderText: "", qaziSignature: "", courtSealRef: "", decisionType: "" });

  useEffect(() => {
    loadCases();
  }, []);

  const loadCases = async () => {
    setLoading(true);
    try {
      const data = await adminApi.getAllCases();
      setCases(data || []);
    } catch (err) {
      setError("Failed to load cases.");
    } finally {
      setLoading(false);
    }
  };

  const filteredCases = useMemo(() => {
    return (cases || []).filter((c) => {
      const matchesFilter = filter === "ALL" || c.status === filter;
      const term = searchTerm.trim().toLowerCase();
      const matchesSearch =
        term === "" ||
        (c.type || "").toLowerCase().includes(term) ||
        (c.caseId || "").toString().toLowerCase().includes(term) ||
        (c.darkhast?.applicantName || "").toLowerCase().includes(term);
      return matchesFilter && matchesSearch;
    });
  }, [cases, filter, searchTerm]);

  const handleSelect = (c) => {
    setSelectedCase(c);
    setError("");
    setNoticeData({ hearingDate: "", notes: "" });
    setHazriData({ applicantPresent: true, respondentPresent: true, qaziRemarks: "" });
    setStatementData({ applicantStatement: "", respondentStatement: "", qaziNotes: "" });
    setArbitrationData({ result: "FAILED", notes: "" });
    setFaislaData({
      finalOrderText: "",
      qaziSignature: user?.fullName || "Qazi Dar-ul-Qaza",
      courtSealRef: `DQ/LHR/${new Date().getFullYear()}/${c.caseId?.slice(-4).toUpperCase() || "X"}`,
      decisionType: c.type
    });
  };

  const handleAdminAction = async (actionFn, ...args) => {
    setActionLoading(true);
    setError("");
    try {
      const updatedCase = await actionFn(selectedCase._id, ...args);
      await loadCases();
      setSelectedCase(updatedCase);
    } catch (err) {
      setError(err?.response?.data?.message || "Action failed.");
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] p-4 lg:p-8 font-sans">
      {!authChecked && <AuthModal onAuth={() => setAuthChecked(true)} />}

      <div className="max-w-7xl mx-auto space-y-6">
        <header className="flex flex-col md:flex-row justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-emerald-100">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center text-2xl">⚖️</div>
            <div>
              <h1 className="text-2xl font-black text-islamicGreen tracking-tight">Qazi Dashboard</h1>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Dar-ul-Qaza Lahore • Judicial Panel</p>
            </div>
          </div>
          <div className="mt-4 md:mt-0 flex gap-3">
            <input
              type="text"
              placeholder="Search by ID or Name..."
              className="border border-emerald-100 bg-emerald-50/30 px-4 py-2 rounded-xl text-sm focus:ring-2 focus:ring-islamicGreen outline-none transition-all w-64"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
            <button onClick={loadCases} className="bg-islamicGreen text-white px-6 py-2 rounded-xl font-bold text-sm shadow-md hover:bg-emerald-700 transition-all">Refresh</button>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* LEFT LIST */}
          <div className="lg:col-span-1 space-y-3 max-h-[80vh] overflow-y-auto pr-2 custom-scrollbar">
            {filteredCases.map(c => (
              <div
                key={c._id}
                onClick={() => handleSelect(c)}
                className={`p-4 rounded-2xl cursor-pointer border-2 transition-all duration-300 ${selectedCase?._id === c._id
                    ? 'bg-emerald-50 border-islamicGreen shadow-md shadow-emerald-100'
                    : 'bg-white border-gray-50 hover:border-emerald-100 hover:shadow-lg'
                  }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <span className="text-[10px] font-black font-mono text-gray-400 uppercase">#{c.caseId?.slice(-6)}</span>
                  <StatusBadge status={c.status} />
                </div>
                <p className="font-bold text-gray-900 truncate">{c.darkhast?.applicantName || 'Anonymous'}</p>
                <p className="text-xs text-gray-400 font-medium mt-1 uppercase tracking-tighter">{c.type || 'New Application'}</p>
              </div>
            ))}
          </div>

          {/* RIGHT DETAILS */}
          <div className="lg:col-span-3">
            {selectedCase ? (
              <div className="bg-white rounded-3xl shadow-xl border border-emerald-50 overflow-hidden min-h-[600px] flex flex-col md:flex-row">
                {/* LEFT DETAIL STRIP */}
                <div className="w-full md:w-80 bg-emerald-50/30 p-8 border-r border-emerald-50 space-y-8">
                  <div>
                    <h3 className="text-xs font-black text-emerald-800 uppercase tracking-widest mb-4">Case Registry</h3>
                    <div className="space-y-4">
                      <DataItem label="Applicant" value={selectedCase.darkhast?.applicantName} />
                      <DataItem label="Relation" value={selectedCase.darkhast?.fatherHusbandName} />
                      <DataItem label="Respondent" value={selectedCase.darkhast?.respondentName} />
                      <DataItem label="Nikah Date" value={selectedCase.darkhast?.nikahDate} />
                      <DataItem label="Type" value={selectedCase.type} accent />
                    </div>
                  </div>
                  <div className="pt-6 border-t border-emerald-100">
                    <h4 className="text-[10px] font-black text-gray-400 uppercase mb-2">Internal Notes</h4>
                    <p className="text-xs text-gray-500 italic leading-relaxed">
                      {selectedCase.darkhast?.reliefRequested || "No specific relief recorded."}
                    </p>
                  </div>
                </div>

                {/* RIGHT ACTION AREA */}
                <div className="flex-1 p-8 space-y-8">
                  {/* SECTION 1: APPLICATION REVIEW */}
                  <Section title="1. Application (Darkhast) Review" active={selectedCase.status === 'DARKHAST_SUBMITTED'}>
                    <div className="bg-white border border-emerald-100 rounded-2xl p-6 shadow-sm">
                      <p className="text-sm text-gray-600 mb-4 font-medium italic">"{selectedCase.darkhast?.statement}"</p>
                      {selectedCase.status === 'DARKHAST_SUBMITTED' && (
                        <button
                          onClick={() => handleAdminAction(adminApi.approveDarkhast)}
                          disabled={actionLoading}
                          className="w-full bg-islamicGreen text-white py-4 rounded-xl font-bold uppercase tracking-widest shadow-lg shadow-emerald-200 hover:bg-emerald-700 hover:-translate-y-0.5 transition-all"
                        >
                          Accept Application (Approve)
                        </button>
                      )}
                      {selectedCase.status !== 'DARKHAST_SUBMITTED' && (
                        <div className="flex items-center gap-2 text-emerald-600 font-bold text-sm">
                          <span className="text-xl">✅</span> Application Approved
                        </div>
                      )}
                    </div>
                  </Section>

                  {/* SECTION 2: ATTENDANCE & HEARING */}
                  <Section title="2. Attendance Form (Hazri)" active={selectedCase.status === 'HEARING_IN_PROGRESS' || selectedCase.status === 'NOTICE_SENT'}>
                    <div className="bg-white border border-emerald-100 rounded-2xl p-6 shadow-sm space-y-6">
                      {selectedCase.status === 'DARKHAST_APPROVED' && (
                        <p className="text-sm text-gray-400 italic">Awaiting user to select case type...</p>
                      )}

                      {selectedCase.status === 'NOTICE_SENT' && (
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-xs font-bold text-gray-400 uppercase">Fixed Hearing Date</p>
                              <p className="font-bold text-gray-900">{new Date(selectedCase.notice?.hearingDate).toLocaleString()}</p>
                            </div>
                            <button
                              onClick={() => handleAdminAction(adminApi.startHearing)}
                              className="bg-islamicGreen text-white px-6 py-2 rounded-xl font-bold text-sm"
                            >
                              Start Hearing Call
                            </button>
                          </div>
                        </div>
                      )}

                      {(selectedCase.type && !selectedCase.notice && selectedCase.status !== 'DARKHAST_SUBMITTED') && (
                        <div className="space-y-4">
                          <input type="datetime-local" className="w-full border-2 border-emerald-50 rounded-xl p-3" value={noticeData.hearingDate} onChange={e => setNoticeData({ ...noticeData, hearingDate: e.target.value })} />
                          <textarea placeholder="Qazi's Instruction for Notice..." className="w-full border-2 border-emerald-50 rounded-xl p-3 text-sm h-20" value={noticeData.notes} onChange={e => setNoticeData({ ...noticeData, notes: e.target.value })} />
                          <button onClick={() => handleAdminAction(adminApi.issueNotice, noticeData)} className="w-full bg-islamicGreen text-white py-3 rounded-xl font-bold">Issue Court Notice</button>
                        </div>
                      )}

                      {selectedCase.status === 'HEARING_IN_PROGRESS' && (
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <PresenceToggle label="Applicant" checked={hazriData.applicantPresent} onChange={v => setHazriData({ ...hazriData, applicantPresent: v })} />
                            <PresenceToggle label="Respondent" checked={hazriData.respondentPresent} onChange={v => setHazriData({ ...hazriData, respondentPresent: v })} />
                          </div>
                          <input placeholder="Hazri Remarks..." className="w-full border-2 border-emerald-50 rounded-xl p-3" value={hazriData.qaziRemarks} onChange={e => setHazriData({ ...hazriData, qaziRemarks: e.target.value })} />
                          <button onClick={() => handleAdminAction(adminApi.recordAttendance, hazriData)} className="w-full bg-islamicGreen text-white py-3 rounded-xl font-bold">Record Hazri & Accept Statement</button>
                        </div>
                      )}

                      {(selectedCase.attendance?.length > 0) && (
                        <div className="pt-4 border-t border-emerald-50">
                          <p className="text-[10px] font-black uppercase text-emerald-800 mb-2">Presence History</p>
                          {selectedCase.attendance.map((h, i) => (
                            <div key={i} className="text-xs bg-emerald-50/50 p-2 rounded-lg flex justify-between mb-2">
                              <span>{new Date(h.date).toLocaleDateString()}</span>
                              <span className="font-bold">{h.applicantPresent ? 'P' : 'A'} / {h.respondentPresent ? 'P' : 'A'}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </Section>

                  {/* SECTION 3: ORDER SHEET (FAISLA) */}
                  <Section title="3. Order Sheet (Faisla)" active={selectedCase.status === 'DECISION_PENDING' || selectedCase.status === 'ARBITRATION_IN_PROGRESS'}>
                    <div className="bg-white border border-emerald-100 rounded-2xl p-6 shadow-sm space-y-4">
                      {selectedCase.status === 'ARBITRATION_IN_PROGRESS' && (
                        <div className="space-y-4">
                          <p className="text-sm font-bold text-amber-700">Arbitration Result (Mandatory Sulh Attempt)</p>
                          <select className="w-full border-2 border-emerald-50 rounded-xl p-3" value={arbitrationData.result} onChange={e => setArbitrationData({ ...arbitrationData, result: e.target.value })}>
                            <option value="FAILED">Reconciliation Failed - Proceed to Faisla</option>
                            <option value="SUCCESS">Reconciliation Successful - Close Case</option>
                          </select>
                          <button onClick={() => handleAdminAction(adminApi.recordArbitration, arbitrationData)} className="w-full bg-islamicGreen text-white py-3 rounded-xl font-bold">Accept Arbitration Report</button>
                        </div>
                      )}

                      {selectedCase.status === 'DECISION_PENDING' && (
                        <div className="space-y-4">
                          <textarea
                            placeholder="Final Judgment / Order Sheet Text..."
                            className="w-full border-2 border-emerald-50 rounded-2xl p-4 h-40 font-serif"
                            value={faislaData.finalOrderText}
                            onChange={e => setFaislaData({ ...faislaData, finalOrderText: e.target.value })}
                          />
                          <button onClick={() => handleAdminAction(adminApi.issueFaisla, faislaData)} className="w-full bg-islamicGreen text-white py-4 rounded-2xl font-black uppercase tracking-widest shadow-xl">Issue Final Faisla</button>
                        </div>
                      )}

                      {selectedCase.status === 'CASE_CLOSED' && (
                        <div className="text-center py-4 bg-emerald-50 rounded-xl">
                          <p className="font-bold text-islamicGreen">Case Closed & Decision Finalized</p>
                        </div>
                      )}
                    </div>
                  </Section>
                </div>
              </div>
            ) : (
              <div className="h-full min-h-[600px] flex flex-col items-center justify-center opacity-20 bg-white border-4 border-dashed border-emerald-100 rounded-3xl">
                <span className="text-9xl mb-8">⚖️</span>
                <p className="text-2xl font-black text-islamicGreen tracking-[0.4em] uppercase">Select A Record</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function Section({ title, children, active }) {
  return (
    <div className={`space-y-4 transition-opacity duration-300 ${active ? 'opacity-100' : 'opacity-40 grayscale-[0.5]'}`}>
      <h3 className="text-sm font-black uppercase tracking-[0.2em] text-islamicGreen flex items-center gap-3">
        <span className={`w-2 h-6 ${active ? 'bg-islamicGreen shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-gray-200'} rounded-full`}></span>
        {title}
      </h3>
      {children}
    </div>
  );
}

function PresenceToggle({ label, checked, onChange }) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className={`flex-1 p-3 rounded-xl border-2 transition-all font-bold text-xs flex items-center justify-between ${checked ? 'bg-emerald-50 border-islamicGreen text-islamicGreen' : 'bg-gray-50 border-gray-100 text-gray-400'}`}
    >
      {label}: {checked ? ' حاضر (PRESENT)' : ' غیر حاضر (ABSENT)'}
      <div className={`w-3 h-3 rounded-full ${checked ? 'bg-islamicGreen' : 'bg-gray-300'}`}></div>
    </button>
  );
}

function DataItem({ label, value, accent }) {
  return (
    <div>
      <span className="text-[10px] font-black uppercase text-gray-400 block mb-0.5">{label}</span>
      <span className={`font-bold ${accent ? 'text-islamicGreen bg-emerald-50 px-2 py-0.5 rounded-lg' : 'text-gray-900'} text-sm`}>{value || "---"}</span>
    </div>
  );
}

function AuthModal({ onAuth }) {
  const [code, setCode] = useState("");
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-emerald-950/80 backdrop-blur-md p-4">
      <div className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl space-y-8 animate-fade-in-up">
        <div className="text-center">
          <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-6 shadow-inner">⚖️</div>
          <h2 className="text-2xl font-black text-islamicGreen tracking-tight">Judicial Panel</h2>
          <p className="text-xs font-bold text-gray-400 mt-2 uppercase tracking-widest leading-loose">Enter Qazi Authorization Code</p>
        </div>
        <input
          type="password"
          value={code}
          onChange={e => setCode(e.target.value)}
          className="w-full bg-emerald-50/50 border-2 border-emerald-50 focus:border-islamicGreen focus:bg-white p-5 rounded-2xl text-center font-black tracking-[1em] outline-none transition-all text-xl"
          placeholder="••••"
        />
        <button
          onClick={() => code === "QAZI" && onAuth()}
          className="w-full bg-islamicGreen text-white py-5 rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-emerald-200 hover:bg-emerald-700 hover:-translate-y-1 transition-all active:scale-95"
        >
          Verify & Access
        </button>
      </div>
    </div>
  );
}
