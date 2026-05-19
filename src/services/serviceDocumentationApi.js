import { getToken } from "./authStorage"

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL
export async function getPendingServiceDocumentation() {
  const token = getToken()

  const response = await fetch(
    `${API_BASE_URL}/service-documentation/pending`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  )

  if (!response.ok) {
    throw new Error("Failed to load pending service documentation.")
  }

  return response.json()
}

export async function getServiceDocumentationByClient(clientId) {
  const token = getToken()

  const response = await fetch(
    `${API_BASE_URL}/service-documentation/client/${clientId}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  )

  if (!response.ok) {
    throw new Error("Failed to load service documentation.")
  }

  return response.json()
}

export async function reviewServiceDocumentation(id, payload) {
  const token = getToken()

  const response = await fetch(
    `${API_BASE_URL}/service-documentation/${id}/review`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    }
  )

  if (!response.ok) {
    throw new Error("Failed to review service documentation.")
  }

  return response.json()
}

export async function submitServiceDocumentation(payload) {
  const token = getToken()

  const response = await fetch(
    `${API_BASE_URL}/service-documentation`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    }
  )

  if (!response.ok) {
    throw new Error("Failed to submit service documentation.")
  }

  return response.json()
}

export async function downloadServiceDocumentationPdf(id) {
  const token = getToken()

  const response = await fetch(
    `${API_BASE_URL}/service-documentation/${id}/pdf`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  )

  if (!response.ok) {
    throw new Error("Failed to download PDF.")
  }

  const blob = await response.blob()

  const url = window.URL.createObjectURL(blob)

  const link = document.createElement("a")

  link.href = url
  link.download = `service-documentation-${id}.pdf`

  document.body.appendChild(link)

  link.click()

  link.remove()

  window.URL.revokeObjectURL(url)
}