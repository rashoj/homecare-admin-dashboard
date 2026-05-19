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

export async function getTodayCaregiverAssignment(caregiverId) {
  const token = getToken()

  const response = await fetch(
    `${API_BASE_URL}/caregiver/assignments/today?caregiverId=${caregiverId}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  )

  if (!response.ok) {
    throw new Error("Failed to load today's assignment.")
  }

  return response.json()
}

export async function clockIn(payload) {
  const token = getToken()

  const response = await fetch(`${API_BASE_URL}/clock/in`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    throw new Error("Clock in failed.")
  }

  return response.json()
}

export async function clockOut(payload) {
  const token = getToken()

  const response = await fetch(`${API_BASE_URL}/clock/out`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    throw new Error("Clock out failed.")
  }

  return response.json()
}

export async function getClockRecords() {
  const token = getToken()

  const response = await fetch(`${API_BASE_URL}/clock`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  if (!response.ok) {
    throw new Error("Failed to load clock records.")
  }

  return response.json()
}