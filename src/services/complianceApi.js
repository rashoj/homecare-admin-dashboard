import api from "../api/axios"

export async function getComplianceSummary() {
  const response = await api.get("/compliance/summary")
  return response.data
}

export async function getClientComplianceRows() {
  const response = await api.get("/compliance/clients")
  return response.data
}

export async function getMissedMedicationAlerts() {
  const response = await api.get("/compliance/missed-medications")
  return response.data
}

export async function getMissingVisitNoteAlerts() {
  const response = await api.get("/compliance/missing-visit-notes")
  return response.data
}