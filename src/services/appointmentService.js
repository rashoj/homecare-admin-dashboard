import api from "../api/axios"

export const getAppointments = async () => {
  const response = await api.get("/appointments")

  return response.data
}

export const createAppointment = async (appointmentData) => {
  const response = await api.post("/appointments", appointmentData)

  return response.data
}

export const updateAppointmentStatus = async (id, payload) => {
  const response = await api.put(
    `/appointments/${id}/status`,
    payload
  )

  return response.data
}