import api from "../api/axios"

export async function getEVVAlerts() {
  const response = await api.get("/evv-alerts")
  return response.data
}

export async function getUnreadEVVAlerts() {
  const response = await api.get("/evv-alerts/unread")
  return response.data
}

export async function markEVVAlertAsRead(id) {
  const response = await api.put(`/evv-alerts/${id}/read`)
  return response.data
}