import { useEffect, useMemo, useState } from "react"
import {
  AlertTriangle,
  Bell,
  CheckCircle2,
  Clock3,
  Filter,
  Search,
  ShieldAlert,
  Eye,
} from "lucide-react"

import {
  getEVVAlerts,
  markEVVAlertAsRead,
} from "../services/evvAlertApi"

function EVVAlertsPage() {
  const [alerts, setAlerts] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [activeTab, setActiveTab] = useState("ALL")

  useEffect(() => {
    loadAlerts()
  }, [])

  async function loadAlerts() {
    try {
      setLoading(true)
      const data = await getEVVAlerts()
      setAlerts(data || [])
    } catch (error) {
      console.error(error)
      alert("Failed to load EVV alerts.")
    } finally {
      setLoading(false)
    }
  }

  async function handleMarkRead(id) {
    try {
      await markEVVAlertAsRead(id)
      await loadAlerts()
    } catch (error) {
      console.error(error)
      alert("Failed to mark alert as read.")
    }
  }

  const filteredAlerts = useMemo(() => {
    return alerts.filter((alert) => {
      const text = `${alert.message || ""} ${alert.alertType || ""} ${
        alert.severity || ""
      } ${alert.status || ""}`.toLowerCase()

      const matchesSearch = text.includes(search.toLowerCase())

      const matchesTab =
        activeTab === "ALL" ||
        alert.status === activeTab ||
        alert.severity === activeTab ||
        alert.alertType === activeTab

      return matchesSearch && matchesTab
    })
  }, [alerts, search, activeTab])

  const unreadCount = alerts.filter((alert) => alert.status === "UNREAD").length
  const highCount = alerts.filter((alert) => alert.severity === "HIGH").length
  const criticalCount = alerts.filter(
    (alert) => alert.severity === "CRITICAL"
  ).length
  const resolvedCount = alerts.filter((alert) => alert.status === "READ").length

  const tabs = [
    { key: "ALL", label: "All Alerts" },
    { key: "UNREAD", label: "Unread" },
    { key: "READ", label: "Read" },
    { key: "HIGH", label: "High" },
    { key: "CRITICAL", label: "Critical" },
  ]

  if (loading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <div className="rounded-3xl bg-white px-8 py-6 font-semibold text-slate-600 shadow-sm">
          Loading EVV alerts...
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-6 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-slate-900">
            EVV Alert Center
          </h1>
          <p className="mt-2 text-slate-500">
            Monitor real-time EVV compliance alerts, missed activity, and
            high-risk visit issues.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
            <Search size={18} className="text-slate-400" />
            <input
              className="w-full bg-transparent text-sm outline-none sm:w-72"
              placeholder="Search alerts..."
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
          title="Total Alerts"
          value={alerts.length}
          subtitle="All EVV alerts"
          icon={<Bell size={26} />}
          tone="blue"
        />
        <MetricCard
          title="Unread Alerts"
          value={unreadCount}
          subtitle="Needs attention"
          icon={<AlertTriangle size={26} />}
          tone="red"
        />
        <MetricCard
          title="High Severity"
          value={highCount}
          subtitle="Compliance risk"
          icon={<ShieldAlert size={26} />}
          tone="orange"
        />
        <MetricCard
          title="Reviewed"
          value={resolvedCount}
          subtitle="Marked as read"
          icon={<CheckCircle2 size={26} />}
          tone="green"
        />
      </div>

      {criticalCount > 0 && (
        <div className="rounded-3xl border border-red-200 bg-red-50 p-6">
          <div className="flex items-start gap-4">
            <div className="rounded-2xl bg-red-100 p-3 text-red-700">
              <ShieldAlert size={24} />
            </div>
            <div>
              <h2 className="text-lg font-black text-red-800">
                Critical EVV alerts need immediate review
              </h2>
              <p className="mt-1 text-sm font-semibold text-red-600">
                {criticalCount} critical alert{criticalCount === 1 ? "" : "s"}{" "}
                detected in the EVV monitoring queue.
              </p>
            </div>
          </div>
        </div>
      )}

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

        <div className="divide-y divide-slate-100">
          {filteredAlerts.length > 0 ? (
            filteredAlerts.map((alert) => (
              <AlertRow
                key={alert.id}
                alert={alert}
                onMarkRead={handleMarkRead}
              />
            ))
          ) : (
            <div className="px-6 py-14 text-center">
              <p className="font-semibold text-slate-600">
                No EVV alerts found.
              </p>
              <p className="mt-1 text-sm text-slate-400">
                Try changing your search or selected tab.
              </p>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-4 border-t border-slate-200 px-6 py-4 text-sm text-slate-500 md:flex-row md:items-center md:justify-between">
          <p>
            Showing {filteredAlerts.length} of {alerts.length} alerts
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
    </div>
  )
}

function AlertRow({ alert, onMarkRead }) {
  const unread = alert.status === "UNREAD"

  return (
    <div
      className={`px-6 py-5 transition hover:bg-slate-50 ${
        unread ? "bg-red-50/60" : "bg-white"
      }`}
    >
      <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
        <div className="flex gap-4">
          <div
            className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${
              unread
                ? "bg-red-100 text-red-700"
                : "bg-slate-100 text-slate-500"
            }`}
          >
            {unread ? <AlertTriangle size={22} /> : <CheckCircle2 size={22} />}
          </div>

          <div>
            <div className="flex flex-wrap items-center gap-2">
              <SeverityBadge severity={alert.severity} />
              <StatusBadge status={alert.status} />
              <TypeBadge type={alert.alertType} />
            </div>

            <p className="mt-3 max-w-4xl font-bold text-slate-900">
              {alert.message || "No alert message provided."}
            </p>

            <div className="mt-3 flex flex-wrap items-center gap-4 text-sm font-semibold text-slate-500">
              <span className="flex items-center gap-2">
                <Clock3 size={15} />
                Created: {formatDate(alert.createdAt)}
              </span>

              {alert.id && <span>Alert ID: EVV-{alert.id}</span>}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 xl:justify-end">
          <button className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700 hover:bg-slate-100">
            <Eye size={16} />
            View
          </button>

          {unread && (
            <button
              onClick={() => onMarkRead(alert.id)}
              className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-bold text-white hover:bg-blue-700"
            >
              Mark as Read
            </button>
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
    green: "bg-green-100 text-green-700",
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

function SeverityBadge({ severity }) {
  if (severity === "CRITICAL") {
    return (
      <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-black text-red-700">
        Critical
      </span>
    )
  }

  if (severity === "HIGH") {
    return (
      <span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-black text-orange-700">
        High
      </span>
    )
  }

  return (
    <span className="rounded-full bg-yellow-100 px-3 py-1 text-xs font-black text-yellow-700">
      {formatLabel(severity || "Medium")}
    </span>
  )
}

function StatusBadge({ status }) {
  if (status === "UNREAD") {
    return (
      <span className="rounded-full bg-yellow-100 px-3 py-1 text-xs font-black text-yellow-700">
        Unread
      </span>
    )
  }

  return (
    <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-black text-green-700">
      Read
    </span>
  )
}

function TypeBadge({ type }) {
  return (
    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-black text-slate-600">
      {formatLabel(type || "EVV Alert")}
    </span>
  )
}

function formatLabel(value) {
  if (!value) return "—"

  return value
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase())
}

function formatDate(value) {
  return value ? new Date(value).toLocaleString() : "—"
}

export default EVVAlertsPage