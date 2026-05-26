import api from "../api/axios"

export async function getAdminOperationsSummary() {
  const response = await api.get("/admin-operations-dashboard/summary")
  return response.data
  
}