import api from "../api/axios"

export const getUsers = async () => {
  const response = await api.get("/users")
  return response.data
}
export async function registerUser(payload) {
  const response = await api.post("/auth/register", payload)
  return response.data
}