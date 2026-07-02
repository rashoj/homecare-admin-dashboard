import api from "../api/axios";

export const getFraudSummary = async () => {
  const response = await api.get("/fraud-alerts/summary");
  return response.data;
};

export const getFraudAlerts = async () => {
  const response = await api.get("/fraud-alerts/open");
  return response.data;
};

export const resolveFraudAlert = async (id) => {
  const response = await api.put(`/fraud-alerts/${id}/resolve`);
  return response.data;
};