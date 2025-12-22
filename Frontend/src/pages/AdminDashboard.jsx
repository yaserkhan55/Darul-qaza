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

  // Form states for different steps
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
      setError("Failed to load cases. Please retry.");
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
    // Reset forms
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

  const renderActionSection = () => {
    const status = selectedCase.status;

    switch (status) {
      case "DARKHAST_SUBMITTED":
        return (
          <div className="space-y-4">
            <h4 className="font-bold text-slate-800 uppercase text-xs tracking-widest border-b pb-2">Darkhast Review</h4>
            <button
              onClick={() => handleAdminAction(adminApi.approveDarkhast)}
              disabled={actionLoading}
              className="w-full bg-emerald-700 text-white py-3 rounded font-black uppercase tracking-widest hover:bg-emerald-800 disabled:opacity-50"
            >
              Issue Approval / منظوری دیں
            </button>
          </div>
        );

      case "DARKHAST_APPROVED":
        return (
          <div className="bg-amber-50 p-4 border border-amber-200 rounded text-center">
            <p className="text-amber-800 text-xs font-bold uppercase italic font-serif">Awaiting User to select Case Type</p>
          </div>
        );

      case "NOTICE_SENT":
        return (
          <div className="space-y-4">
            <h4 className="font-bold text-slate-800 uppercase text-xs tracking-widest border-b pb-2">Hearing Management</h4>
            <button
              onClick={() => handleAdminAction(adminApi.startHearing)}
              disabled={actionLoading}
              className="w-full bg-indigo-700 text-white py-3 rounded font-black uppercase tracking-widest hover:bg-indigo-800 disabled:opacity-50"
            >
              Start Hearing / سماعت شروع کریں
            </button>
          </div>
        );

      case "HEARING_IN_PROGRESS":
        return (
          <div className="space-y-6">
            <h4 className="font-bold text-slate-800 uppercase text-xs tracking-widest border-b pb-2">Record Hearing</h4>

            <div className="space-y-3 bg-slate-50 p-3 border rounded">
              <p className="text-[10px] font-black uppercase text-slate-400">Step 1: Record Attendance (Hazri)</p>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 text-xs">
                  <input type="checkbox" checked={hazriData.applicantPresent} onChange={e => setHazriData({ ...hazriData, applicantPresent: e.target.checked })} /> Applicant
                </label>
                <label className="flex items-center gap-2 text-xs">
                  <input type="checkbox" checked={hazriData.respondentPresent} onChange={e => setHazriData({ ...hazriData, respondentPresent: e.target.checked })} /> Respondent
                </label>
              </div>
              <input
                className="w-full text-xs border p-2 rounded"
                placeholder="Remarks on presence..."
                value={hazriData.qaziRemarks}
                onChange={e => setHazriData({ ...hazriData, qaziRemarks: e.target.value })}
              />
              <button onClick={() => handleAdminAction(adminApi.recordAttendance, hazriData)} className="w-full bg-slate-800 text-white py-1.5 rounded text-[10px] font-bold uppercase">Record Hazri</button>
            </div>

            <div className="space-y-3 bg-slate-50 p-3 border rounded">
              <p className="text-[10px] font-black uppercase text-slate-400">Step 2: Record Statements</p>
              <textarea placeholder="Applicant statement" className="w-full text-xs border p-2 rounded" rows="2" value={statementData.applicantStatement} onChange={e => setStatementData({ ...statementData, applicantStatement: e.target.value })} />
              <textarea placeholder="Respondent statement" className="w-full text-xs border p-2 rounded" rows="2" value={statementData.respondentStatement} onChange={e => setStatementData({ ...statementData, respondentStatement: e.target.value })} />
              <textarea placeholder="Qazi's judicial notes" className="w-full text-xs border p-2 rounded" rows="2" value={statementData.qaziNotes} onChange={e => setStatementData({ ...statementData, qaziNotes: e.target.value })} />
              <button onClick={() => handleAdminAction(adminApi.recordStatement, statementData)} className="w-full bg-slate-800 text-white py-1.5 rounded text-[10px] font-bold uppercase">Submit Statements</button>
            </div>

            <button onClick={() => handleAdminAction(adminApi.recordArbitration, { result: "FAILED", notes: "Proceeding to Arbitration stage." })} className="w-full bg-amber-600 text-white py-3 rounded font-black uppercase tracking-widest">Move to Arbitration</button>
          </div>
        );

      case "ARBITRATION_IN_PROGRESS":
        return (
          <div className="space-y-4">
            <h4 className="font-bold text-slate-800 uppercase text-xs tracking-widest border-b pb-2">Arbitration (Sulh) Report</h4>
            <select
              className="w-full border p-2 rounded font-bold"
              value={arbitrationData.result}
              onChange={e => setArbitrationData({ ...arbitrationData, result: e.target.value })}
            >
              <option value="FAILED">FAILED (Proceed to Faisla)</option>
              <option value="SUCCESS">SUCCESS (Close Case)</option>
            </select>
            <textarea
              placeholder="Detail of mediation attempt..."
              className="w-full border p-2 rounded italic text-sm"
              rows="3"
              value={arbitrationData.notes}
              onChange={e => setArbitrationData({ ...arbitrationData, notes: e.target.value })}
            />
            <button onClick={() => handleAdminAction(adminApi.recordArbitration, arbitrationData)} className="w-full bg-emerald-800 text-white py-3 rounded font-black uppercase tracking-widest">Confirm Resolution Result</button>
          </div>
        );

      case "DECISION_PENDING":
        return (
          <div className="space-y-4">
            <h4 className="font-bold text-slate-800 uppercase text-xs tracking-widest border-b pb-2">Issue Final Order Sheet</h4>
            <textarea
              placeholder="Final Order Text..."
              className="w-full border p-4 rounded bg-slate-50 italic text-sm"
              rows="8"
              value={faislaData.finalOrderText}
              onChange={e => setFaislaData({ ...faislaData, finalOrderText: e.target.value })}
            />
            <button onClick={() => handleAdminAction(adminApi.issueFaisla, faislaData)} className="w-full bg-slate-900 text-white py-4 rounded font-black uppercase tracking-widest shadow-xl">Issue Faisla / فیصلہ جاری کریں</button>
          </div>
        );

      default:
        // Handle Issue Notice form for other applicable statuses (like when first selecting type)
        // If type is selected but no notice yet
        if (selectedCase.type && !selectedCase.notice) {
          return (
            <div className="space-y-4">
              <h4 className="font-bold text-slate-800 uppercase text-xs tracking-widest border-b pb-2">Issue Notice & Fix Date</h4>
              <input type="datetime-local" className="w-full border p-2 rounded" value={noticeData.hearingDate} onChange={e => setNoticeData({ ...noticeData, hearingDate: e.target.value })} />
              <textarea placeholder="Notice notes..." className="w-full border p-2 rounded text-sm italic" rows="2" value={noticeData.notes} onChange={e => setNoticeData({ ...noticeData, notes: e.target.value })} />
              <button onClick={() => handleAdminAction(adminApi.issueNotice, noticeData)} className="w-full bg-slate-900 text-white py-3 rounded font-black uppercase tracking-widest">Generate Notice</button>
            </div>
          );
        }
        return <p className="text-center text-xs text-slate-400 italic">No further actions available for this status.</p>;
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] p-4 lg:p-8 font-serif">
      {!authChecked && (
        <AuthModal onAuth={() => setAuthChecked(true)} />
      )}

      <div className="max-w-7xl mx-auto space-y-6">
        <header className="flex flex-col md:flex-row justify-between items-center bg-white p-6 shadow-md border-b-4 border-slate-900">
          <div>
            <h1 className="text-3xl font-black uppercase tracking-tighter text-slate-900">Qazi Dashboard</h1>
            <p className="text-sm font-bold text-slate-500 uppercase tracking-[0.2em]">Dar-ul-Qaza Lahore • Judicial Panel</p>
          </div>
          <div className="mt-4 md:mt-0 flex gap-4">
            <input
              type="text"
              placeholder="Search cases..."
              className="border-2 border-slate-200 px-4 py-2 rounded font-sans text-sm focus:border-slate-900 outline-none"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
            <button onClick={loadCases} className="bg-slate-900 text-white px-6 py-2 rounded font-black uppercase text-xs tracking-widest">Refresh</button>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* List */}
          <div className="lg:col-span-1 space-y-3 max-h-[80vh] overflow-y-auto pr-2 custom-scrollbar">
            {filteredCases.map(c => (
              <CaseCard key={c._id} c={c} isSelected={selectedCase?._id === c._id} onSelect={() => handleSelect(c)} />
            ))}
          </div>

          {/* Details */}
          <div className="lg:col-span-2 space-y-8">
            {selectedCase ? (
              <div className="bg-white p-8 shadow-2xl border-2 border-slate-100 min-h-screen">
                <div className="flex justify-between items-start border-b-2 border-slate-100 pb-6 mb-8">
                  <div>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Active Record</span>
                    <h2 className="text-2xl font-black text-slate-900 font-mono italic">#{selectedCase.caseId?.slice(-8).toUpperCase()}</h2>
                  </div>
                  <StatusBadge status={selectedCase.status} />
                </div>

                {/* Darkhast Details */}
                <section className="space-y-4">
                  <h3 className="text-sm font-black uppercase tracking-[0.3em] text-slate-400 border-l-4 border-slate-900 pl-4 mb-6">Application Details</h3>
                  <div className="grid grid-cols-2 gap-y-4 text-sm">
                    <DataItem label="Applicant" value={selectedCase.darkhast?.applicantName} />
                    <DataItem label="Relation" value={selectedCase.darkhast?.fatherHusbandName} />
                    <DataItem label="CNIC" value={selectedCase.darkhast?.cnic} />
                    <DataItem label="Respondent" value={selectedCase.darkhast?.respondentName} />
                    <DataItem label="City" value={selectedCase.darkhast?.address} />
                    <DataItem label="Proceeding" value={selectedCase.type || "Pending Type Selection"} />
                  </div>
                  <div className="mt-6">
                    <span className="text-[10px] font-black uppercase text-slate-400 block mb-2">Original Statement</span>
                    <div className="bg-slate-50 p-4 border italic text-slate-700 text-sm leading-relaxed">
                      {selectedCase.darkhast?.statement}
                    </div>
                  </div>
                </section>

                {/* Workflow Action Panel */}
                <section className="mt-12 pt-8 border-t-4 border-slate-900">
                  {renderActionSection()}
                  {error && <p className="mt-4 text-red-600 bg-red-50 p-3 text-xs font-bold border-l-4 border-red-500">{error}</p>}
                </section>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center opacity-20 py-40 bg-slate-100 rounded-xl border-4 border-dashed border-slate-300">
                <span className="text-9xl">⚖️</span>
                <p className="text-2xl font-black uppercase tracking-[0.5em] mt-8">Select a Case</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function CaseCard({ c, isSelected, onSelect }) {
  return (
    <button
      onClick={onSelect}
      className={`w-full text-left p-4 border-2 transition-all ${isSelected ? 'bg-slate-900 border-slate-900 text-white shadow-xl translate-x-1' : 'bg-white border-slate-100 text-slate-900 hover:border-slate-300'}`}
    >
      <div className="flex justify-between items-start mb-2">
        <span className="text-[10px] font-black font-mono tracking-tighter opacity-60">#{c.caseId?.slice(-6).toUpperCase()}</span>
        <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded ${isSelected ? 'bg-white/20' : 'bg-slate-100'}`}>{c.status?.replace(/_/g, " ")}</span>
      </div>
      <p className="font-bold text-sm truncate uppercase tracking-widest">{c.darkhast?.applicantName || 'Anonymous'}</p>
      <p className={`text-[10px] italic mt-1 ${isSelected ? 'text-slate-400' : 'text-slate-500'}`}>{c.type || 'Inquiry Stage'}</p>
    </button>
  );
}

function DataItem({ label, value }) {
  return (
    <div>
      <span className="text-[10px] font-black uppercase text-slate-400 block">{label}</span>
      <span className="font-bold text-slate-900">{value || "---"}</span>
    </div>
  );
}

function AuthModal({ onAuth }) {
  const [code, setCode] = useState("");
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/90 p-4">
      <div className="bg-white border-b-8 border-slate-900 p-8 max-w-sm w-full space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-black uppercase tracking-widest text-slate-900">Judicial Access</h2>
          <p className="text-sm font-medium text-slate-500 mt-2 italic font-serif">Enter your Qazi credentials to access the judicial panel.</p>
        </div>
        <input
          type="password"
          value={code}
          onChange={e => setCode(e.target.value)}
          className="w-full border-4 border-slate-100 focus:border-slate-900 p-4 text-center font-black tracking-[1em] outline-none"
        />
        <button
          onClick={() => code === "QAZI" && onAuth()}
          className="w-full bg-slate-900 text-white py-4 font-black uppercase tracking-widest hover:bg-black transition-colors"
        >
          Verify & Enter
        </button>
      </div>
    </div>
  );
}
