import api from "../api/axios"

export const getClients = async () => {
  const response = await api.get("/clients")
  return response.data
}

export const createClient = async (clientData) => {
  const response = await api.post("/clients", clientData)
  return response.data
}