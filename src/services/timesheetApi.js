import { getToken } from "./authStorage"

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL
export async function getTimesheets() {
  const token = getToken()

  const response = await fetch(`${API_BASE_URL}/timesheets`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  if (!response.ok) {
    throw new Error("Failed to load timesheets.")
  }

  return response.json()
}

export async function reviewTimesheet(id, payload) {
  const token = getToken()

  const response = await fetch(`${API_BASE_URL}/timesheets/${id}/review`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    throw new Error("Failed to review timesheet.")
  }

  return response.json()
}