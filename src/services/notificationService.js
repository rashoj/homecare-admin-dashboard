import api from "../api/axios"

export const getUserNotifications = async (userId) => {
  const response = await api.get(`/notifications/user/${userId}`)
  return response.data
}