import api from "../api/axios"

export const getSchedulerCaregivers = async () => {
  const response = await api.get("/scheduler/caregivers")
  return response.data
}