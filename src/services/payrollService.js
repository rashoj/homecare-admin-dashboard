import api from "../api/axios"

export const calculateCaregiverPayroll = async (
  caregiverId,
  hourlyRate
) => {

  const response = await api.get(
    `/payroll/caregiver/${caregiverId}?hourlyRate=${hourlyRate}`
  )

  return response.data
}

export const calculateClientPayroll = async (
  clientId,
  rate
) => {

  const response = await api.get(
    `/client-payroll/client/${clientId}?rate=${rate}`
  )

  return response.data
}
export const downloadClientInvoicePdf = async (
  clientId,
  rate
) => {

  const response = await api.get(
    `/invoices/client/${clientId}/pdf?rate=${rate}`,
    {
      responseType: "blob"
    }
  )

  return response.data
}