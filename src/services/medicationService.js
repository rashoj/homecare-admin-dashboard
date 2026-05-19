import api from "../api/axios"

export const getMedications = async () => {

  const response = await api.get("/medications")

  return response.data
}

export const createMedication = async (medicationData) => {

  const response = await api.post(
    "/medications",
    medicationData
  )

  return response.data
}