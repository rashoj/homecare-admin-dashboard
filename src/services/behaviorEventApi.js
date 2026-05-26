import api from "../api/axios"

export async function createBehaviorEvent(payload) {
  const response = await api.post("/behavior-events", payload)
  return response.data
}

export async function getBehaviorEventsByClient(clientId) {
  const response = await api.get(`/behavior-events/client/${clientId}`)
  return response.data
}

export async function getBehaviorEventsByServiceDocumentation(documentationId) {
  const response = await api.get(
    `/behavior-events/service-documentation/${documentationId}`
  )
  return response.data
}

export async function getBehaviorOptions(type) {
  const response = await api.get(`/behavior-events/options/${type}`)
  return response.data
}