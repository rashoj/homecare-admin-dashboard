import api from "../api/axios"

export const getClockRecords = async () => {

  const response = await api.get("/clock")

  return response.data
}