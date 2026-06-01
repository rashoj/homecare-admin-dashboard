import { useEffect, useState } from "react"

function ClientDocumentsTab({ clientId }) {
  const [documents, setDocuments] = useState([])
  const [loading, setLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState("")

  function getAdminToken() {
    return localStorage.getItem("homecare_auth_token")
  }

  function getAdminUser() {
    const savedUser = localStorage.getItem("homecare_user")
    return savedUser ? JSON.parse(savedUser) : null
  }

  useEffect(() => {
    async function loadDocuments() {
      try {
        setLoading(true)
        setErrorMessage("")

        const token = getAdminToken()

        const response = await fetch(
          `http://localhost:8080/api/documents/client/${clientId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        )

        if (!response.ok) {
          throw new Error("Failed to load documents.")
        }

        const data = await response.json()
        setDocuments(data)
      } catch (error) {
        setErrorMessage(error.message || "Something went wrong.")
      } finally {
        setLoading(false)
      }
    }

    if (clientId) {
      loadDocuments()
    }
  }, [clientId])

  async function downloadDocument(documentId, fileName) {
    try {
      const token = getAdminToken()
      const user = getAdminUser()

      if (!user?.id) {
        alert("Logged-in user not found. Please login again.")
        return
      }

      const response = await fetch(
        `http://localhost:8080/api/documents/${documentId}/download?actorUserId=${user.id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )

      if (!response.ok) {
        alert("Failed to download document.")
        return
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)

      const link = document.createElement("a")
      link.href = url
      link.download = fileName || "client-document"
      document.body.appendChild(link)
      link.click()
      link.remove()

      window.URL.revokeObjectURL(url)
    } catch {
      alert("Failed to download document.")
    }
  }

  if (loading) {
    return <p className="text-gray-500">Loading documents...</p>
  }

  if (errorMessage) {
    return <p className="text-red-600">{errorMessage}</p>
  }

  if (documents.length === 0) {
    return <p className="text-gray-500">No documents found.</p>
  }

  return (
    <div>
      <h2 className="text-xl font-bold text-gray-900">Documents</h2>

      <div className="mt-4 overflow-x-auto rounded-xl border bg-white">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 text-gray-500">
            <tr>
              <th className="px-4 py-3">Document</th>
              <th className="px-4 py-3">Type</th>
              <th className="px-4 py-3">Uploaded By</th>
              <th className="px-4 py-3">Expiration</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Action</th>
            </tr>
          </thead>

          <tbody>
            {documents.map((doc) => (
              <tr key={doc.id} className="border-t">
                <td className="px-4 py-3 font-medium text-gray-900">
                  {doc.documentName || "Untitled"}
                </td>

                <td className="px-4 py-3 text-gray-700">
                  {doc.documentType || "—"}
                </td>

                <td className="px-4 py-3 text-gray-700">
                  {doc.uploadedByName || "—"}
                </td>

                <td className="px-4 py-3 text-gray-700">
                  {doc.expirationDate || "—"}
                </td>

                <td className="px-4 py-3">
                  <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
                    {doc.approvalStatus || "PENDING"}
                  </span>
                </td>

                <td className="px-4 py-3">
                  <button
                    onClick={() => downloadDocument(doc.id, doc.fileName)}
                    className="rounded-lg bg-blue-600 px-3 py-1 text-xs font-semibold text-white hover:bg-blue-700"
                  >
                    Download
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default ClientDocumentsTab