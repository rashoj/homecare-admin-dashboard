import { useEffect, useMemo, useState } from "react"
import {
  getEVVExceptions,
  reviewEVVException,
  getEVVExceptionAuditLogs,
  getEVVExceptionSummary,
  getComplianceDashboard,
} from "../services/evvExceptionApi"

function EVVExceptionsPage() {
  const [exceptions, setExceptions] = useState([])
  const [selectedException, setSelectedException] = useState(null)
  const [auditLogs, setAuditLogs] = useState([])
  const [loadingAudit, setLoadingAudit] = useState(false)
  const [summary, setSummary] = useState(null)
  const [complianceDashboard, setComplianceDashboard] = useState(null)

  const [search, setSearch] = useState("")
  const [clientFilter, setClientFilter] = useState("ALL")
  const [caregiverFilter, setCaregiverFilter] = useState("ALL")
  const [statusFilter, setStatusFilter] = useState("ALL")
  const [severityFilter, setSeverityFilter] = useState("ALL")
  const [typeFilter, setTypeFilter] = useState("ALL")
  const [dateFrom, setDateFrom] = useState("")
  const [dateTo, setDateTo] = useState("")

  const [reviewData, setReviewData] = useState({
    status: "RESOLVED",
    supervisorNotes: "",
    adminResolutionReason: "",
    correctedClockOutTime: "",
    adminApproved: true,
  })

  useEffect(() => {
    loadExceptions()
    loadSummary()
    loadComplianceDashboard()
  }, [])

  async function loadExceptions() {
    const data = await getEVVExceptions()
    setExceptions(data)
  }

  async function loadSummary() {
    const data = await getEVVExceptionSummary()
    setSummary(data)
  }

  async function loadComplianceDashboard() {
    const data = await getComplianceDashboard()
    setComplianceDashboard(data)
  }

  const clients = [
    ...new Map(exceptions.map((item) => [item.clientId, item])).values(),
  ]

  const caregivers = [
    ...new Map(exceptions.map((item) => [item.caregiverId, item])).values(),
  ]

  const exceptionTypes = [
    ...new Set(exceptions.map((item) => item.exceptionType).filter(Boolean)),
  ]

  const filteredExceptions = useMemo(() => {
    return exceptions.filter((item) => {
      const createdDate = item.createdAt ? new Date(item.createdAt) : null

      const matchesSearch =
        search.trim() === "" ||
        item.clientName?.toLowerCase().includes(search.toLowerCase()) ||
        item.caregiverName?.toLowerCase().includes(search.toLowerCase()) ||
        item.exceptionType?.toLowerCase().includes(search.toLowerCase()) ||
        item.description?.toLowerCase().includes(search.toLowerCase())

      const matchesClient =
        clientFilter === "ALL" || String(item.clientId) === clientFilter

      const matchesCaregiver =
        caregiverFilter === "ALL" || String(item.caregiverId) === caregiverFilter

      const matchesStatus =
        statusFilter === "ALL" || item.status === statusFilter

      const matchesSeverity =
        severityFilter === "ALL" || item.severity === severityFilter

      const matchesType =
        typeFilter === "ALL" || item.exceptionType === typeFilter

      const matchesDateFrom =
        !dateFrom || (createdDate && createdDate >= new Date(dateFrom))

      const matchesDateTo =
        !dateTo ||
        (createdDate && createdDate <= new Date(`${dateTo}T23:59:59`))

      return (
        matchesSearch &&
        matchesClient &&
        matchesCaregiver &&
        matchesStatus &&
        matchesSeverity &&
        matchesType &&
        matchesDateFrom &&
        matchesDateTo
      )
    })
  }, [
    exceptions,
    search,
    clientFilter,
    caregiverFilter,
    statusFilter,
    severityFilter,
    typeFilter,
    dateFrom,
    dateTo,
  ])

  async function openReview(exceptionItem) {
    setSelectedException(exceptionItem)

    setReviewData({
      status:
        exceptionItem.status === "OPEN"
          ? "REVIEWED"
          : exceptionItem.status || "REVIEWED",
      supervisorNotes: exceptionItem.supervisorNotes || "",
      adminResolutionReason: exceptionItem.adminResolutionReason || "",
      correctedClockOutTime: exceptionItem.correctedClockOutTime
        ? exceptionItem.correctedClockOutTime.slice(0, 16)
        : "",
      adminApproved: exceptionItem.adminApproved ?? true,
    })

    try {
      setLoadingAudit(true)
      const logs = await getEVVExceptionAuditLogs(exceptionItem.id)
      setAuditLogs(logs)
    } catch (error) {
      console.error("Failed to load audit logs", error)
      setAuditLogs([])
    } finally {
      setLoadingAudit(false)
    }
  }

  async function handleSubmit(e) {
    e.preventDefault()

    const payload = {
      ...reviewData,
      correctedClockOutTime: reviewData.correctedClockOutTime || null,
    }

    await reviewEVVException(selectedException.id, payload)

    await loadExceptions()
    await loadSummary()
    await loadComplianceDashboard()

    setSelectedException(null)
    setAuditLogs([])
    alert("EVV exception reviewed.")
  }

  function closeModal() {
    setSelectedException(null)
    setAuditLogs([])
  }

  function clearFilters() {
    setSearch("")
    setClientFilter("ALL")
    setCaregiverFilter("ALL")
    setStatusFilter("ALL")
    setSeverityFilter("ALL")
    setTypeFilter("ALL")
    setDateFrom("")
    setDateTo("")
  }

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-4xl font-bold text-slate-800">
          EVV Exceptions
        </h2>
        <p className="mt-2 text-slate-500">
          Review late clock-ins, early clock-outs, GPS issues, and EVV compliance exceptions.
        </p>
      </div>

      {summary && (
        <div className="mb-6 grid gap-4 md:grid-cols-5">
          <SummaryCard label="Total" value={summary.total} />
          <SummaryCard label="Needs Review" value={summary.needsReview} />
          <SummaryCard label="Reviewed" value={summary.reviewed} />
          <SummaryCard label="Resolved" value={summary.resolved} />
          <SummaryCard label="High Severity" value={summary.highSeverity} />
        </div>
      )}

      {complianceDashboard && (
        <div className="mb-6 grid gap-6 lg:grid-cols-4">
          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <p className="text-sm font-semibold text-slate-500">
              Compliance Rate
            </p>
            <p className="mt-3 text-5xl font-bold text-green-600">
              {Number(complianceDashboard.complianceRate || 0).toFixed(1)}%
            </p>
            <p className="mt-2 text-sm text-slate-500">
              Resolved EVV issues out of total exceptions.
            </p>
          </div>

          <AnalyticsCard
            title="Exceptions by Type"
            data={complianceDashboard.exceptionsByType}
          />

          <AnalyticsCard
            title="Top Client Issues"
            data={complianceDashboard.exceptionsByClient}
          />

          <AnalyticsCard
            title="Top Caregiver Issues"
            data={complianceDashboard.exceptionsByCaregiver}
            danger
          />
        </div>
      )}

      <div className="mb-6 rounded-2xl bg-white p-5 shadow-sm">
        <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-800">
              Advanced EVV Filters
            </h3>
            <p className="text-sm text-slate-500">
              Find issues by client, caregiver, status, severity, type, search, and date range.
            </p>
          </div>

          <div className="rounded-xl bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700">
            Showing {filteredExceptions.length} of {exceptions.length}
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search client, caregiver, type..."
            className="rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-blue-500"
          />

          <select
            value={clientFilter}
            onChange={(e) => setClientFilter(e.target.value)}
            className="rounded-xl border border-slate-300 px-4 py-3 text-sm"
          >
            <option value="ALL">All Clients</option>
            {clients.map((client) => (
              <option key={client.clientId} value={client.clientId}>
                {client.clientName}
              </option>
            ))}
          </select>

          <select
            value={caregiverFilter}
            onChange={(e) => setCaregiverFilter(e.target.value)}
            className="rounded-xl border border-slate-300 px-4 py-3 text-sm"
          >
            <option value="ALL">All Caregivers</option>
            {caregivers.map((caregiver) => (
              <option key={caregiver.caregiverId} value={caregiver.caregiverId}>
                {caregiver.caregiverName}
              </option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-xl border border-slate-300 px-4 py-3 text-sm"
          >
            <option value="ALL">All Status</option>
            <option value="OPEN">Needs Review</option>
            <option value="REVIEWED">Reviewed</option>
            <option value="RESOLVED">Resolved</option>
          </select>

          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="rounded-xl border border-slate-300 px-4 py-3 text-sm"
          >
            <option value="ALL">All Severity</option>
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
            <option value="LOW">Low</option>
          </select>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="rounded-xl border border-slate-300 px-4 py-3 text-sm"
          >
            <option value="ALL">All Exception Types</option>
            {exceptionTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>

          <input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="rounded-xl border border-slate-300 px-4 py-3 text-sm"
          />

          <input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="rounded-xl border border-slate-300 px-4 py-3 text-sm"
          />
        </div>

        <div className="mt-4 flex justify-end">
          <button
            type="button"
            onClick={clearFilters}
            className="rounded-xl bg-slate-100 px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-200"
          >
            Clear Filters
          </button>
        </div>
      </div>

      <div className="rounded-2xl bg-white p-6 shadow-sm">
        {filteredExceptions.length === 0 ? (
          <p className="text-slate-500">No EVV exceptions found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="border-b bg-slate-50">
                <tr>
                  <th className="p-4">Type</th>
                  <th className="p-4">Severity</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Client</th>
                  <th className="p-4">Caregiver</th>
                  <th className="p-4">Created</th>
                  <th className="p-4">Action</th>
                </tr>
              </thead>

              <tbody>
                {filteredExceptions.map((item) => (
                  <tr key={item.id} className="border-b hover:bg-slate-50">
                    <td className="p-4 font-semibold">{item.exceptionType}</td>
                    <td className="p-4">
                      <SeverityBadge severity={item.severity} />
                    </td>
                    <td className="p-4">
                      <StatusBadge status={item.status} />
                    </td>
                    <td className="p-4">{item.clientName}</td>
                    <td className="p-4">{item.caregiverName}</td>
                    <td className="p-4">{formatDate(item.createdAt)}</td>
                    <td className="p-4">
                      <button
                        onClick={() => openReview(item)}
                        className={`rounded-lg px-3 py-2 text-sm font-semibold text-white ${
                          item.status === "OPEN"
                            ? "bg-blue-600 hover:bg-blue-700"
                            : item.status === "REVIEWED"
                            ? "bg-slate-600 hover:bg-slate-700"
                            : "bg-green-600 hover:bg-green-700"
                        }`}
                      >
                        {item.status === "OPEN"
                          ? "Review"
                          : item.status === "REVIEWED"
                          ? "Update"
                          : "View"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {selectedException && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl">
            <div className="mb-6 flex items-start justify-between">
              <div>
                <h3 className="text-2xl font-bold text-slate-800">
                  EVV Exception Details
                </h3>
                <p className="mt-1 text-slate-500">
                  Review exception information, supervisor notes, and audit history.
                </p>
              </div>

              <button
                type="button"
                onClick={closeModal}
                className="rounded-lg bg-slate-100 px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-200"
              >
                X
              </button>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <DetailCard label="Exception Type" value={selectedException.exceptionType} />
              <DetailCard label="Severity" value={selectedException.severity} />
              <DetailCard label="Status" value={getStatusLabel(selectedException.status)} />
              <DetailCard label="Client" value={selectedException.clientName} />
              <DetailCard label="Caregiver" value={selectedException.caregiverName} />
              <DetailCard label="Created At" value={formatDate(selectedException.createdAt)} />
              <DetailCard label="Appointment ID" value={selectedException.appointmentId} />
              <DetailCard label="Clock Record ID" value={selectedException.clockRecordId || "—"} />
              <DetailCard label="Admin Reason" value={selectedException.adminResolutionReason || "—"} />
              <DetailCard label="Corrected Clock-Out" value={formatDate(selectedException.correctedClockOutTime)} />
              <DetailCard
                label="Admin Approved"
                value={selectedException.adminApproved ? "Yes" : "No"}
              />
            </div>

            <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-sm font-semibold text-slate-500">Description</p>
              <p className="mt-1 text-slate-800">
                {selectedException.description || "No description provided."}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <h4 className="text-lg font-bold text-slate-800">
                Supervisor Review
              </h4>

              <select
                value={reviewData.status}
                onChange={(e) =>
                  setReviewData({ ...reviewData, status: e.target.value })
                }
                className="w-full rounded-xl border border-slate-300 px-4 py-3"
              >
                <option value="REVIEWED">Reviewed</option>
                <option value="RESOLVED">Resolved</option>
              </select>

              <div className="grid gap-4 md:grid-cols-2">
                <select
                  value={reviewData.adminResolutionReason}
                  onChange={(e) =>
                    setReviewData({
                      ...reviewData,
                      adminResolutionReason: e.target.value,
                    })
                  }
                  className="rounded-xl border border-slate-300 px-4 py-3"
                >
                  <option value="">Select Resolution Reason</option>
                  <option value="Caregiver forgot to clock out">
                    Caregiver forgot to clock out
                  </option>
                  <option value="Phone battery died">Phone battery died</option>
                  <option value="App or network issue">App or network issue</option>
                  <option value="Client emergency">Client emergency</option>
                  <option value="Supervisor verified visit">
                    Supervisor verified visit
                  </option>
                  <option value="GPS or device issue">GPS or device issue</option>
                  <option value="Other">Other</option>
                </select>

                <input
                  type="datetime-local"
                  value={reviewData.correctedClockOutTime}
                  onChange={(e) =>
                    setReviewData({
                      ...reviewData,
                      correctedClockOutTime: e.target.value,
                    })
                  }
                  className="rounded-xl border border-slate-300 px-4 py-3"
                />
              </div>

              <label className="flex items-center gap-3 rounded-xl bg-green-50 p-4">
                <input
                  type="checkbox"
                  checked={reviewData.adminApproved}
                  onChange={(e) =>
                    setReviewData({
                      ...reviewData,
                      adminApproved: e.target.checked,
                    })
                  }
                />

                <span className="font-semibold text-green-700">
                  Supervisor approved this EVV exception
                </span>
              </label>

              <textarea
                value={reviewData.supervisorNotes}
                onChange={(e) =>
                  setReviewData({
                    ...reviewData,
                    supervisorNotes: e.target.value,
                  })
                }
                placeholder="Supervisor notes"
                rows="4"
                className="w-full rounded-xl border border-slate-300 px-4 py-3"
                required
              />

              <div className="flex gap-3">
                <button
                  type="submit"
                  className="flex-1 rounded-xl bg-blue-600 py-3 font-semibold text-white hover:bg-blue-700"
                >
                  Save Review
                </button>

                <button
                  type="button"
                  onClick={closeModal}
                  className="rounded-xl bg-slate-200 px-6 py-3 font-semibold hover:bg-slate-300"
                >
                  Cancel
                </button>
              </div>
            </form>

            <div className="mt-8">
              <h4 className="text-lg font-bold text-slate-800">
                Audit Timeline
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

                      <p className="mt-3 text-sm text-slate-700">
                        {log.supervisorNotes || "No notes provided."}
                      </p>

                      <p className="mt-2 text-xs text-slate-400">
                        Reviewed at: {formatDate(log.reviewedAt || log.createdAt)}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function SummaryCard({ label, value }) {
  return (
    <div className="rounded-2xl bg-white p-5 shadow-sm">
      <p className="text-sm font-semibold text-slate-500">{label}</p>
      <p className="mt-2 text-3xl font-bold text-slate-800">{value}</p>
    </div>
  )
}

function AnalyticsCard({ title, data, danger = false }) {
  const entries = Object.entries(data || {}).sort((a, b) => b[1] - a[1])

  return (
    <div className="rounded-2xl bg-white p-6 shadow-sm">
      <h3 className="text-lg font-bold text-slate-800">{title}</h3>

      {entries.length === 0 ? (
        <p className="mt-4 text-sm text-slate-500">No data available.</p>
      ) : (
        <div className="mt-4 space-y-3">
          {entries.map(([label, count]) => (
            <div
              key={label}
              className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3"
            >
              <span className="text-sm font-medium text-slate-700">
                {label}
              </span>

              <span
                className={`font-bold ${
                  danger ? "text-red-600" : "text-slate-900"
                }`}
              >
                {count}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function DetailCard({ label, value }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <p className="text-sm font-semibold text-slate-500">{label}</p>
      <p className="mt-1 font-bold text-slate-800">{value || "—"}</p>
    </div>
  )
}

function formatDate(value) {
  return value ? new Date(value).toLocaleString() : "—"
}

function getStatusLabel(status) {
  return status === "OPEN"
    ? "Needs Review"
    : status === "REVIEWED"
    ? "Reviewed"
    : status === "RESOLVED"
    ? "Resolved"
    : status || "—"
}

function StatusBadge({ status }) {
  const label = getStatusLabel(status)

  return (
    <span
      className={`rounded-full px-3 py-1 text-xs font-semibold ${
        status === "OPEN"
          ? "bg-yellow-100 text-yellow-700"
          : status === "RESOLVED"
          ? "bg-green-100 text-green-700"
          : "bg-blue-100 text-blue-700"
      }`}
    >
      {label}
    </span>
  )
}

function SeverityBadge({ severity }) {
  const isHigh = severity === "HIGH"

  return (
    <span
      className={`rounded-full px-3 py-1 text-xs font-semibold ${
        isHigh ? "bg-red-100 text-red-700" : "bg-orange-100 text-orange-700"
      }`}
    >
      {severity}
    </span>
  )
}

export default EVVExceptionsPage