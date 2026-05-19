import api from "../api/axios"

export const getVisitNotes = async () => {

  const response = await api.get("/visit-notes")

  return response.data
}