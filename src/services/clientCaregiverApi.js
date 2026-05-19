import { getToken } from "./authStorage"

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL
export async function getClientCaregivers(clientId) {
  const token = getToken()

  const response = await fetch(
    `${API_BASE_URL}/client-caregivers/client/${clientId}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  )

  if (!response.ok) {
    throw new Error("Failed to load assigned caregivers.")
  }

  return response.json()
}

export async function assignCaregiverToClient(payload) {
  const token = getToken()

  const response = await fetch(`${API_BASE_URL}/client-caregivers`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    throw new Error("Failed to assign caregiver.")
  }

  return response.json()
}