import { getToken } from "./authStorage"

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL
export async function getClientRiskRows() {
  const token = getToken()

  const response = await fetch(`${API_BASE_URL}/risk/clients`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  if (!response.ok) {
    throw new Error("Failed to load client risk dashboard.")
  }

  return response.json()
}