import api from "../api/axios"

export const getUsers = async () => {
  const response = await api.get("/users")
  return response.data
}
export async function registerUser(payload) {
  const response = await fetch("http://localhost:8080/api/auth/register", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    throw new Error("Failed to register user.")
  }

  return response.json()
}