import api from "./axios";

export const sendAdminMessage = async (payload) => {
  // payload: { caseId, recipientId, recipientEmail, title, body, senderId, senderName }
  const res = await api.post("/messages/admin/send", payload);
  return res.data;
};

export const getMyMessages = async (userId) => {
  const res = await api.get("/messages/my", {
    params: { userId },
  });
  return res.data;
};

export const markMessageRead = async (messageId) => {
  const res = await api.patch(`/messages/${messageId}/read`);
  return res.data;
};

export const getCaseMessages = async (caseId) => {
  const res = await api.get(`/messages/case/${caseId}`);
  return res.data;
};


