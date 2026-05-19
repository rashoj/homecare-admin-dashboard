import { getToken } from "./authStorage"

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL
export async function getClientById(clientId) {
  const token = getToken()

  const response = await fetch(`${API_BASE_URL}/clients/${clientId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  if (!response.ok) {
    throw new Error("Failed to load client details.")
  }

  return response.json()
}

export async function getClientClockRecords(clientId) {
  const token = getToken()

  const response = await fetch(
    `${API_BASE_URL}/clock/client/${clientId}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  )

  if (!response.ok) {
    throw new Error("Failed to load client clock records.")
  }

  return response.json()
}
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
export async function getClientVisitNotes(clientId) {
  const token = getToken()

  const response = await fetch(
    `${API_BASE_URL}/visit-notes/client/${clientId}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  )

  if (!response.ok) {
    throw new Error("Failed to load visit notes.")
  }

  return response.json()
}
export async function getClientAppointments(clientId) {
  const token = getToken()

  const response = await fetch(
    `${API_BASE_URL}/appointments/client/${clientId}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  )

  if (!response.ok) {
    throw new Error("Failed to load client appointments.")
  }

  return response.json()
}
export async function getClientMedications(clientId) {
  const token = getToken()

  const response = await fetch(
    `${API_BASE_URL}/medications/client/${clientId}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  )

  if (!response.ok) {
    throw new Error("Failed to load client medications.")
  }

  return response.json()
}

export async function getClientMedicationLogs(clientId) {
  const token = getToken()

  const response = await fetch(
    `${API_BASE_URL}/medications/logs/client/${clientId}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  )

  if (!response.ok) {
    throw new Error("Failed to load medication logs.")
  }

  return response.json()
}

export async function logMedication(payload) {
  const token = getToken()

  const response = await fetch(`${API_BASE_URL}/medications/logs`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    throw new Error("Failed to log medication.")
  }

  return response.json()
}

export async function createVisitNote(payload) {
  const token = getToken()

  const response = await fetch(`${API_BASE_URL}/visit-notes`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    throw new Error("Failed to submit visit note.")
  }

  return response.json()
}