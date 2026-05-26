import api from "../api/axios"

export async function getMedications() {
  const response = await api.get("/medications")
  return response.data
}

export async function createMedication(payload) {
  const response = await api.post("/medications", payload)
  return response.data
}

export async function getDueMedicationsByClient(clientId) {
  const response = await api.get(`/medications/mar/client/${clientId}/due`)
  return response.data
}

export async function logMedication(payload) {
  const response = await api.post("/medications/logs", payload)
  return response.data
}

export async function getMARAlerts() {
  const response = await api.get("/medications/mar/alerts")
  return response.data
}

export async function getMARReviewLogs() {
  const response = await api.get("/medications/mar/review")
  return response.data
}

export async function getMARComplianceSummary() {
  const response = await api.get("/medications/mar/compliance-summary")
  return response.data
}

export async function createMARSupervisorAction(payload) {
  const response = await api.post("/medications/mar/actions", payload)
  return response.data
}

export async function getMARSupervisorActionsByLog(logId) {
  const response = await api.get(`/medications/mar/actions/log/${logId}`)
  return response.data
}