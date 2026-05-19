import api from "../api/axios"

export const getCaregiverDashboard = async (caregiverId) => {
  const response = await api.get(`/dashboard/caregiver/${caregiverId}`)
  return response.data
}

export const getCaregiverAppointments = async (caregiverId) => {
  const response = await api.get(`/appointments/caregiver/${caregiverId}`)
  return response.data
}