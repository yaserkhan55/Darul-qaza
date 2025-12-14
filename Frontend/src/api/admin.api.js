import api from "./axios";

export const getAllCases = async () => {
  const res = await api.get("/cases/admin/all");
  return res.data;
};

export const approveCase = async (caseId) => {
  const res = await api.patch(`/cases/${caseId}/approve`);
  return res.data;
};

export const downloadCertificate = async (caseId) => {
  const res = await api.get(`/cases/${caseId}/certificate/pdf`, {
    responseType: 'blob',
  });
  return res.data;
};

