import { useEffect, useMemo, useState } from "react";
import { useUser } from "@clerk/clerk-react";
import { getAllCases, transitionCase } from "../api/admin.api";
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
  const [rejectReason, setRejectReason] = useState("");
  const [sendBackNote, setSendBackNote] = useState("");
  const [error, setError] = useState("");
  const [authChecked, setAuthChecked] = useState(false);
  const [authCode, setAuthCode] = useState("");

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



  const filters = useMemo(() => [
    { value: "ALL", label: t("admin.filters.all") },
    { value: "UNDER_REVIEW", label: t("admin.filters.underReview") },
    { value: "APPROVED", label: t("admin.filters.approved") },
    { value: "REJECTED", label: t("admin.filters.rejected") },
  ], [t]);

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
    { key: "applicantAffidavit", label: t("documents.labels.applicant") },
    { key: "respondentAffidavit", label: t("documents.labels.respondent") },
    { key: "witnessAffidavits", label: t("documents.labels.witness") },
    { key: "nikahnama", label: t("documents.labels.nikahnama") },
    { key: "idProof", label: t("documents.labels.idProof") },
  ]
    .flatMap((d) => {
      const value = pickDoc(d.key);
      if (!value) return [];

      if (Array.isArray(value)) {
        return value
          .filter(Boolean)
          .map((v, idx) => ({
            key: `${d.key}-${idx + 1}`,
            label: `${d.label} #${idx + 1}`,
            value: v,
          }));
      }

      return [{ key: d.key, label: d.label, value }];
    })
    .map((d) => {
      const raw = d.value;
      const url = typeof raw === "string" ? raw : raw?.url;
      const filename =
        (typeof raw === "object" && raw?.filename) || url?.split("/").pop();
      const uploadedAt =
        typeof raw === "object" && raw?.uploadedAt
          ? new Date(raw.uploadedAt)
          : null;

      return { ...d, url, filename, uploadedAt };
    })
    .filter((d) => d.url);

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
      const updatedCase = await transitionCase(selectedCase._id, {
        nextStatus,
        note: note || undefined,
        assignedQazi: user?.id,
      });

      // Send automatic notification to applicant
      if (selectedCase.createdBy) {
        let title = "";
        let body = "";
        if (nextStatus === "APPROVED") {
          title = t("admin.notifications.approved.title");
          body = t("admin.notifications.approved.body");
        } else if (nextStatus === "REJECTED") {
          title = t("admin.notifications.rejected.title");
          body = note || t("admin.notifications.rejected.body");
        } else {
          title = t("admin.notifications.update.title");
          body = note || t("admin.notifications.update.body");
        }

        try {
          await sendAdminMessage({
            caseId: selectedCase._id,
            recipientId: selectedCase.createdBy,
            title,
            body,
            senderId: user?.id,
            senderName: user?.fullName || "Dar-ul-Qaza Admin",
          });
        } catch (msgErr) {
          console.error("Failed to send admin message", msgErr);
        }
      }

      await loadCases();
      setSelectedCase(updatedCase || null);
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
      {/* Safety confirmation before entering admin controls */}
      {!authChecked && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 p-6 sm:p-7 max-w-md w-full space-y-4">
            <h2 className="text-xl font-bold text-gray-900">{t("admin.safety.title")}</h2>
            <p className="text-sm text-gray-600">
              {t("admin.safety.description")}
            </p>
            <input
              type="text"
              value={authCode}
              onChange={(e) => setAuthCode(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-islamicGreen"
              placeholder={t("admin.safety.placeholder")}
            />
            <button
              onClick={() => authCode.trim().toUpperCase() === "QAZI" && setAuthChecked(true)}
              className="w-full bg-islamicGreen text-white py-2.5 rounded-lg text-sm font-semibold hover:bg-teal-700 transition disabled:opacity-60"
              disabled={authCode.trim().length === 0}
            >
              {t("admin.safety.button")}
            </button>
            <p className="text-[12px] text-gray-500 text-center">
              {t("admin.disclaimer")}
            </p>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6">
        <header className="bg-white rounded-2xl shadow-lg border border-gray-100 p-4 sm:p-6 flex flex-col gap-3 sm:gap-4">
          <div className="flex items-start sm:items-center justify-between gap-3">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-islamicGreen">{t("admin.header.title")}</h1>
              <p className="text-sm text-gray-600">{t("admin.header.subtitle")}</p>
            </div>
            {user && (
              <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-700 max-w-xs">
                Signed in as <span className="font-semibold">{user.fullName || user.emailAddresses[0]?.emailAddress}</span>
              </div>
            )}
          </div>
          <div className="flex flex-wrap gap-2 text-xs sm:text-sm">
            {filters.map((f) => (
              <button
                key={f.value}
                onClick={() => setFilter(f.value)}
                className={`px-3 py-2 rounded-full border transition ${filter === f.value
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
              placeholder={t("admin.searchPlaceholder")}
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
                    className={`w-full text-left border rounded-xl p-3 sm:p-4 transition shadow-sm hover:shadow ${selectedCase?._id === c._id ? "border-islamicGreen bg-emerald-50/40" : "border-gray-100 bg-white"
                      }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-xs text-gray-500">{t("admin.caseId")}</p>
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
                  <h4 className="text-sm font-semibold text-gray-800">{t("form.personalDetails")}</h4>
                  <InfoRow label={t("form.husbandName")} value={selectedCase.details?.husbandName} />
                  <InfoRow label={t("form.wifeName")} value={selectedCase.details?.wifeName} />
                  <InfoRow label={t("form.aadharNumber")} value={selectedCase.details?.cnic || selectedCase.details?.wifeCnic || selectedCase.details?.husbandCnic} />
                  <InfoRow label={t("admin.details.address")} value={selectedCase.details?.address} />
                </section>

                <section className="pt-2 border-t space-y-2">
                  <h4 className="text-sm font-semibold text-gray-800">Resolution Notes</h4>
                  <InfoRow label="Outcome" value={selectedCase.resolution?.outcome} />
                  <InfoRow label="Attempt Date" value={selectedCase.resolution?.attemptDate} />
                  <InfoRow label="Description" value={selectedCase.resolution?.description} />
                </section>

                <section className="pt-2 border-t space-y-2">
                  <h4 className="text-sm font-semibold text-gray-800">{t("admin.details.agreement")}</h4>
                  <InfoRow label={t("form.mahrAmount")} value={selectedCase.details?.mahr} />
                  <InfoRow label="Maintenance / Iddat" value={selectedCase.details?.maintenance || selectedCase.details?.iddat} />
                  <InfoRow label="Custody" value={selectedCase.details?.custody} />
                  <InfoRow label="Conditions" value={selectedCase.details?.conditions} />
                </section>

                <section className="pt-2 border-t space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-semibold text-gray-800">{t("documents.title")}</h4>
                    <span className="text-[11px] text-gray-500">{t("admin.documents.viewOnly")}</span>
                  </div>
                  {documentList.length === 0 ? (
                    <p className="text-xs text-gray-500">{t("admin.documents.noDocs")}</p>
                  ) : (
                    <div className="space-y-2">
                      {documentList.map((doc) => (
                        <DocRow
                          key={doc.key}
                          label={doc.label}
                          url={doc.url}
                          filename={doc.filename}
                          uploadedAt={doc.uploadedAt}
                        />
                      ))}
                    </div>
                  )}
                  <div className="text-[11px] text-gray-500 bg-amber-50 border border-amber-200 rounded-lg p-2">
                    {t("admin.documents.note")}
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
                  <h4 className="text-sm font-semibold text-gray-800">{t("admin.actions.title")}</h4>
                  <div className="flex flex-col gap-2">
                    <button
                      onClick={() => doTransition("APPROVED")}
                      disabled={actionLoading}
                      className="w-full bg-islamicGreen text-white py-2 rounded-lg text-sm font-semibold hover:bg-teal-700 disabled:opacity-60"
                    >
                      {actionLoading ? t("common.loading") : t("admin.actions.approve")}
                    </button>
                    <div className="space-y-2">
                      <textarea
                        value={rejectReason}
                        onChange={(e) => setRejectReason(e.target.value)}
                        placeholder={t("admin.actions.rejectReason")}
                        rows="3"
                        className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                      />
                      <button
                        onClick={() => rejectReason.trim() && doTransition("REJECTED", rejectReason.trim())}
                        disabled={actionLoading || !rejectReason.trim()}
                        className="w-full bg-red-500 text-white py-2 rounded-lg text-sm font-semibold hover:bg-red-600 disabled:opacity-60"
                      >
                        {actionLoading ? t("common.loading") : t("admin.actions.reject")}
                      </button>
                    </div>
                    <div className="space-y-2">
                      <textarea
                        value={sendBackNote}
                        onChange={(e) => setSendBackNote(e.target.value)}
                        placeholder={t("admin.actions.correctionNote")}
                        rows="2"
                        className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                      />
                      <button
                        onClick={() => doTransition("FORM_COMPLETED", sendBackNote || "Please correct and resubmit.")}
                        disabled={actionLoading}
                        className="w-full bg-amber-500 text-white py-2 rounded-lg text-sm font-semibold hover:bg-amber-600 disabled:opacity-60"
                      >
                        {actionLoading ? t("common.loading") : t("admin.actions.sendBack")}
                      </button>
                    </div>
                  </div>
                </section>

                <p className="text-[12px] text-gray-500 pt-2 border-t">
                  {t("admin.disclaimer")}
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

function DocRow({ label, url, filename, uploadedAt }) {
  const name = filename || url?.split("/").pop();
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
      <span className="ml-2 text-[11px] text-gray-500">
        {isPdf ? "PDF" : "Image/Doc"}
        {uploadedAt && ` · ${uploadedAt.toLocaleDateString()}`}
      </span>
    </a>
  );
}