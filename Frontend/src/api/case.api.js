import api from "./axios";

export const getMyCases = async () => {
  const res = await api.get("/cases/my");
  return res.data;
};

export const startCase = async (divorceType) => {
  const res = await api.post("/cases/start", {
    divorceType,
  });
  return res.data;
};

export const saveDivorceForm = async (caseId, formData) => {
  const res = await api.post(`/cases/${caseId}/form`, formData);
  return res.data;
};

export const saveResolution = async (caseId, resolutionData) => {
  const res = await api.post(`/cases/${caseId}/resolution`, resolutionData);
  return res.data;
};

export const saveAgreement = async (caseId, agreementData) => {
  const res = await api.post(`/cases/${caseId}/agreement`, agreementData);
  return res.data;
};

export const saveAffidavits = async (caseId, affidavitsData) => {
  const res = await api.post(`/cases/${caseId}/affidavits`, affidavitsData);
  return res.data;
};