import api from "./axios";

export const getMyCases = async () => {
  const res = await api.get("/cases/my");
  return res.data;
};

export const submitDarkhast = async (darkhastData) => {
  const res = await api.post("/cases/darkhast", { darkhast: darkhastData });
  return res.data;
};

export const selectCaseType = async (caseId, type) => {
  const res = await api.put(`/cases/${caseId}/select-type`, { type });
  return res.data;
};

export const saveFormData = async (caseId, formData) => {
  const res = await api.put(`/cases/${caseId}/save-form`, { formData });
  return res.data;
};

export const saveResolution = async (caseId, resolutionData) => {
  const res = await api.put(`/cases/${caseId}/save-resolution`, resolutionData);
  return res.data;
};

export const saveAffidavits = async (caseId, affidavitsData) => {
  const res = await api.put(`/cases/${caseId}/save-affidavits`, affidavitsData);
  return res.data;
};

// Admin/Qazi Actions
export const approveDarkhast = async (caseId) => {
  const res = await api.put(`/cases/${caseId}/approve-darkhast`);
  return res.data;
};

export const issueNotice = async (caseId, payload) => {
  const res = await api.put(`/cases/${caseId}/issue-notice`, payload);
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
