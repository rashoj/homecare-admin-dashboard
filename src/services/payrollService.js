import api from "../api/axios"

export async function calculateCaregiverPayroll(caregiverId, hourlyRate) {
  const response = await api.get(
    `/payroll/caregiver/${caregiverId}?hourlyRate=${hourlyRate}`
  )
  return response.data
}

export async function calculateClientPayroll(clientId, rate) {
  const response = await api.get(`/client-payroll/client/${clientId}?rate=${rate}`)
  return response.data
}

export async function downloadClientInvoicePdf(clientId, rate) {
  const response = await api.get(`/invoices/client/${clientId}/pdf?rate=${rate}`, {
    responseType: "blob",
  })

  return response.data
}