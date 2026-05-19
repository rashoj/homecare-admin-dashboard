import { getToken } from "./authStorage"

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL
export async function createIncident(payload) {
  const token = getToken()

  const response = await fetch(`${API_BASE_URL}/incidents`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    throw new Error("Failed to submit incident.")
  }

  return response.json()
}

export async function getIncidents() {
  const token = getToken()

  const response = await fetch(`${API_BASE_URL}/incidents`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  if (!response.ok) {
    throw new Error("Failed to load incidents.")
  }

  return response.json()
}

export async function reviewIncident(id, payload) {
  const token = getToken()

  const response = await fetch(`${API_BASE_URL}/incidents/${id}/review`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    throw new Error("Failed to review incident.")
  }

  return response.json()
}

export async function getIncidentAttachments(incidentId) {
  const token = getToken()

  const response = await fetch(
    `${API_BASE_URL}/incidents/${incidentId}/attachments`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  )

  if (!response.ok) {
    throw new Error("Failed to load incident attachments.")
  }

  return response.json()
}

export async function downloadIncidentAttachment(attachmentId, fileName) {
  const token = getToken()

  const response = await fetch(
    `${API_BASE_URL}/incidents/attachments/${attachmentId}/download`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  )

  if (!response.ok) {
    throw new Error("Failed to download attachment.")
  }

  const blob = await response.blob()
  const url = window.URL.createObjectURL(blob)

  const link = document.createElement("a")
  link.href = url
  link.download = fileName || `incident-attachment-${attachmentId}`

  document.body.appendChild(link)
  link.click()
  link.remove()

  window.URL.revokeObjectURL(url)
}

export async function uploadIncidentAttachment(incidentId, file) {
  const token = getToken()

  const formData = new FormData()
  formData.append("file", file)

  const response = await fetch(
    `${API_BASE_URL}/incidents/${incidentId}/attachments`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    }
  )

  if (!response.ok) {
    throw new Error("Failed to upload incident attachment.")
  }

  return response.json()
}
export async function downloadIncidentPdf(incidentId) {
  const token = getToken()

  const response = await fetch(
    `${API_BASE_URL}/incidents/${incidentId}/pdf`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  )

  if (!response.ok) {
    throw new Error("Failed to download incident PDF.")
  }

  const blob = await response.blob()
  const url = window.URL.createObjectURL(blob)

  const link = document.createElement("a")
  link.href = url
  link.download = `incident-report-${incidentId}.pdf`

  document.body.appendChild(link)
  link.click()
  link.remove()

  window.URL.revokeObjectURL(url)
}

export async function getIncidentsByClient(clientId) {
  const token = getToken()

  const response = await fetch(`${API_BASE_URL}/incidents/client/${clientId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  if (!response.ok) {
    throw new Error("Failed to load client incidents.")
  }

  return response.json()
}