import api from "../api/axios"

export async function getClients() {
  const response = await api.get("/clients")
  return response.data
}

export async function createClient(payload) {
  const response = await api.post("/clients", payload)
  return response.data
}