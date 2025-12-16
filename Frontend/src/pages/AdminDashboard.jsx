import { useEffect, useMemo, useState } from "react";
import { useUser } from "@clerk/clerk-react";
import { getAllCases, transitionCase } from "../api/admin.api";
import StatusBadge from "../components/StatusBadge";

const FILTERS = [
  { value: "ALL", label: "All" },
  { value: "UNDER_REVIEW", label: "Under Review" },
  { value: "APPROVED", label: "Approved" },
  { value: "REJECTED", label: "Rejected" },
];

export default function AdminDashboard() {
  const { user } = useUser();
  const [cases, setCases] = useState([]);
  const [selectedCase, setSelectedCase] = useState(null);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState("ALL");
  const [searchTerm, setSearchTerm] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [sendBackNote, setSendBackNote] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    loadCases();
  }, []);

  const loadCases = async () => {
    setLoading(true);
    try {
      const data = await getAllCases();
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
        (c.type || c.divorceType || "").toLowerCase().includes(term) ||
        (c.caseId || c._id || "").toString().toLowerCase().includes(term) ||
        (c.createdBy || "").toLowerCase().includes(term);
      return matchesFilter && matchesSearch;
    });
  }, [cases, filter, searchTerm]);

  const pickDoc = (key) =>
    selectedCase?.affidavits?.[key] ||
    selectedCase?.details?.affidavits?.[key] ||
    selectedCase?.details?.[key];

  const documentList = [
    { key: "applicantAffidavit", label: "Applicant affidavit" },
    { key: "respondentAffidavit", label: "Respondent affidavit" },
    { key: "witnessAffidavit", label: "Witness affidavit" },
    { key: "nikahnama", label: "Nikahnama" },
    { key: "idProof", label: "ID proof" },
  ].map((d) => ({ ...d, url: pickDoc(d.key) })).filter((d) => d.url);

  const handleSelect = (c) => {
    setSelectedCase(c);
    setRejectReason("");
    setSendBackNote("");
    setError("");
  };

  const doTransition = async (nextStatus, note) => {
    if (!selectedCase?._id || !nextStatus) return;
    setActionLoading(true);
    setError("");
    try {
      await transitionCase(selectedCase._id, {
        nextStatus,
        note: note || undefined,
        assignedQazi: user?.id,
      });
      await loadCases();
      const updated = (await getAllCases()).find((c) => c._id === selectedCase._id);
      setSelectedCase(updated || null);
      setRejectReason("");
      setSendBackNote("");
    } catch (err) {
      setError(err?.response?.data?.message || "Action failed. Please try again.");
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-islamicBeige to-white p-3 sm:p-4 lg:p-6">
      <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6">
        <header className="bg-white rounded-2xl shadow-lg border border-gray-100 p-4 sm:p-6 flex flex-col gap-3 sm:gap-4">
          <div className="flex items-start sm:items-center justify-between gap-3">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-islamicGreen">Qazi Admin Panel</h1>
              <p className="text-sm text-gray-600">Review, verify, and issue formal decisions.</p>
            </div>
            {user && (
              <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-700 max-w-xs">
                Signed in as <span className="font-semibold">{user.fullName || user.emailAddresses[0]?.emailAddress}</span>
              </div>
            )}
          </div>
          <div className="flex flex-wrap gap-2 text-xs sm:text-sm">
            {FILTERS.map((f) => (
              <button
                key={f.value}
                onClick={() => setFilter(f.value)}
                className={`px-3 py-2 rounded-full border transition ${
                  filter === f.value
                    ? "bg-islamicGreen text-white border-islamicGreen shadow-sm"
                    : "bg-white text-gray-700 border-gray-200 hover:border-islamicGreen/50"
                }`}
              >
                {f.label}
              </button>
            ))}
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by ID, type, user..."
              className="flex-1 min-w-[160px] px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-islamicGreen"
            />
          </div>
          {error && (
            <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              {error}
            </div>
          )}
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Left Panel */}
          <div className="lg:col-span-2 bg-white border border-gray-100 rounded-2xl shadow-sm p-3 sm:p-4">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm text-gray-600">Cases ({filteredCases.length})</p>
              {loading && <span className="text-xs text-gray-500">Loading...</span>}
            </div>
            <div className="space-y-3 max-h-[70vh] overflow-y-auto pr-1">
              {filteredCases.length === 0 ? (
                <div className="text-center text-gray-500 text-sm py-6">No cases found.</div>
              ) : (
                filteredCases.map((c) => (
                  <button
                    key={c._id}
                    onClick={() => handleSelect(c)}
                    className={`w-full text-left border rounded-xl p-3 sm:p-4 transition shadow-sm hover:shadow ${
                      selectedCase?._id === c._id ? "border-islamicGreen bg-emerald-50/40" : "border-gray-100 bg-white"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-xs text-gray-500">Case ID</p>
                        <p className="font-mono text-xs break-all">{(c.caseId || c._id || "").toString()}</p>
                      </div>
                      <StatusBadge status={c.status} />
                    </div>
                    <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-gray-600">
                      <span className="px-2 py-1 rounded-full bg-gray-100 text-gray-700">{c.type || c.divorceType}</span>
                      <span>{new Date(c.createdAt).toLocaleDateString()}</span>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Right Panel */}
          <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-4 space-y-4">
            {selectedCase ? (
              <>
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-xs text-gray-500">Applicant</p>
                      <p className="font-semibold text-gray-900">
                        {selectedCase.details?.wifeName || selectedCase.details?.husbandName || "—"}
                      </p>
                    </div>
                    <StatusBadge status={selectedCase.status} />
                  </div>
                  <p className="text-xs text-gray-600">Divorce Type: {selectedCase.type || selectedCase.divorceType}</p>
                  <p className="text-xs text-gray-600">Created: {new Date(selectedCase.createdAt).toLocaleString()}</p>
                </div>

                <section className="pt-2 border-t space-y-2">
                  <h4 className="text-sm font-semibold text-gray-800">Applicant Information</h4>
                  <InfoRow label="Husband" value={selectedCase.details?.husbandName} />
                  <InfoRow label="Wife" value={selectedCase.details?.wifeName} />
                  <InfoRow label="CNIC" value={selectedCase.details?.cnic} />
                  <InfoRow label="Address" value={selectedCase.details?.address} />
                </section>

                <section className="pt-2 border-t space-y-2">
                  <h4 className="text-sm font-semibold text-gray-800">Resolution Notes</h4>
                  <InfoRow label="Outcome" value={selectedCase.resolution?.outcome} />
                  <InfoRow label="Attempt Date" value={selectedCase.resolution?.attemptDate} />
                  <InfoRow label="Description" value={selectedCase.resolution?.description} />
                </section>

                <section className="pt-2 border-t space-y-2">
                  <h4 className="text-sm font-semibold text-gray-800">Agreement</h4>
                  <InfoRow label="Mahr" value={selectedCase.details?.mahr} />
                  <InfoRow label="Maintenance / Iddat" value={selectedCase.details?.maintenance || selectedCase.details?.iddat} />
                  <InfoRow label="Custody" value={selectedCase.details?.custody} />
                  <InfoRow label="Conditions" value={selectedCase.details?.conditions} />
                </section>

                <section className="pt-2 border-t space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-semibold text-gray-800">Documents (Cloudinary)</h4>
                    <span className="text-[11px] text-gray-500">View only</span>
                  </div>
                  {documentList.length === 0 ? (
                    <p className="text-xs text-gray-500">No documents uploaded.</p>
                  ) : (
                    <div className="space-y-2">
                      {documentList.map((doc) => (
                        <DocRow key={doc.key} label={doc.label} url={doc.url} />
                      ))}
                    </div>
                  )}
                  <div className="text-[11px] text-gray-500 bg-amber-50 border border-amber-200 rounded-lg p-2">
                    Documents are uploaded by applicants to Cloudinary (unsigned). We only read the stored secure_url. If a link opens, Cloudinary is working; if it fails, check credentials/preset.
                  </div>
                </section>

                <section className="pt-2 border-t space-y-2">
                  <h4 className="text-sm font-semibold text-gray-800">Timeline</h4>
                  <div className="space-y-1 text-xs text-gray-700">
                    <p>Created: {new Date(selectedCase.createdAt).toLocaleString()}</p>
                    {Array.isArray(selectedCase.history) &&
                      selectedCase.history.map((h, idx) => (
                        <div key={`${h.status}-${idx}`} className="flex items-start gap-2">
                          <span className="mt-0.5 w-2 h-2 rounded-full bg-islamicGreen block" />
                          <div>
                            <p className="font-medium">{h.status?.replace(/_/g, " ")}</p>
                            <p className="text-gray-500">{new Date(h.timestamp || h.createdAt).toLocaleString()}</p>
                            {h.note && <p className="text-gray-500">{h.note}</p>}
                          </div>
                        </div>
                      ))}
                  </div>
                </section>

                <section className="pt-2 border-t space-y-3">
                  <h4 className="text-sm font-semibold text-gray-800">Qazi Actions</h4>
                  <div className="flex flex-col gap-2">
                    <button
                      onClick={() => doTransition("APPROVED")}
                      disabled={actionLoading}
                      className="w-full bg-islamicGreen text-white py-2 rounded-lg text-sm font-semibold hover:bg-teal-700 disabled:opacity-60"
                    >
                      {actionLoading ? "Working..." : "Approve (lock case)"}
                    </button>
                    <div className="space-y-2">
                      <textarea
                        value={rejectReason}
                        onChange={(e) => setRejectReason(e.target.value)}
                        placeholder="Reason for rejection (required)"
                        rows="3"
                        className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                      />
                      <button
                        onClick={() => rejectReason.trim() && doTransition("REJECTED", rejectReason.trim())}
                        disabled={actionLoading || !rejectReason.trim()}
                        className="w-full bg-red-500 text-white py-2 rounded-lg text-sm font-semibold hover:bg-red-600 disabled:opacity-60"
                      >
                        {actionLoading ? "Working..." : "Reject with reason"}
                      </button>
                    </div>
                    <div className="space-y-2">
                      <textarea
                        value={sendBackNote}
                        onChange={(e) => setSendBackNote(e.target.value)}
                        placeholder="Notes for correction (will be visible to applicant)"
                        rows="2"
                        className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                      />
                      <button
                        onClick={() => doTransition("FORM_COMPLETED", sendBackNote || "Please correct and resubmit.")}
                        disabled={actionLoading}
                        className="w-full bg-amber-500 text-white py-2 rounded-lg text-sm font-semibold hover:bg-amber-600 disabled:opacity-60"
                      >
                        {actionLoading ? "Working..." : "Send back for correction"}
                      </button>
                    </div>
                  </div>
                </section>

                <p className="text-[12px] text-gray-500 pt-2 border-t">
                  Final decisions are issued by qualified Islamic authorities.
                </p>
              </>
            ) : (
              <div className="text-center text-gray-500 text-sm py-10">Select a case to view details.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoRow({ label, value }) {
  if (!value) return null;
  return (
    <div className="text-xs text-gray-700">
      <span className="font-medium text-gray-600">{label}: </span>
      <span>{value}</span>
    </div>
  );
}

function DocRow({ label, url }) {
  const name = url?.split("/").pop();
  const isPdf = url?.toLowerCase().endsWith(".pdf");
  return (
    <a
      href={url}
      target="_blank"
      rel="noreferrer"
      className="flex items-center justify-between text-xs text-islamicGreen hover:text-teal-700 underline"
    >
      <span>{label}</span>
      <span className="truncate ml-2 text-gray-600">{name || url}</span>
      <span className="ml-2 text-[11px] text-gray-500">{isPdf ? "PDF" : "Image/Doc"}</span>
    </a>
  );
}