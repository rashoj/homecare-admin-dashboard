import { useEffect, useState } from "react"

function FamilyDocumentsTab() {
  const [documents, setDocuments] = useState([])
  const [file, setFile] = useState(null)
  const [documentName, setDocumentName] = useState("")
  const [documentType, setDocumentType] = useState("Family_Document")
  const [expirationDate, setExpirationDate] = useState("")
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")

  useEffect(() => {
    loadDocuments()
  }, [])

  async function loadDocuments() {
    try {
      setLoading(true)
      setErrorMessage("")

      const token = localStorage.getItem("homecare_auth_token")

      const response = await fetch(
        "http://localhost:8080/api/family-portal/documents",
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

  async function uploadDocument(e) {
    e.preventDefault()

    if (!file) {
      alert("Please choose a file.")
      return
    }

    try {
      setUploading(true)

      const token = localStorage.getItem("homecare_auth_token")

      const formData = new FormData()
      formData.append("file", file)
      formData.append("documentName", documentName)
      formData.append("documentType", documentType)

      if (expirationDate) {
        formData.append("expirationDate", expirationDate)
      }

      const response = await fetch(
        "http://localhost:8080/api/family-portal/documents/upload",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      )

      if (!response.ok) {
        throw new Error("Failed to upload document.")
      }

      setFile(null)
      setDocumentName("")
      setDocumentType("Family_Document")
      setExpirationDate("")

      alert("Document uploaded. It will appear after admin approval.")

      await loadDocuments()
    } catch (error) {
      alert(error.message || "Upload failed.")
    } finally {
      setUploading(false)
    }
  }

  if (loading) {
    return <p className="text-slate-500">Loading documents...</p>
  }

  return (
    <div className="space-y-6">
      <div className="rounded-3xl bg-white p-8 shadow">
        <h2 className="text-2xl font-bold text-slate-900">
          Upload Document
        </h2>

        <p className="mt-2 text-slate-500">
          Upload documents for the agency to review. Documents appear here after approval.
        </p>

        <form onSubmit={uploadDocument} className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
          <input
            type="text"
            placeholder="Document name"
            value={documentName}
            onChange={(e) => setDocumentName(e.target.value)}
            className="rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-500"
            required
          />

          <input
            type="text"
            placeholder="Document type"
            value={documentType}
            onChange={(e) => setDocumentType(e.target.value)}
            className="rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-500"
            required
          />

          <input
            type="date"
            value={expirationDate}
            onChange={(e) => setExpirationDate(e.target.value)}
            className="rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-500"
          />

          <input
            type="file"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            className="rounded-xl border border-slate-300 px-4 py-3"
            required
          />

          <button
            disabled={uploading}
            className="rounded-xl bg-blue-600 px-5 py-3 font-bold text-white hover:bg-blue-700 disabled:bg-blue-300 md:col-span-2"
          >
            {uploading ? "Uploading..." : "Upload for Review"}
          </button>
        </form>
      </div>

      <div className="rounded-3xl bg-white p-8 shadow">
        <h2 className="text-2xl font-bold text-slate-900">
          Approved Documents
        </h2>

        {errorMessage && (
          <p className="mt-4 text-red-600">{errorMessage}</p>
        )}

        {documents.length === 0 ? (
          <p className="mt-4 text-slate-500">
            No approved documents found yet.
          </p>
        ) : (
          <div className="mt-6 overflow-x-auto rounded-xl border">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-500">
                <tr>
                  <th className="px-4 py-3">Document</th>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3">Uploaded</th>
                  <th className="px-4 py-3">Expiration</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>

              <tbody>
                {documents.map((doc) => (
                  <tr key={doc.id} className="border-t">
                    <td className="px-4 py-3 font-semibold text-slate-900">
                      {doc.documentName}
                    </td>

                    <td className="px-4 py-3 text-slate-700">
                      {doc.documentType}
                    </td>

                    <td className="px-4 py-3 text-slate-700">
                      {formatDate(doc.uploadedAt)}
                    </td>

                    <td className="px-4 py-3 text-slate-700">
                      {doc.expirationDate || "—"}
                    </td>

                    <td className="px-4 py-3">
                      <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-bold text-green-700">
                        {doc.approvalStatus}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

function formatDate(value) {
  if (!value) return "—"
  return new Date(value).toLocaleDateString()
}

export default FamilyDocumentsTab