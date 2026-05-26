import api from "../api/axios"

export async function getISPPlansByClient(clientId) {
  const response = await api.get(`/isp/clients/${clientId}/plans`)
  return response.data
}

export async function createISPPlan(payload) {
  const response = await api.post("/isp/plans", payload)
  return response.data
}

export async function getActiveISPGoalsByClient(clientId) {
  const response = await api.get(`/isp/clients/${clientId}/goals/active`)
  return response.data
}

export async function createISPGoal(payload) {
  const response = await api.post("/isp/goals", payload)
  return response.data
}

export async function getISPProgressByClient(clientId) {
  const response = await api.get(`/isp/clients/${clientId}/progress`)
  return response.data
}

export async function getISPProgressByServiceDocumentation(documentationId) {
  const response = await api.get(`/isp/service-documentation/${documentationId}/progress`)
  return response.data
}
