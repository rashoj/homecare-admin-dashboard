import { useEffect, useMemo, useState } from "react"
import {
  AlertTriangle,
  Bell,
  CheckCircle2,
  Clock3,
  FileCheck,
  Pill,
  Search,
  ShieldAlert,
  XCircle,
} from "lucide-react"

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
  const [search, setSearch] = useState("")
  const [activeTab, setActiveTab] = useState("ALL")

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

      setAlerts(alertsData || [])
      setLogs(logsData || [])

      const actionsMap = {}

      await Promise.all(
        (logsData || []).map(async (log) => {
          const actions = await getMARSupervisorActionsByLog(log.id)
          actionsMap[log.id] = actions || []
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
        [logId]: updatedActions || [],
      })

      alert("Supervisor action saved.")
    } catch (error) {
      alert(error.message || "Failed to save supervisor action.")
    } finally {
      setSubmittingLogId(null)
    }
  }

  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      const text = `${log.medicationName || ""} ${log.clientName || ""} ${
        log.caregiverName || ""
      } ${log.status || ""}`.toLowerCase()

      const matchesSearch = text.includes(search.toLowerCase())
      const matchesTab = activeTab === "ALL" || log.status === activeTab

      return matchesSearch && matchesTab
    })
  }, [logs, search, activeTab])

  const overdueCount = alerts.filter((a) => a.alertType === "OVERDUE").length
  const missedCount = alerts.filter((a) => a.alertType === "MISSED").length
  const refusedCount = alerts.filter((a) => a.alertType === "REFUSED").length
  const prnCount = alerts.filter((a) => a.alertType === "PRN_GIVEN").length

  const tabs = [
    { key: "ALL", label: "All Logs" },
    { key: "ADMINISTERED", label: "Administered" },
    { key: "MISSED", label: "Missed" },
    { key: "REFUSED", label: "Refused" },
    { key: "PRN_GIVEN", label: "PRN Given" },
  ]

  if (loading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <div className="rounded-3xl bg-white px-8 py-6 font-semibold text-slate-600 shadow-sm">
          Loading MAR review...
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-6 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-slate-900">
            Supervisor MAR Review
          </h1>
          <p className="mt-2 text-slate-500">
            Review medication alerts, missed doses, refusals, PRN activity, and
            supervisor follow-up actions.
          </p>
        </div>

        <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
          <Search size={18} className="text-slate-400" />
          <input
            className="w-full bg-transparent text-sm outline-none sm:w-72"
            placeholder="Search medication, client, caregiver..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          title="Total Alerts"
          value={alerts.length}
          subtitle="Medication alerts"
          icon={<Bell size={26} />}
          tone="blue"
        />
        <MetricCard
          title="Overdue"
          value={overdueCount}
          subtitle="Needs urgent review"
          icon={<AlertTriangle size={26} />}
          tone="red"
        />
        <MetricCard
          title="Missed"
          value={missedCount}
          subtitle="Missed medication events"
          icon={<XCircle size={26} />}
          tone="orange"
        />
        <MetricCard
          title="PRN Given"
          value={prnCount}
          subtitle="As-needed medications"
          icon={<Pill size={26} />}
          tone="purple"
        />
      </div>

      {refusedCount > 0 && (
        <div className="rounded-3xl border border-yellow-200 bg-yellow-50 p-6">
          <div className="flex items-start gap-4">
            <div className="rounded-2xl bg-yellow-100 p-3 text-yellow-700">
              <ShieldAlert size={24} />
            </div>
            <div>
              <h2 className="text-lg font-black text-yellow-800">
                Medication refusals require supervisor review
              </h2>
              <p className="mt-1 text-sm font-semibold text-yellow-700">
                {refusedCount} refusal event{refusedCount === 1 ? "" : "s"} found
                in the current MAR queue.
              </p>
            </div>
          </div>
        </div>
      )}

      <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-black text-slate-900">
                MAR Alerts
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                High-priority medication exceptions and compliance events.
              </p>
            </div>
            <span className="rounded-full bg-blue-100 px-4 py-2 text-sm font-black text-blue-700">
              {alerts.length} Alert{alerts.length === 1 ? "" : "s"}
            </span>
          </div>
        </div>

        <div className="divide-y divide-slate-100">
          {alerts.length === 0 ? (
            <EmptyState text="No MAR alerts found." />
          ) : (
            alerts.map((alert, index) => (
              <AlertRow
                key={`${alert.alertType}-${alert.medicationId}-${index}`}
                alert={alert}
              />
            ))
          )}
        </div>
      </section>

      <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
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

        <div className="p-6">
          <div className="mb-5 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
            <div>
              <h2 className="text-2xl font-black text-slate-900">
                Full MAR Review
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Review medication logs and document supervisor actions.
              </p>
            </div>
            <p className="text-sm font-semibold text-slate-500">
              Showing {filteredLogs.length} of {logs.length} logs
            </p>
          </div>

          {filteredLogs.length === 0 ? (
            <EmptyState text="No MAR logs found." />
          ) : (
            <div className="space-y-5">
              {filteredLogs.map((log) => (
                <MARLogCard
                  key={log.id}
                  log={log}
                  notesByLog={notesByLog}
                  setNotesByLog={setNotesByLog}
                  submittingLogId={submittingLogId}
                  handleSupervisorAction={handleSupervisorAction}
                  actions={actionsByLog[log.id] || []}
                />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  )
}

function AlertRow({ alert }) {
  return (
    <div className="px-6 py-5 transition hover:bg-slate-50">
      <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
        <div className="flex gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-red-100 text-red-700">
            <AlertTriangle size={22} />
          </div>

          <div>
            <div className="flex flex-wrap gap-2">
              <AlertBadge type={alert.alertType} />
              <ClientBadge name={alert.clientName} />
            </div>

            <h4 className="mt-3 text-lg font-black text-slate-900">
              {alert.medicationName || "Unknown Medication"}
            </h4>

            <div className="mt-3 grid gap-2 text-sm text-slate-500 md:grid-cols-2">
              <p>Caregiver: {alert.caregiverName || "Not logged yet"}</p>
              <p>Scheduled: {formatDate(alert.scheduledAt)}</p>
              <p>Given At: {formatDate(alert.givenAt)}</p>
            </div>

            <div className="mt-4 rounded-2xl bg-slate-50 p-4">
              <p className="text-xs font-black uppercase tracking-wide text-slate-400">
                Reason / Notes
              </p>
              <p className="mt-2 text-sm leading-6 text-slate-700">
                {alert.reason || alert.notes || "—"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function MARLogCard({
  log,
  notesByLog,
  setNotesByLog,
  submittingLogId,
  handleSupervisorAction,
  actions,
}) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
        <div className="flex gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-100 text-blue-700">
            <Pill size={22} />
          </div>

          <div>
            <h4 className="text-xl font-black text-slate-900">
              {log.medicationName || "Unknown Medication"}
            </h4>

            <div className="mt-3 grid gap-2 text-sm text-slate-500 md:grid-cols-2">
              <p>Client: {log.clientName || "—"}</p>
              <p>Caregiver: {log.caregiverName || "—"}</p>
              <p>Scheduled: {formatDate(log.scheduledAt)}</p>
              <p>Given At: {formatDate(log.givenAt)}</p>
            </div>
          </div>
        </div>

        <StatusBadge status={log.status} />
      </div>

      <div className="mt-5 grid gap-4 xl:grid-cols-2">
        <InfoPanel title="Reason / Notes">
          {log.prnReason ||
            log.missedReason ||
            log.refusalReason ||
            log.notes ||
            "—"}
        </InfoPanel>

        <InfoPanel title="Signature">
          {log.caregiverSignature?.startsWith("data:image") ? (
            <img
              src={log.caregiverSignature}
              alt="Caregiver signature"
              className="mt-2 h-20 max-w-56 rounded-xl border border-slate-200 bg-white p-2 object-contain"
            />
          ) : (
            <span>{log.caregiverSignature || "—"}</span>
          )}
        </InfoPanel>
      </div>

      <div className="mt-5 rounded-3xl border border-blue-100 bg-white p-5">
        <h5 className="flex items-center gap-2 font-black text-slate-900">
          <FileCheck size={18} className="text-blue-600" />
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
          className="mt-4 w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-500"
        />

        <div className="mt-4 grid gap-3 md:grid-cols-4">
          <ActionButton
            label="Acknowledge"
            disabled={submittingLogId === log.id}
            onClick={() => handleSupervisorAction(log.id, "ACKNOWLEDGED")}
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
            onClick={() => handleSupervisorAction(log.id, "ESCALATED")}
          />
          <ActionButton
            label="Resolve"
            success
            disabled={submittingLogId === log.id}
            onClick={() => handleSupervisorAction(log.id, "RESOLVED")}
          />
        </div>

        <div className="mt-6">
          <h6 className="text-sm font-black text-slate-700">
            Action History
          </h6>

          {actions.length > 0 ? (
            <div className="mt-3 space-y-3">
              {actions.map((action) => (
                <div
                  key={action.id}
                  className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
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
            <div className="mt-3 rounded-2xl bg-slate-50 p-4 text-sm font-semibold text-slate-500">
              No supervisor actions recorded yet.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function MetricCard({ title, value, subtitle, icon, tone }) {
  const tones = {
    blue: "bg-blue-100 text-blue-700",
    red: "bg-red-100 text-red-700",
    orange: "bg-orange-100 text-orange-700",
    purple: "bg-purple-100 text-purple-700",
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

function InfoPanel({ title, children }) {
  return (
    <div className="rounded-2xl bg-white p-4">
      <p className="text-xs font-black uppercase tracking-wide text-slate-400">
        {title}
      </p>
      <div className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-700">
        {children}
      </div>
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
      className={`rounded-2xl px-4 py-3 text-sm font-black text-white disabled:bg-gray-300 ${classes}`}
    >
      {label}
    </button>
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
      className={`rounded-full px-3 py-1 text-xs font-black ${
        styles[type] || "bg-blue-100 text-blue-700"
      }`}
    >
      {formatStatus(type)}
    </span>
  )
}

function ClientBadge({ name }) {
  return (
    <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-black text-blue-700">
      {name || "Unknown Client"}
    </span>
  )
}

function StatusBadge({ status }) {
  return <AlertBadge type={status} />
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
      className={`rounded-full px-3 py-1 text-xs font-black ${
        styles[status] || "bg-slate-100 text-slate-700"
      }`}
    >
      {formatSupervisorStatus(status)}
    </span>
  )
}

function EmptyState({ text }) {
  return (
    <div className="p-8 text-center text-sm font-semibold text-slate-500">
      {text}
    </div>
  )
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
