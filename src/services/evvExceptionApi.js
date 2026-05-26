import api from "../api/axios"

export async function getEVVExceptions() {
  const response = await api.get("/evv-exceptions")
  return response.data
}

export async function getOpenEVVExceptions() {
  const response = await api.get("/evv-exceptions/open")
  return response.data
}

export async function reviewEVVException(id, payload) {
  const response = await api.put(`/evv-exceptions/${id}/review`, payload)
  return response.data
}

export async function getEVVExceptionAuditLogs(id) {
  const response = await api.get(`/evv-exceptions/${id}/audit-logs`)
  return response.data
}
export async function getEVVExceptionSummary() {
  const response = await api.get("/evv-exceptions/summary")
  return response.data
}
export async function getComplianceDashboard() {
  const response = await api.get("/evv-exceptions/compliance-dashboard")
  return response.data
}