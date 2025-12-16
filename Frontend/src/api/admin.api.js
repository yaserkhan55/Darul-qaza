import api from "./axios";

export const getAllCases = async (params = {}) => {
  const res = await api.get("/cases/admin/all", { params });
  return res.data;
};

// Generic transition handler for the status machine
// payload: { nextStatus, note, consentDocument, talaqCount, assignedQazi }
export const transitionCase = async (caseId, payload) => {
  const res = await api.patch(`/cases/${caseId}/transition`, payload);
  return res.data;
};

export const downloadCertificate = async (caseId) => {
  const res = await api.get(`/cases/${caseId}/certificate/pdf`, {
    responseType: "blob",
  });
  return res.data;
};


