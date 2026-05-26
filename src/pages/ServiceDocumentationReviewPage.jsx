import { useEffect, useState } from "react"
import {
  getPendingServiceDocumentation,
  getServiceDocumentationByClient,
  reviewServiceDocumentation,
  downloadServiceDocumentationPdf,
  getServiceDocumentationAuditLogs,
} from "../services/serviceDocumentationApi"

import { getClients } from "../services/clientService"
import { getISPProgressByServiceDocumentation } from "../services/ispApi"
import { getBehaviorEventsByServiceDocumentation } from "../services/behaviorEventApi"

function ServiceDocumentationReviewPage() {
  const [clients, setClients] = useState([])
  const [selectedClientId, setSelectedClientId] = useState("")
  const [records, setRecords] = useState([])
  const [selectedRecord, setSelectedRecord] = useState(null)

  const [auditLogs, setAuditLogs] = useState([])
  const [ispProgressLogs, setIspProgressLogs] = useState([])
  const [behaviorEvents, setBehaviorEvents] = useState([])

  const [loadingAudit, setLoadingAudit] = useState(false)
  const [loadingLinkedData, setLoadingLinkedData] = useState(false)

  const [loading, setLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState("")

  const [reviewForm, setReviewForm] = useState({
    supervisorComments: "",
    correctedClockInTime: "",
    correctedClockOutTime: "",
    correctionReason: "",
    timeCorrectionApproved: true,
  })

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

  async function openReview(record) {
    setSelectedRecord(record)

    setReviewForm({
      supervisorComments: record.supervisorComments || "",
      correctedClockInTime: record.correctedClockInTime
        ? record.correctedClockInTime.slice(0, 16)
        : "",
      correctedClockOutTime: record.correctedClockOutTime
        ? record.correctedClockOutTime.slice(0, 16)
        : "",
      correctionReason: record.correctionReason || "",
      timeCorrectionApproved: record.timeCorrectionApproved ?? true,
    })

    try {
      setLoadingAudit(true)
      setLoadingLinkedData(true)

      const [logs, progressLogs, behaviorData] = await Promise.all([
        getServiceDocumentationAuditLogs(record.id),
        getISPProgressByServiceDocumentation(record.id),
        getBehaviorEventsByServiceDocumentation(record.id),
      ])

      setAuditLogs(logs)
      setIspProgressLogs(progressLogs)
      setBehaviorEvents(behaviorData)
    } catch (error) {
      console.error("Failed to load review details:", error)
      setAuditLogs([])
      setIspProgressLogs([])
      setBehaviorEvents([])
    } finally {
      setLoadingAudit(false)
      setLoadingLinkedData(false)
    }
  }

  function closeReview() {
    setSelectedRecord(null)
    setAuditLogs([])
    setIspProgressLogs([])
    setBehaviorEvents([])
  }

  async function handleReview(status) {
    try {
      const payload = {
        status,
        supervisorComments: reviewForm.supervisorComments,
        correctedClockInTime: reviewForm.correctedClockInTime || null,
        correctedClockOutTime: reviewForm.correctedClockOutTime || null,
        correctionReason: reviewForm.correctionReason || null,
        timeCorrectionApproved: reviewForm.timeCorrectionApproved,
      }

      await reviewServiceDocumentation(selectedRecord.id, payload)

      await loadClientDocumentation(selectedClientId)

      closeReview()

      alert(`Documentation ${status.toLowerCase()} successfully.`)
    } catch (error) {
      alert(error.message)
    }
  }

  const hasHighRiskBehavior = behaviorEvents.some(
    (event) => event.severity === "HIGH" || event.severity === "CRITICAL"
  )

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
          Review caregiver service documentation, ISP progress, behavior incidents, and audit history.
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

                    <td className="p-4">{formatDate(record.submittedAt)}</td>

                    <td className="p-4">
                      <StatusBadge status={record.status} />
                    </td>

                    <td className="p-4">{record.locked ? "Yes" : "No"}</td>

                    <td className="p-4">
                      <button
                        onClick={() => openReview(record)}
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
          <div className="max-h-[90vh] w-full max-w-5xl overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl">
            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <h3 className="text-2xl font-bold text-slate-800">
                  Service Documentation Review
                </h3>

                <p className="mt-1 text-slate-500">
                  Review shift documentation, ISP outcomes, behavior incidents, and approval details.
                </p>
              </div>

              <button
                onClick={closeReview}
                className="rounded-lg bg-slate-200 px-3 py-2 text-sm font-semibold hover:bg-slate-300"
              >
                Close
              </button>
            </div>

            {hasHighRiskBehavior && (
              <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-4">
                <p className="font-bold text-red-700">
                  High-risk behavior incident reported.
                </p>
                <p className="mt-1 text-sm text-red-600">
                  Supervisor should review behavior notes carefully before approval.
                </p>
              </div>
            )}

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
                value={formatDate(selectedRecord.submittedAt)}
              />
              <InfoCard
                label="Shift Completed"
                value={selectedRecord.shiftCompleted ? "Yes" : "No"}
              />
              <InfoCard
                label="Corrected Clock-In"
                value={formatDate(selectedRecord.correctedClockInTime)}
              />
              <InfoCard
                label="Corrected Clock-Out"
                value={formatDate(selectedRecord.correctedClockOutTime)}
              />
              <InfoCard
                label="Correction Reason"
                value={selectedRecord.correctionReason || "—"}
              />
              <InfoCard
                label="Time Correction Approved"
                value={selectedRecord.timeCorrectionApproved ? "Yes" : "No"}
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

            <div className="mt-6 rounded-2xl border border-indigo-100 bg-indigo-50 p-5">
              <div className="flex items-center justify-between">
                <h4 className="text-lg font-bold text-indigo-900">
                  ISP Goal Progress
                </h4>

                <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-indigo-700">
                  {ispProgressLogs.length} Goal(s)
                </span>
              </div>

              {loadingLinkedData ? (
                <p className="mt-3 rounded-xl bg-white p-4 text-sm text-slate-500">
                  Loading ISP progress...
                </p>
              ) : ispProgressLogs.length === 0 ? (
                <p className="mt-3 rounded-xl bg-white p-4 text-sm text-slate-500">
                  No ISP goal progress submitted with this documentation.
                </p>
              ) : (
                <div className="mt-4 space-y-4">
                  {ispProgressLogs.map((log) => (
                    <div key={log.id} className="rounded-xl bg-white p-4 shadow-sm">
                      <h5 className="font-bold text-slate-800">
                        {log.goalTitle}
                      </h5>

                      <div className="mt-2 flex flex-wrap gap-2">
                        <BehaviorBadge text={log.progressStatus} color="green" />
                        <BehaviorBadge text={log.promptLevel} color="blue" />
                      </div>

                      <p className="mt-3 text-sm text-slate-700">
                        {log.progressNote}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="mt-6 rounded-2xl border border-red-100 bg-red-50 p-5">
              <div className="flex items-center justify-between">
                <h4 className="text-lg font-bold text-red-900">
                  Behavior Incidents
                </h4>

                <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-red-700">
                  {behaviorEvents.length} Incident(s)
                </span>
              </div>

              {hasHighRiskBehavior && (
                <div className="mt-4 rounded-xl border border-red-200 bg-white p-4 text-sm font-semibold text-red-700">
                  High-risk behavior incident reported. Supervisor review recommended.
                </div>
              )}

              {loadingLinkedData ? (
                <p className="mt-3 rounded-xl bg-white p-4 text-sm text-slate-500">
                  Loading behavior incidents...
                </p>
              ) : behaviorEvents.length === 0 ? (
                <p className="mt-3 rounded-xl bg-white p-4 text-sm text-slate-500">
                  No behavior incidents submitted with this documentation.
                </p>
              ) : (
                <div className="mt-4 space-y-4">
                  {behaviorEvents.map((event) => (
                    <div key={event.id} className="rounded-xl bg-white p-4 shadow-sm">
                      <div className="flex flex-wrap gap-2">
                        <BehaviorBadge text={event.behaviorType} color="red" />
                        <BehaviorBadge
                          text={event.severity}
                          color={
                            event.severity === "CRITICAL" || event.severity === "HIGH"
                              ? "red"
                              : "orange"
                          }
                        />
                        <BehaviorBadge text={event.outcome} color="green" />
                        {event.outcome === "INCIDENT_REPORT_REQUIRED" && (
  <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 p-4">
    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
      <div>
        <p className="font-bold text-red-700">
          Incident Report Required
        </p>

        <p className="mt-1 text-sm text-red-600">
          This behavior incident may require an official incident report and supervisor follow-up.
        </p>
      </div>

      <button
        type="button"
        className="rounded-xl bg-red-600 px-4 py-3 text-sm font-semibold text-white hover:bg-red-700"
      >
        Create Incident Report
      </button>
    </div>
  </div>
)}
                      </div>

                      <div className="mt-4 grid gap-3 md:grid-cols-2">
                        <InfoCard label="Trigger" value={event.trigger} />
                        <InfoCard
                          label="Duration"
                          value={
                            event.durationMinutes
                              ? `${event.durationMinutes} mins`
                              : "—"
                          }
                        />
                      </div>

                      <LargeInfoCard
                        label="Intervention Used"
                        value={event.interventionUsed || "—"}
                      />

                      <LargeInfoCard
                        label="Notes"
                        value={event.notes || "—"}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {!selectedRecord.locked && (
              <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-5">
                <h4 className="text-lg font-bold text-slate-800">
                  Admin Time Correction / Approval
                </h4>

                <p className="mt-1 text-sm text-slate-500">
                  Use this when clock-in or clock-out is missing/invalid before approval.
                </p>

                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                      Corrected Clock-In
                    </label>
                    <input
                      type="datetime-local"
                      value={reviewForm.correctedClockInTime}
                      onChange={(e) =>
                        setReviewForm({
                          ...reviewForm,
                          correctedClockInTime: e.target.value,
                        })
                      }
                      className="w-full rounded-xl border border-slate-300 px-4 py-3"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                      Corrected Clock-Out
                    </label>
                    <input
                      type="datetime-local"
                      value={reviewForm.correctedClockOutTime}
                      onChange={(e) =>
                        setReviewForm({
                          ...reviewForm,
                          correctedClockOutTime: e.target.value,
                        })
                      }
                      className="w-full rounded-xl border border-slate-300 px-4 py-3"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                      Correction Reason
                    </label>
                    <select
                      value={reviewForm.correctionReason}
                      onChange={(e) =>
                        setReviewForm({
                          ...reviewForm,
                          correctionReason: e.target.value,
                        })
                      }
                      className="w-full rounded-xl border border-slate-300 px-4 py-3"
                    >
                      <option value="">Select correction reason</option>
                      <option value="Caregiver forgot to clock out">
                        Caregiver forgot to clock out
                      </option>
                      <option value="Caregiver forgot to clock in">
                        Caregiver forgot to clock in
                      </option>
                      <option value="Phone battery died">Phone battery died</option>
                      <option value="App or network issue">
                        App or network issue
                      </option>
                      <option value="Supervisor verified visit">
                        Supervisor verified visit
                      </option>
                      <option value="Client emergency">Client emergency</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>

                <label className="mt-4 flex items-center gap-3 rounded-xl bg-green-50 p-4">
                  <input
                    type="checkbox"
                    checked={reviewForm.timeCorrectionApproved}
                    onChange={(e) =>
                      setReviewForm({
                        ...reviewForm,
                        timeCorrectionApproved: e.target.checked,
                      })
                    }
                  />

                  <span className="font-semibold text-green-700">
                    Supervisor approved time correction
                  </span>
                </label>

                <div className="mt-4">
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Supervisor Comments
                  </label>
                  <textarea
                    value={reviewForm.supervisorComments}
                    onChange={(e) =>
                      setReviewForm({
                        ...reviewForm,
                        supervisorComments: e.target.value,
                      })
                    }
                    rows="4"
                    placeholder="Enter approval/rejection comments..."
                    className="w-full rounded-xl border border-slate-300 px-4 py-3"
                  />
                </div>

                <div className="mt-6 flex flex-col gap-3 md:flex-row">
                  <button
                    onClick={() => handleReview("APPROVED")}
                    className="rounded-xl bg-green-600 px-5 py-3 font-semibold text-white hover:bg-green-700"
                  >
                    Approve Documentation
                  </button>

                  <button
                    onClick={() => handleReview("REJECTED")}
                    className="rounded-xl bg-red-600 px-5 py-3 font-semibold text-white hover:bg-red-700"
                  >
                    Reject Documentation
                  </button>
                </div>
              </div>
            )}

            <div className="mt-8">
              <h4 className="text-lg font-bold text-slate-800">
                Documentation Audit Timeline
              </h4>

              {loadingAudit ? (
                <p className="mt-3 text-slate-500">Loading audit logs...</p>
              ) : auditLogs.length === 0 ? (
                <p className="mt-3 rounded-xl bg-slate-50 p-4 text-slate-500">
                  No audit history found yet.
                </p>
              ) : (
                <div className="mt-4 space-y-4">
                  {auditLogs.map((log) => (
                    <div
                      key={log.id}
                      className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
                    >
                      <div className="flex flex-wrap items-center gap-2">
                        <StatusBadge status={log.oldStatus} />
                        <span className="text-slate-400">→</span>
                        <StatusBadge status={log.newStatus} />
                      </div>

                      <div className="mt-4 grid gap-3 md:grid-cols-2">
                        <InfoCard
                          label="Corrected Clock-In"
                          value={formatDate(log.correctedClockInTime)}
                        />
                        <InfoCard
                          label="Corrected Clock-Out"
                          value={formatDate(log.correctedClockOutTime)}
                        />
                        <InfoCard
                          label="Correction Reason"
                          value={log.correctionReason || "—"}
                        />
                        <InfoCard
                          label="Time Correction Approved"
                          value={log.timeCorrectionApproved ? "Yes" : "No"}
                        />
                      </div>

                      <p className="mt-3 text-sm text-slate-700">
                        {log.supervisorComments ||
                          "No supervisor comments provided."}
                      </p>

                      <p className="mt-2 text-xs text-slate-400">
                        Reviewed at: {formatDate(log.reviewedAt || log.createdAt)}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {selectedRecord.locked && selectedRecord.status === "APPROVED" && (
              <button
                onClick={() => downloadServiceDocumentationPdf(selectedRecord.id)}
                className="mt-6 rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700"
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

function BehaviorBadge({ text, color }) {
  const colors = {
    red: "bg-red-100 text-red-700",
    orange: "bg-orange-100 text-orange-700",
    green: "bg-green-100 text-green-700",
    blue: "bg-blue-100 text-blue-700",
  }

  return (
    <span
      className={`rounded-full px-3 py-1 text-xs font-semibold ${
        colors[color] || colors.blue
      }`}
    >
      {text}
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

function formatDate(value) {
  return value ? new Date(value).toLocaleString() : "—"
}

export default ServiceDocumentationReviewPage