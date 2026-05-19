import { getToken } from "./authStorage"

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL
export async function getComplianceSummary() {
  const token = getToken()

  const response = await fetch(`${API_BASE_URL}/compliance/summary`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  if (!response.ok) {
    throw new Error("Failed to load compliance summary.")
  }

  return response.json()
}

export async function getClientComplianceRows() {
  const token = getToken()

  const response = await fetch(`${API_BASE_URL}/compliance/clients`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  if (!response.ok) {
    throw new Error("Failed to load client compliance.")
  }

  return response.json()
}

export async function getMissedMedicationAlerts() {
  const token = getToken()

  const response = await fetch(
    `${API_BASE_URL}/compliance/missed-medications`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  )

  if (!response.ok) {
    throw new Error("Failed to load missed medication alerts.")
  }

  return response.json()
}

export async function getMissingVisitNoteAlerts() {
  const token = getToken()

  const response = await fetch(
    `${API_BASE_URL}/compliance/missing-visit-notes`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  )

  if (!response.ok) {
    throw new Error("Failed to load missing visit note alerts.")
  }

  return response.json()
}