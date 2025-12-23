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
  const [viewMode, setViewMode] = useState("cases"); // "cases" or "darkhast"

  // Form states
  const [noticeData, setNoticeData] = useState({ hearingDate: "", notes: "" });
  const [hazriData, setHazriData] = useState({ applicantPresent: true, respondentPresent: true, qaziRemarks: "" });
  const [statementData, setStatementData] = useState({ applicantStatement: "", respondentStatement: "", qaziNotes: "" });
  const [arbitrationData, setArbitrationData] = useState({ result: "FAILED", notes: "" });
  const [faislaData, setFaislaData] = useState({ finalOrderText: "", qaziSignature: "", courtSealRef: "", decisionType: "" });
  const [adminMessage, setAdminMessage] = useState("");
  const [showHistory, setShowHistory] = useState(false);

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
      // Filter by view mode
      if (viewMode === "darkhast") {
        // Only show darkhast-related statuses
        const darkhastStatuses = ["DARKHAST_SUBMITTED", "DARKHAST_APPROVED", "DARKHAST_REJECTED"];
        if (!darkhastStatuses.includes(c.status)) return false;
      }

      const matchesFilter = filter === "ALL" || c.status === filter;
      const term = searchTerm.trim().toLowerCase();
      const matchesSearch =
        term === "" ||
        (c.type || "").toLowerCase().includes(term) ||
        (c.caseId || "").toString().toLowerCase().includes(term) ||
        (c.darkhast?.firstPartyName || c.darkhast?.applicantName || "").toLowerCase().includes(term) ||
        (c.darkhast?.secondPartyName || c.darkhast?.respondentName || "").toLowerCase().includes(term) ||
        (c.darkhast?.cnic || "").toLowerCase().includes(term);
      return matchesFilter && matchesSearch;
    });
  }, [cases, filter, searchTerm, viewMode]);

  const handleSelect = (c) => {
    setSelectedCase(c);
    setError("");
    setNoticeData({ hearingDate: "", notes: "" });
    setHazriData({ applicantPresent: true, respondentPresent: true, qaziRemarks: "" });
    setStatementData({ applicantStatement: "", respondentStatement: "", qaziNotes: "" });
    setAdminMessage("");
    setArbitrationData({ result: "FAILED", notes: "" });
    setFaislaData({
      finalOrderText: "",
      qaziSignature: user?.fullName || "Qazi Dar-ul-Qaza",
      courtSealRef: `DQ/NDD/${new Date().getFullYear()}/${c.caseId?.slice(-4).toUpperCase() || "X"}`,
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
            <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center shadow-inner border-2 border-emerald-100">
              <div className="w-6 h-6 border-2 border-islamicGreen rounded-full"></div>
            </div>
            <div>
              <h1 className="text-2xl font-black text-islamicGreen tracking-tight">Qazi Judicial Panel</h1>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Nanded, Maharashtra • Central Registry</p>
            </div>
          </div>
          <div className="mt-4 md:mt-0 flex gap-3">
            <div className="relative">
              <input
                type="text"
                placeholder="Search cases..."
                className="border border-emerald-100 bg-emerald-50/30 px-4 py-2 pl-10 rounded-xl text-sm focus:ring-2 focus:ring-islamicGreen outline-none transition-all w-64"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
              <span className="absolute left-3 top-2.5 opacity-30">🔍</span>
            </div>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="border border-emerald-100 bg-white px-4 py-2 rounded-xl text-sm focus:ring-2 focus:ring-islamicGreen outline-none transition-all"
            >
              <option value="ALL">All Status</option>
              <option value="DARKHAST_SUBMITTED">Submitted</option>
              <option value="DARKHAST_REJECTED">Rejected</option>
              <option value="DARKHAST_APPROVED">Approved</option>
              <option value="NOTICE_ISSUED">Notice Issued</option>
              <option value="HEARING_SCHEDULED">Hearing</option>
              <option value="CASE_CLOSED">Closed</option>
            </select>
            <button onClick={loadCases} className="bg-islamicGreen text-white px-6 py-2 rounded-xl font-bold text-sm shadow-md hover:bg-emerald-700 transition-all flex items-center gap-2">
              <span>🔄</span> Refresh
            </button>
          </div>
        </header>

        {/* VIEW MODE TABS */}
        <div className="bg-white rounded-2xl shadow-sm border border-emerald-100 p-2 flex gap-2">
          <button
            onClick={() => setViewMode("cases")}
            className={`flex-1 px-6 py-3 rounded-xl font-bold text-sm uppercase tracking-widest transition-all ${viewMode === "cases"
              ? "bg-islamicGreen text-white shadow-md"
              : "text-gray-400 hover:text-islamicGreen hover:bg-emerald-50"
              }`}
          >
            All Cases
          </button>
          <button
            onClick={() => setViewMode("darkhast")}
            className={`flex-1 px-6 py-3 rounded-xl font-bold text-sm uppercase tracking-widest transition-all ${viewMode === "darkhast"
              ? "bg-islamicGreen text-white shadow-md"
              : "text-gray-400 hover:text-islamicGreen hover:bg-emerald-50"
              }`}
          >
            Request Applications
          </button>
        </div>

        {/* MAIN TABLE VIEW */}
        <div className="bg-white rounded-3xl shadow-xl border border-emerald-50 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-emerald-50/50 border-b border-emerald-100">
                  <th className="px-6 py-4 text-[10px] font-black text-emerald-800 uppercase tracking-widest">
                    {viewMode === "darkhast" ? "Application ID" : "Case ID"}
                  </th>
                  <th className="px-6 py-4 text-[10px] font-black text-emerald-800 uppercase tracking-widest">Date</th>
                  <th className="px-6 py-4 text-[10px] font-black text-emerald-800 uppercase tracking-widest">
                    {viewMode === "darkhast" ? "First Party" : "Applicant"}
                  </th>
                  <th className="px-6 py-4 text-[10px] font-black text-emerald-800 uppercase tracking-widest">
                    {viewMode === "darkhast" ? "Second Party" : "Respondent"}
                  </th>
                  {viewMode === "cases" && (
                    <th className="px-6 py-4 text-[10px] font-black text-emerald-800 uppercase tracking-widest">Matter Type</th>
                  )}
                  <th className="px-6 py-4 text-[10px] font-black text-emerald-800 uppercase tracking-widest">Status</th>
                  <th className="px-6 py-4 text-[10px] font-black text-emerald-800 uppercase tracking-widest text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredCases.length === 0 ? (
                  <tr>
                    <td colSpan={viewMode === "cases" ? "7" : "6"} className="px-6 py-12 text-center text-gray-400 italic">
                      {viewMode === "darkhast" ? "No request applications found matching filters." : "No judicial records found matching filters."}
                    </td>
                  </tr>
                ) : (
                  filteredCases.map((c) => (
                    <tr
                      key={c._id}
                      className="hover:bg-emerald-50/30 transition-colors group cursor-pointer"
                      onClick={() => handleSelect(c)}
                    >
                      <td className="px-6 py-4">
                        <span className="text-xs font-black font-mono text-gray-400 group-hover:text-islamicGreen">
                          #{c.caseId?.slice(-6).toUpperCase() || "NEW"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-xs font-medium text-gray-500">
                          {new Date(c.createdAt).toLocaleDateString()}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-gray-900">
                            {c.darkhast?.firstPartyName || c.darkhast?.applicantName || "Anonymous"}
                          </span>
                          <span className="text-[10px] text-gray-400">{c.darkhast?.applicantCnic}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-medium text-gray-700">
                          {c.darkhast?.secondPartyName || c.darkhast?.respondentName || "---"}
                        </span>
                      </td>
                      {viewMode === "cases" && (
                        <td className="px-6 py-4">
                          <span className="text-xs font-bold text-islamicGreen bg-emerald-50 px-2 py-1 rounded-lg border border-emerald-100">
                            {c.type}
                          </span>
                        </td>
                      )}
                      <td className="px-6 py-4">
                        <StatusBadge status={c.status} />
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          className="text-xs font-black text-islamicGreen uppercase tracking-widest hover:underline"
                        >
                          Manage →
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* DETAIL PANEL MODAL */}
        {selectedCase && (
          <div className="fixed inset-0 z-40 flex items-center justify-center p-4 sm:p-6 lg:p-12">
            <div
              className="absolute inset-0 bg-emerald-950/40 backdrop-blur-sm"
              onClick={() => setSelectedCase(null)}
            ></div>
            <div className="relative bg-white w-full max-w-6xl max-h-full rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-fade-in-up">
              {/* Modal Header */}
              <div className="bg-islamicGreen px-8 py-6 flex justify-between items-center text-white shrink-0">
                <div>
                  <h2 className="text-2xl font-black tracking-tight uppercase">Case Management</h2>
                  <p className="text-emerald-100 text-xs font-bold tracking-widest opacity-80 mt-1">
                    REFERENCE: #{selectedCase.caseId} • {selectedCase.type}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedCase(null)}
                  className="bg-white/10 hover:bg-white/20 p-2 rounded-xl transition-all"
                >
                  ✕
                </button>
              </div>

              {/* Modal Content - Scrollable */}
              <div className="flex-1 overflow-y-auto custom-scrollbar">
                <div className="p-8 space-y-8">
                  {/* Simple Case Details Section */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Basic Information */}
                    <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
                      <h3 className="text-sm font-bold text-islamicGreen mb-4">Case Information</h3>
                      <div className="space-y-3">
                        <DataItem label="Application Number" value={selectedCase.displayId} />
                        <DataItem label="File Number" value={selectedCase.fileNumber || "Pending Approval"} />
                        <DataItem label="Case Type" value={selectedCase.type} />
                        <DataItem label="Status" value={selectedCase.status.replace(/_/g, ' ')} />
                        <DataItem label="Created" value={new Date(selectedCase.createdAt).toLocaleDateString()} />
                      </div>
                    </div>

                    {/* Party Details */}
                    <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
                      <h3 className="text-sm font-bold text-islamicGreen mb-4">Party Details</h3>
                      <div className="space-y-3">
                        <DataItem label="Applicant" value={selectedCase.darkhast?.applicantName || selectedCase.darkhast?.firstPartyName} />
                        <DataItem label="CNIC" value={selectedCase.darkhast?.applicantCnic || selectedCase.darkhast?.cnic} />
                        <DataItem label="Respondent" value={selectedCase.darkhast?.respondentName || selectedCase.darkhast?.secondPartyName} />
                        <DataItem label="Relief Requested" value={selectedCase.darkhast?.reliefRequested} />
                      </div>
                    </div>
                  </div>

                  <div className="w-full h-px bg-gray-200"></div>

                  {/* BOTTOM SECTION: JUDICIAL WORKFLOW ACTIONS */}
                  <div className="max-w-4xl mx-auto space-y-12">
                    {/* Stage Headers/Sections continue below... */}
                    {/* Reuse the Section components for stages */}
                    {/* STAGE 1: DARKHAST REVIEW */}
                    <Section
                      title="1. Application (Darkhast) Review"
                      active={selectedCase.status === 'DARKHAST_SUBMITTED'}
                      done={selectedCase.status !== 'DARKHAST_SUBMITTED'}
                    >
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-white border border-emerald-100 rounded-2xl p-6 shadow-sm">
                          <DataItem label="Nature of Dispute" value={selectedCase.type} accent />
                          <div className="mt-4">
                            <label className="text-[9px] font-black text-gray-300 uppercase block mb-1">Target Relief</label>
                            <p className="text-xs text-gray-600 font-bold">{selectedCase.darkhast?.reliefRequested || "N/A"}</p>
                          </div>
                        </div>

                        {selectedCase.status === 'DARKHAST_SUBMITTED' && (
                          <div className="flex flex-col gap-4">
                            <button
                              onClick={() => handleAdminAction(adminApi.approveDarkhast, { adminMessage })}
                              disabled={actionLoading}
                              className="w-full bg-islamicGreen text-white py-4 rounded-xl font-bold uppercase tracking-widest shadow-lg shadow-emerald-200 hover:bg-emerald-700 transition-all flex items-center justify-center gap-2"
                            >
                              <span>✅</span> Accept & Approve
                            </button>
                            <button
                              onClick={() => handleAdminAction(adminApi.rejectDarkhast, { adminMessage })}
                              disabled={actionLoading}
                              className="w-full bg-rose-600 text-white py-4 rounded-xl font-bold uppercase tracking-widest shadow-lg shadow-rose-200 hover:bg-rose-700 transition-all flex items-center justify-center gap-2"
                            >
                              <span>❌</span> Reject for Correction
                            </button>
                          </div>
                        )}
                      </div>
                    </Section>

                    {/* ADMIN COMMUNICATION BOX (Sticky-like or prominent) */}
                    <div className="bg-emerald-50/50 border-2 border-emerald-100 rounded-2xl p-6 space-y-3">
                      <div className="flex items-center justify-between">
                        <label className="text-[10px] font-black text-islamicGreen uppercase tracking-widest px-1">Message to Applicant (Notification)</label>
                        <span className="text-[9px] font-bold text-emerald-400 italic">Goes as a dashboard notification</span>
                      </div>
                      <textarea
                        placeholder="Type a message or reason for approval/rejection here... (Optional)"
                        value={adminMessage}
                        onChange={e => setAdminMessage(e.target.value)}
                        className="w-full bg-white border-2 border-emerald-50 rounded-xl p-4 text-sm focus:border-islamicGreen outline-none transition-all placeholder:text-gray-300"
                        rows="3"
                      />
                    </div>

                    {/* STAGE 2: NOTICE ISSUANCE */}
                    <Section
                      title="2. Issue Court Notice"
                      active={selectedCase.status === 'DARKHAST_APPROVED'}
                      done={selectedCase.status !== 'DARKHAST_SUBMITTED' && selectedCase.status !== 'DARKHAST_APPROVED'}
                    >
                      <div className="bg-white border border-emerald-100 rounded-2xl p-6 shadow-sm space-y-4">
                        {selectedCase.status === 'DARKHAST_APPROVED' ? (
                          <>
                            <div className="grid grid-cols-1 gap-4">
                              <div>
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 block">Hearing Date & Time</label>
                                <input
                                  type="datetime-local"
                                  className="w-full border-2 border-emerald-50 rounded-xl p-3 focus:border-islamicGreen outline-none transition-all"
                                  value={noticeData.hearingDate}
                                  onChange={e => setNoticeData({ ...noticeData, hearingDate: e.target.value })}
                                />
                              </div>
                              <div>
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 block">Qazi's Remarks for Notice</label>
                                <textarea
                                  placeholder="Enter specific instructions..."
                                  className="w-full border-2 border-emerald-50 rounded-xl p-3 text-sm h-24 focus:border-islamicGreen outline-none transition-all"
                                  value={noticeData.notes}
                                  onChange={e => setNoticeData({ ...noticeData, notes: e.target.value })}
                                />
                              </div>
                            </div>
                            <button
                              onClick={() => handleAdminAction(adminApi.issueNotice, noticeData)}
                              className="w-full bg-islamicGreen text-white py-4 rounded-xl font-bold uppercase tracking-widest shadow-lg shadow-emerald-200 hover:bg-emerald-700 transition-all"
                            >
                              Accept & Issue Notice
                            </button>
                          </>
                        ) : selectedCase.notice ? (
                          <div className="space-y-2">
                            <div className="flex items-center gap-2 text-emerald-600 font-bold text-sm">
                              <span className="text-xl">✅</span> Notice Issued
                            </div>
                            <p className="text-xs text-gray-500">Scheduled: {new Date(selectedCase.notice.hearingDate).toLocaleString()}</p>
                          </div>
                        ) : (
                          <p className="text-xs text-gray-400 italic">Complete preceding stage first.</p>
                        )}
                      </div>
                    </Section>

                    {/* STAGE 3: HAZRI & HEARING */}
                    <Section
                      title="3. Attendance (Hazri) & Hearing"
                      active={['NOTICE_ISSUED', 'HEARING_SCHEDULED'].includes(selectedCase.status)}
                      done={!['DARKHAST_SUBMITTED', 'DARKHAST_APPROVED', 'NOTICE_ISSUED', 'HEARING_SCHEDULED'].includes(selectedCase.status)}
                    >
                      <div className="bg-white border border-emerald-100 rounded-2xl p-6 shadow-sm space-y-6">
                        {selectedCase.status === 'NOTICE_ISSUED' && (
                          <button
                            onClick={() => handleAdminAction(adminApi.startHearing)}
                            className="w-full bg-islamicGreen text-white py-4 rounded-xl font-bold uppercase tracking-widest shadow-lg"
                          >
                            Initialize Hearing Session
                          </button>
                        )}

                        {selectedCase.status === 'HEARING_SCHEDULED' && (
                          <div className="space-y-6">
                            <div className="p-4 bg-emerald-50/50 rounded-xl space-y-4">
                              <h4 className="text-[10px] font-black text-emerald-800 uppercase tracking-widest">Attendance Sheet</h4>
                              <div className="grid grid-cols-2 gap-4">
                                <PresenceToggle label="Applicant" checked={hazriData.applicantPresent} onChange={v => setHazriData({ ...hazriData, applicantPresent: v })} />
                                <PresenceToggle label="Respondent" checked={hazriData.respondentPresent} onChange={v => setHazriData({ ...hazriData, respondentPresent: v })} />
                              </div>
                              <textarea
                                placeholder="Hazri / Presence Notes..."
                                className="w-full border-2 border-emerald-50 rounded-xl p-3 text-sm h-20"
                                value={hazriData.qaziRemarks}
                                onChange={e => setHazriData({ ...hazriData, qaziRemarks: e.target.value })}
                              />
                              <button
                                onClick={() => handleAdminAction(adminApi.recordAttendance, { hazri: { presentParties: [hazriData.applicantPresent && "Applicant", hazriData.respondentPresent && "Respondent"].filter(Boolean), signatures: "Verified by Qazi", notes: hazriData.qaziRemarks } })}
                                className="w-full bg-white border-2 border-islamicGreen text-islamicGreen py-2 rounded-lg font-bold text-xs"
                              >
                                Record Attendance
                              </button>
                            </div>

                            <div className="space-y-4">
                              <h4 className="text-[10px] font-black text-emerald-800 uppercase tracking-widest">Hearing Statement</h4>
                              <textarea
                                placeholder="Applicant's Statement..."
                                className="w-full border-2 border-emerald-50 rounded-xl p-3 text-sm h-24"
                                value={statementData.applicantStatement}
                                onChange={e => setStatementData({ ...statementData, applicantStatement: e.target.value })}
                              />
                              <textarea
                                placeholder="Respondent's Statement..."
                                className="w-full border-2 border-emerald-50 rounded-xl p-3 text-sm h-24"
                                value={statementData.respondentStatement}
                                onChange={e => setStatementData({ ...statementData, respondentStatement: e.target.value })}
                              />
                              <button
                                onClick={() => handleAdminAction(adminApi.recordStatement, { statement: statementData })}
                                className="w-full bg-islamicGreen text-white py-4 rounded-xl font-bold uppercase tracking-widest"
                              >
                                Accept & Finalize Hearing
                              </button>
                            </div>
                          </div>
                        )}

                        {['HEARING_COMPLETED', 'ARBITRATION_IN_PROGRESS', 'DECISION_PENDING', 'CASE_CLOSED'].includes(selectedCase.status) && (
                          <div className="flex items-center gap-2 text-emerald-600 font-bold text-sm">
                            <span className="text-xl">✅</span> Hearing Completed
                          </div>
                        )}
                      </div>
                    </Section>

                    {/* STAGE 4: ARBITRATION (SULH) */}
                    <Section
                      title="4. Compulsory Arbitration (Sulh)"
                      active={selectedCase.status === 'HEARING_COMPLETED' || selectedCase.status === 'ARBITRATION_IN_PROGRESS'}
                      done={['DECISION_PENDING', 'CASE_CLOSED'].includes(selectedCase.status)}
                    >
                      <div className="bg-white border border-emerald-100 rounded-2xl p-6 shadow-sm space-y-4">
                        {(selectedCase.status === 'HEARING_COMPLETED' || selectedCase.status === 'ARBITRATION_IN_PROGRESS') ? (
                          <div className="space-y-4">
                            <label className="text-[10px] font-black text-amber-700 uppercase tracking-widest mb-1 block">Arbitration Outcome</label>
                            <select
                              className="w-full border-2 border-emerald-50 rounded-xl p-3 focus:border-islamicGreen outline-none"
                              value={arbitrationData.result}
                              onChange={e => setArbitrationData({ ...arbitrationData, result: e.target.value })}
                            >
                              <option value="FAILED">Reconciliation Failed - Proceed with Divorce</option>
                              <option value="SUCCESS">Reconciliation Successful - Close Case Amicably</option>
                            </select>
                            <textarea
                              placeholder="Details of Sulh attempt..."
                              className="w-full border-2 border-emerald-50 rounded-xl p-3 text-sm h-24"
                              value={arbitrationData.notes}
                              onChange={e => setArbitrationData({ ...arbitrationData, notes: e.target.value })}
                            />
                            <button
                              onClick={() => handleAdminAction(adminApi.recordArbitration, arbitrationData)}
                              className="w-full bg-islamicGreen text-white py-4 rounded-xl font-bold uppercase tracking-widest shadow-lg"
                            >
                              Accept Arbitration Result
                            </button>
                          </div>
                        ) : selectedCase.status === 'CASE_CLOSED' && selectedCase.arbitration?.result === 'SUCCESS' ? (
                          <div className="flex items-center gap-2 text-emerald-600 font-bold text-sm">
                            <span className="text-xl">🤝</span> Reconciliation Achieved
                          </div>
                        ) : (['DECISION_PENDING', 'CASE_CLOSED'].includes(selectedCase.status)) ? (
                          <div className="flex items-center gap-2 text-amber-600 font-bold text-sm">
                            <span className="text-xl">⚖️</span> Proceeding to Decision
                          </div>
                        ) : (
                          <p className="text-xs text-gray-400 italic">Complete preceding stage first.</p>
                        )}
                      </div>
                    </Section>

                    {/* STAGE 5: FAISLA (ORDER SHEET) */}
                    <Section
                      title="5. Faisla (Final Order Sheet)"
                      active={selectedCase.status === 'DECISION_PENDING'}
                      done={selectedCase.status === 'CASE_CLOSED'}
                    >
                      <div className="bg-white border border-emerald-100 rounded-2xl p-6 shadow-sm space-y-4">
                        {selectedCase.status === 'DECISION_PENDING' ? (
                          <div className="space-y-4">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 block">Final Judgment Statement</label>
                            <textarea
                              placeholder="Enter the formal court decision here..."
                              className="w-full border-2 border-emerald-50 rounded-2xl p-4 h-64 font-serif text-sm leading-relaxed focus:border-islamicGreen outline-none"
                              value={faislaData.finalOrderText}
                              onChange={e => setFaislaData({ ...faislaData, finalOrderText: e.target.value })}
                            />
                            <button
                              onClick={() => handleAdminAction(adminApi.issueFaisla, faislaData)}
                              className="w-full bg-islamicGreen text-white py-5 rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-emerald-200 hover:bg-emerald-700 transition-all"
                            >
                              Accept & Issue Final Faisla
                            </button>
                          </div>
                        ) : selectedCase.status === 'CASE_CLOSED' ? (
                          <div className="p-4 bg-emerald-50 rounded-xl text-center">
                            <p className="font-bold text-islamicGreen uppercase tracking-widest text-xs">Judicial Record Closed</p>
                            <p className="text-[10px] text-emerald-600 mt-1">Certificate Issued on {new Date(selectedCase.updatedAt).toLocaleDateString()}</p>
                          </div>
                        ) : (
                          <p className="text-xs text-gray-400 italic">Complete preceding stage first.</p>
                        )}
                      </div>
                    </Section>

                    {/* JUDICIAL HISTORY SECTION */}
                    <div className="pt-8 border-t border-gray-100">
                      <button
                        onClick={() => setShowHistory(!showHistory)}
                        className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest hover:text-islamicGreen transition-colors"
                      >
                        {showHistory ? '▼' : '▶'} Judicial Action History
                      </button>
                      {showHistory && (
                        <div className="mt-4 space-y-3">
                          {selectedCase.history?.length > 0 ? (
                            selectedCase.history.slice().reverse().map((h, i) => (
                              <div key={i} className="flex gap-4 items-start p-3 bg-gray-50 rounded-xl border border-gray-100">
                                <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full mt-1.5 shrink-0"></div>
                                <div className="flex-1">
                                  <div className="flex justify-between items-start">
                                    <span className="text-[10px] font-black text-gray-900 uppercase tracking-tight">{h.status.replace(/_/g, ' ')}</span>
                                    <span className="text-[9px] font-bold text-gray-400">{new Date(h.timestamp).toLocaleString()}</span>
                                  </div>
                                  <p className="text-xs text-gray-500 mt-0.5">{h.note}</p>
                                  <p className="text-[8px] font-black text-gray-300 uppercase mt-1">BY: {h.changedBy}</p>
                                </div>
                              </div>
                            ))
                          ) : (
                            <p className="text-xs text-gray-400 italic">No history records found.</p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function Section({ title, children, active, done }) {
  return (
    <div className={`space-y-4 transition-opacity duration-300 ${active ? 'opacity-100' : done ? 'opacity-100' : 'opacity-40 grayscale-[0.5]'}`}>
      <h3 className="text-sm font-black uppercase tracking-[0.2em] text-islamicGreen flex items-center gap-3">
        <span className={`w-2 h-6 ${active ? 'bg-islamicGreen shadow-[0_0_8px_rgba(16,185,129,0.5)]' : done ? 'bg-emerald-500' : 'bg-gray-200'} rounded-full`}></span>
        {title}
        {done && <span className="ml-auto text-[10px] text-emerald-600 font-bold tracking-widest">COMPLETED</span>}
      </h3>
      <div className={`${done && !active ? 'pointer-events-none' : ''}`}>
        {children}
      </div>
    </div>
  );
}

function PresenceToggle({ label, checked, onChange }) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className={`flex-1 p-3 rounded-xl border-2 transition-all font-bold text-[10px] flex items-center justify-between ${checked ? 'bg-emerald-50 border-islamicGreen text-islamicGreen' : 'bg-gray-50 border-gray-100 text-gray-400'}`}
    >
      <span className="truncate">{label}: {checked ? ' حاضر (P)' : ' غیر حاضر (A)'}</span>
      <div className={`w-2 h-2 rounded-full flex-shrink-0 ml-1 ${checked ? 'bg-islamicGreen' : 'bg-gray-300'}`}></div>
    </button>
  );
}

function DataItem({ label, value, accent }) {
  return (
    <div className="group">
      <span className="text-[9px] font-black uppercase text-gray-300 group-hover:text-islamicGreen transition-colors block mb-0.5 tracking-tighter">{label}</span>
      <span className={`font-bold block truncate ${accent ? 'text-islamicGreen bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-100' : 'text-gray-900'} text-xs`}>{value || "---"}</span>
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
