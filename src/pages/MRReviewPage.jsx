import { useEffect, useState } from "react"
import {
  getMARAlerts,
  getMARReviewLogs,
  createMARSupervisorAction,
  getMARSupervisorActionsByLog,
} from "../services/medicationService"
import { getUser } from "../services/authStorage"

function MARReviewPage() {
  const [alerts, setAlerts] = useState([])
  const [logs, setLogs] = useState([])
  const [actionsByLog, setActionsByLog] = useState({})
  const [notesByLog, setNotesByLog] = useState({})
  const [loading, setLoading] = useState(true)
  const [submittingLogId, setSubmittingLogId] = useState(null)

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    try {
      setLoading(true)

      const [alertsData, logsData] = await Promise.all([
        getMARAlerts(),
        getMARReviewLogs(),
      ])

      setAlerts(alertsData)
      setLogs(logsData)

      const actionsMap = {}

      await Promise.all(
        logsData.map(async (log) => {
          const actions = await getMARSupervisorActionsByLog(log.id)
          actionsMap[log.id] = actions
        })
      )

      setActionsByLog(actionsMap)
    } finally {
      setLoading(false)
    }
  }

  async function handleSupervisorAction(logId, actionStatus) {
    const supervisor = getUser()
    const notes = notesByLog[logId] || ""

    if (!notes.trim()) {
      alert("Supervisor notes are required.")
      return
    }

    try {
      setSubmittingLogId(logId)

      await createMARSupervisorAction({
        medicationLogId: logId,
        supervisorId: supervisor?.id || null,
        actionStatus,
        supervisorNotes: notes,
      })

      setNotesByLog({
        ...notesByLog,
        [logId]: "",
      })

      const updatedActions = await getMARSupervisorActionsByLog(logId)

      setActionsByLog({
        ...actionsByLog,
        [logId]: updatedActions,
      })

      alert("Supervisor action saved.")
    } catch (error) {
      alert(error.message || "Failed to save supervisor action.")
    } finally {
      setSubmittingLogId(null)
    }
  }

  if (loading) {
    return <p className="text-slate-500">Loading MAR review...</p>
  }

  return (
    <div>
      <h2 className="text-4xl font-bold text-slate-800">
        Supervisor MAR Review
      </h2>

      <p className="mt-2 text-slate-500">
        Review medication alerts, overdue meds, refusals, missed doses, PRN activity, and supervisor actions.
      </p>

      <div className="mt-6 grid gap-4 md:grid-cols-4">
        <StatCard label="Total Alerts" value={alerts.length} />
        <StatCard
          label="Overdue"
          value={alerts.filter((a) => a.alertType === "OVERDUE").length}
          danger
        />
        <StatCard
          label="Missed"
          value={alerts.filter((a) => a.alertType === "MISSED").length}
          warning
        />
        <StatCard
          label="PRN Given"
          value={alerts.filter((a) => a.alertType === "PRN_GIVEN").length}
        />
      </div>

      <section className="mt-8 rounded-2xl bg-white p-6 shadow-sm">
        <h3 className="text-2xl font-bold text-slate-800">MAR Alerts</h3>

        {alerts.length === 0 ? (
          <p className="mt-4 text-slate-500">No MAR alerts found.</p>
        ) : (
          <div className="mt-5 space-y-4">
            {alerts.map((alert, index) => (
              <div
                key={`${alert.alertType}-${alert.medicationId}-${index}`}
                className="rounded-2xl border border-slate-200 bg-slate-50 p-5"
              >
                <div className="flex flex-col justify-between gap-3 md:flex-row md:items-start">
                  <div>
                    <div className="flex flex-wrap gap-2">
                      <AlertBadge type={alert.alertType} />
                      <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-bold text-blue-700">
                        {alert.clientName}
                      </span>
                    </div>

                    <h4 className="mt-4 text-lg font-bold text-slate-900">
                      {alert.medicationName}
                    </h4>

                    <p className="mt-1 text-sm text-slate-500">
                      Caregiver: {alert.caregiverName || "Not logged yet"}
                    </p>

                    <p className="mt-1 text-sm text-slate-500">
                      Scheduled: {formatDate(alert.scheduledAt)}
                    </p>

                    <p className="mt-1 text-sm text-slate-500">
                      Given At: {formatDate(alert.givenAt)}
                    </p>
                  </div>
                </div>

                <div className="mt-4 rounded-xl bg-white p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Reason / Notes
                  </p>

                  <p className="mt-2 text-sm text-slate-700">
                    {alert.reason || alert.notes || "—"}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="mt-8 rounded-2xl bg-white p-6 shadow-sm">
        <h3 className="text-2xl font-bold text-slate-800">Full MAR Review</h3>

        {logs.length === 0 ? (
          <p className="mt-4 text-slate-500">No MAR logs found.</p>
        ) : (
          <div className="mt-5 space-y-5">
            {logs.map((log) => (
              <div
                key={log.id}
                className="rounded-2xl border border-slate-200 bg-slate-50 p-5"
              >
                <div className="flex flex-col justify-between gap-3 md:flex-row md:items-start">
                  <div>
                    <h4 className="text-lg font-bold text-slate-900">
                      {log.medicationName}
                    </h4>

                    <p className="mt-1 text-sm text-slate-500">
                      Client: {log.clientName}
                    </p>

                    <p className="mt-1 text-sm text-slate-500">
                      Caregiver: {log.caregiverName || "—"}
                    </p>

                    <p className="mt-1 text-sm text-slate-500">
                      Scheduled: {formatDate(log.scheduledAt)}
                    </p>

                    <p className="mt-1 text-sm text-slate-500">
                      Given At: {formatDate(log.givenAt)}
                    </p>
                  </div>

                  <StatusBadge status={log.status} />
                </div>

                <div className="mt-4 rounded-xl bg-white p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Reason / Notes
                  </p>

                  <p className="mt-2 whitespace-pre-wrap text-sm text-slate-700">
                    {log.prnReason ||
                      log.missedReason ||
                      log.refusalReason ||
                      log.notes ||
                      "—"}
                  </p>
                </div>

                <div className="mt-4 rounded-xl bg-white p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Signature
                  </p>

                  {log.caregiverSignature?.startsWith("data:image") ? (
                    <img
                      src={log.caregiverSignature}
                      alt="Caregiver signature"
                      className="mt-3 h-20 max-w-56 rounded-xl border border-slate-200 bg-white p-2 object-contain"
                    />
                  ) : (
                    <p className="mt-2 text-sm text-slate-400">
                      {log.caregiverSignature || "—"}
                    </p>
                  )}
                </div>

                <div className="mt-4 rounded-2xl border border-blue-100 bg-white p-4">
                  <h5 className="font-bold text-slate-800">
                    Supervisor Action
                  </h5>

                  <textarea
                    value={notesByLog[log.id] || ""}
                    onChange={(e) =>
                      setNotesByLog({
                        ...notesByLog,
                        [log.id]: e.target.value,
                      })
                    }
                    rows="3"
                    placeholder="Add supervisor notes before taking action..."
                    className="mt-3 w-full rounded-xl border border-slate-300 px-4 py-3"
                  />

                  <div className="mt-4 grid gap-3 md:grid-cols-4">
                    <ActionButton
                      label="Acknowledge"
                      disabled={submittingLogId === log.id}
                      onClick={() =>
                        handleSupervisorAction(log.id, "ACKNOWLEDGED")
                      }
                    />

                    <ActionButton
                      label="Follow Up"
                      warning
                      disabled={submittingLogId === log.id}
                      onClick={() =>
                        handleSupervisorAction(log.id, "FOLLOW_UP_REQUIRED")
                      }
                    />

                    <ActionButton
                      label="Escalate"
                      danger
                      disabled={submittingLogId === log.id}
                      onClick={() =>
                        handleSupervisorAction(log.id, "ESCALATED")
                      }
                    />

                    <ActionButton
                      label="Resolve"
                      success
                      disabled={submittingLogId === log.id}
                      onClick={() =>
                        handleSupervisorAction(log.id, "RESOLVED")
                      }
                    />
                  </div>

                  <div className="mt-5">
                    <h6 className="text-sm font-bold text-slate-700">
                      Action History
                    </h6>

                    {actionsByLog[log.id]?.length > 0 ? (
                      <div className="mt-3 space-y-3">
                        {actionsByLog[log.id].map((action) => (
                          <div
                            key={action.id}
                            className="rounded-xl border border-slate-200 bg-slate-50 p-4"
                          >
                            <div className="flex flex-wrap items-center gap-2">
                              <ActionBadge status={action.actionStatus} />

                              <span className="text-xs text-slate-400">
                                {formatDate(action.createdAt)}
                              </span>
                            </div>

                            <p className="mt-2 text-sm text-slate-700">
                              {action.supervisorNotes || "No notes provided."}
                            </p>

                            <p className="mt-2 text-xs text-slate-400">
                              Supervisor: {action.supervisorName || "—"}
                            </p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="mt-3 rounded-xl bg-slate-50 p-4 text-sm text-slate-500">
                        No supervisor actions recorded yet.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}

function ActionButton({ label, onClick, disabled, danger, warning, success }) {
  let classes = "bg-blue-600 hover:bg-blue-700"

  if (danger) classes = "bg-red-600 hover:bg-red-700"
  if (warning) classes = "bg-orange-500 hover:bg-orange-600"
  if (success) classes = "bg-green-600 hover:bg-green-700"

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={`rounded-xl px-4 py-3 text-sm font-bold text-white disabled:bg-gray-300 ${classes}`}
    >
      {label}
    </button>
  )
}

function ActionBadge({ status }) {
  const styles = {
    ACKNOWLEDGED: "bg-blue-100 text-blue-700",
    FOLLOW_UP_REQUIRED: "bg-orange-100 text-orange-700",
    ESCALATED: "bg-red-100 text-red-700",
    RESOLVED: "bg-green-100 text-green-700",
  }

  return (
    <span
      className={`rounded-full px-3 py-1 text-xs font-bold ${
        styles[status] || "bg-slate-100 text-slate-700"
      }`}
    >
      {formatSupervisorStatus(status)}
    </span>
  )
}

function StatCard({ label, value, danger, warning }) {
  let badgeClass = "bg-blue-100 text-blue-700"

  if (danger) badgeClass = "bg-red-100 text-red-700"
  if (warning) badgeClass = "bg-orange-100 text-orange-700"

  return (
    <div className="rounded-2xl bg-white p-5 shadow-sm">
      <p className="text-sm text-slate-500">{label}</p>
      <p
        className={`mt-3 w-fit rounded-xl px-4 py-2 text-2xl font-black ${badgeClass}`}
      >
        {value}
      </p>
    </div>
  )
}

function AlertBadge({ type }) {
  const styles = {
    OVERDUE: "bg-red-100 text-red-700",
    MISSED: "bg-orange-100 text-orange-700",
    REFUSED: "bg-yellow-100 text-yellow-700",
    HELD: "bg-slate-100 text-slate-700",
    PRN_GIVEN: "bg-purple-100 text-purple-700",
    GIVEN: "bg-green-100 text-green-700",
    ADMINISTERED: "bg-green-100 text-green-700",
  }

  return (
    <span
      className={`rounded-full px-3 py-1 text-xs font-bold ${
        styles[type] || "bg-blue-100 text-blue-700"
      }`}
    >
      {formatStatus(type)}
    </span>
  )
}

function StatusBadge({ status }) {
  return <AlertBadge type={status} />
}

function formatStatus(status) {
  if (status === "PRN_GIVEN") return "PRN Given"
  if (status === "ADMINISTERED") return "Administered"
  if (status === "FOLLOW_UP_REQUIRED") return "Follow Up Required"

  return status || "—"
}

function formatSupervisorStatus(status) {
  if (status === "ACKNOWLEDGED") return "Acknowledged"
  if (status === "FOLLOW_UP_REQUIRED") return "Follow Up Required"
  if (status === "ESCALATED") return "Escalated"
  if (status === "RESOLVED") return "Resolved"

  return status || "—"
}

function formatDate(value) {
  return value ? new Date(value).toLocaleString() : "—"
}

export default MARReviewPage