import api from "../api/axios"

export const getSummaryReport = async (
  clientRate,
  caregiverRate
) => {

  const response = await api.get(
    `/reports/summary?clientRate=${clientRate}&caregiverRate=${caregiverRate}`
  )

  return response.data
}