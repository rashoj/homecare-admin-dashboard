import { getToken } from "./authStorage"

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL
export async function getAuthorizations() {
  const token = getToken()

  const response = await fetch(`${API_BASE_URL}/authorizations`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  if (!response.ok) {
    throw new Error("Failed to load authorizations.")
  }

  return response.json()
}

export async function closeAuthorization(id) {
  const token = getToken()

  const response = await fetch(
    `${API_BASE_URL}/authorizations/${id}/close`,
    {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  )

  if (!response.ok) {
    throw new Error("Failed to close authorization.")
  }

  return response.text()
}

export async function createAuthorization(payload) {
  const token = getToken()

  const response = await fetch(`${API_BASE_URL}/authorizations`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    throw new Error("Failed to create authorization.")
  }

  return response.json()
}