import api from "../api/axios"

export async function getCaregiverById(id) {
  const response = await api.get(`/users/${id}`)
  return response.data
}

export async function getCaregiverAppointments(id) {
  const response = await api.get(`/appointments/caregiver/${id}`)
  return response.data
}

export async function getCaregiverVisitNotes(id) {
  const response = await api.get(`/visit-notes/caregiver/${id}`)
  return response.data
}

export async function getCaregiverDocuments(id) {
  const response = await api.get(`/documents/user/${id}`)
  return response.data
}

export async function getCaregiverClockRecords() {
  const response = await api.get("/clock")
  return response.data
}