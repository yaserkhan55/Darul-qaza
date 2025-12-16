import { useEffect, useState } from "react";
import { useUser } from "@clerk/clerk-react";
import { getAllCases, transitionCase, downloadCertificate } from "../api/admin.api";
import { sendAdminMessage, getCaseMessages } from "../api/message.api";
import StatusBadge from "../components/StatusBadge";

const ADMIN_FILTERS = [
  { value: "ALL", label: "All" },
  { value: "PENDING_REVIEW", label: "Pending Review" },
  { value: "PENDING_HUSBAND_CONSENT", label: "Husband Consent" },
  { value: "ARBITRATION", label: "Arbitration" },
  { value: "APPROVED", label: "Approved" },
  { value: "REJECTED", label: "Rejected" },
  { value: "COMPLETED", label: "Completed" },
];

export default function AdminDashboard() {
  const { user } = useUser();
  const [cases, setCases] = useState([]);
  const [selectedCase, setSelectedCase] = useState(null);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState("ALL");
  const [searchTerm, setSearchTerm] = useState("");
  const [notes, setNotes] = useState("");
  const [messages, setMessages] = useState([]);
  const [messageTitle, setMessageTitle] = useState("");
  const [messageBody, setMessageBody] = useState("");
  const [messageSending, setMessageSending] = useState(false);

  useEffect(() => {
    loadCases();
  }, []);

  const loadCases = async () => {
    setLoading(true);
    try {
      const data = await getAllCases();
      setCases(data);
    } catch (err) {
      alert("Failed to load cases");
    } finally {
      setLoading(false);
    }
  };

  const handleTransition = async (caseId, nextStatus) => {
    if (!nextStatus) return;

    const label = nextStatus.replace(/_/g, " ");
    if (!window.confirm(`Move case to "${label}"?`)) return;

    try {
      await transitionCase(caseId, {
        nextStatus,
        note: notes,
        assignedQazi: user?.id || "admin",
      });
      await loadCases();
      if (selectedCase?._id === caseId) {
        const updated = (await getAllCases()).find((c) => c._id === caseId);
        setSelectedCase(updated || null);
      }
      setNotes("");
    } catch (err) {
      // eslint-disable-next-line no-alert
      alert(err.response?.data?.message || "Failed to update case");
    }
  };

  const filteredCases = cases.filter((c) => {
    const matchesFilter = filter === "ALL" || c.status === filter;
    const matchesSearch =
      searchTerm === "" ||
      (c.type || c.divorceType || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      (c.caseId || c._id || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      (c.createdBy || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const statusCounts = ADMIN_FILTERS.reduce(
    (acc, f) => ({
      ...acc,
      [f.value]: f.value === "ALL" ? cases.length : cases.filter((c) => c.status === f.value).length,
    }),
    { ALL: cases.length }
  );

  const handleSelectCase = async (caseData) => {
    setSelectedCase(caseData);
    setNotes("");
    try {
      if (caseData._id) {
        const msgs = await getCaseMessages(caseData._id);
        setMessages(msgs || []);
      } else {
        setMessages([]);
      }
    } catch (err) {
      console.error("Failed to load case messages", err);
      setMessages([]);
    }
  };

  const handleSendMessage = async () => {
    if (!selectedCase || !messageTitle.trim() || !messageBody.trim()) return;

    const recipientId = selectedCase.createdBy;
    if (!recipientId) {
      alert("This case does not have a linked user account.");
      return;
    }

    try {
      setMessageSending(true);
      const msg = await sendAdminMessage({
        caseId: selectedCase._id,
        recipientId,
        recipientEmail: selectedCase.applicantEmail,
        title: messageTitle.trim(),
        body: messageBody.trim(),
        senderId: user?.id,
        senderName: user?.fullName || "Dar-ul-Qaza Admin",
      });
      setMessages((prev) => [msg, ...prev]);
      setMessageTitle("");
      setMessageBody("");
    } catch (err) {
      alert(err.response?.data?.message || "Failed to send message");
    } finally {
      setMessageSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-islamicBeige p-3 sm:p-4 lg:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header / Top Navigation */}
        <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 mb-4 sm:mb-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
            <div className="flex-1 min-w-0">
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-islamicGreen mb-1 sm:mb-2">
                Qazi Admin Panel
              </h1>
              <p className="text-sm sm:text-base text-gray-600">Manage and review all divorce cases</p>
            </div>
            <div className="flex flex-wrap gap-2 w-full sm:w-auto items-stretch justify-end">
              <div className="flex-1 sm:flex-none bg-teal-50 border border-teal-200 rounded-lg px-3 sm:px-4 py-2">
                <p className="text-xs text-gray-500">Total Cases</p>
                <p className="text-base sm:text-lg font-bold text-islamicGreen">{cases.length}</p>
              </div>
              <div className="flex-1 sm:flex-none bg-blue-50 border border-blue-200 rounded-lg px-3 sm:px-4 py-2">
                <p className="text-xs text-gray-500">Under Review</p>
                <p className="text-base sm:text-lg font-bold text-blue-600">
                  {statusCounts.PENDING_REVIEW || 0}
                </p>
              </div>
              {user && (
                <div className="flex-1 sm:flex-none bg-gray-50 border border-gray-200 rounded-lg px-3 sm:px-4 py-2">
                  <p className="text-xs text-gray-500">Signed in as</p>
                  <p className="text-xs sm:text-sm font-medium text-gray-700 truncate">
                    {user.fullName || user.emailAddresses[0]?.emailAddress}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Left Panel - Case List */}
          <div className="lg:col-span-2 space-y-4 sm:space-y-6">
            {/* Filters & Search */}
            <div className="bg-white rounded-xl shadow-lg p-3 sm:p-4 lg:p-6">
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-4">
                <input
                  type="text"
                  placeholder="Search by case, type or user..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="flex-1 border rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-islamicGreen"
                />
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  className="border rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-islamicGreen"
                >
                  {ADMIN_FILTERS.map((f) => (
                    <option key={f.value} value={f.value}>
                      {f.label} ({statusCounts[f.value] || 0})
                    </option>
                  ))}
                </select>
              </div>

              {/* Case Table */}
              <div className="overflow-x-auto -mx-3 sm:mx-0">
                <table className="w-full text-xs sm:text-sm min-w-[600px]">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-2 sm:py-3 px-2 font-semibold text-gray-700">Case ID</th>
                      <th className="text-left py-2 sm:py-3 px-2 font-semibold text-gray-700">Type</th>
                      <th className="text-left py-2 sm:py-3 px-2 font-semibold text-gray-700">Status</th>
                      <th className="text-left py-2 sm:py-3 px-2 font-semibold text-gray-700 hidden sm:table-cell">Date</th>
                      <th className="text-left py-2 sm:py-3 px-2 font-semibold text-gray-700">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr>
                        <td colSpan="5" className="text-center py-8 text-gray-500">
                          Loading...
                        </td>
                      </tr>
                    ) : filteredCases.length === 0 ? (
                      <tr>
                        <td colSpan="5" className="text-center py-8 text-gray-500">
                          No cases found
                        </td>
                      </tr>
                    ) : (
                      filteredCases.map((c) => (
                        <tr
                          key={c._id}
                          className={`border-b border-gray-100 hover:bg-gray-50 cursor-pointer ${
                            selectedCase?._id === c._id ? "bg-teal-50" : ""
                          }`}
                          onClick={() => handleSelectCase(c)}
                        >
                          <td className="py-3 px-2 font-mono text-xs">
                            {(c.caseId || c._id || "").toString().slice(-8).toUpperCase()}
                          </td>
                          <td className="py-3 px-2">{c.type || c.divorceType}</td>
                          <td className="py-3 px-2">
                            <StatusBadge status={c.status} />
                          </td>
                          <td className="py-2 sm:py-3 px-2 text-gray-600 hidden sm:table-cell">
                            {new Date(c.createdAt).toLocaleDateString()}
                          </td>
                          <td className="py-3 px-2 text-xs text-gray-500">
                            {c.createdBy ? c.createdBy.slice(0, 10) : "-"}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Right Panel - Case Details */}
          <div className="lg:col-span-1">
            {selectedCase ? (
              <div className="bg-white rounded-xl shadow-lg p-3 sm:p-4 lg:p-6 sticky top-4 lg:top-6 max-h-[calc(100vh-8rem)] overflow-y-auto">
                <h3 className="text-lg font-semibold text-islamicGreen mb-4">
                  Case Details
                </h3>
                
                <div className="space-y-4 text-sm">
                  <div>
                    <p className="text-gray-500 mb-1">Case ID</p>
                    <p className="font-mono text-xs break-all">
                      {selectedCase.caseId || selectedCase._id}
                    </p>
                  </div>
                  
                  <div>
                    <p className="text-gray-500 mb-1">Divorce Type</p>
                    <p className="font-medium">{selectedCase.type || selectedCase.divorceType}</p>
                  </div>
                  
                  <div>
                    <p className="text-gray-500 mb-1">Status</p>
                    <StatusBadge status={selectedCase.status} />
                  </div>
                  
                  <div>
                    <p className="text-gray-500 mb-1">Created</p>
                    <p>{new Date(selectedCase.createdAt).toLocaleString()}</p>
                  </div>

                  {selectedCase.details && (
                    <div className="border-t pt-4 mt-4">
                      <p className="text-gray-500 mb-2 font-semibold">Applicant & Case Details</p>
                      <div className="space-y-2 text-xs">
                        {selectedCase.details.husbandName && (
                          <div>
                            <span className="text-gray-500 font-medium">Husband:</span>
                            <p className="text-gray-700 mt-1">{selectedCase.details.husbandName}</p>
                          </div>
                        )}
                        {selectedCase.details.wifeName && (
                          <div>
                            <span className="text-gray-500 font-medium">Wife:</span>
                            <p className="text-gray-700 mt-1">{selectedCase.details.wifeName}</p>
                          </div>
                        )}
                        {selectedCase.details.cnic && (
                          <div>
                            <span className="text-gray-500 font-medium">CNIC:</span>
                            <p className="text-gray-700 mt-1">{selectedCase.details.cnic}</p>
                          </div>
                        )}
                        {selectedCase.details.address && (
                          <div>
                            <span className="text-gray-500 font-medium">Address:</span>
                            <p className="text-gray-700 mt-1">{selectedCase.details.address}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {selectedCase.details && (
                    <div className="border-t pt-4 mt-4">
                      <p className="text-gray-500 mb-2 font-semibold">Agreement & Affidavits</p>
                      <div className="space-y-1 text-xs">
                        {selectedCase.details.mehr && (
                          <p className="text-gray-700">
                            <span className="font-medium text-gray-500">Mehr:</span> {selectedCase.details.mehr}
                          </p>
                        )}
                        {selectedCase.details.iddat && (
                          <p className="text-gray-700">
                            <span className="font-medium text-gray-500">Iddat:</span> {selectedCase.details.iddat}
                          </p>
                        )}
                        {selectedCase.details.custody && (
                          <p className="text-gray-700">
                            <span className="font-medium text-gray-500">Custody:</span>{" "}
                            {selectedCase.details.custody}
                          </p>
                        )}
                        {selectedCase.details.maintenance && (
                          <p className="text-gray-700">
                            <span className="font-medium text-gray-500">Maintenance:</span>{" "}
                            {selectedCase.details.maintenance}
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Case Timeline */}
                  <div className="border-t pt-4 mt-4">
                    <p className="text-gray-500 mb-3 font-semibold">Case Timeline</p>
                    <div className="space-y-2 text-xs">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-islamicGreen"></div>
                        <span className="text-gray-600">Case Created: {new Date(selectedCase.createdAt).toLocaleString()}</span>
                      </div>
                      {Array.isArray(selectedCase.history) &&
                        selectedCase.history.map((h, idx) => (
                          <div key={`${h.status}-${idx}`} className="flex items-start gap-2">
                            <div className="w-2 h-2 mt-1 rounded-full bg-blue-500"></div>
                            <div>
                              <span className="text-gray-700 font-medium">
                                {h.status.replace(/_/g, " ")}
                              </span>
                              <span className="text-gray-500 ml-1">
                                – {new Date(h.timestamp || h.createdAt).toLocaleString()}
                              </span>
                              {h.note && (
                                <p className="text-[11px] text-gray-500 mt-0.5">{h.note}</p>
                              )}
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>

                  {(selectedCase.status === "PENDING_REVIEW" ||
                    selectedCase.status === "PENDING_HUSBAND_CONSENT" ||
                    selectedCase.status === "ARBITRATION") && (
                    <div className="border-t pt-4 mt-4 space-y-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Add Notes
                        </label>
                        <textarea
                          value={notes}
                          onChange={(e) => setNotes(e.target.value)}
                          placeholder="Add review notes..."
                          rows="3"
                          className="w-full border rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-islamicGreen"
                        />
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={() => handleTransition(selectedCase._id, "APPROVED")}
                          className="flex-1 min-w-[45%] bg-islamicGreen text-white py-2 rounded-lg hover:bg-teal-700 transition-all text-sm font-medium"
                        >
                          ✓ Approve
                        </button>
                        <button
                          onClick={() => handleTransition(selectedCase._id, "REJECTED")}
                          className="flex-1 min-w-[45%] bg-red-500 text-white py-2 rounded-lg hover:bg-red-600 transition-all text-sm font-medium"
                        >
                          ✗ Reject
                        </button>
                        {selectedCase.status === "PENDING_REVIEW" && (
                          <button
                            onClick={() =>
                              handleTransition(selectedCase._id, "PENDING_HUSBAND_CONSENT")
                            }
                            className="w-full bg-amber-500 text-white py-2 rounded-lg hover:bg-amber-600 transition-all text-sm font-medium"
                          >
                            Request Husband Consent
                          </button>
                        )}
                        {(selectedCase.status === "PENDING_REVIEW" ||
                          selectedCase.status === "PENDING_HUSBAND_CONSENT") && (
                          <button
                            onClick={() => handleTransition(selectedCase._id, "ARBITRATION")}
                            className="w-full bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700 transition-all text-sm font-medium"
                          >
                            Move to Arbitration
                          </button>
                        )}
                      </div>
                    </div>
                  )}

                  {selectedCase.status === "APPROVED" && (
                    <div className="border-t pt-4 mt-4">
                      <p className="text-green-600 font-semibold mb-2">✓ Case Approved</p>
                      <button
                        onClick={() => downloadCertificate(selectedCase._id)}
                        className="w-full bg-teal-600 text-white py-2 rounded hover:opacity-90 text-sm font-medium"
                      >
                        Download Certificate
                      </button>
                    </div>
                  )}

                  {/* Admin → User Messaging */}
                  <div className="border-t pt-4 mt-4 space-y-3">
                    <p className="text-gray-500 mb-1 font-semibold">Messages to Applicant</p>
                    <div className="space-y-2 max-h-40 overflow-y-auto border border-gray-100 rounded-lg p-2 bg-gray-50">
                      {messages.length === 0 ? (
                        <p className="text-[11px] text-gray-400 text-center py-2">
                          No messages sent for this case yet.
                        </p>
                      ) : (
                        messages.map((m) => (
                          <div
                            key={m._id}
                            className="border-b border-gray-100 pb-2 mb-2 last:border-0 last:pb-0 last:mb-0"
                          >
                            <p className="text-[11px] text-gray-500">
                              {new Date(m.createdAt).toLocaleString()}
                            </p>
                            <p className="text-xs font-semibold text-gray-800">{m.title}</p>
                            <p className="text-xs text-gray-700">{m.body}</p>
                          </div>
                        ))
                      )}
                    </div>
                    <div className="space-y-2">
                      <input
                        type="text"
                        value={messageTitle}
                        onChange={(e) => setMessageTitle(e.target.value)}
                        placeholder="Message subject (visible to user)"
                        className="w-full border rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-islamicGreen"
                      />
                      <textarea
                        value={messageBody}
                        onChange={(e) => setMessageBody(e.target.value)}
                        placeholder="Write a calm, respectful message to the applicant..."
                        rows="3"
                        className="w-full border rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-islamicGreen"
                      />
                      <button
                        onClick={handleSendMessage}
                        disabled={messageSending || !messageTitle.trim() || !messageBody.trim()}
                        className="w-full bg-islamicGreen text-white py-2 rounded-lg hover:bg-teal-700 transition-all text-sm font-medium disabled:opacity-60"
                      >
                        {messageSending ? "Sending..." : "Send Message to Applicant"}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-lg p-6 text-center text-gray-500">
                Select a case to view details
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

