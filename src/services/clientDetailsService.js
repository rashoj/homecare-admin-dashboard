import api from "../api/axios"

export const getClientById = async (id) => {
  const response = await api.get(`/clients/${id}`)
  return response.data
}

export const getClientVisitNotes = async (id) => {
  const response = await api.get(`/visit-notes/client/${id}`)
  return response.data
}

export const getClientDocuments = async (id) => {
  const response = await api.get(`/documents/client/${id}`)
  return response.data
}

export const getClientMedications = async (id) => {
  const response = await api.get(`/medications/client/${id}`)
  return response.data
}

export const getClientAppointments = async (id) => {
  const response = await api.get(`/appointments/client/${id}`)
  return response.data
}