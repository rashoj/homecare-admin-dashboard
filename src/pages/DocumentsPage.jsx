import { useEffect, useState } from "react"

import {
  Upload,
  Download,
  Search,
  X
} from "lucide-react"

import {
  getDocuments,
  uploadDocument,
  downloadDocument
} from "../services/documentService"

import { getClients } from "../services/clientService"

function DocumentsPage() {

  const [documents, setDocuments] = useState([])

  const [clients, setClients] = useState([])

  const [search, setSearch] = useState("")

  const [showModal, setShowModal] = useState(false)

  const [formData, setFormData] = useState({
    clientId: "",
    documentName: "",
    documentType: "",
    expirationDate: ""
  })

  const [selectedFile, setSelectedFile] = useState(null)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {

    try {

      const documentData = await getDocuments()

      const clientData = await getClients()

      setDocuments(documentData)

      setClients(clientData)

    } catch (error) {

      console.error(error)

      alert("Failed to load documents")
    }
  }

  const handleChange = (e) => {

    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleUpload = async (e) => {

    e.preventDefault()

    try {

      const uploadData = new FormData()

      uploadData.append("file", selectedFile)

      uploadData.append("clientId", formData.clientId)

      uploadData.append("documentName", formData.documentName)

      uploadData.append("documentType", formData.documentType)

      uploadData.append("expirationDate", formData.expirationDate)

      await uploadDocument(uploadData)

      setShowModal(false)

      setSelectedFile(null)

      setFormData({
        clientId: "",
        documentName: "",
        documentType: "",
        expirationDate: ""
      })

      loadData()

    } catch (error) {

      console.error(error)

      alert("Failed to upload document")
    }
  }

  const filteredDocuments = documents.filter((document) =>
    document.documentName?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div>

      {/* Header */}
      <div className="flex justify-between items-center mb-8">

        <div>

          <h2 className="text-4xl font-bold text-slate-800">
            Documents
          </h2>

          <p className="text-slate-500 mt-2">
            Manage certifications and compliance documents.
          </p>

        </div>

        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-blue-600 text-white px-5 py-3 rounded-xl hover:bg-blue-700 transition"
        >

          <Upload size={18} />

          Upload Document

        </button>

      </div>

      {/* Search */}
      <div className="bg-white rounded-2xl p-6 shadow-sm mb-6">

        <div className="flex items-center gap-3 border border-slate-200 rounded-xl px-4 py-3">

          <Search size={20} className="text-slate-400" />

          <input
            className="w-full outline-none"
            placeholder="Search documents..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

        </div>

      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">

        <table className="w-full text-left">

          <thead className="bg-slate-50 border-b">

            <tr>

              <th className="p-4">Document</th>

              <th className="p-4">Client</th>

              <th className="p-4">Type</th>

              <th className="p-4">Expiration</th>

              <th className="p-4">Status</th>

              <th className="p-4">Action</th>

            </tr>

          </thead>

          <tbody>

            {filteredDocuments.map((document) => (

              <tr
                key={document.id}
                className="border-b hover:bg-slate-50"
              >

                <td className="p-4 font-medium">
                  {document.documentName}
                </td>

                <td className="p-4">
                  {document.clientName}
                </td>

                <td className="p-4">
                  {document.documentType}
                </td>

                <td className="p-4">
                  {document.expirationDate}
                </td>

                <td className="p-4">

                  <span className={`px-3 py-1 rounded-full text-sm ${
                    document.approvalStatus === "APPROVED"
                      ? "bg-green-100 text-green-700"
                      : "bg-yellow-100 text-yellow-700"
                  }`}>

                    {document.approvalStatus}

                  </span>

                </td>

                <td className="p-4">

                  <button
                    onClick={() => downloadDocument(document.id, document.fileName)}
                    className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 px-4 py-2 rounded-xl transition"
                  >

                    <Download size={16} />

                    Download

                  </button>

                </td>

              </tr>

            ))}

          </tbody>

        </table>

      </div>

      {/* Upload Modal */}
      {showModal && (

        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">

          <div className="bg-white w-full max-w-lg rounded-2xl p-8">

            <div className="flex justify-between items-center mb-6">

              <h3 className="text-2xl font-bold">
                Upload Document
              </h3>

              <button onClick={() => setShowModal(false)}>

                <X size={24} />

              </button>

            </div>

            <form
              onSubmit={handleUpload}
              className="space-y-4"
            >

              <select
                name="clientId"
                value={formData.clientId}
                onChange={handleChange}
                className="w-full border border-slate-300 rounded-xl px-4 py-3"
                required
              >

                <option value="">
                  Select Client
                </option>

                {clients.map((client) => (

                  <option
                    key={client.id}
                    value={client.id}
                  >

                    {client.fullName}

                  </option>

                ))}

              </select>

              <input
                type="text"
                name="documentName"
                placeholder="Document Name"
                value={formData.documentName}
                onChange={handleChange}
                className="w-full border border-slate-300 rounded-xl px-4 py-3"
                required
              />

              <input
                type="text"
                name="documentType"
                placeholder="Document Type"
                value={formData.documentType}
                onChange={handleChange}
                className="w-full border border-slate-300 rounded-xl px-4 py-3"
                required
              />

              <input
                type="date"
                name="expirationDate"
                value={formData.expirationDate}
                onChange={handleChange}
                className="w-full border border-slate-300 rounded-xl px-4 py-3"
              />

              <input
                type="file"
                onChange={(e) => setSelectedFile(e.target.files[0])}
                className="w-full border border-slate-300 rounded-xl px-4 py-3"
                required
              />

              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition"
              >

                Upload Document

              </button>

            </form>

          </div>

        </div>

      )}

    </div>
  )
}

export default DocumentsPage