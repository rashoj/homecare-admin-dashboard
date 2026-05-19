import { getToken } from "./authStorage"

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL
export async function getCaregivers() {
  const token = getToken()

  const response = await fetch(`${API_BASE_URL}/caregivers`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  if (!response.ok) {
    throw new Error("Failed to load caregivers.")
  }

  return response.json()
}

export async function getCaregiverById(id) {
  const token = getToken()

  const response = await fetch(`${API_BASE_URL}/caregivers/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  if (!response.ok) {
    throw new Error("Failed to load caregiver.")
  }

  return response.json()
}