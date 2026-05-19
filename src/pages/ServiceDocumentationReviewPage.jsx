import { useEffect, useState } from "react"
import {
  getPendingServiceDocumentation,
  getServiceDocumentationByClient,
  reviewServiceDocumentation,
  downloadServiceDocumentationPdf,

} from "../services/serviceDocumentationApi"

import { getClients } from "../services/clientService"

function ServiceDocumentationReviewPage() {
  const [clients, setClients] = useState([])
  const [selectedClientId, setSelectedClientId] = useState("")
  const [records, setRecords] = useState([])
  const [selectedRecord, setSelectedRecord] = useState(null)

  const [loading, setLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState("")

  useEffect(() => {
    loadInitialData()
  }, [])

  async function loadInitialData() {
    try {
      const clientsData = await getClients()
      setClients(clientsData)

      const pendingData = await getPendingServiceDocumentation()
      setRecords(pendingData)
    } catch (error) {
      setErrorMessage(error.message)
    } finally {
      setLoading(false)
    }
  }

  async function loadClientDocumentation(clientId) {
    try {
      setLoading(true)

      if (!clientId) {
        const pendingData = await getPendingServiceDocumentation()
        setRecords(pendingData)
      } else {
        const data = await getServiceDocumentationByClient(clientId)
        setRecords(data)
      }
    } catch (error) {
      setErrorMessage(error.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleClientChange(event) {
    const clientId = event.target.value

    setSelectedClientId(clientId)
    await loadClientDocumentation(clientId)
  }

  async function handleReview(id, status) {
    const comments =
      window.prompt(`Enter supervisor comments for ${status}:`) || ""

    try {
      await reviewServiceDocumentation(id, {
        status,
        supervisorComments: comments,
      })

      await loadClientDocumentation(selectedClientId)

      alert(`Documentation ${status.toLowerCase()} successfully.`)
    } catch (error) {
      alert(error.message)
    }
  }

  if (loading) {
    return <p className="text-slate-500">Loading service documentation...</p>
  }

  if (errorMessage) {
    return <p className="text-red-600">{errorMessage}</p>
  }

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-4xl font-bold text-slate-800">
          Service Documentation
        </h2>

        <p className="mt-2 text-slate-500">
          Review caregiver service documentation history.
        </p>
      </div>

      <div className="mb-6 rounded-2xl bg-white p-6 shadow-sm">
        <label className="mb-2 block text-sm font-semibold text-slate-700">
          Select Client
        </label>

        <select
          value={selectedClientId}
          onChange={handleClientChange}
          className="w-full rounded-xl border border-slate-300 p-3 outline-none focus:border-blue-500"
        >
          <option value="">All Pending Documentation</option>

          {clients.map((client) => (
            <option key={client.id} value={client.id}>
              {client.fullName}
            </option>
          ))}
        </select>
      </div>

      <div className="rounded-2xl bg-white p-6 shadow-sm">
        {records.length === 0 ? (
          <p className="text-slate-500">No service documentation found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="border-b bg-slate-50">
                <tr>
                  <th className="p-4">Client</th>
                  <th className="p-4">Caregiver</th>
                  <th className="p-4">Submitted</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Locked</th>
                  <th className="p-4">Actions</th>
                </tr>
              </thead>

              <tbody>
                {records.map((record) => (
                  <tr key={record.id} className="border-b hover:bg-slate-50">
                    <td className="p-4 font-semibold text-slate-800">
                      {record.clientName}
                    </td>

                    <td className="p-4">{record.caregiverName}</td>

                    <td className="p-4">
                      {record.submittedAt
                        ? new Date(record.submittedAt).toLocaleString()
                        : "—"}
                    </td>

                    <td className="p-4">
                      <StatusBadge status={record.status} />
                    </td>

                    <td className="p-4">{record.locked ? "Yes" : "No"}</td>

                    <td className="p-4">
                      <button
                        onClick={() => setSelectedRecord(record)}
                        className="rounded-lg bg-blue-600 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-700"
                      >
                        Review
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {selectedRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl">
            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <h3 className="text-2xl font-bold text-slate-800">
                  Service Documentation Review
                </h3>

                <p className="mt-1 text-slate-500">
                  Review caregiver shift documentation before approval.
                </p>
              </div>

              <button
                onClick={() => setSelectedRecord(null)}
                className="rounded-lg bg-slate-200 px-3 py-2 text-sm font-semibold hover:bg-slate-300"
              >
                Close
              </button>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <InfoCard label="Client" value={selectedRecord.clientName} />
              <InfoCard label="Caregiver" value={selectedRecord.caregiverName} />
              <InfoCard label="Status" value={selectedRecord.status} />
              <InfoCard
                label="Locked"
                value={selectedRecord.locked ? "Yes" : "No"}
              />
              <InfoCard
                label="Submitted"
                value={
                  selectedRecord.submittedAt
                    ? new Date(selectedRecord.submittedAt).toLocaleString()
                    : "—"
                }
              />
              <InfoCard
                label="Shift Completed"
                value={selectedRecord.shiftCompleted ? "Yes" : "No"}
              />
            </div>

            <div className="mt-6 grid grid-cols-1 gap-4">
              <LargeInfoCard
                label="Shift Tasks Completed"
                value={selectedRecord.shiftTasksCompleted}
              />

              <LargeInfoCard
                label="ADLs Completed"
                value={selectedRecord.adlsCompleted}
              />

              <LargeInfoCard
                label="Goal Progress Notes"
                value={selectedRecord.goalProgressNotes}
              />

              <LargeInfoCard
                label="Daily Service Notes"
                value={selectedRecord.dailyServiceNotes}
              />

              <div className="rounded-xl bg-slate-50 p-4">
  <p className="text-sm text-slate-500">Caregiver Signature</p>

  {selectedRecord.caregiverSignature?.startsWith("data:image") ? (
    <img
      src={selectedRecord.caregiverSignature}
      alt="Caregiver signature"
      className="mt-3 max-h-40 rounded-lg border bg-white p-2"
    />
  ) : (
    <p className="mt-2 whitespace-pre-wrap leading-7 text-slate-800">
      {selectedRecord.caregiverSignature || "Not provided"}
    </p>
  )}
</div>

              {selectedRecord.supervisorComments && (
                <LargeInfoCard
                  label="Supervisor Comments"
                  value={selectedRecord.supervisorComments}
                />
              )}
            </div>

            {!selectedRecord.locked && (
              <div className="mt-6 flex flex-col gap-3 md:flex-row">
                <button
                  onClick={async () => {
                    await handleReview(selectedRecord.id, "APPROVED")
                    setSelectedRecord(null)
                  }}
                  className="rounded-xl bg-green-600 px-5 py-3 font-semibold text-white hover:bg-green-700"
                >
                  Approve Documentation
                </button>

                <button
                  onClick={async () => {
                    await handleReview(selectedRecord.id, "REJECTED")
                    setSelectedRecord(null)
                  }}
                  className="rounded-xl bg-red-600 px-5 py-3 font-semibold text-white hover:bg-red-700"
                >
                  Reject Documentation
                </button>
    
                
              </div>
            )}
            {selectedRecord.locked && selectedRecord.status === "APPROVED" && (
    <button
      onClick={() => downloadServiceDocumentationPdf(selectedRecord.id)}
      className="rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700"
    >
      Download PDF
    </button>
  )}
          </div>
        </div>
      )}
    </div>
  )
}

function StatusBadge({ status }) {
  if (status === "APPROVED") {
    return (
      <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
        Approved
      </span>
    )
  }

  if (status === "REJECTED") {
    return (
      <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-700">
        Rejected
      </span>
    )
  }

  return (
    <span className="rounded-full bg-yellow-100 px-3 py-1 text-xs font-semibold text-yellow-700">
      Submitted
    </span>
  )
}

function InfoCard({ label, value }) {
  return (
    <div className="rounded-xl bg-slate-50 p-4">
      <p className="text-sm text-slate-500">{label}</p>

      <p className="mt-1 font-semibold text-slate-800">{value || "—"}</p>
    </div>
  )
}

function LargeInfoCard({ label, value }) {
  return (
    <div className="rounded-xl bg-slate-50 p-4">
      <p className="text-sm text-slate-500">{label}</p>

      <p className="mt-2 whitespace-pre-wrap leading-7 text-slate-800">
        {value || "Not provided"}
      </p>
    </div>
  )
}

export default ServiceDocumentationReviewPage