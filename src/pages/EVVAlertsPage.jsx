import { useEffect, useState } from "react"
import {
  getEVVAlerts,
  markEVVAlertAsRead,
} from "../services/evvAlertApi"

function EVVAlertsPage() {
  const [alerts, setAlerts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadAlerts()
  }, [])

  async function loadAlerts() {
    try {
      setLoading(true)
      const data = await getEVVAlerts()
      setAlerts(data)
    } finally {
      setLoading(false)
    }
  }

  async function handleMarkRead(id) {
    await markEVVAlertAsRead(id)
    await loadAlerts()
  }

  if (loading) {
    return <p className="text-slate-500">Loading EVV alerts...</p>
  }

  const unreadCount = alerts.filter((alert) => alert.status === "UNREAD").length

  return (
    <div>
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h2 className="text-4xl font-bold text-slate-800">
            EVV Alert Center
          </h2>
          <p className="mt-2 text-slate-500">
            Monitor real-time EVV compliance alerts and high-risk visit issues.
          </p>
        </div>

        <div className="rounded-2xl bg-red-50 px-5 py-4 text-center">
          <p className="text-sm font-semibold text-red-600">Unread Alerts</p>
          <p className="text-3xl font-bold text-red-700">{unreadCount}</p>
        </div>
      </div>

      <div className="rounded-2xl bg-white p-6 shadow-sm">
        {alerts.length === 0 ? (
          <p className="text-slate-500">No EVV alerts found.</p>
        ) : (
          <div className="space-y-4">
            {alerts.map((alert) => (
              <div
                key={alert.id}
                className={`rounded-2xl border p-5 ${
                  alert.status === "UNREAD"
                    ? "border-red-200 bg-red-50"
                    : "border-slate-200 bg-white"
                }`}
              >
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <SeverityBadge severity={alert.severity} />
                      <StatusBadge status={alert.status} />

                      <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                        {alert.alertType}
                      </span>
                    </div>

                    <p className="mt-3 font-semibold text-slate-800">
                      {alert.message}
                    </p>

                    <p className="mt-2 text-sm text-slate-500">
                      Created: {formatDate(alert.createdAt)}
                    </p>
                  </div>

                  {alert.status === "UNREAD" && (
                    <button
                      onClick={() => handleMarkRead(alert.id)}
                      className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
                    >
                      Mark as Read
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function SeverityBadge({ severity }) {
  const isHigh = severity === "HIGH"

  return (
    <span
      className={`rounded-full px-3 py-1 text-xs font-semibold ${
        isHigh
          ? "bg-red-100 text-red-700"
          : "bg-orange-100 text-orange-700"
      }`}
    >
      {severity}
    </span>
  )
}

function StatusBadge({ status }) {
  return (
    <span
      className={`rounded-full px-3 py-1 text-xs font-semibold ${
        status === "UNREAD"
          ? "bg-yellow-100 text-yellow-700"
          : "bg-green-100 text-green-700"
      }`}
    >
      {status}
    </span>
  )
}

function formatDate(value) {
  return value ? new Date(value).toLocaleString() : "—"
}

export default EVVAlertsPage