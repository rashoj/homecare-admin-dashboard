// src/services/openShiftService.js
import api from "../api/axios"

export const getOpenShifts = async () => {
  const response = await api.get("/open-shifts")
  return response.data
}

export const getAvailableOpenShifts = async () => {
  const response = await api.get("/open-shifts/open")
  return response.data
}

export const createOpenShift = async (payload) => {
  const response = await api.post("/open-shifts", payload)
  return response.data
}

export const cancelOpenShift = async (openShiftId) => {
  const response = await api.put(`/open-shifts/${openShiftId}/cancel`)
  return response.data
}

export const claimOpenShift = async (openShiftId) => {
  const response = await api.post(`/open-shifts/${openShiftId}/claim`)
  return response.data
}