import api from "./axios";

export const getMyCases = async () => {
  const res = await api.get("/cases/my");
  return res.data;
};

export const startCase = async (divorceType) => {
  // Backend now expects { type } but we keep divorceType for backward compatibility
  const res = await api.post("/cases/start", {
    type: divorceType,
  });
  return res.data;
};

export const saveDivorceForm = async (caseId, formData) => {
  // New workflow: save as DRAFT details, then submit case for review
  await api.post(`/cases/${caseId}/draft`, { details: formData });
  const res = await api.post(`/cases/${caseId}/submit`);
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