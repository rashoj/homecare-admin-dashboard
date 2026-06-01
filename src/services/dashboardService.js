import api from "../api/axios"

export const getAdminDashboard = async () => {
  const response = await api.get("/dashboard/admin")
  return response.data
}

export const getAdminVisitTrends = async () => {
  const response = await api.get("/dashboard/admin/visit-trends")
  return response.data
}

export const getAdminMarTrends = async () => {
  const response = await api.get("/dashboard/admin/mar-trends")
  return response.data
}

export const getAdminIncidentSeverity = async () => {
  const response = await api.get("/dashboard/admin/incident-severity")
  return response.data
}

export const getAdminEVVTrends = async () => {
  const response = await api.get("/dashboard/admin/evv-trends")
  return response.data
}

export const getAdminRecentActivity = async () => {
  const response = await api.get("/dashboard/admin/recent-activity")
  return response.data
}