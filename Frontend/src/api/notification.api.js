import api from "./axios";

export const getMyNotifications = async () => {
    const response = await api.get("/notifications/my");
    return response.data;
};

export const markRead = async (id) => {
    const response = await api.patch(`/notifications/${id}/read`);
    return response.data;
};
