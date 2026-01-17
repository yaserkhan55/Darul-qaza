import api from "./axios";

export const getAllCases = async (params = {}) => {
  const res = await api.get("/cases/admin/all", { params });
  return res.data;
};

export const approveDarkhast = async (caseId, payload) => {
  const res = await api.put(`/cases/${caseId}/approve-darkhast`, payload);
  return res.data;
};

export const rejectDarkhast = async (caseId, payload) => {
  const res = await api.put(`/cases/${caseId}/reject-darkhast`, payload);
  return res.data;
};

export const sendBackForCorrection = async (caseId, payload) => {
  const res = await api.put(`/cases/${caseId}/send-back-correction`, payload);
  return res.data;
};

export const approveForContinue = async (caseId, payload) => {
  const res = await api.put(`/cases/${caseId}/approve-continue`, payload);
  return res.data;
};

export const issueNotice = async (caseId, payload) => {
  const res = await api.put(`/cases/${caseId}/issue-notice`, payload);
  return res.data;
};

export const scheduleHearing = async (caseId, payload) => {
  const res = await api.put(`/cases/${caseId}/schedule-hearing`, payload);
  return res.data;
};

export const startHearing = async (caseId) => {
  const res = await api.put(`/cases/${caseId}/start-hearing`);
  return res.data;
};

export const recordAttendance = async (caseId, hazri) => {
  const res = await api.put(`/cases/${caseId}/record-attendance`, { hazri });
  return res.data;
};

export const recordStatement = async (caseId, statement) => {
  const res = await api.put(`/cases/${caseId}/record-statement`, { statement });
  return res.data;
};

export const recordArbitration = async (caseId, payload) => {
  const res = await api.put(`/cases/${caseId}/record-arbitration`, payload);
  return res.data;
};

export const issueFaisla = async (caseId, faisla) => {
  const res = await api.put(`/cases/${caseId}/issue-faisla`, { faisla });
  return res.data;
};

export const closeCase = async (caseId) => {
  const res = await api.put(`/cases/${caseId}/close`);
  return res.data;
};

export const downloadCertificate = async (caseId) => {
  const res = await api.get(`/cases/${caseId}/certificate/pdf`, {
    responseType: "blob",
  });
  return res.data;
};




