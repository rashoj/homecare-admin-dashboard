import { useEffect, useState } from "react"
import {
  Upload,
  Download,
  Search,
  X,
  Check,
  Ban,
  FileText,
  Clock,
  ShieldCheck,
  CircleX,
} from "lucide-react"

import api from "../api/axios"

import {
  getDocuments,
  uploadDocument,
  downloadDocument,
} from "../services/documentService"

import { getClients } from "../services/clientService"

function DocumentsPage() {
  const [documents, setDocuments] = useState([])
  const [clients, setClients] = useState([])
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("ALL")
  const [sourceFilter, setSourceFilter] = useState("ALL")
  const [showModal, setShowModal] = useState(false)
  const [selectedFile, setSelectedFile] = useState(null)

  const [formData, setFormData] = useState({
    clientId: "",
    documentName: "",
    documentType: "",
    expirationDate: "",
  })

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    try {
      const documentData = await getDocuments()
      const clientData = await getClients()

      setDocuments(documentData || [])
      setClients(clientData || [])
    } catch (error) {
      console.error(error)
      alert("Failed to load documents.")
    }
  }

  function getAdminUserId() {
    const savedUser = localStorage.getItem("homecare_user")
    const user = savedUser ? JSON.parse(savedUser) : null
    return user?.id || 1
  }

  function handleChange(e) {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  async function handleUpload(e) {
    e.preventDefault()

    if (!selectedFile) {
      alert("Please select a file.")
      return
    }

    try {
      const actorUserId = getAdminUserId()

      const uploadData = new FormData()
      uploadData.append("file", selectedFile)
      uploadData.append("uploadedByUserId", actorUserId)
      uploadData.append("clientId", formData.clientId)
      uploadData.append("documentName", formData.documentName)
      uploadData.append("documentType", formData.documentType)

      if (formData.expirationDate) {
        uploadData.append("expirationDate", formData.expirationDate)
      }

      await uploadDocument(uploadData)

      setShowModal(false)
      setSelectedFile(null)
      setFormData({
        clientId: "",
        documentName: "",
        documentType: "",
        expirationDate: "",
      })

      await loadData()
    } catch (error) {
      console.error(error)
      alert("Failed to upload document.")
    }
  }

  async function approveDocument(documentId) {
    try {
      const actorUserId = getAdminUserId()

      await api.put(
        `/documents/${documentId}/approve?actorUserId=${actorUserId}`
      )

      await loadData()
    } catch (error) {
      console.error(error)
      alert(
        error.response?.data?.message ||
          error.message ||
          "Failed to approve document."
      )
    }
  }

  async function rejectDocument(documentId) {
    const reason = window.prompt("Enter rejection reason:")

    if (!reason || !reason.trim()) {
      return
    }

    try {
      const actorUserId = getAdminUserId()

      await api.put(
        `/documents/${documentId}/reject?reason=${encodeURIComponent(
          reason
        )}&actorUserId=${actorUserId}`
      )

      await loadData()
    } catch (error) {
      console.error(error)
      alert(
        error.response?.data?.message ||
          error.message ||
          "Failed to reject document."
      )
    }
  }

  const totalCount = documents.length
  const pendingCount = documents.filter(
    (doc) => doc.approvalStatus === "PENDING"
  ).length
  const approvedCount = documents.filter(
    (doc) => doc.approvalStatus === "APPROVED"
  ).length
  const rejectedCount = documents.filter(
    (doc) => doc.approvalStatus === "REJECTED"
  ).length

  const filteredDocuments = documents.filter((document) => {
    const keyword = search.toLowerCase()

    const matchesSearch =
      document.documentName?.toLowerCase().includes(keyword) ||
      document.clientName?.toLowerCase().includes(keyword) ||
      document.documentType?.toLowerCase().includes(keyword) ||
      document.approvalStatus?.toLowerCase().includes(keyword) ||
      document.uploadedByName?.toLowerCase().includes(keyword)

    const matchesStatus =
      statusFilter === "ALL" || document.approvalStatus === statusFilter

    const uploadedBy = document.uploadedByName || ""

    const matchesSource =
      sourceFilter === "ALL" ||
      (sourceFilter === "FAMILY" &&
        uploadedBy.toLowerCase().includes("family")) ||
      (sourceFilter === "AGENCY" &&
        !uploadedBy.toLowerCase().includes("family"))

    return matchesSearch && matchesStatus && matchesSource
  })

  return (
    <div>
      <div className="mb-8 flex flex-col justify-between gap-5 xl:flex-row xl:items-center">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-blue-600">
            Compliance Center
          </p>

          <h2 className="mt-2 text-4xl font-black text-slate-900">
            Document Management
          </h2>

          <p className="mt-2 text-slate-500">
            Review, approve, reject, and manage agency, client, and family-uploaded documents.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="flex w-fit items-center gap-2 rounded-2xl bg-blue-600 px-5 py-3 font-semibold text-white shadow-sm transition hover:bg-blue-700"
        >
          <Upload size={18} />
          Upload Document
        </button>
      </div>

      <div className="mb-8 grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
        <StatsCard
          title="Total Documents"
          value={totalCount}
          icon={<FileText size={22} />}
          color="bg-blue-50 text-blue-700"
        />

        <StatsCard
          title="Pending Review"
          value={pendingCount}
          icon={<Clock size={22} />}
          color="bg-yellow-50 text-yellow-700"
        />

        <StatsCard
          title="Approved"
          value={approvedCount}
          icon={<ShieldCheck size={22} />}
          color="bg-green-50 text-green-700"
        />

        <StatsCard
          title="Rejected"
          value={rejectedCount}
          icon={<CircleX size={22} />}
          color="bg-red-50 text-red-700"
        />
      </div>

      <div className="mb-6 rounded-3xl bg-white p-6 shadow-sm">
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
          <div className="flex items-center gap-3 rounded-2xl border border-slate-200 px-4 py-3 xl:col-span-1">
            <Search size={20} className="text-slate-400" />

            <input
              className="w-full outline-none"
              placeholder="Search documents..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-2xl border border-slate-200 px-4 py-3 outline-none"
          >
            <option value="ALL">All Statuses</option>
            <option value="PENDING">Pending</option>
            <option value="APPROVED">Approved</option>
            <option value="REJECTED">Rejected</option>
          </select>

          <select
            value={sourceFilter}
            onChange={(e) => setSourceFilter(e.target.value)}
            className="rounded-2xl border border-slate-200 px-4 py-3 outline-none"
          >
            <option value="ALL">All Upload Sources</option>
            <option value="FAMILY">Family Uploads</option>
            <option value="AGENCY">Agency/Admin Uploads</option>
          </select>
        </div>
      </div>

      <div className="overflow-hidden rounded-3xl bg-white shadow-sm">
        <div className="border-b border-slate-100 px-6 py-5">
          <h3 className="text-xl font-bold text-slate-900">
            Document Queue
          </h3>
          <p className="mt-1 text-sm text-slate-500">
            Pending family uploads can be approved or rejected by admin.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[1050px] text-left">
            <thead className="bg-slate-50 text-sm text-slate-500">
              <tr>
                <th className="px-6 py-4">Document</th>
                <th className="px-6 py-4">Client</th>
                <th className="px-6 py-4">Uploaded By</th>
                <th className="px-6 py-4">Type</th>
                <th className="px-6 py-4">Expiration</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Actions</th>
              </tr>
            </thead>

            <tbody>
              {filteredDocuments.map((document) => (
                <tr
                  key={document.id}
                  className="border-t border-slate-100 hover:bg-slate-50"
                >
                  <td className="px-6 py-5">
                    <p className="font-bold text-slate-900">
                      {document.documentName || "Untitled Document"}
                    </p>
                    <p className="mt-1 text-xs text-slate-400">
                      {document.fileName || "No file name"}
                    </p>
                  </td>

                  <td className="px-6 py-5 text-slate-700">
                    {document.clientName || "—"}
                  </td>

                  <td className="px-6 py-5 text-slate-700">
                    {document.uploadedByName || "—"}
                  </td>

                  <td className="px-6 py-5 text-slate-700">
                    {document.documentType || "—"}
                  </td>

                  <td className="px-6 py-5 text-slate-700">
                    {document.expirationDate || "—"}
                  </td>

                  <td className="px-6 py-5">
                    <StatusBadge status={document.approvalStatus} />
                  </td>

                  <td className="px-6 py-5">
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() =>
                          downloadDocument(document.id, document.fileName)
                        }
                        className="rounded-xl bg-slate-100 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-200"
                      >
                        <span className="flex items-center gap-2">
                          <Download size={15} />
                          Download
                        </span>
                      </button>

                      <button
                        onClick={() => approveDocument(document.id)}
                        disabled={document.approvalStatus === "APPROVED"}
                        className={`rounded-xl px-3 py-2 text-sm font-semibold transition ${
                          document.approvalStatus === "APPROVED"
                            ? "cursor-not-allowed bg-green-50 text-green-300"
                            : "bg-green-100 text-green-700 hover:bg-green-200"
                        }`}
                      >
                        <span className="flex items-center gap-2">
                          <Check size={15} />
                          Approve
                        </span>
                      </button>

                      <button
                        onClick={() => rejectDocument(document.id)}
                        disabled={document.approvalStatus === "REJECTED"}
                        className={`rounded-xl px-3 py-2 text-sm font-semibold transition ${
                          document.approvalStatus === "REJECTED"
                            ? "cursor-not-allowed bg-red-50 text-red-300"
                            : "bg-red-100 text-red-700 hover:bg-red-200"
                        }`}
                      >
                        <span className="flex items-center gap-2">
                          <Ban size={15} />
                          Reject
                        </span>
                      </button>
                    </div>

                    {document.rejectionReason && (
                      <p className="mt-2 text-xs text-red-600">
                        Reason: {document.rejectionReason}
                      </p>
                    )}
                  </td>
                </tr>
              ))}

              {filteredDocuments.length === 0 && (
                <tr>
                  <td
                    colSpan="7"
                    className="px-6 py-12 text-center text-slate-500"
                  >
                    No documents found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-lg rounded-3xl bg-white p-8 shadow-xl">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-black text-slate-900">
                  Upload Document
                </h3>
                <p className="mt-1 text-sm text-slate-500">
                  Upload a client document for review.
                </p>
              </div>

              <button
                onClick={() => setShowModal(false)}
                className="rounded-xl bg-slate-100 p-2 hover:bg-slate-200"
              >
                <X size={22} />
              </button>
            </div>

            <form onSubmit={handleUpload} className="space-y-4">
              <select
                name="clientId"
                value={formData.clientId}
                onChange={handleChange}
                className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-500"
                required
              >
                <option value="">Select Client</option>

                {clients.map((client) => (
                  <option key={client.id} value={client.id}>
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
                className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-500"
                required
              />

              <input
                type="text"
                name="documentType"
                placeholder="Document Type"
                value={formData.documentType}
                onChange={handleChange}
                className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-500"
                required
              />

              <input
                type="date"
                name="expirationDate"
                value={formData.expirationDate}
                onChange={handleChange}
                className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-500"
              />

              <input
                type="file"
                onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                className="w-full rounded-2xl border border-slate-300 px-4 py-3"
                required
              />

              <button
                type="submit"
                className="w-full rounded-2xl bg-blue-600 py-3 font-bold text-white transition hover:bg-blue-700"
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

function StatsCard({ title, value, icon, color }) {
  return (
    <div className="rounded-3xl bg-white p-6 shadow-sm">
      <div
        className={`mb-4 flex h-12 w-12 items-center justify-center rounded-2xl ${color}`}
      >
        {icon}
      </div>
      <p className="text-sm font-semibold text-slate-500">{title}</p>
      <h3 className="mt-2 text-4xl font-black text-slate-900">
        {value ?? 0}
      </h3>
    </div>
  )
}

function StatusBadge({ status }) {
  const value = status || "PENDING"

  const classes =
    value === "APPROVED"
      ? "bg-green-100 text-green-700"
      : value === "REJECTED"
      ? "bg-red-100 text-red-700"
      : "bg-yellow-100 text-yellow-700"

  return (
    <span className={`rounded-full px-3 py-1 text-xs font-bold ${classes}`}>
      {value}
    </span>
  )
}

export default DocumentsPage