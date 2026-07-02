// src/services/caregiverTimeService.js
import api from "../api/axios"

export const getCurrentCaregiverShift = async () => {
  const response = await api.get("/caregiver-time/current")
  return response.data
}

export const getMyCaregiverTimeEntries = async () => {
  const response = await api.get("/caregiver-time/me")
  return response.data
}

export const caregiverShiftClockIn = async (payload) => {
  const response = await api.post("/caregiver-time/clock-in", payload)
  return response.data
}

export const caregiverShiftClockOut = async (payload) => {
  const response = await api.put("/caregiver-time/clock-out", payload)
  return response.data
}