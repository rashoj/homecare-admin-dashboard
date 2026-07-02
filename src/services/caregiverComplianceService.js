import api from "../api/axios"

export const getCaregiverComplianceRecords = async (caregiverId) => {
  const response = await api.get(`/caregiver-compliance/caregiver/${caregiverId}`)
  return response.data
}

export const createCaregiverComplianceRecord = async (payload) => {
  const response = await api.post("/caregiver-compliance", payload)
  return response.data
}

export const getExpiringCaregiverComplianceRecords = async (days = 30) => {
  const response = await api.get(`/caregiver-compliance/expiring?days=${days}`)
  return response.data
}