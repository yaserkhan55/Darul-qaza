import { useEffect, useState } from "react";
import { getAllCases, approveCase } from "../api/admin.api";
import StatusBadge from "../components/StatusBadge";

export default function AdminDashboard() {
  const [cases, setCases] = useState([]);
  const [selectedCase, setSelectedCase] = useState(null);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState("ALL");
  const [searchTerm, setSearchTerm] = useState("");
  const [notes, setNotes] = useState("");

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

  const handleApprove = async (caseId) => {
    if (!confirm("Are you sure you want to approve this case?")) return;
    
    try {
      await approveCase(caseId);
      await loadCases();
      if (selectedCase?._id === caseId) {
        setSelectedCase(null);
      }
      alert("Case approved successfully");
    } catch (err) {
      alert("Failed to approve case");
    }
  };

  const filteredCases = cases.filter((c) => {
    const matchesFilter = filter === "ALL" || c.status === filter;
    const matchesSearch = searchTerm === "" || 
      c.divorceType.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c._id.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const statusCounts = {
    ALL: cases.length,
    STARTED: cases.filter(c => c.status === "STARTED").length,
    FORM_COMPLETED: cases.filter(c => c.status === "FORM_COMPLETED").length,
    RESOLUTION_SUCCESS: cases.filter(c => c.status === "RESOLUTION_SUCCESS").length,
    RESOLUTION_FAILED: cases.filter(c => c.status === "RESOLUTION_FAILED").length,
    AGREEMENT_DONE: cases.filter(c => c.status === "AGREEMENT_DONE").length,
    AFFIDAVITS_DONE: cases.filter(c => c.status === "AFFIDAVITS_DONE").length,
    UNDER_REVIEW: cases.filter(c => c.status === "UNDER_REVIEW").length,
    APPROVED: cases.filter(c => c.status === "APPROVED").length,
  };

  return (
    <div className="min-h-screen bg-islamicBeige p-3 sm:p-4 lg:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 mb-4 sm:mb-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
            <div className="flex-1 min-w-0">
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-islamicGreen mb-1 sm:mb-2">
                Qazi Admin Panel
              </h1>
              <p className="text-sm sm:text-base text-gray-600">Manage and review all divorce cases</p>
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
              <div className="flex-1 sm:flex-none bg-teal-50 border border-teal-200 rounded-lg px-3 sm:px-4 py-2">
                <p className="text-xs text-gray-500">Total Cases</p>
                <p className="text-base sm:text-lg font-bold text-islamicGreen">{cases.length}</p>
              </div>
              <div className="flex-1 sm:flex-none bg-blue-50 border border-blue-200 rounded-lg px-3 sm:px-4 py-2">
                <p className="text-xs text-gray-500">Under Review</p>
                <p className="text-base sm:text-lg font-bold text-blue-600">{statusCounts.UNDER_REVIEW}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Left Panel - Case List */}
          <div className="lg:col-span-2 space-y-4 sm:space-y-6">
            {/* Filters */}
            <div className="bg-white rounded-xl shadow-lg p-3 sm:p-4 lg:p-6">
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-4">
                <input
                  type="text"
                  placeholder="Search cases..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="flex-1 border rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-islamicGreen"
                />
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  className="border rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-islamicGreen"
                >
                  <option value="ALL">All Status ({statusCounts.ALL})</option>
                  <option value="STARTED">Started ({statusCounts.STARTED})</option>
                  <option value="FORM_COMPLETED">Form Completed ({statusCounts.FORM_COMPLETED})</option>
                  <option value="RESOLUTION_SUCCESS">Resolution Success ({statusCounts.RESOLUTION_SUCCESS})</option>
                  <option value="RESOLUTION_FAILED">Resolution Failed ({statusCounts.RESOLUTION_FAILED})</option>
                  <option value="AGREEMENT_DONE">Agreement Done ({statusCounts.AGREEMENT_DONE})</option>
                  <option value="AFFIDAVITS_DONE">Affidavits Done ({statusCounts.AFFIDAVITS_DONE})</option>
                  <option value="UNDER_REVIEW">Under Review ({statusCounts.UNDER_REVIEW})</option>
                  <option value="APPROVED">Approved ({statusCounts.APPROVED})</option>
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
                          onClick={() => setSelectedCase(c)}
                        >
                          <td className="py-3 px-2 font-mono text-xs">
                            {c._id.slice(-8).toUpperCase()}
                          </td>
                          <td className="py-3 px-2">{c.divorceType}</td>
                          <td className="py-3 px-2">
                            <StatusBadge status={c.status} />
                          </td>
                          <td className="py-2 sm:py-3 px-2 text-gray-600 hidden sm:table-cell">
                            {new Date(c.createdAt).toLocaleDateString()}
                          </td>
                          <td className="py-3 px-2">
                            {c.status === "UNDER_REVIEW" && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleApprove(c._id);
                                }}
                                className="bg-islamicGreen text-white px-3 py-1 rounded text-xs hover:opacity-90"
                              >
                                Approve
                              </button>
                            )}
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
                    <p className="font-mono text-xs">{selectedCase._id}</p>
                  </div>
                  
                  <div>
                    <p className="text-gray-500 mb-1">Divorce Type</p>
                    <p className="font-medium">{selectedCase.divorceType}</p>
                  </div>
                  
                  <div>
                    <p className="text-gray-500 mb-1">Status</p>
                    <StatusBadge status={selectedCase.status} />
                  </div>
                  
                  <div>
                    <p className="text-gray-500 mb-1">Created</p>
                    <p>{new Date(selectedCase.createdAt).toLocaleString()}</p>
                  </div>

                  {selectedCase.divorceForm && (
                    <div className="border-t pt-4 mt-4">
                      <p className="text-gray-500 mb-2 font-semibold">Divorce Form</p>
                      <div className="space-y-1 text-xs">
                        <p><span className="text-gray-500">Husband:</span> {selectedCase.divorceForm.husbandName}</p>
                        <p><span className="text-gray-500">Wife:</span> {selectedCase.divorceForm.wifeName}</p>
                        <p><span className="text-gray-500">CNIC:</span> {selectedCase.divorceForm.cnic}</p>
                      </div>
                    </div>
                  )}

                  {selectedCase.resolution && (
                    <div className="border-t pt-4 mt-4">
                      <p className="text-gray-500 mb-2 font-semibold">Resolution</p>
                      <div className="space-y-1 text-xs">
                        <p><span className="text-gray-500">Result:</span> {selectedCase.resolution.result}</p>
                        {selectedCase.resolution.mediatorName && (
                          <p><span className="text-gray-500">Mediator:</span> {selectedCase.resolution.mediatorName}</p>
                        )}
                      </div>
                    </div>
                  )}

                  {selectedCase.agreement && (
                    <div className="border-t pt-4 mt-4">
                      <p className="text-gray-500 mb-2 font-semibold">Agreement</p>
                      <div className="space-y-2 text-xs">
                        {selectedCase.agreement.mehr && (
                          <div>
                            <span className="text-gray-500 font-medium">Mahr:</span>
                            <p className="text-gray-700 mt-1">{selectedCase.agreement.mehr}</p>
                          </div>
                        )}
                        {selectedCase.agreement.iddat && (
                          <div>
                            <span className="text-gray-500 font-medium">Iddat:</span>
                            <p className="text-gray-700 mt-1">{selectedCase.agreement.iddat}</p>
                          </div>
                        )}
                        {selectedCase.agreement.custody && (
                          <div>
                            <span className="text-gray-500 font-medium">Custody:</span>
                            <p className="text-gray-700 mt-1">{selectedCase.agreement.custody}</p>
                          </div>
                        )}
                        {selectedCase.agreement.maintenance && (
                          <div>
                            <span className="text-gray-500 font-medium">Maintenance:</span>
                            <p className="text-gray-700 mt-1">{selectedCase.agreement.maintenance}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {selectedCase.affidavits && (
                    <div className="border-t pt-4 mt-4">
                      <p className="text-gray-500 mb-2 font-semibold">Affidavits</p>
                      <div className="space-y-1 text-xs">
                        <p className={selectedCase.affidavits.applicantAffidavit ? "text-green-600" : "text-gray-400"}>
                          {selectedCase.affidavits.applicantAffidavit ? "✓" : "✗"} Applicant Affidavit
                        </p>
                        <p className={selectedCase.affidavits.witnessAffidavit ? "text-green-600" : "text-gray-400"}>
                          {selectedCase.affidavits.witnessAffidavit ? "✓" : "✗"} Witness Affidavit
                        </p>
                        <p className={selectedCase.affidavits.supportAffidavit ? "text-green-600" : "text-gray-400"}>
                          {selectedCase.affidavits.supportAffidavit ? "✓" : "✗"} Support Affidavit
                        </p>
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
                      {selectedCase.updatedAt !== selectedCase.createdAt && (
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                          <span className="text-gray-600">Last Updated: {new Date(selectedCase.updatedAt).toLocaleString()}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {selectedCase.status === "UNDER_REVIEW" && (
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
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleApprove(selectedCase._id)}
                          className="flex-1 bg-islamicGreen text-white py-2 rounded-lg hover:bg-teal-700 transition-all text-sm font-medium"
                        >
                          ✓ Approve
                        </button>
                        <button
                          onClick={() => alert("Reject functionality - to be implemented")}
                          className="flex-1 bg-red-500 text-white py-2 rounded-lg hover:bg-red-600 transition-all text-sm font-medium"
                        >
                          ✗ Reject
                        </button>
                      </div>
                    </div>
                  )}

                  {selectedCase.status === "APPROVED" && (
                    <div className="border-t pt-4 mt-4">
                      <p className="text-green-600 font-semibold mb-2">✓ Case Approved</p>
                      <button
                        onClick={() => window.open(`/api/cases/${selectedCase._id}/certificate/pdf`, '_blank')}
                        className="w-full bg-teal-600 text-white py-2 rounded hover:opacity-90 text-sm font-medium"
                      >
                        Download Certificate
                      </button>
                    </div>
                  )}
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

