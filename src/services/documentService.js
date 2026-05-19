import api from "../api/axios"

export const getDocuments = async () => {

  const response = await api.get("/documents")

  return response.data
}

export const uploadDocument = async (formData) => {

  const response = await api.post(
    "/documents/upload",
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data"
      }
    }
  )

  return response.data
}

export const downloadDocument = async (documentId, fileName = "document") => {
  const response = await api.get(`/documents/${documentId}/download`, {
    responseType: "blob"
  })

  const url = window.URL.createObjectURL(new Blob([response.data]))

  const link = document.createElement("a")
  link.href = url
  link.setAttribute("download", fileName)
  document.body.appendChild(link)
  link.click()
  link.remove()

  window.URL.revokeObjectURL(url)
}