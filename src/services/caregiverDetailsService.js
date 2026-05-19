import api from "../api/axios"

export const getCaregiverById = async (id) => {
  const response = await api.get(`/users/${id}`)
  return response.data
}

export const getCaregiverAppointments = async (id) => {
  const response = await api.get(`/appointments/caregiver/${id}`)
  return response.data
}

export const getCaregiverVisitNotes = async (id) => {
  const response = await api.get(`/visit-notes/caregiver/${id}`)
  return response.data
}

export const getCaregiverDocuments = async (id) => {
  const response = await api.get(`/documents/user/${id}`)
  return response.data
}

export const getCaregiverClockRecords = async () => {
  const response = await api.get("/clock")
  return response.data
}