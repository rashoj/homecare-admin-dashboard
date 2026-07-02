import { useEffect, useMemo, useState } from "react"
import {
  Search,
  Filter,
  ClipboardCheck,
  FileCheck,
  AlertTriangle,
  Lock,
  Unlock,
  Eye,
  X,
  Download,
  CheckCircle2,
  XCircle,
  Clock3,
  UserRound,
} from "lucide-react"

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
  const [search, setSearch] = useState("")
  const [activeTab, setActiveTab] = useState("ALL")

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
      setClients(clientsData || [])

      const pendingData = await getPendingServiceDocumentation()
      setRecords(pendingData || [])
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
        setRecords(pendingData || [])
      } else {
        const data = await getServiceDocumentationByClient(clientId)
        setRecords(data || [])
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

      setAuditLogs(logs || [])
      setIspProgressLogs(progressLogs || [])
      setBehaviorEvents(behaviorData || [])
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

  const filteredRecords = useMemo(() => {
    return records.filter((record) => {
      const text = `${record.clientName || ""} ${record.caregiverName || ""} ${
        record.status || ""
      }`.toLowerCase()

      const matchesSearch = text.includes(search.toLowerCase())

      const matchesTab =
        activeTab === "ALL" ||
        record.status === activeTab ||
        (activeTab === "LOCKED" && record.locked) ||
        (activeTab === "UNLOCKED" && !record.locked)

      return matchesSearch && matchesTab
    })
  }, [records, search, activeTab])

  const submittedCount = records.filter((r) => r.status === "SUBMITTED").length
  const approvedCount = records.filter((r) => r.status === "APPROVED").length
  const rejectedCount = records.filter((r) => r.status === "REJECTED").length
  const lockedCount = records.filter((r) => r.locked).length

  const hasHighRiskBehavior = behaviorEvents.some(
    (event) => event.severity === "HIGH" || event.severity === "CRITICAL"
  )

  const tabs = [
    { key: "ALL", label: "All" },
    { key: "SUBMITTED", label: "Submitted" },
    { key: "APPROVED", label: "Approved" },
    { key: "REJECTED", label: "Rejected" },
    { key: "LOCKED", label: "Locked" },
  ]

  if (loading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <div className="rounded-3xl bg-white px-8 py-6 font-semibold text-slate-600 shadow-sm">
          Loading service documentation...
        </div>
      </div>
    )
  }

  if (errorMessage) {
    return (
      <div className="rounded-3xl bg-red-50 p-6 font-semibold text-red-700">
        {errorMessage}
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-6 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-slate-900">
            Service Documentation Review
          </h1>

          <p className="mt-2 text-slate-500">
            Review caregiver documentation, ISP progress, behavior incidents,
            time corrections, and audit history before billing and payroll.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
            <Search size={18} className="text-slate-400" />
            <input
              className="w-full bg-transparent text-sm outline-none sm:w-72"
              placeholder="Search client or caregiver..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <button className="flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-700 shadow-sm hover:bg-slate-50">
            <Filter size={17} />
            Filters
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          title="Submitted"
          value={submittedCount}
          subtitle="Needs supervisor review"
          icon={<ClipboardCheck size={26} />}
          tone="yellow"
        />
        <MetricCard
          title="Approved"
          value={approvedCount}
          subtitle="Ready for downstream workflows"
          icon={<CheckCircle2 size={26} />}
          tone="green"
        />
        <MetricCard
          title="Rejected"
          value={rejectedCount}
          subtitle="Needs correction"
          icon={<XCircle size={26} />}
          tone="red"
        />
        <MetricCard
          title="Locked"
          value={lockedCount}
          subtitle="Finalized documents"
          icon={<Lock size={26} />}
          tone="blue"
        />
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <label className="mb-2 block text-sm font-bold text-slate-700">
          Client Filter
        </label>

        <select
          value={selectedClientId}
          onChange={handleClientChange}
          className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-500"
        >
          <option value="">All Pending Documentation</option>
          {clients.map((client) => (
            <option key={client.id} value={client.id}>
              {client.fullName}
            </option>
          ))}
        </select>
      </div>

      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-6">
          <div className="flex gap-6 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`border-b-2 px-1 py-5 text-sm font-bold ${
                  activeTab === tab.key
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-slate-500 hover:text-slate-800"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[1100px] text-left">
            <thead className="border-b border-slate-200 bg-slate-50">
              <tr>
                <TableHead>Client</TableHead>
                <TableHead>Caregiver</TableHead>
                <TableHead>Submitted</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Locked</TableHead>
                <TableHead>Risk</TableHead>
                <TableHead>Actions</TableHead>
              </tr>
            </thead>

            <tbody>
              {filteredRecords.map((record) => (
                <tr
                  key={record.id}
                  className="border-b border-slate-100 transition hover:bg-slate-50"
                >
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-4">
                      <Avatar name={record.clientName} />
                      <div>
                        <p className="font-black text-slate-900">
                          {record.clientName || "Unknown Client"}
                        </p>
                        <p className="mt-1 text-sm text-slate-500">
                          Doc #{record.id}
                        </p>
                      </div>
                    </div>
                  </td>

                  <td className="px-6 py-5">
                    <div className="flex items-center gap-3">
                      <UserRound size={17} className="text-slate-400" />
                      <span className="font-bold text-slate-700">
                        {record.caregiverName || "—"}
                      </span>
                    </div>
                  </td>

                  <td className="px-6 py-5">
                    <DateTimeBlock value={record.submittedAt} />
                  </td>

                  <td className="px-6 py-5">
                    <StatusBadge status={record.status} />
                  </td>

                  <td className="px-6 py-5">
                    <LockBadge locked={record.locked} />
                  </td>

                  <td className="px-6 py-5">
                    <RiskBadge record={record} />
                  </td>

                  <td className="px-6 py-5">
                    <button
                      onClick={() => openReview(record)}
                      className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-black text-white hover:bg-blue-700"
                    >
                      <Eye size={16} />
                      Review
                    </button>
                  </td>
                </tr>
              ))}

              {filteredRecords.length === 0 && (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center">
                    <p className="font-semibold text-slate-600">
                      No service documentation found.
                    </p>
                    <p className="mt-1 text-sm text-slate-400">
                      Try changing your search, client filter, or selected tab.
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="flex flex-col gap-4 border-t border-slate-200 px-6 py-4 text-sm text-slate-500 md:flex-row md:items-center md:justify-between">
          <p>
            Showing {filteredRecords.length} of {records.length} documentation
            records
          </p>

          <div className="flex items-center gap-2">
            <button className="rounded-xl border border-slate-200 px-4 py-2 font-semibold text-slate-600">
              Previous
            </button>
            <button className="rounded-xl bg-blue-600 px-4 py-2 font-semibold text-white">
              1
            </button>
            <button className="rounded-xl border border-slate-200 px-4 py-2 font-semibold text-slate-600">
              Next
            </button>
          </div>
        </div>
      </div>

      {selectedRecord && (
        <ReviewModal
          selectedRecord={selectedRecord}
          closeReview={closeReview}
          hasHighRiskBehavior={hasHighRiskBehavior}
          reviewForm={reviewForm}
          setReviewForm={setReviewForm}
          handleReview={handleReview}
          auditLogs={auditLogs}
          loadingAudit={loadingAudit}
          ispProgressLogs={ispProgressLogs}
          behaviorEvents={behaviorEvents}
          loadingLinkedData={loadingLinkedData}
        />
      )}
    </div>
  )
}

function ReviewModal({
  selectedRecord,
  closeReview,
  hasHighRiskBehavior,
  reviewForm,
  setReviewForm,
  handleReview,
  auditLogs,
  loadingAudit,
  ispProgressLogs,
  behaviorEvents,
  loadingLinkedData,
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="max-h-[92vh] w-full max-w-6xl overflow-y-auto rounded-3xl bg-white shadow-2xl">
        <div className="sticky top-0 z-10 border-b border-slate-200 bg-white p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="text-2xl font-black text-slate-900">
                Service Documentation Review
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                Review shift documentation, ISP outcomes, behavior incidents,
                corrections, and audit history.
              </p>
            </div>

            <button
              onClick={closeReview}
              className="rounded-xl bg-slate-100 p-2 text-slate-600 hover:bg-slate-200"
            >
              <X size={22} />
            </button>
          </div>
        </div>

        <div className="space-y-6 p-6">
          {hasHighRiskBehavior && (
            <div className="rounded-3xl border border-red-200 bg-red-50 p-5">
              <div className="flex items-start gap-4">
                <div className="rounded-2xl bg-red-100 p-3 text-red-700">
                  <AlertTriangle size={22} />
                </div>
                <div>
                  <p className="font-black text-red-800">
                    High-risk behavior incident reported.
                  </p>
                  <p className="mt-1 text-sm font-semibold text-red-600">
                    Supervisor should review behavior notes carefully before
                    approval.
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
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
          </div>

          <SectionCard title="Shift Documentation">
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

            <div className="rounded-2xl bg-slate-50 p-5">
              <p className="text-sm font-bold text-slate-500">
                Caregiver Signature
              </p>

              {selectedRecord.caregiverSignature?.startsWith("data:image") ? (
                <img
                  src={selectedRecord.caregiverSignature}
                  alt="Caregiver signature"
                  className="mt-3 max-h-40 rounded-xl border bg-white p-2"
                />
              ) : (
                <p className="mt-2 whitespace-pre-wrap leading-7 text-slate-800">
                  {selectedRecord.caregiverSignature || "Not provided"}
                </p>
              )}
            </div>
          </SectionCard>

          <SectionCard title="ISP Goal Progress">
            {loadingLinkedData ? (
              <EmptyPanel text="Loading ISP progress..." />
            ) : ispProgressLogs.length === 0 ? (
              <EmptyPanel text="No ISP goal progress submitted with this documentation." />
            ) : (
              <div className="space-y-4">
                {ispProgressLogs.map((log) => (
                  <div key={log.id} className="rounded-2xl bg-indigo-50 p-5">
                    <h5 className="font-black text-slate-900">
                      {log.goalTitle}
                    </h5>

                    <div className="mt-3 flex flex-wrap gap-2">
                      <BehaviorBadge text={log.progressStatus} color="green" />
                      <BehaviorBadge text={log.promptLevel} color="blue" />
                    </div>

                    <p className="mt-3 text-sm leading-6 text-slate-700">
                      {log.progressNote}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </SectionCard>

          <SectionCard title="Behavior Incidents">
            {loadingLinkedData ? (
              <EmptyPanel text="Loading behavior incidents..." />
            ) : behaviorEvents.length === 0 ? (
              <EmptyPanel text="No behavior incidents submitted with this documentation." />
            ) : (
              <div className="space-y-4">
                {behaviorEvents.map((event) => (
                  <div key={event.id} className="rounded-2xl bg-red-50 p-5">
                    <div className="flex flex-wrap gap-2">
                      <BehaviorBadge text={event.behaviorType} color="red" />
                      <BehaviorBadge
                        text={event.severity}
                        color={
                          event.severity === "CRITICAL" ||
                          event.severity === "HIGH"
                            ? "red"
                            : "orange"
                        }
                      />
                      <BehaviorBadge text={event.outcome} color="green" />
                    </div>

                    {event.outcome === "INCIDENT_REPORT_REQUIRED" && (
                      <div className="mt-4 rounded-2xl border border-red-200 bg-white p-4">
                        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                          <div>
                            <p className="font-bold text-red-700">
                              Incident Report Required
                            </p>
                            <p className="mt-1 text-sm text-red-600">
                              This behavior incident may require an official
                              incident report and supervisor follow-up.
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

                    <LargeInfoCard label="Notes" value={event.notes || "—"} />
                  </div>
                ))}
              </div>
            )}
          </SectionCard>

          {!selectedRecord.locked && (
            <SectionCard title="Admin Time Correction / Approval">
              <p className="mb-4 text-sm text-slate-500">
                Use this when clock-in or clock-out is missing or invalid before
                approval.
              </p>

              <div className="grid gap-4 md:grid-cols-2">
                <FormField label="Corrected Clock-In">
                  <input
                    type="datetime-local"
                    value={reviewForm.correctedClockInTime}
                    onChange={(e) =>
                      setReviewForm({
                        ...reviewForm,
                        correctedClockInTime: e.target.value,
                      })
                    }
                    className="w-full rounded-2xl border border-slate-300 px-4 py-3"
                  />
                </FormField>

                <FormField label="Corrected Clock-Out">
                  <input
                    type="datetime-local"
                    value={reviewForm.correctedClockOutTime}
                    onChange={(e) =>
                      setReviewForm({
                        ...reviewForm,
                        correctedClockOutTime: e.target.value,
                      })
                    }
                    className="w-full rounded-2xl border border-slate-300 px-4 py-3"
                  />
                </FormField>

                <div className="md:col-span-2">
                  <FormField label="Correction Reason">
                    <select
                      value={reviewForm.correctionReason}
                      onChange={(e) =>
                        setReviewForm({
                          ...reviewForm,
                          correctionReason: e.target.value,
                        })
                      }
                      className="w-full rounded-2xl border border-slate-300 px-4 py-3"
                    >
                      <option value="">Select correction reason</option>
                      <option value="Caregiver forgot to clock out">
                        Caregiver forgot to clock out
                      </option>
                      <option value="Caregiver forgot to clock in">
                        Caregiver forgot to clock in
                      </option>
                      <option value="Phone battery died">
                        Phone battery died
                      </option>
                      <option value="App or network issue">
                        App or network issue
                      </option>
                      <option value="Supervisor verified visit">
                        Supervisor verified visit
                      </option>
                      <option value="Client emergency">Client emergency</option>
                      <option value="Other">Other</option>
                    </select>
                  </FormField>
                </div>
              </div>

              <label className="mt-4 flex items-center gap-3 rounded-2xl bg-green-50 p-4">
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

                <span className="font-bold text-green-700">
                  Supervisor approved time correction
                </span>
              </label>

              <div className="mt-4">
                <FormField label="Supervisor Comments">
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
                    className="w-full rounded-2xl border border-slate-300 px-4 py-3"
                  />
                </FormField>
              </div>

              <div className="mt-6 flex flex-col gap-3 md:flex-row">
                <button
                  onClick={() => handleReview("APPROVED")}
                  className="rounded-2xl bg-green-600 px-5 py-3 font-bold text-white hover:bg-green-700"
                >
                  Approve Documentation
                </button>

                <button
                  onClick={() => handleReview("REJECTED")}
                  className="rounded-2xl bg-red-600 px-5 py-3 font-bold text-white hover:bg-red-700"
                >
                  Reject Documentation
                </button>
              </div>
            </SectionCard>
          )}

          <SectionCard title="Documentation Audit Timeline">
            {loadingAudit ? (
              <EmptyPanel text="Loading audit logs..." />
            ) : auditLogs.length === 0 ? (
              <EmptyPanel text="No audit history found yet." />
            ) : (
              <div className="space-y-4">
                {auditLogs.map((log) => (
                  <div
                    key={log.id}
                    className="rounded-2xl border border-slate-200 bg-white p-5"
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
          </SectionCard>

          {selectedRecord.locked && selectedRecord.status === "APPROVED" && (
            <button
              onClick={() => downloadServiceDocumentationPdf(selectedRecord.id)}
              className="inline-flex items-center gap-2 rounded-2xl bg-blue-600 px-5 py-3 font-bold text-white hover:bg-blue-700"
            >
              <Download size={18} />
              Download PDF
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

function MetricCard({ title, value, subtitle, icon, tone }) {
  const tones = {
    yellow: "bg-yellow-100 text-yellow-700",
    green: "bg-green-100 text-green-700",
    red: "bg-red-100 text-red-700",
    blue: "bg-blue-100 text-blue-700",
  }

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-center gap-5">
        <div
          className={`flex h-16 w-16 items-center justify-center rounded-2xl ${
            tones[tone] || tones.blue
          }`}
        >
          {icon}
        </div>

        <div>
          <p className="text-sm font-semibold text-slate-500">{title}</p>
          <p className="mt-1 text-3xl font-black text-slate-900">{value}</p>
          <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
        </div>
      </div>
    </div>
  )
}

function TableHead({ children }) {
  return (
    <th className="px-6 py-4 text-xs font-black uppercase tracking-wide text-slate-500">
      {children}
    </th>
  )
}

function Avatar({ name }) {
  return (
    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-100 text-sm font-black text-blue-700">
      {getInitials(name)}
    </div>
  )
}

function DateTimeBlock({ value }) {
  if (!value) return <span className="text-sm text-slate-400">—</span>

  const date = new Date(value)

  return (
    <div>
      <p className="font-bold text-slate-800">{date.toLocaleDateString()}</p>
      <p className="mt-1 text-sm text-slate-500">
        {date.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })}
      </p>
    </div>
  )
}

function LockBadge({ locked }) {
  return locked ? (
    <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1 text-xs font-black text-slate-700">
      <Lock size={13} />
      Locked
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-3 py-1 text-xs font-black text-blue-700">
      <Unlock size={13} />
      Open
    </span>
  )
}

function RiskBadge({ record }) {
  if (record.status === "REJECTED") {
    return (
      <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-black text-red-700">
        Review
      </span>
    )
  }

  if (!record.locked && record.status === "SUBMITTED") {
    return (
      <span className="rounded-full bg-yellow-100 px-3 py-1 text-xs font-black text-yellow-700">
        Pending
      </span>
    )
  }

  return (
    <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-black text-green-700">
      Normal
    </span>
  )
}

function StatusBadge({ status }) {
  if (status === "APPROVED") {
    return (
      <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-black text-green-700">
        Approved
      </span>
    )
  }

  if (status === "REJECTED") {
    return (
      <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-black text-red-700">
        Rejected
      </span>
    )
  }

  return (
    <span className="rounded-full bg-yellow-100 px-3 py-1 text-xs font-black text-yellow-700">
      Submitted
    </span>
  )
}

function SectionCard({ title, children }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6">
      <h4 className="mb-5 text-xl font-black text-slate-900">{title}</h4>
      <div className="space-y-4">{children}</div>
    </div>
  )
}

function InfoCard({ label, value }) {
  return (
    <div className="rounded-2xl bg-slate-50 p-4">
      <p className="text-sm font-semibold text-slate-500">{label}</p>
      <p className="mt-1 font-bold text-slate-800">{value || "—"}</p>
    </div>
  )
}

function LargeInfoCard({ label, value }) {
  return (
    <div className="rounded-2xl bg-slate-50 p-4">
      <p className="text-sm font-semibold text-slate-500">{label}</p>
      <p className="mt-2 whitespace-pre-wrap leading-7 text-slate-800">
        {value || "Not provided"}
      </p>
    </div>
  )
}

function FormField({ label, children }) {
  return (
    <div>
      <label className="mb-2 block text-sm font-bold text-slate-700">
        {label}
      </label>
      {children}
    </div>
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
      className={`rounded-full px-3 py-1 text-xs font-black ${
        colors[color] || colors.blue
      }`}
    >
      {text || "—"}
    </span>
  )
}

function EmptyPanel({ text }) {
  return (
    <div className="rounded-2xl bg-slate-50 p-5 text-sm font-semibold text-slate-500">
      {text}
    </div>
  )
}

function formatDate(value) {
  return value ? new Date(value).toLocaleString() : "—"
}

function getInitials(name) {
  if (!name) return "?"

  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("")
}

export default ServiceDocumentationReviewPage